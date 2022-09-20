import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LeaderboardPageRoutingModule } from './leaderboard-routing.module';

import { LeaderboardPage } from './leaderboard.page';
import { GetFriendNamePipe } from '../pipes/get-friend-name.pipe';
import { GetFriendPipe } from '../pipes/get-friend.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LeaderboardPageRoutingModule
  ],
  declarations: [LeaderboardPage, GetFriendPipe]
})
export class LeaderboardPageModule {}
