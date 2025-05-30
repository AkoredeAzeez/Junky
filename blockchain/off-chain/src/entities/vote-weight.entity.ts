import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class VoteWeight {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  request_id: string

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  ai_weight: number

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  donor_weight: number

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  total_weight: number
}
