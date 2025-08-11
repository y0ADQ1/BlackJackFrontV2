import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../../services/game';

@Component({
  selector: 'app-game-join',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-join.html',
  styleUrls: ['./game-join.scss']
})
export class GameJoinComponent {
  roomCode = '';
  errorMessage = '';

  constructor(private gameService: GameService, private router: Router) {}

  joinGame(): void {
    this.gameService.joinGame(this.roomCode.toUpperCase()).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/game', response.game.id]);
        }
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Failed to join game';
      }
    });
  }
}