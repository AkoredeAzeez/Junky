import { IsNotEmpty, IsString, IsNumber, Min, Max } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateRequestDto {
  @ApiProperty({
    description: 'Unique identifier for the request',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsString()
  request_id: string

  @ApiProperty({
    description: 'Hospital wallet address',
    example:
      'addr1qxck2s9taw3zawfwluyz78ld2d73kj3wk7docjak3mqkdsh40s2d78wzjvj4891sn8dpc7m89cjzr57kaf6khteaxssffnlaj',
  })
  @IsNotEmpty()
  @IsString()
  hospital_addr: string

  @ApiProperty({
    description: 'AI-generated triage score (0-1)',
    minimum: 0,
    maximum: 1,
    example: 0.75,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(1)
  triage_score: number
}
