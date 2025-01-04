import { ApiProperty } from '@nestjs/swagger';

export class ExtractTransferMarktMatchesDto {
  @ApiProperty({
    description: 'İşlenecek HTML içeriği',
    example: '<div class="large-6 columns">...</div>',
  })
  html: string;
}
