import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { PollService } from './poll.service';
import { Poll } from '../../entities/poll.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Vote } from 'src/entities/vote.entity';
@Controller('poll')
export class PollController {
  constructor(private readonly pollService: PollService) {}

  @Post()
  async create(@Body() pollData: Partial<Poll>) {
    return this.pollService.create(pollData);
  }

  @Get()
  async findAll() {
    return this.pollService.findAll();
  }

  @Get(':id')
  async getPollWithTally(@Param('id') id: string) {
    const poll = await this.pollService.findOne(parseInt(id));
    if (!poll) throw new NotFoundException('Poll not found');

    const votes = await this.pollService.findVotes(parseInt(id));

    const tally = poll.options.map((value, index) => {
        if (!votes) return {
          option: value,
          value: 0
        }
        return  {
          option: value,
          value: votes.filter((v) => v.optionIndex === index).length
        }
      }
    );

    return {
      id: poll.id,
      question: poll.question,
      options: poll.options,
      expiresAt: poll.expiresAt,
      tally,
    };
  }

  @Post(':id/vote')
  @UseGuards(JwtAuthGuard)
  async vote(
    @Param('id') pollId: string,
    @Body('optionIndex') optionIndex: number,
    @Req() req: any,
  ) {
    const voterHash = req.user.sub;
    return this.pollService.vote(pollId, optionIndex, voterHash);
  } 

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.pollService.remove(id);
  }
}
