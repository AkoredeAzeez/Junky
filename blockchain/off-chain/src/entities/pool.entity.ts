import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class Pool {
  @PrimaryGeneratedColumn('uuid')
  pool_id: string

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  total_ada: number

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  last_distribution: Date

  @Column({ type: 'json' })
  hyperparams: {
    percent: number
    interval: number
    top_n: number
  }
}
