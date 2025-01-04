import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { parseDateTimeToUTC } from 'src/utils/date-helper';
import { getMinuteFromPosition, getPlayerPosition } from 'src/utils/player-helper';
import { normalizeSpaces, parseTeamString, sanitizePropertyName } from 'src/utils/string-helper';

@Injectable()
export class TransfermarktService {

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

}
