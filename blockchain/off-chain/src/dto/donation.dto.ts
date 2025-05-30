import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class DonationDto {
  @ApiProperty({
    description: 'Unique identifier for the donation',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsString()
  donation_id: string

  @ApiProperty({
    description: 'Donor wallet address',
    example:
      'addr1q9ld26v2lv5n8f6y9s4s0ta9r4jqg8f4xd0e5278zsgdnsqme76c49xns92kwv9hvlgud8q7v8ec2v5w78wnkm2xkh9qh4xrdf',
  })
  @IsNotEmpty()
  @IsString()
  donor_addr: string

  @ApiProperty({
    description: 'Amount of ADA donated',
    minimum: 0,
    example: 100.5,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  ada_amount: number

  @ApiProperty({
    description: 'Optional request ID to vote for',
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  request_id?: string
}
