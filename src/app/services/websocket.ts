import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';
import { Game } from '../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: Socket;
  private gameStateSubject = new Subject<Game>();
  gameState$ = this.gameStateSubject.asObservable();
  private errorSubject = new Subject<string>();
  error$ = this.errorSubject.asObservable();
  private gameEndedSubject = new Subject<{ reason: string }>();
  gameEnded$ = this.gameEndedSubject.asObservable();
  private playerJoinedSubject = new Subject<{ userId: number; message: string }>();
  playerJoined$ = this.playerJoinedSubject.asObservable();

  constructor(private authService: AuthService) {
    this.socket = io(environment.wsUrl, {
      path: '/socket.io/',
      autoConnect: false,
      transports: ['websocket', 'polling']
    });
    this.setupSocketListeners();
    console.log('WebsocketService initialized with wsUrl:', environment.wsUrl);
  }

  connect(userId: number): void {
    console.log('Attempting to connect with userId:', userId);
    this.socket.connect();
    this.socket.emit('authenticate', { userId });
  }

  disconnect(): void {
    console.log('Disconnecting WebSocket');
    this.socket.disconnect();
  }

  joinGame(roomCode: string): void {
    console.log('Joining game:', roomCode);
    this.socket.emit('joinGame', { roomCode });
  }

  startGame(roomCode: string): void {
    console.log('Starting game:', roomCode);
    this.socket.emit('startGame', { roomCode });
  }

  requestCard(roomCode: string): void {
    console.log('Requesting card for game:', roomCode);
    this.socket.emit('requestCard', { roomCode });
  }

  skipTurn(roomCode: string): void {
    console.log('Skipping turn for game:', roomCode);
    this.socket.emit('skipTurn', { roomCode });
  }

  requestReveal(roomCode: string): void {
    console.log('Requesting reveal for game:', roomCode);
    this.socket.emit('requestReveal', { roomCode });
  }

  dealCard(roomCode: string, targetPlayerId: number): void {
    console.log('Dealing card to player:', targetPlayerId, 'in game:', roomCode);
    this.socket.emit('dealCard', { roomCode, targetPlayerId });
  }

  rematch(roomCode: string): void {
    console.log('Requesting rematch for game:', roomCode);
    this.socket.emit('rematch', { roomCode });
  }

  leaveGame(roomCode: string): void {
    console.log('Leaving game:', roomCode);
    this.socket.emit('leaveGame', { roomCode });
  }

  private setupSocketListeners(): void {
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.errorSubject.next('Failed to connect to WebSocket server: ' + error.message);
    });

    this.socket.on('gameState', (gameState: Game) => {
      console.log('Received gameState:', gameState);
      this.gameStateSubject.next(gameState);
    });

    this.socket.on('playerJoined', (data: { userId: number; message: string }) => {
      console.log('Player joined:', data);
      this.playerJoinedSubject.next(data);
    });

    this.socket.on('error', (data: { message: string }) => {
      console.error('WebSocket error:', data.message);
      this.errorSubject.next(data.message);
    });

    this.socket.on('gameEnded', (data: { reason: string }) => {
      console.log('Game ended:', data.reason);
      this.gameEndedSubject.next(data);
    });
  }
}