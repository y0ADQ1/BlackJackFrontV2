// game.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../services/game';
import { WebsocketService } from '../../services/websocket';
import { AuthService } from '../../services/auth';
import { Game } from '../../models/game.model';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FilterNonHostPipe } from '../../pipes/filter-non-host.pipe';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FilterNonHostPipe],
  templateUrl: './game.html',
  styleUrls: ['./game.scss'],
  providers: [FilterNonHostPipe]
})
export class GameComponent implements OnInit, OnDestroy {
  game: Game | null = null;
  errorMessage = '';
  gameEndedReason = '';
  notificationMessage = '';
  environment = environment;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService,
    private websocketService: WebsocketService,
    private authService: AuthService,
    private filterNonHostPipe: FilterNonHostPipe
  ) {}

  ngOnInit(): void {
    const gameId = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(gameId)) {
      this.errorMessage = 'Invalid game ID';
      this.router.navigate(['/games']);
      return;
    }

    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.websocketService.connect(user.id);
          this.gameService.getGame(gameId).subscribe({
            next: (response) => {
              if (response.success && response.game) {
                this.game = response.game;
                this.websocketService.joinGame(response.game.roomCode);
                console.log('Initial game state loaded:', response.game);
              } else {
                this.errorMessage = 'Failed to load game';
                this.router.navigate(['/games']);
              }
            },
            error: (err) => {
              this.errorMessage = err.error?.message || 'Failed to load game';
              this.router.navigate(['/games']);
            }
          });
        } else {
          this.errorMessage = 'User not authenticated';
          this.router.navigate(['/login']);
        }
      }),
      this.websocketService.gameState$.subscribe(gameState => {
        console.log('Received gameState in frontend:', {
          roomCode: gameState?.roomCode,
          players: gameState?.players?.map(player => ({
            username: player.username,
            isHost: player.isHost,
            isCurrentUser: player.userId === gameState?.userPlayer?.id,
            cards: player.cards.map(c => ({
              id: c.id,
              isVisible: c.isVisible,
              filename: c.filename,
            })),
          })),
        });
        this.game = gameState;
      }),
      this.websocketService.playerJoined$.subscribe(data => {
        this.notificationMessage = data.message;
        setTimeout(() => this.notificationMessage = '', 3000);
        if (this.game?.id) {
          this.gameService.getGame(this.game.id).subscribe({
            next: (response) => {
              if (response.success && response.game) {
                this.game = response.game;
                console.log('Game state refreshed after player joined:', response.game);
              }
            },
            error: (err) => {
              this.errorMessage = err.error?.message || 'Failed to refresh game state';
            }
          });
        }
      }),
      this.websocketService.error$.subscribe(error => {
        this.errorMessage = error;
        console.error('WebSocket error received:', error);
      }),
      this.websocketService.gameEnded$.subscribe(data => {
        this.gameEndedReason = data.reason;
        console.log('Game ended:', data);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.websocketService.disconnect();
  }

  startGame(): void {
    if (this.game?.roomCode) {
      const nonHostPlayers = this.filterNonHostPipe.transform(this.game.players);
      if (nonHostPlayers.length >= 4) {
        this.websocketService.startGame(this.game.roomCode);
        console.log('Starting game:', this.game.roomCode);
      }
    }
  }

  requestCard(): void {
    if (this.game?.roomCode && !this.game.userPlayer?.isHost) {
      this.websocketService.requestCard(this.game.roomCode);
      console.log('Requesting card for:', this.game.roomCode);
    }
  }

  skipTurn(): void {
    if (this.game?.roomCode && !this.game.userPlayer?.isHost) {
      this.websocketService.skipTurn(this.game.roomCode);
      console.log('Skipping turn for:', this.game.roomCode);
    }
  }

  requestReveal(): void {
    if (this.game?.roomCode && !this.game.userPlayer?.isHost) {
      this.websocketService.requestReveal(this.game.roomCode);
      console.log('Requesting reveal for:', this.game.roomCode);
    }
  }

  dealCard(targetPlayerId: number): void {
    if (this.game?.roomCode && this.game.userPlayer?.isHost) {
      this.websocketService.dealCard(this.game.roomCode, targetPlayerId);
      console.log('Dealing card to player:', targetPlayerId, 'in game:', this.game.roomCode);
    }
  }

  rematch(): void {
    if (this.game?.roomCode && this.game.userPlayer?.isHost) {
      this.websocketService.rematch(this.game.roomCode);
      console.log('Requesting rematch for:', this.game.roomCode);
    }
  }

  leaveGame(): void {
    if (this.game?.id && this.game?.roomCode) {
      this.gameService.leaveGame(this.game.id).subscribe({
        next: () => {
          this.websocketService.leaveGame(this.game!.roomCode);
          this.router.navigate(['/games']);
          console.log('Left game:', this.game!.roomCode);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to leave game';
          console.error('Error leaving game:', err);
        }
      });
    }
  }
}
