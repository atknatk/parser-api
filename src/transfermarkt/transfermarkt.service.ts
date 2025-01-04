import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { parseDateTimeToUTC } from 'src/utils/date-helper';
import { getMinuteFromPosition, getPlayerPosition } from 'src/utils/player-helper';
import { normalizeSpaces, parseTeamString, sanitizePropertyName } from 'src/utils/string-helper';
import { TeamResponse } from './dto/extract-team.dto';

@Injectable()
export class TransfermarktService {

    extractPlayer(html: string) {

        const $ = cheerio.load(html);
        const result = {
            basics: {
                fullName: "",
                name: "",
                firstName: "",
                lastName: "",
                shirtNumber: "",
                image: {
                    url: "",
                    source: ""
                },
                currentClub: {
                    name: "",
                    link: "",
                    logo: "",
                    joined: "",
                    contractExpires: "",
                    contractExtension: ""
                },
                marketValue: {
                    value: "",
                    currency: "",
                    lastUpdate: ""
                }
            },
            personalInfo: {
                dateOfBirth: "",
                age: "",
                placeOfBirth: {
                    city: "",
                    country: "",
                    countryFlag: ""
                },
                citizenship: [],
                height: "",
                position: {
                    main: "",
                    other: [],
                    detailed: ""
                },
                foot: "",
                playerAgent: {
                    name: "",
                    link: "",
                    isVerified: false
                },
                outfitter: ""
            },
            nationalTeam: {
                current: {
                    name: "",
                    link: "",
                    flag: "",
                    appearances: "",
                    goals: ""
                },
                history: []
            },
            achievements: [],
            stats: {
                international: [],
                nationalTeams: []
            },
            socialMedia: [],
            youthClubs: "",
            additionalInfo: "",
            pronunciation: {
                available: false,
                audioUrl: ""
            }
        };

        // Basic Info
        const nameContainer = $('.data-header__headline-wrapper');
        result.basics.shirtNumber = nameContainer.find('.data-header__shirt-number').text().trim().replace('#', '');
        result.basics.firstName = nameContainer.contents().filter((i, el) => el.nodeType === 3).text().trim();
        result.basics.lastName = nameContainer.find('strong').text().trim();
        result.basics.name = result.basics.firstName + ' ' + result.basics.lastName;

        // Image Info
        result.basics.image.url = $('.modal__content img').attr('src') || "";
        result.basics.image.source = $('.bildquelle span').attr('title') || "";

        // Current Club Info
        const clubSection = $('.data-header__box--big');
        result.basics.currentClub = {
            name: clubSection.find('.data-header__club').text().trim(),
            link: clubSection.find('.data-header__club a').attr('href') || "",
            logo: clubSection.find('img').first().attr('src') || "",
            joined: $('.info-table__content:contains("Joined:")').next().text().trim(),
            contractExpires: $('.info-table__content:contains("Contract expires:")').next().text().trim(),
            contractExtension: $('.info-table__content:contains("Last contract extension:")').next().text().trim()
        };

        // Market Value
        const marketValueText = $('.data-header__market-value-wrapper').text().trim();
        const [value, currency] = marketValueText.match(/[€$£](\d+(?:\.\d+)?)(m|k)?/) || ["", "", ""];
        result.basics.marketValue = {
            value: value || "",
            currency: currency || "",
            lastUpdate: $('.data-header__last-update').text().replace('Last update:', '').trim()
        };

        // Personal Information
        $('.info-table__content').each((i, elem) => {
            const label = $(elem).prev('.info-table__content').text().trim();
            const value = $(elem).text().trim();

            switch (label) {
                case 'Name in home country:':
                    result.basics.fullName = value;
                    break;
                case 'Date of birth/Age:':
                    const [date, age] = value.split('(');
                    result.personalInfo.dateOfBirth = date.trim();
                    result.personalInfo.age = age ? age.replace(')', '').trim() : '';
                    break;
                case 'Place of birth:':
                    const placeText = value.split('\n')[0];
                    const [city, country] = placeText.split(/\s+(?=\()/) || [placeText];
                    result.personalInfo.placeOfBirth = {
                        city: city.trim(),
                        country: country ? country.replace(/[()]/g, '').trim() : "",
                        countryFlag: $(elem).find('img').attr('src') || ""
                    };
                    break;
                case 'Citizenship:':
                    result.personalInfo.citizenship = value.split('\n')
                        .map(c => c.trim())
                        .filter(Boolean)
                        .map(country => ({
                            name: country,
                            flag: $(elem).find(`img[title="${country}"]`).attr('src') || ""
                        }));
                    break;
                case 'Height:':
                    result.personalInfo.height = value;
                    break;
                case 'Position:':
                    result.personalInfo.position.main = value;
                    break;
                case 'Foot:':
                    result.personalInfo.foot = value;
                    break;
                case 'Player agent:':
                    result.personalInfo.playerAgent = {
                        name: $(elem).find('a').text().trim(),
                        link: $(elem).find('a').attr('href') || "",
                        isVerified: $(elem).find('img[title="verified"]').length > 0
                    };
                    break;
                case 'Outfitter:':
                    result.personalInfo.outfitter = value;
                    break;
            }
        });

        // Additional Positions
        $('.detail-position__position').each((i, elem) => {
            if (i === 0) {
                result.personalInfo.position.detailed = $(elem).text().trim();
            } else {
                result.personalInfo.position.other.push($(elem).text().trim());
            }
        });

        // Achievements
        $('.data-header__success-data').each((i, elem) => {
            const achievement = {
                title: $(elem).attr('title') || "",
                count: $(elem).find('.data-header__success-number').text().trim(),
                icon: $(elem).find('img').attr('src') || ""
            };
            result.achievements.push(achievement);
        });

        // National Team Career
        $('.national-career__row').not('.national-career__row--header').each((i, elem) => {
            const teamData = {
                number: $(elem).find('.grid__cell--center').first().text().trim(),
                team: $(elem).find('.grid__cell--club a').last().text().trim(),
                teamLink: $(elem).find('.grid__cell--club a').last().attr('href') || "",
                flag: $(elem).find('.grid__cell--club img').attr('data-src') || "",
                debut: $(elem).find('.grid__cell--center').eq(2).text().trim(),
                matches: $(elem).find('.grid__cell--center').eq(3).text().trim(),
                goals: $(elem).find('.grid__cell--center').last().text().trim(),
                isCaptain: $(elem).find('.national-career__icon--captain').length > 0
            };
            result.stats.nationalTeams.push(teamData);
        });

        // Current National Team Info
        const nationalTeamSection = $('.data-header__items li:contains("Current international:")');
        if (nationalTeamSection.length) {
            result.nationalTeam.current = {
                name: nationalTeamSection.find('a').text().trim(),
                link: nationalTeamSection.find('a').attr('href') || "",
                flag: nationalTeamSection.find('img').attr('src') || "",
                appearances: $('.data-header__content--highlight').first().text().trim(),
                goals: $('.data-header__content--highlight').last().text().trim()
            };
        }

        // Social Media Links
        $('.social-media-toolbar__icons a').each((i, elem) => {
            const socialMedia = {
                platform: $(elem).attr('title') || "",
                link: $(elem).attr('href') || "",
                icon: $(elem).find('img').attr('data-src') || ""
            };
            result.socialMedia.push(socialMedia);
        });

        // Youth Clubs
        result.youthClubs = $('.tm-player-additional-data .content').first().text().trim();

        // Additional Information
        result.additionalInfo = $('.tm-player-additional-data .content').last().text().trim();

        // Pronunciation
        const pronunciationAudio = $('#audio_aussprache');
        if (pronunciationAudio.length) {
            result.pronunciation = {
                available: true,
                audioUrl: pronunciationAudio.find('source').attr('src') || ""
            };
        }

        return result;
    }

    extractMatches(html: string) {
        const $ = cheerio.load(html);
        const result = {
            matchResult: "",
            firstHalfResult: "",
            stadium: "",
            stadiumLink: "",
            attendance: "",
            referee: "",
            refereeLink: "",
            homeTeam: {
                name: "",
                link: "",
                title: "",
                score: "",
                startingLineUp: "",
                position: "",
                players: [],
                substitutes: [],
                manager: "",
                managerLink: ""
            },
            awayTeam: {
                name: "",
                link: "",
                title: "",
                score: "",
                startingLineUp: "",
                position: "",
                players: [],
                substitutes: [],
                manager: "",
                managerLink: ""
            },
            goals: [],
            substitutions: [],
            cards: []
        };

        // Basic match info
        const scoreText = $('.sb-endstand').first().text().trim();
        const firstHalfText = $('.sb-halbzeit').first().text().trim();
        result.matchResult = scoreText.split('(')[0].trim();
        result.firstHalfResult = firstHalfText.replace(/[\(\)]/g, '');

        // Stadium, attendance and referee
        result.stadium = $('.sb-zusatzinfos a').first().text().trim();
        result.stadiumLink = $('.sb-zusatzinfos a').first().attr('href') || "";

        // Extract attendance if exists
        const infoText = $('.sb-zusatzinfos').text();
        const attendanceMatch = infoText.match(/Attendance: ([\d.,]+)/);
        result.attendance = attendanceMatch ? attendanceMatch[1] : "";

        // Extract referee
        const refereeElement = $('.sb-zusatzinfos strong:contains("Referee:")').next().next('a');
        result.referee = refereeElement.text().trim();
        result.refereeLink = refereeElement.attr('href') || "";

        // Home team
        const homeTeamSection = $('.large-6.columns.aufstellung-box').first();
        const homeTeamLinkElement = homeTeamSection.find('.sb-vereinslink').first();
        result.homeTeam.name = homeTeamLinkElement.text().trim();
        result.homeTeam.link = homeTeamLinkElement.attr('href') || "";
        result.homeTeam.position = homeTeamSection.find('[data-type="link"]').text().replace('Position:', '').trim();
        result.homeTeam.startingLineUp = homeTeamSection.find('.aufstellung-unterueberschrift').first().text().trim();

        // Away team
        const awayTeamSection = $('.large-6.columns').last();
        const awayTeamLinkElement = awayTeamSection.find('.sb-vereinslink').first();
        result.awayTeam.name = awayTeamLinkElement.text().trim();
        result.awayTeam.link = awayTeamLinkElement.attr('href') || "";
        result.awayTeam.position = awayTeamSection.find('[data-type="link"]').text().replace('Position:', '').trim();
        result.awayTeam.startingLineUp = awayTeamSection.find('.aufstellung-unterueberschrift').first().text().trim();

        // Goals
        $('#sb-tore li').each((i, elem) => {
            const scorerElement = $(elem).find('.sb-aktion-aktion a').first();
            const assistElement = $(elem).find('.sb-aktion-aktion a').last();
            const isHome = $(elem).hasClass('sb-aktion-heim');
            const style = $(elem).find('.sb-aktion-uhr span').attr('style') || '';
            const goalInfo = {
                minute: getMinuteFromPosition(style.split('background-position:')[1] || ''),
                score: $(elem).find('.sb-aktion-spielstand b').text().trim(),
                scorer: scorerElement.text().trim(),
                scorerLink: scorerElement.attr('href') || "",
                team: isHome ? result.homeTeam.name : result.awayTeam.name,
                side: isHome ? 'home' : 'away',
                assist: $(elem).find('.sb-aktion-aktion').text().includes('Assist:') ? assistElement.text().trim() : 'No assist',
                assistLink: $(elem).find('.sb-aktion-aktion').text().includes('Assist:') ? (assistElement.attr('href') || "") : ""
            };
            result.goals.push(goalInfo);
        });

        // Substitutions
        $('#sb-wechsel li').each((i, elem) => {
            const playerInElement = $(elem).find('.sb-aktion-wechsel-ein a');
            const playerOutElement = $(elem).find('.sb-aktion-wechsel-aus a');
            const isHome = $(elem).hasClass('sb-aktion-heim');
            const style = $(elem).find('.sb-aktion-uhr span').attr('style') || '';
            const subInfo = {
                minute: getMinuteFromPosition(style.split('background-position:')[1] || ''),
                playerIn: playerInElement.text().trim(),
                playerInLink: playerInElement.attr('href') || "",
                playerOut: playerOutElement.text().trim(),
                playerOutLink: playerOutElement.attr('href') || "",
                team: isHome ? result.homeTeam.name : result.awayTeam.name,
                side: isHome ? 'home' : 'away',
                reason: $(elem).find('.sb-aktion-spielstand span').attr('title') || 'Tactical'
            };
            result.substitutions.push(subInfo);
        });

        // Cards
        $('#sb-karten li').each((i, elem) => {
            const playerElement = $(elem).find('.sb-aktion-aktion a').first();
            const isHome = $(elem).hasClass('sb-aktion-heim');
            const style = $(elem).find('.sb-aktion-uhr span').attr('style') || '';
            const cardInfo = {
                minute: getMinuteFromPosition(style.split('background-position:')[1] || ''),
                player: playerElement.text().trim(),
                playerLink: playerElement.attr('href') || "",
                team: isHome ? result.homeTeam.name : result.awayTeam.name,
                side: isHome ? 'home' : 'away',
                type: $(elem).find('.sb-aktion-aktion').text().includes('Yellow card') ? 'Yellow' : 'Red',
                reason: $(elem).find('.sb-aktion-aktion').text().split(',')[1]?.trim() || 'Not specified'
            };
            result.cards.push(cardInfo);
        });

        // Players for home team
        homeTeamSection.find('.aufstellung-spieler-container').each((i, elem) => {
            const playerElement = $(elem).find('.aufstellung-rueckennummer-name a');
            const player = {
                number: $(elem).find('.tm-shirt-number').text().trim(),
                name: playerElement.text().trim(),
                playerLink: playerElement.attr('href') || "",
                position: getPlayerPosition(i)
            };
            result.homeTeam.players.push(player);
        });

        // Players for away team
        awayTeamSection.find('.aufstellung-spieler-container').each((i, elem) => {
            const playerElement = $(elem).find('.aufstellung-rueckennummer-name a');
            const player = {
                number: $(elem).find('.tm-shirt-number').text().trim(),
                name: playerElement.text().trim(),
                playerLink: playerElement.attr('href') || "",
                position: getPlayerPosition(i)
            };
            result.awayTeam.players.push(player);
        });

        // Substitutes for home team
        homeTeamSection.find('.ersatzbank tr').each((i, elem) => {
            if (!$(elem).find('div:contains("Manager:")').length) {
                const playerElement = $(elem).find('td:nth-child(2) a').first();
                const substitute = {
                    number: $(elem).find('.tm-shirt-number').text().trim(),
                    name: playerElement.text().trim(),
                    playerLink: playerElement.attr('href') || "",
                    position: $(elem).find('td:last-child').text().trim()
                };
                if (substitute.name) {
                    result.homeTeam.substitutes.push(substitute);
                }
            }
        });

        // Substitutes for away team
        awayTeamSection.find('.ersatzbank tr').each((i, elem) => {
            if (!$(elem).find('div:contains("Manager:")').length) {
                const playerElement = $(elem).find('td:nth-child(2) a').first();
                const substitute = {
                    number: $(elem).find('.tm-shirt-number').text().trim(),
                    name: playerElement.text().trim(),
                    playerLink: playerElement.attr('href') || "",
                    position: $(elem).find('td:last-child').text().trim()
                };
                if (substitute.name) {
                    result.awayTeam.substitutes.push(substitute);
                }
            }
        });

        // Managers
        const homeManagerElement = homeTeamSection.find('.ersatzbank tr:last-child a');
        const awayManagerElement = awayTeamSection.find('.ersatzbank tr:last-child a');
        result.homeTeam.manager = homeManagerElement.text().trim();
        result.homeTeam.managerLink = homeManagerElement.attr('href') || "";
        result.awayTeam.manager = awayManagerElement.text().trim();
        result.awayTeam.managerLink = awayManagerElement.attr('href') || "";

        return result;
    }



    extractFikstureMatches(html: string, selector: string): any[] {
        const $ = cheerio.load(html);
        const rows = [];
        const table = $(selector);
        const league = Number(normalizeSpaces($('.content-box-headline').text().trim()).split('.')[0]);
        if (!table.length) {
            throw new Error('Tablo bulunamadı!');
        }

        // Başlıkları oku (th)
        const headers: string[] = [];
        table.find('thead tr th').each((_, th) => {
            const headerText = $(th).text().trim();
            headers.push(sanitizePropertyName(headerText || `Column${headers.length + 1}`));
        });

        // Satırları oku (tbody > tr)
        let idx = 0;
        let date;
        let time;
        table.find('tbody tr').each((_, tr) => {
            const row = {};

            $(tr).find('td').each((index, td) => {
                const columnName = headers[index] || `column${index + 1}`;
                const element = $(td);

                // Hücre metni
                const text = normalizeSpaces(element.text().trim());

                // Link ve Title değerlerini ayıkla
                const link = element.find('a').attr('href') || null;
                const title = element.find('a').attr('title') || null;

                // Home team veya Away team içindeki parantezli değerleri ayır
                if (columnName === 'homeTeam') {
                    row[`${columnName}Original`] = text;
                    const parsedTeamString = parseTeamString(text);
                    row[`${columnName}Position`] = parsedTeamString.rank;
                    row[columnName] = parsedTeamString.team;
                } else if (columnName === 'away') {
                    row[`${columnName}Original`] = text;
                    const parsedTeamString = parseTeamString(text);
                    row[`${columnName}Position`] = parsedTeamString.rank;
                    row[columnName] = parsedTeamString.team;
                } else if (columnName === 'date' && !(text.includes(' AM') || text.includes(' PM'))) {
                    if (text && text.split(' ').length == 2) {
                        date = text.split(' ')[1]?.trim();
                    }
                    row[columnName] = text;
                } else if (columnName === 'time') {
                    row[columnName] = text;
                    if (text && text?.length > 0) {
                        time = text;
                    }
                    if (date && time && time?.length > 0) {
                        row['dateTime'] = parseDateTimeToUTC(date, time, 'Europe/Malta');
                    }
                } else {
                    row[columnName] = text;
                }

                if (link) row[`${columnName}Link`] = link;
                if (title) row[`${columnName}Title`] = title;

            });

            // Sadece geçerli satırları ekle (Date varsa ve sadece Date değilse)
            if (row['homeTeamOriginal'] && Object.keys(row)?.length > 1) {
                idx++;
                row['idx'] = idx;
                row['leagueWeek'] = league;
                rows.push(row);
            }
        });

        return rows;
    }



    async extractTeam(html: string): Promise<TeamResponse> {
        const $ = cheerio.load(html);
        
        return {
            basics: this.extractBasics($),
            achievements: this.extractAchievements($),
            transfers: this.extractTransfers($),
            topPlayers: this.extractTopPlayers($),
            staff: this.extractStaff($),
            facts: this.extractFacts($),
            seasonRecord: this.extractSeasonRecord($),
            relatedTeams: this.extractRelatedTeams($)
        };
    }

    private extractBasics($: cheerio.CheerioAPI) {
        const basics = {
            name: $('.data-header__headline-wrapper').text().trim(),
            nameLink: $('.data-header__headline-wrapper a').attr('href') || '',
            image: {
                url: $('.data-header__profile-container img').attr('src') || '',
                alt: $('.data-header__profile-container img').attr('alt') || ''
            },
            league: {
                name: $('.data-header__club a').first().text().trim(),
                link: $('.data-header__club a').first().attr('href') || '',
                logo: $('.data-header__box--big img').first().attr('srcset')?.split(' ')[0] || '',
                level: $('.data-header__club-info .data-header__content').first().text().trim(),
                country: {
                    name: $('.data-header__club-info img').attr('title') || '',
                    flag: $('.data-header__club-info img').attr('src') || ''
                }
            },
            currentStats: {
                squadSize: $('.data-header__items li:contains("Squad size") .data-header__content').text().trim(),
                averageAge: $('.data-header__items li:contains("Average age") .data-header__content').text().trim(),
                foreigners: {
                    count: $('.data-header__items li:contains("Foreigners") a').text().trim(),
                    percentage: $('.data-header__items li:contains("Foreigners") .tabellenplatz').text().trim(),
                    link: $('.data-header__items li:contains("Foreigners") a').attr('href') || ''
                },
                nationalTeamPlayers: {
                    count: $('.data-header__items li:contains("National team players") a').text().trim(),
                    link: $('.data-header__items li:contains("National team players") a').attr('href') || ''
                },
                stadium: {
                    name: $('.data-header__items li:contains("Stadium") a').first().text().trim(),
                    nameLink: $('.data-header__items li:contains("Stadium") a').attr('href') || '',
                    capacity: $('.data-header__items li:contains("Stadium") .tabellenplatz').text().trim()
                },
                currentTransferRecord: {
                    value: $('.data-header__items li:contains("Current transfer record") .redtext').text().trim(),
                    link: $('.data-header__items li:contains("Current transfer record") a').attr('href') || ''
                }
            },
            marketValue: {
                total: $('.data-header__market-value-wrapper')
                    .text()
                    .replace(/[^0-9.]/g, ''),
                currency: $('.waehrung').first().text().trim(),
                link: $('.data-header__market-value-wrapper').attr('href') || ''
            },
            leaguePosition: {
                position: $('.data-header__club-info:contains("Table position") a').text().trim(),
                link: $('.data-header__club-info:contains("Table position") a').attr('href') || ''
            },
            leagueHistory: {
                years: $('.data-header__club-info:contains("In league since") a').text().trim(),
                link: $('.data-header__club-info:contains("In league since") a').attr('href') || ''
            }
        };

        return basics;
    }

    private extractAchievements($: cheerio.CheerioAPI) {
        const achievements: any[] = [];
        
        $('.data-header__badge-container a').each((_, elem) => {
            achievements.push({
                title: $(elem).attr('title') || '',
                titleLink: $(elem).attr('href') || '',
                count: $(elem).find('.data-header__success-number').text().trim(),
                imageUrl: $(elem).find('img').attr('data-src') || ''
            });
        });

        return achievements;
    }

    private extractTransfers($: cheerio.CheerioAPI) {
        const arrivals: any[] = [];
        const departures: any[] = [];

        // Parse arrivals
        $('div[name="zugaenge"] + div .items tbody tr').each((_, elem) => {
            arrivals.push(this.parseTransferRow($, elem));
        });

        // Parse departures
        $('div[name="zugaenge"] + div + div .items tbody tr').each((_, elem) => {
            departures.push(this.parseTransferRow($, elem));
        });

        return {
            season: $('select[name="saison_id"] option:selected').text().trim(),
            arrivals,
            departures,
            stats: this.extractTransferStats($)
        };
    }

    private extractTransferStats($: cheerio.CheerioAPI) {
        const incomeCount = $('.transfer-record__revenue .test-class').text().trim();
        const incomeValue = $('.transfer-record__revenue .transfer-record__total').text().trim();
        const expenditureText = $('.transfer-record__expenses .transfer-record__text').text().trim();
        const expenditureValue = $('.transfer-record__expenses .transfer-record__total').text().trim();
        const balance = $('.transfer-record__text--bold').next().text().trim();

        return {
            income: {
                count: incomeCount ? parseInt(incomeCount) : 0,
                value: incomeValue
            },
            expenditure: {
                count: expenditureText ? parseInt(expenditureText.match(/\d+/)?.[0] || '0') : 0,
                value: expenditureValue
            },
            balance
        };
    }
    

    private parseTransferRow($: cheerio.CheerioAPI, elem: any) {
        const $elem = $(elem);
        const playerInfo = $elem.find('.inline-table');
        const transfer = {
            player: {
                name: playerInfo.find('.hauptlink a').first().text().trim(),
                link: playerInfo.find('.hauptlink a').first().attr('href') || '',
                image: playerInfo.find('img').attr('data-src') || '',
                position: playerInfo.find('tr:last-child td').text().trim(),
                age: $elem.find('td.zentriert:not([class*="rueckennummer"])').text().trim()
            },
            nationalities: [] as any[],
            club: {
                name: '',
                link: '',
                logo: '',
                league: {
                    name: '',
                    link: ''
                }
            },
            fee: {
                amount: '',
                link: ''
            },
            marketValue: ''
        };

        // Extract nationalities
        $elem.find('td.zentriert img.flaggenrahmen').each((_, flag) => {
            transfer.nationalities.push({
                name: $(flag).attr('title') || '',
                flag: $(flag).attr('src') || ''
            });
        });

        // Extract club info
        const clubInfo = $elem.find('td:nth-child(5) .inline-table');
        if (clubInfo.length) {
            transfer.club = {
                name: clubInfo.find('.hauptlink').first().text().trim(),
                link: clubInfo.find('.hauptlink a').attr('href') || '',
                logo: clubInfo.find('img.tiny_wappen').attr('src') || '',
                league: {
                    name: clubInfo.find('tr:last-child td a:last').text().trim(),
                    link: clubInfo.find('tr:last-child td a:last').attr('href') || ''
                }
            };
        }

        // Extract fee
        const feeCell = $elem.find('td.rechts.hauptlink');
        transfer.fee = {
            amount: feeCell.text().trim(),
            link: feeCell.find('a').attr('href') || ''
        };

        return transfer;
    
    }

    private extractTopPlayers($: cheerio.CheerioAPI) {
        const goals: any[] = [];
        const assists: any[] = [];

        // Extract top scorers
        $('.torschuetzen-widget tbody tr').each((_, elem) => {
            goals.push({
                name: $(elem).find('.spielername').text().trim(),
                link: $(elem).find('.table-link').first().attr('href') || '',
                position: $(elem).find('.spieler-zusatz').text().trim(),
                value: $(elem).find('.tore').text().trim()
            });
        });

        // Extract top assists
        $('.vorlagengeber-widget tbody tr').each((_, elem) => {
            assists.push({
                name: $(elem).find('.spielername').text().trim(),
                link: $(elem).find('.table-link').first().attr('href') || '',
                position: $(elem).find('.spieler-zusatz').text().trim(),
                value: $(elem).find('.tore').text().trim()
            });
        });

        return { goals, assists };
    }

    private extractStaff($: cheerio.CheerioAPI) {
        const staff: any[] = [];
        
        // Find all players in the squad listing
        $('#yw1 tbody tr').each((_, elem) => {
            const $elem = $(elem);
            const playerInfo = $elem.find('.inline-table');
            const playerRow = {
                name: playerInfo.find('.hauptlink a').first().text().trim(),
                link: playerInfo.find('.hauptlink a').first().attr('href') || '',
                role: playerInfo.find('tr:last-child td').text().trim(),
                image: playerInfo.find('img').attr('data-src') || '',
                shirtNumber: $elem.find('.rn_nummer').text().trim(),
                age: $elem.find('td:nth-child(3)').text().trim(),
                nationalities: [] as any[]
            } as any;

            // Extract all nationality flags
            $elem.find('td:nth-child(4) img').each((_, flag) => {
                playerRow.nationalities.push({
                    name: $(flag).attr('title') || '',
                    flag: $(flag).attr('src') || ''
                });
            });

            // Extract market value
            const marketValue = {
                value: $elem.find('td:last-child a').first().text().trim(),
                trend: '' as string
            };

            // Check market value trend
            if ($elem.find('.icons_sprite.red-arrow-ten').length) {
                marketValue.trend = 'down';
            } else if ($elem.find('.icons_sprite.green-arrow-ten').length) {
                marketValue.trend = 'up';
            } else if ($elem.find('.icons_sprite.grey-block-ten').length) {
                marketValue.trend = 'stable';
            }

            playerRow.marketValue = marketValue;

            // Check if player is injured or suspended
            const status = playerInfo.find('.verletzt-table, .ausfall-1-table');
            if (status.length) {
                playerRow.status = {
                    type: status.hasClass('verletzt-table') ? 'injured' : 'suspended',
                    reason: status.attr('title') || ''
                };
            }

            // Check if player is team captain
            if (playerInfo.find('.kapitaenicon-table').length) {
                playerRow.isCaptain = true;
            }

            staff.push(playerRow);
        });

        return staff;
    }

    private extractFacts($: cheerio.CheerioAPI) {
        return {
            officialName: $('.info-table__content:contains("Official club name")').next().text().trim(),
            address: $('.info-table span[itemprop="streetAddress"]').text().trim(),
            postalCode: $('.info-table span[itemprop="postalCode"]').text().trim(),
            country: $('.info-table span[itemprop="addressLocality"]').text().trim(),
            phone: $('.info-table span[itemprop="telephone"]').text().trim(),
            fax: $('.info-table span[itemprop="faxNumber"]').text().trim(),
            website: $('.info-table span[itemprop="url"] a').text().trim(),
            founded: $('.info-table span[itemprop="foundingDate"]').text().trim(),
            members: $('.info-table span[itemprop="member"]').text().trim()
        };
    }

    private extractSeasonRecord($: cheerio.CheerioAPI) {
        const records: any[] = [];
        
        $('div.box:contains("Season record") tbody tr').each((_, elem) => {
            records.push({
                competition: {
                    name: $(elem).find('.hauptlink a').text().trim(),
                    link: $(elem).find('.hauptlink a').attr('href') || ''
                },
                achievement: $(elem).find('td:last-child').text().trim()
            });
        });

        return records;
    }

    private extractRelatedTeams($: cheerio.CheerioAPI) {
        const teams: any[] = [];
        
        $('.data-header__list-clubs li').each((_, elem) => {
            teams.push({
                name: $(elem).find('a').text().trim(),
                link: $(elem).find('a').attr('href') || '',
                logo: $(elem).find('img').attr('src') || ''
            });
        });

        return teams;
    }


}
