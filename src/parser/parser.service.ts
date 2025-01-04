import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';

@Injectable()
export class ParserService {

    extractHtml(html: string, selector: string): string[] {
        const $ = cheerio.load(html);
        const elements = $(selector);
        const result: string[] = [];
    
        elements.each((_, element) => {
          result.push($.html(element));
        });
    
        return result;
      }

}
