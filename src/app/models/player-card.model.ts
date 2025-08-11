import { Card } from './card.model';

export interface PlayerCard {
  id: number;
  suit?: string;
  value?: string;
  numericValue?: number;
  imageData?: string;
  filename?: string;
  orderReceived: number;
  isVisible: boolean;
  card?: Card;
}