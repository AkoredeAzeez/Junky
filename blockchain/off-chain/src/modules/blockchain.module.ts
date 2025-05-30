import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Pool } from '../entities/pool.entity'
import { Request } from '../entities/request.entity'
import { Donation } from '../entities/donation.entity'
import { VoteWeight } from '../entities/vote-weight.entity'
import { Distribution } from '../entities/distribution.entity'
import { BlockchainService } from '../services/blockchain.service'
import { PoolController } from '../controllers/pool.controller'
import { CardanoService } from 'src/services/cardano.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pool,
      Request,
      Donation,
      VoteWeight,
      Distribution,
    ]),
  ],
  controllers: [PoolController],
  providers: [BlockchainService, CardanoService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
