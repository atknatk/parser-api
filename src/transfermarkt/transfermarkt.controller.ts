import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { TransfermarktService } from './transfermarkt.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExtractFikstureMatchesDto } from './dto/extract-fiksture-matches.dto';
import { ExtractTransferMarktMatchesDto } from './dto/extract-matches.dto';
import { ExtractTransferMarktPlayerDto } from './dto/extract-player.dto';
import { ExtractTransferMarktTeamDto, TeamResponse } from './dto/extract-team.dto';

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



    @Post('extract-player')
    @ApiOperation({
        summary: 'Extract player data from Transfermarkt HTML',
        description: 'Extracts detailed player information from a Transfermarkt player profile page HTML'
    })
    @ApiBody({ type: ExtractTransferMarktPlayerDto })
    @ApiResponse({
        status: 200,
        description: 'Successfully extracted player data',
        schema: {
            example: {
                basics: {
                    fullName: "Erling Braut Håland",
                    name: "Erling Haaland",
                    firstName: "Erling",
                    lastName: "Haaland",
                    shirtNumber: "9",
                    image: {
                        url: "https://img.a.transfermarkt.technology/portrait/big/418560-1709108116.png",
                        source: "IMAGO"
                    },
                    currentClub: {
                        name: "Manchester City",
                        link: "/manchester-city/startseite/verein/281",
                        joined: "Jul 1, 2022",
                        contractExpires: "Jun 30, 2027"
                    },
                    marketValue: {
                        value: "200.00",
                        currency: "€",
                        lastUpdate: "Dec 16, 2024"
                    }
                },
                personalInfo: {
                    dateOfBirth: "Jul 21, 2000",
                    age: "24",
                    placeOfBirth: {
                        city: "Leeds",
                        country: "England",
                        countryFlag: "https://tmssl.akamaized.net//images/flagge/tiny/189.png"
                    },
                    height: "1,95 m",
                    position: {
                        main: "Centre-Forward",
                        other: []
                    },
                    foot: "left",
                    citizenship: [
                        {
                            name: "Norway",
                            flag: "https://tmssl.akamaized.net//images/flagge/tiny/125.png"
                        }
                    ]
                },
                nationalTeam: {
                    current: {
                        name: "Norway",
                        link: "/norwegen/startseite/verein/3440",
                        appearances: "39",
                        goals: "38"
                    }
                },
                stats: {
                    nationalTeams: [
                        {
                            team: "Norway",
                            matches: "39",
                            goals: "38",
                            debut: "Sep 5, 2019"
                        }
                    ]
                },
                achievements: [
                    {
                        title: "Champions League winner",
                        count: "1"
                    },
                    {
                        title: "English Champion",
                        count: "2"
                    }
                ],
                youthClubs: "Bryne FK (2006-2015)"
            }
        }
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad request - Invalid or missing HTML content',
        schema: {
            example: {
                statusCode: 400,
                message: "HTML content is required",
                error: "Bad Request"
            }
        }
    })
    extractPlayer(@Body() body: ExtractTransferMarktPlayerDto) {
        const { html } = body;

        if (!html) {
            throw new BadRequestException('HTML content is required');
        }

        try {
            return this.transfermarktService.extractPlayer(html);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }




    @Post('extract-team')
    @ApiOperation({
        summary: 'Extract team data from Transfermarkt HTML',
        description: 'Extracts detailed team information including stats, transfers, achievements, and more'
    })
    @ApiBody({ type: ExtractTransferMarktTeamDto })
    @ApiResponse({
        status: 200,
        description: 'Successfully extracted team data',
        type: TeamResponse
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Invalid or missing HTML content',
        schema: {
            example: {
                statusCode: 400,
                message: 'HTML content is required',
                error: 'Bad Request'
            }
        }
    })
    async extractTeam(@Body() body: ExtractTransferMarktTeamDto): Promise<TeamResponse> {
        const { html } = body;

        if (!html) {
            throw new BadRequestException('HTML content is required');
        }

        try {
            return await this.transfermarktService.extractTeam(html);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

}
