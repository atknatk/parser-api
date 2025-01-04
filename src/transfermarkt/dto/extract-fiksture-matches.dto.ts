import { ApiProperty } from '@nestjs/swagger';

export class ExtractFikstureMatchesDto {
  @ApiProperty({
    description: 'İşlenecek HTML içeriği',
    example: '<div class="large-6 columns">...</div>',
  })
  html: string;

  @ApiProperty({
    description: 'Seçici (ör. tablo için "table")',
    example: 'table',
  })
  selector: string;
}
