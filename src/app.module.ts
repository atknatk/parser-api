import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransfermarktModule } from './transfermarkt/transfermarkt.module';
import { ParserModule } from './parser/parser.module';

@Module({
  imports: [TransfermarktModule, ParserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
