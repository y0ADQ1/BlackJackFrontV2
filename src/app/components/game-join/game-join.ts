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
  infoMessage = '';

  constructor(private gameService: GameService, private router: Router) {}

  joinGame(): void {
    if (!this.roomCode.trim()) {
      this.errorMessage = 'Por favor ingresa un código de sala';
      return;
    }

    this.errorMessage = '';
    this.infoMessage = '';
    
    this.gameService.joinGame(this.roomCode.toUpperCase()).subscribe({
      next: (response) => {
        if (response.success) {
          // Verificar si el jugador ya está en el juego
          if (response.alreadyInGame) {
            console.log('Player already in game, redirecting to game room:', response.game.id);
            this.infoMessage = 'Ya estás en este juego. Redirigiendo a la sala...';
            // Redirigir automáticamente a la sala de juego existente
            setTimeout(() => {
              this.router.navigate(['/game', response.game.id]);
            }, 1000);
          } else {
            console.log('Successfully joined new game:', response.game.id);
            this.infoMessage = 'Te has unido al juego exitosamente. Redirigiendo...';
            // Comportamiento normal: unirse al juego
            setTimeout(() => {
              this.router.navigate(['/game', response.game.id]);
            }, 500);
          }
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al unirse al juego';
        console.error('Join game error:', err);
      }
    });
  }
}