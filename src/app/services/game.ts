import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Game } from '../models/game.model';


@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createGame(minPlayers: number, maxPlayers: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/games`, {minPlayers, maxPlayers})
  }

  joinGame(roomCode: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/games/join`, {roomCode})
  }

  getGame(gameId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/games/${gameId}`)
  }

  getUserGames(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/user/games`)
  }

  getCards(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/games/cards`)
  }

  leaveGame(gameId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/games/${gameId}/leave`)
  }
}
