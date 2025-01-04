import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { TransfermarktService } from './transfermarkt.service';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { ExtractFikstureMatchesDto } from './dto/extract-fiksture-matches.dto';
import { ExtractTransferMarktMatchesDto } from './dto/extract-matches.dto';

@Controller('transfermarkt')
export class TransfermarktController {

    constructor(private readonly transfermarktService: TransfermarktService) { }

    @Post('extract-fiksture-matches')
    @ApiBody({ type: ExtractFikstureMatchesDto })
    @ApiResponse({
        status: 200,
        description: 'Tablodaki verilerin başarılı bir şekilde ayrıştırılması',
        schema: {
            example: [
                {
                    Date: 'Sat 9/30/00',
                    Time: '3:00 PM',
                    'Home team': '(11.) Bari',
                    Result: '1:1',
                    'Away team': 'Hellas Verona (10.)',
                },
                {
                    Date: 'Sat 9/30/00',
                    Time: '8:30 PM',
                    'Home team': '(15.) Napoli',
                    Result: '1:2',
                    'Away team': 'Juventus (4.)',
                },
            ],
        },
    })
    @ApiResponse({ status: 400, description: 'HTML veya selector eksik' })
    extractFikstureMatches(@Body() body: ExtractFikstureMatchesDto) {
        const { html, selector } = body;

        if (!html || !selector) {
            throw new BadRequestException('HTML veya selector eksik!');
        }

        try {
            return this.transfermarktService.extractFikstureMatches(html, selector);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }



    @Post('extract-matches')
    @ApiBody({ type: ExtractTransferMarktMatchesDto })
    @ApiResponse({
        status: 200,
        description: 'Tablodaki verilerin başarılı bir şekilde ayrıştırılması',
        schema: {
            example: [
                {
                    Date: 'Sat 9/30/00',
                    Time: '3:00 PM',
                    'Home team': '(11.) Bari',
                    Result: '1:1',
                    'Away team': 'Hellas Verona (10.)',
                },
                {
                    Date: 'Sat 9/30/00',
                    Time: '8:30 PM',
                    'Home team': '(15.) Napoli',
                    Result: '1:2',
                    'Away team': 'Juventus (4.)',
                },
            ],
        },
    })
    @ApiResponse({ status: 400, description: 'HTML veya selector eksik' })
    extractMatches(@Body() body: ExtractTransferMarktMatchesDto) {
        const { html } = body;

        if (!html) {
            throw new BadRequestException('HTML veya selector eksik!');
        }

        try {
            return this.transfermarktService.extractMatches(html);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

}
