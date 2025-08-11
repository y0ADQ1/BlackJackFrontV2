import { GamePlayer } from './game-player.model';

export interface Game {
  id: number;
  roomCode: string;
  status: 'waiting' | 'playing' | 'finished';
  currentTurnPlayerId: number | null;
  minPlayers: number;
  maxPlayers: number;
  cardsRevealed: boolean;
  winnerId: number | null;
  createdAt: string;
  updatedAt: string;
  players: GamePlayer[];
  userPlayer: {
    id: number;
    position: number;
    isHost: boolean;
    wantsCards: boolean;
    hasRequestedReveal: boolean; 
    totalScore: number;
    isCurrentTurn: boolean;
  } | null;
}