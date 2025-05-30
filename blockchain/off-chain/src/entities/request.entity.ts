import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class Request {
  @PrimaryGeneratedColumn('uuid')
  request_id: string

  @Column()
  hospital_addr: string

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  triage_score: number

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date
}
