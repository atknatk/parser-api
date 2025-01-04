import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { parseDateTimeToUTC } from 'src/utils/date-helper';
import { parseTeamString, sanitizePropertyName } from 'src/utils/string-helper';

@Injectable()
export class TransfermarktService {


    extractFikstureMatches(html: string, selector: string): any[] {
        const $ = cheerio.load(html);
        const rows = [];
        const table = $(selector);

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
                const text = element.text().trim();

                // Link ve Title değerlerini ayıkla
                const link = element.find('a').attr('href') || null;
                const title = element.find('a').attr('title') || null;

                // Home team veya Away team içindeki parantezli değerleri ayır
                if (columnName === 'home_team') {
                    row[`${columnName}_orig`] = text;
                    const parsedTeamString = parseTeamString(text);
                    row[`${columnName}_rank`] = parsedTeamString.rank;
                    row[columnName] = parsedTeamString.team;
                } else if (columnName === 'away') {
                    row[`${columnName}_orig`] = text;
                    const parsedTeamString = parseTeamString(text);
                    row[`${columnName}_rank`] = parsedTeamString.rank;
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
                        row['date_time'] = parseDateTimeToUTC(date, time, 'Europe/Malta');
                    }
                } else {
                    row[columnName] = text;
                }

                if (link) row[`${columnName}_link`] = link;
                if (title) row[`${columnName}_title`] = title;

            });

            // Sadece geçerli satırları ekle (Date varsa ve sadece Date değilse)
            if (row['home_team_orig'] && Object.keys(row)?.length > 1) {
                idx++;
                row['idx'] = idx;
                rows.push(row);
            }
        });

        return rows;
    }

}
