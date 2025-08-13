// game-create.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../../services/game';
import { GameJoinComponent} from '../game-join/game-join';

@Component({
  selector: 'app-game-create',
  standalone: true,
  imports: [CommonModule, FormsModule, GameJoinComponent],
  templateUrl: './game-create.html',
  styleUrls: ['./game-create.scss']
})
export class GameCreateComponent {
  maxPlayers = 8;
  errorMessage = '';

  constructor(private gameService: GameService, private router: Router) {}

  createGame(): void {
    if (this.maxPlayers < 4 || this.maxPlayers > 8) {
      this.errorMessage = 'Maximum non-host players must be between 4 and 8';
      return;
    }

    this.gameService.createGame(4, this.maxPlayers).subscribe({
      // Updated minPlayers to 4
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
