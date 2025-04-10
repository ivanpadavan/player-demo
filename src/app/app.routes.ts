import { Routes } from '@angular/router';
import {MenuComponent} from "./menu/menu.component";
import {PlayerComponent} from "./player/player.component";

export const routes: Routes = [
  { path: '', component: MenuComponent },
  { path: 'player/:id', component: PlayerComponent },
];
