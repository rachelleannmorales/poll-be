import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poll } from '../../entities/poll.entity';
import { PollService } from './poll.service'; 
import { PollController } from './poll.controller';
import { Vote } from 'src/entities/vote.entity';
import { EventsGateway } from '../../gateways/events.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Poll, Vote])],
  providers: [PollService, EventsGateway],
  controllers: [PollController],
  exports: [PollService],
})
export class PollModule {}
