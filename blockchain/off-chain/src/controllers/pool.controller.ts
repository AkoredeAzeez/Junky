import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { BlockchainService } from '../services/blockchain.service'
import { CreateRequestDto } from '../dto/request.dto'
import { DonationDto } from '../dto/donation.dto'
import { DistributionDto } from '../dto/distribution.dto'

@ApiTags('pool')
@Controller('pool')
export class PoolController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Post('request')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new funding request' })
  @ApiResponse({
    status: 201,
    description: 'Request has been successfully registered.',
  })
  async registerRequest(@Body() createRequestDto: CreateRequestDto) {
    return this.blockchainService.registerRequest(createRequestDto)
  }

  @Post('donate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Record a donation and optionally vote for a request',
  })
  @ApiResponse({
    status: 201,
    description: 'Donation has been successfully recorded.',
  })
  async recordDonation(@Body() donationDto: DonationDto) {
    return this.blockchainService.recordDonation(donationDto)
  }

  @Post('distribute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger distribution of funds to top recipients' })
  @ApiResponse({
    status: 200,
    description: 'Distribution has been successfully initiated.',
    schema: {
      type: 'object',
      properties: {
        txHash: {
          type: 'string',
          example:
            'e2797df592a1d7d261e5d0339a8c6a3f71304669c0dac846f7c6bb45a9049fc7',
        },
      },
    },
  })
  async distributePool(@Body() distributionDto: DistributionDto) {
    return this.blockchainService.distributePool(distributionDto)
  }
}
