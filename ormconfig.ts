import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { Poll } from './src/entities/poll.entity';
import { Vote } from 'src/entities/vote.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'polldb',
  entities: [Poll, Vote],
  migrations: [join(__dirname, 'src', 'migrations', '*.{ts,js}')],
  synchronize: false, // set to false in production
  logging: true, // Enable logging to see SQL queries
});
