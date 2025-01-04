import { Module } from '@nestjs/common';
import { TransfermarktService } from './transfermarkt.service';
import { TransfermarktController } from './transfermarkt.controller';

@Module({
  providers: [TransfermarktService],
  controllers: [TransfermarktController]
})
export class TransfermarktModule {}
