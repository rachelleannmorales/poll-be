import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    Unique,
  } from 'typeorm';
  import { Poll } from './poll.entity';
  
  @Entity()
  @Unique(['poll', 'voterHash'])
  export class Vote {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => Poll, (poll) => poll.votes, { onDelete: 'CASCADE' })
    poll: Poll;
  
    @Column()
    optionIndex: number;
  
    @CreateDateColumn()
    createdAt: Date;

    @Column()
    voterHash: string;
  }
  