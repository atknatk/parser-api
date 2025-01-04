import { ApiProperty } from '@nestjs/swagger';

export class ExtractHtmlDto {
  @ApiProperty({
    description: 'İşlenecek HTML içeriği',
    example: "<div><p class='text'>Hello</p></div>",
  })
  html: string;

  @ApiProperty({
    description: 'HTML seçicisi (class, id veya element adı)',
    example: '.text',
  })
  selector: string;
}