import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { GameCreateComponent } from './components/game-create/game-create';
import { GameJoinComponent } from './components/game-join/game-join';
import { GameComponent } from './components/game/game';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'games', component: GameCreateComponent, canActivate: [AuthGuard] },
  { path: 'join', component: GameJoinComponent, canActivate: [AuthGuard] },
  { path: 'game/:id', component: GameComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];