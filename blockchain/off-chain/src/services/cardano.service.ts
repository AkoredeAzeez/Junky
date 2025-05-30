import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BlockFrostAPI } from '@blockfrost/blockfrost-js'
import { CardanoNetwork } from '@blockfrost/blockfrost-js/lib/types'
import * as fs from 'fs'
import * as path from 'path'

// Define the structure of the script addresses file
interface ScriptAddresses {
  donation_pool: {
    mainnet: string
    testnet: string
  }
}

@Injectable()
export class CardanoService {
  private readonly logger = new Logger(CardanoService.name)
  private readonly blockfrostApi: BlockFrostAPI
  private readonly scriptAddress: string
  private readonly network: CardanoNetwork

  constructor(private configService: ConfigService) {
    const projectId = this.configService.getOrThrow<string>(
      'blockfrost.projectId',
    )
    const networkString =
      this.configService.getOrThrow<string>('blockfrost.network')

    const supportedCardanoNetworks = [
      'mainnet',
      'preview',
      'preprod',
      'sanchonet',
    ]
    if (!supportedCardanoNetworks.includes(networkString)) {
      throw new Error(`Invalid Cardano network: ${networkString}`)
    }

    this.network = networkString as CardanoNetwork

    this.blockfrostApi = new BlockFrostAPI({
      projectId,
      network: this.network,
    })

    // Initialize script address from the JSON file
    const addresses = this.loadScriptAddressesFromFile()
    this.scriptAddress = this.selectScriptAddressForNetwork(addresses)
  }

  async getNetworkInfo() {
    try {
      return await this.blockfrostApi.network()
    } catch (error) {
      this.logger.error(
        `Error fetching network info: ${(error as Error).message}`,
      )
      throw error
    }
  }

  async getAddressUtxos(address: string) {
    try {
      return await this.blockfrostApi.addressesUtxos(address)
    } catch (error) {
      this.logger.error(
        `Error fetching UTxOs for address ${address}: ${(error as Error).message}`,
      )
      throw error
    }
  }

  async getPoolUtxos() {
    try {
      return await this.blockfrostApi.addressesUtxos(this.scriptAddress)
    } catch (error) {
      this.logger.error(
        `Error fetching pool UTxOs: ${(error as Error).message}`,
      )
      throw error
    }
  }

  async submitTransaction(txCbor: string) {
    try {
      const txHash = await this.blockfrostApi.txSubmit(txCbor)
      this.logger.log(`Transaction submitted successfully: ${txHash}`)
      return txHash
    } catch (error) {
      this.logger.error(
        `Error submitting transaction: ${(error as Error).message}`,
      )
      throw error
    }
  }

  async getProtocolParameters() {
    try {
      return await this.blockfrostApi.epochsLatestParameters()
    } catch (error) {
      this.logger.error(
        `Error fetching protocol parameters: ${(error as Error).message}`,
      )
      throw error
    }
  }

  /**
   * Load script addresses from the JSON file
   */
  private loadScriptAddressesFromFile(): ScriptAddresses {
    try {
      // Construct the path to the script addresses file
      const scriptAddressesPath = path.resolve(
        __dirname,
        '../../../..',
        'blockchain/on-chain/build/addresses/script_addresses.json',
      )

      // Read the file and parse its JSON content
      const fileContent = fs.readFileSync(scriptAddressesPath, 'utf8')
      // Remove comments if present (JSON doesn't support comments, but the file has them)
      const jsonContent = fileContent.replace(/^\s*\/\/.*$/gm, '')

      return JSON.parse(jsonContent) as ScriptAddresses
    } catch (error) {
      this.logger.error(
        `Error loading script addresses: ${(error as Error).message}`,
      )
      throw new Error('Failed to load script addresses from file')
    }
  }

  /**
   * Select the appropriate script address based on the current network
   */
  private selectScriptAddressForNetwork(
    scriptAddresses: ScriptAddresses,
  ): string {
    switch (this.network) {
      case 'mainnet':
        return scriptAddresses.donation_pool.mainnet
      default:
        return scriptAddresses.donation_pool.testnet
    }
  }
}
