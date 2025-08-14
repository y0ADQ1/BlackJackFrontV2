// filter-non-host.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { GamePlayer } from '../models/game-player.model';

@Pipe({
  name: 'filterNonHost',
  standalone: true
})
export class FilterNonHostPipe implements PipeTransform {
  transform(players: GamePlayer[] | undefined | null): GamePlayer[] {
    if (!players) return [];
    return players.filter(player => !player.isHost);
  }
}
