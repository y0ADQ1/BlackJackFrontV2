import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../../services/game';

@Component({
  selector: 'app-game-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-create.html',
  styleUrls: ['./game-create.scss']
})
export class GameCreateComponent {
  maxPlayers = 8;
  errorMessage = '';

  constructor(private gameService: GameService, private router: Router) {}

  createGame(): void {
    if (this.maxPlayers < 5 || this.maxPlayers > 8) {
      this.errorMessage = 'Maximum players must be between 5 and 8';
      return;
    }

    this.gameService.createGame(5, this.maxPlayers).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/game', response.game.id]);
        }
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Failed to create game';
      }
    });
  }
}