import { ApiProperty } from '@nestjs/swagger';

export class ExtractTransferMarktPlayerDto {
  @ApiProperty({
      description: 'Player profile page HTML content',
      required: true,
      type: String
  })
  html: string;
}