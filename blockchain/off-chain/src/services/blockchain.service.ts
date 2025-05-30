import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'

import { Pool } from '../entities/pool.entity'
import { Request } from '../entities/request.entity'
import { Donation } from '../entities/donation.entity'
import { VoteWeight } from '../entities/vote-weight.entity'
import { Distribution } from '../entities/distribution.entity'
import { CardanoService } from './cardano.service'

import { CreateRequestDto } from '../dto/request.dto'
import { DonationDto } from '../dto/donation.dto'
import { DistributionDto } from '../dto/distribution.dto'

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name)

  constructor(
    @InjectRepository(Pool)
    private poolRepository: Repository<Pool>,
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
    @InjectRepository(VoteWeight)
    private voteWeightRepository: Repository<VoteWeight>,
    @InjectRepository(Distribution)
    private distributionRepository: Repository<Distribution>,
    private configService: ConfigService,
    private cardanoService: CardanoService,
  ) {}

  /**
   * Register a new funding request
   */
  async registerRequest(requestDto: CreateRequestDto): Promise<Request> {
    this.logger.log(`Registering new request: ${requestDto.request_id}`)

    const request = this.requestRepository.create({
      request_id: requestDto.request_id,
      hospital_addr: requestDto.hospital_addr,
      triage_score: requestDto.triage_score,
    })

    // Create initial vote weight record with AI weight
    await this.voteWeightRepository.save({
      request_id: requestDto.request_id,
      ai_weight: requestDto.triage_score,
      donor_weight: 0,
      total_weight: requestDto.triage_score,
    })

    return this.requestRepository.save(request)
  }

  /**
   * Record a donation and optionally vote for a request
   */
  async recordDonation(donationDto: DonationDto): Promise<Donation> {
    this.logger.log(`Recording donation: ${donationDto.donation_id}`)

    const donation = this.donationRepository.create({
      donation_id: donationDto.donation_id,
      donor_addr: donationDto.donor_addr,
      ada_amt: donationDto.ada_amount,
      request_id: donationDto.request_id,
    })

    // Save to database
    await this.donationRepository.save(donation)

    // Update pool total
    const pool = await this.poolRepository.findOne({ where: {} })
    if (pool) {
      pool.total_ada = Number(pool.total_ada) + donationDto.ada_amount
      await this.poolRepository.save(pool)
    }

    // If voting for a request, update vote weights
    if (donationDto.request_id) {
      const voteWeight = await this.voteWeightRepository.findOne({
        where: { request_id: donationDto.request_id },
      })

      if (voteWeight) {
        voteWeight.donor_weight += donationDto.ada_amount
        voteWeight.total_weight =
          Number(voteWeight.ai_weight) + Number(voteWeight.donor_weight)
        await this.voteWeightRepository.save(voteWeight)
      }
    }

    // TODO: Submit on-chain transaction via CardanoService
    try {
      await this.submitDonationTx(donationDto)
    } catch (error) {
      this.logger.error(
        `Failed to submit donation transaction: ${(error as Error).message}`,
      )
      // Continue anyway - we have the data in the database
    }

    return donation
  }

  /**
   * Distribute funds to top recipients
   */
  async distributePool(
    distributionDto: DistributionDto,
  ): Promise<{ txHash: string }> {
    this.logger.log(
      `Triggering distribution for pool: ${distributionDto.pool_id}`,
    )

    // Get pool data
    const pool = await this.poolRepository.findOne({
      where: { pool_id: distributionDto.pool_id },
    })

    if (!pool) {
      throw new Error(`Pool not found: ${distributionDto.pool_id}`)
    }

    // Find top N requests by weight
    const topRequests = await this.voteWeightRepository.find({
      order: { total_weight: 'DESC' },
      take: distributionDto.top_n,
    })

    if (topRequests.length === 0) {
      throw new Error('No valid requests found for distribution')
    } // Calculate distribution amounts
    const totalToDistribute = Number(pool.total_ada) * distributionDto.percent
    const totalWeight = topRequests.reduce(
      (sum, req) => sum + Number(req.total_weight),
      0,
    )

    const recipients = await Promise.all(
      topRequests.map(async (vote) => {
        const request = await this.requestRepository.findOne({
          where: { request_id: vote.request_id },
        })

        if (!request) {
          this.logger.warn(`Request not found for ID: ${vote.request_id}`)
          return null
        }

        const weight = Number(vote.total_weight) / totalWeight
        const amount = totalToDistribute * weight

        return {
          request_id: vote.request_id,
          hospital_addr: request.hospital_addr,
          amount,
        }
      }),
    )

    // Filter out null entries (requests that weren't found)
    const validRecipients = recipients.filter((recipient) => recipient !== null)

    if (validRecipients.length === 0) {
      throw new Error(
        'No valid requests found with matching hospital addresses for distribution',
      )
    }

    // Create distribution record
    await this.distributionRepository.save({
      interval: distributionDto.interval,
      percent_pool: distributionDto.percent,
      recipients: validRecipients.map((r) => ({
        request_id: r.request_id,
        amount: r.amount,
      })),
    })

    // Submit on-chain transaction
    const txHash = await this.submitDistributionTx(pool, validRecipients)

    // Update pool after distribution
    pool.total_ada = Number(pool.total_ada) - totalToDistribute
    pool.last_distribution = new Date()
    await this.poolRepository.save(pool)

    return { txHash }
  }

  /**
   * Submit donation transaction to the Cardano blockchain
   */
  private async submitDonationTx(donationDto: DonationDto): Promise<string> {
    // This is a placeholder - actual implementation would require:
    // 1. Getting the current pool UTxO
    try {
      // Get all UTXOs at the script address
      const poolUtxos = await this.cardanoService.getPoolUtxos()

      // Just for development, return mock transaction hash
      this.logger.log(
        `[TODO] Building donation transaction for ${donationDto.ada_amount} ADA`,
      )
      return `tx_${Date.now().toString(16)}`

      // Real implementation would:
      // 1. Build transaction with proper inputs/outputs
      // 2. Add metadata with donation info
      // 3. Sign transaction
      // 4. Submit via cardanoService.submitTransaction()
    } catch (error) {
      this.logger.error(
        `Failed to submit donation transaction: ${(error as Error).message}`,
      )
      throw error
    }
  }

  /**
   * Submit distribution transaction to the Cardano blockchain
   */
  private async submitDistributionTx(
    pool: Pool,
    recipients: Array<{
      request_id: string
      hospital_addr: string
      amount: number
    }>,
  ): Promise<string> {
    try {
      // Get all UTXOs at the script address
      const poolUtxos = await this.cardanoService.getPoolUtxos()

      this.logger.log(
        `[TODO] Building distribution transaction for ${recipients.length} recipients`,
      )

      // For development/testing, just return a mock txHash
      return `tx_${Date.now().toString(16)}`

      // Real implementation would:
      // 1. Build transaction with proper inputs/outputs to each recipient hospital
      // 2. Create datum for the remainder output back to the script
      // 3. Sign transaction
      // 4. Submit via cardanoService.submitTransaction()
    } catch (error) {
      this.logger.error(
        `Failed to submit distribution transaction: ${(error as Error).message}`,
      )
      throw error
    }
  }
}
