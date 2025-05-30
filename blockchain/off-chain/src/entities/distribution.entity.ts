import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class Distribution {
  @PrimaryGeneratedColumn('uuid')
  distribution_id: string

  @Column()
  interval: number

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  percent_pool: number

  @Column('json')
  recipients: Array<{ request_id: string; amount: number }>
}
