import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  donation_id: string

  @Column({ nullable: true })
  request_id: string

  @Column()
  donor_addr: string

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  ada_amt: number
}
