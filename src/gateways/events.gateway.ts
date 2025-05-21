import {
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { RedisClientType, createClient } from 'redis';
  import { createAdapter } from '@socket.io/redis-adapter';
  import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
  
  const pubClient = createClient({ 
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          return new Error('Max retries reached');
        }
        return Math.min(retries * 100, 3000);
      }
    }
  });
  const subClient = pubClient.duplicate();
  
  @Injectable()
  @WebSocketGateway({
    namespace: /^\/poll\/\d+$/,
    cors: {
      origin: '*',
    },
    adapter: createAdapter(pubClient, subClient)
  })
  export class EventsGateway implements OnModuleInit, OnModuleDestroy {
    @WebSocketServer()
    server: Server;
  
    private readonly RATE_LIMIT_WINDOW = 60; // 1 minute window
    private readonly MAX_REQUESTS = 5; // max requests per window
    private isConnected = false;
  
    async onModuleInit() {
      try {
        await Promise.all([pubClient.connect(), subClient.connect()]);
        this.isConnected = true;
        console.log('WebSocket Gateway initialized successfully');
        console.log('Redis connection established');
      } catch (error) {
        console.error('Failed to initialize Redis:', error);
        throw error;
      }
    }
  
    async onModuleDestroy() {
      if (this.isConnected) {
        await Promise.all([pubClient.disconnect(), subClient.disconnect()]);
        this.isConnected = false;
        console.log('WebSocket Gateway disconnected');
      }
    }

    handleConnection(client: Socket) {
        console.log('Client connected:', client.id);
      
        const pollId = client.nsp.name.split('/').pop();
        if (!pollId) {
          console.error('Invalid poll ID in namespace');
          client.emit('error', { message: 'Invalid poll ID' });
          client.disconnect();
          return;
        }
      
        this.handleJoinPoll(client, pollId).catch(err => {
          console.error('Error joining poll:', err);
          client.emit('error', { message: 'Failed to join poll' });
          client.disconnect();
        });
      }
      

      handleDisconnect(client: Socket) {
        console.log('Client disconnected:', client.id);
      }
  
    private async ensureConnection() {
      if (!this.isConnected) {
        await this.onModuleInit();
      }
    }

    private async handleJoinPoll(client: Socket, pollId: string) {
      await this.ensureConnection();
      
      const clientId = client.id;
      const key = `rate_limit:${clientId}`;
      
      // Check rate limit
      const requests = await pubClient.incr(key);
      if (requests === 1) {
        await pubClient.expire(key, this.RATE_LIMIT_WINDOW);
      }
      
      if (requests > this.MAX_REQUESTS) {
        client.emit('error', { message: 'Rate limit exceeded' });
        return;
      }

      const room = `poll:${pollId}`;
      client.join(room);
      console.log(`Client ${clientId} joined poll room: ${room}`);
      
      const currentTally = await this.getLatestTally(pollId);
      if (currentTally) {
        client.emit('tallyUpdate', currentTally);
      }
    }
  
    async broadcastTallyDelta(pollId: string, tallyDelta: any) {
      await this.ensureConnection();
      
      const channel = `poll:${pollId}`;
      try {
        await pubClient.set(`tally:${pollId}`, JSON.stringify(tallyDelta));
        this.server.to(channel).emit('tallyUpdate', tallyDelta);
        console.log(`Broadcasted tally update to room ${channel}:`, tallyDelta);
      } catch (error) {
        console.error('Error broadcasting tally:', error);
        throw error;
      }
    }

    async getLatestTally(pollId: string) {
      await this.ensureConnection();
      
      try {
        const tally = await pubClient.get(`tally:${pollId}`);
        return tally ? JSON.parse(tally) : null;
      } catch (error) {
        console.error('Error getting latest tally:', error);
        throw error;
      }
    }
  }
  