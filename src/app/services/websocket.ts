
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
  private rematchVoteConfirmedSubject = new Subject<{ hasVoted: boolean }>();
  rematchVoteConfirmed$ = this.rematchVoteConfirmedSubject.asObservable();
  private socket: Socket;
  private gameStateSubject = new Subject<Game>();
  gameState$ = this.gameStateSubject.asObservable();
  private errorSubject = new Subject<string>();
  error$ = this.errorSubject.asObservable();
  private gameEndedSubject = new Subject<{ reason: string }>();
  gameEnded$ = this.gameEndedSubject.asObservable();
  private playerJoinedSubject = new Subject<{ userId: number; message: string }>();
  playerJoined$ = this.playerJoinedSubject.asObservable();
  private playerActionSubject = new Subject<{ message: string; playerId?: number; username?: string }>();
  playerAction$ = this.playerActionSubject.asObservable();
  private playerStandSubject = new Subject<{ userId: number; playerName: string; roomCode: string; message: string }>();
  playerStand$ = this.playerStandSubject.asObservable();

  private hostTransferSubject = new Subject<{ message: string; isTemporary?: boolean; newHostName?: string }>();
  hostTransfer$ = this.hostTransferSubject.asObservable();

  private hostRestoredSubject = new Subject<{ message: string; originalHostName?: string }>();
  hostRestored$ = this.hostRestoredSubject.asObservable();

  private forceLeaveAllSubject = new Subject<{ reason: string; message: string }>();
  forceLeaveAll$ = this.forceLeaveAllSubject.asObservable();

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
    console.log('Joining game:', roomCode, 'Socket ID:', this.socket.id);
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

  stand(roomCode: string): void {
    console.log('Standing for game:', roomCode);
    this.socket.emit('stand', { roomCode });
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

  // Notifica al host que un jugador ha solicitado carta (workaround)
  notifyHostCardRequest(roomCode: string, playerId: number, username: string): void {
    this.socket.emit('cardRequestNotification', { roomCode, playerId, username });
  }

  private setupSocketListeners(): void {
    // Escuchar confirmación de voto de rematch
    this.socket.on('rematchVoteConfirmed', (data: { hasVoted: boolean }) => {
      this.rematchVoteConfirmedSubject.next(data);
    });
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

    this.socket.on('playerAction', (data: { message: string }) => {
      console.log('Player action received:', data);
      this.playerActionSubject.next(data);
    });

    // Workaround: escuchar notificación de solicitud de carta para el host
    this.socket.on('cardRequestNotification', (data: { playerId: number; username: string }) => {
      this.playerActionSubject.next({ message: `El jugador ${data.username} ha solicitado una carta. Usa el botón para repartir.`, playerId: data.playerId, username: data.username });
    });

    // Escuchar evento de expulsión global
    this.socket.on('forceLeaveAll', (data: { reason: string; message: string }) => {
      console.warn('Recibido forceLeaveAll:', data);
      console.log('Socket ID:', this.socket.id, 'Data:', data);
      this.forceLeaveAllSubject.next(data);
    });

    // Escuchar evento de stand de jugador
    this.socket.on('playerStand', (data: { userId: number; playerName: string; roomCode: string; message: string }) => {
      console.log('Player stand event received:', data);
      this.playerStandSubject.next(data);
    });

    // Escuchar eventos de transferencia de host
    this.socket.on('hostTransferred', (data: { message: string; isTemporary?: boolean; newHostName?: string }) => {
      console.log('Host transferred event received:', data);
      this.hostTransferSubject.next(data);
    });

    // Escuchar eventos de restauración de host original
    this.socket.on('hostRestored', (data: { message: string; originalHostName?: string }) => {
      console.log('Host restored event received:', data);
      this.hostRestoredSubject.next(data);
    });
  }
}
