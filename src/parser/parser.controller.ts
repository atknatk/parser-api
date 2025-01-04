import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ParserService } from './parser.service';
import { ExtractHtmlDto } from './dto/extract-html.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('html-parser')
export class ParserController {
    constructor(private readonly parserService: ParserService) { }

    @Post()
    @ApiBody({ type: ExtractHtmlDto }) // Swagger için body şeması
    @ApiResponse({
        status: 200, description: 'Başarılı işlem sonucu', schema: {
            example: {
                matches: ["<p class='text'>Text 1</p>", "<p class='text'>Text 2</p>"]
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Geçersiz istek' })
    extractHtml(@Body() body: ExtractHtmlDto) {
        const { html, selector } = body;

        if (!html || !selector) {
            throw new BadRequestException('Both "html" and "selector" fields are required.');
        }

        try {
            const matches = this.parserService.extractHtml(html, selector);
            return { matches };
        } catch (error) {
            throw new BadRequestException('An error occurred while processing the HTML.');
        }
    }

}
