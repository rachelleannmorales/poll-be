import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll } from '../../entities/poll.entity';
import { Vote } from '../../entities/vote.entity';
import { EventsGateway } from '../../gateways/events.gateway';
@Injectable() 
export class PollService {
  constructor(
    @InjectRepository(Poll)
    private readonly pollRepository: Repository<Poll>,
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async create(pollData: Partial<Poll>) {
    const poll = this.pollRepository.create(pollData);
    return this.pollRepository.save(poll);
  }

  async findAll() { 
    return this.pollRepository.find();
  }

  async findOne(id: number) {
    return this.pollRepository.findOne({ where: { id } });
  }

  async findVotes(id: number) {
    return this.voteRepository.find({ where: { poll: { id } } });
  }

  async update(id: number, pollData: Partial<Poll>) {
    await this.pollRepository.update({ id }, pollData);
    return this.pollRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const poll = await this.findOne(id);
    if (!poll) {
        throw new NotFoundException('Poll not found');
    }
    return this.pollRepository.remove(poll);
  }

  async vote(pollId: string, optionIndex: number, voterHash: string) {
    const poll = await this.pollRepository.findOne({
      where: { id: parseInt(pollId) },
      relations: ['votes'],
    });
    if (!poll) throw new NotFoundException('Poll not found');

    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      throw new BadRequestException('Poll has expired');
    }
  
    const existing = await this.voteRepository.findOne({
      where: { poll: { id: parseInt(pollId) }, voterHash },
    });
  
    if (existing) {
      throw new NotFoundException('User has already voted');
    }
  
    const vote = this.voteRepository.create({
      poll,
      optionIndex,
      voterHash,
    });

    this.voteRepository.save(vote);

    const tallyDelta = { optionIndex, increment: 1 };

    this.eventsGateway.broadcastTallyDelta(pollId, tallyDelta);

    return { success: true };
  }

}
  