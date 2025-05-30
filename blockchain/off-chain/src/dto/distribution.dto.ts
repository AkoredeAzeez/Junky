import { IsNotEmpty, IsString, IsNumber, Min, Max } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class DistributionDto {
  @ApiProperty({
    description: 'Pool ID to distribute from',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsString()
  pool_id: string

  @ApiProperty({
    description: 'Distribution interval in days',
    example: 10,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  interval: number

  @ApiProperty({
    description: 'Percentage of pool to distribute (0-1)',
    minimum: 0,
    maximum: 1,
    example: 0.2,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(1)
  percent: number

  @ApiProperty({
    description: 'Number of top requests to consider',
    example: 5,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  top_n: number
}
