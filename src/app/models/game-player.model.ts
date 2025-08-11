import { PlayerCard } from './player-card.model';

export interface GamePlayer {
  id: number;
  userId: number;
  username: string;
  position: number;
  isHost: boolean;
  wantsCards: boolean;
  hasRequestedReveal: boolean;
  totalScore: number | null;
  isEliminated: boolean;
  isCurrentTurn?: boolean;
  cardCount?: number;
  cards: PlayerCard[];
}