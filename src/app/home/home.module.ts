import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { FinalWordLetterComponent } from '../components/final-word-letter/final-word-letter.component';
import { ScrambleWordLetterComponent } from '../components/scramble-word-letter/scramble-word-letter.component';
import { ProgressIndicatorComponent } from '../components/progress-indicator/progress-indicator.component';
import { PipesPipe } from '../pipes.pipe';
import { AveragePipe } from '../pipes/average.pipe';
import { CumulatePipe } from '../pipes/cumulate.pipe';
import { CareerstatsComponent } from '../modals/careerstats/careerstats.component';
import { AdsenseModule } from 'ng2-adsense';
import { KofiBtnComponent } from '../components/kofi-btn/kofi-btn.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    AdsenseModule.forRoot({
      adClient: 'ca-pub-7017056226718877',
    })
  ],
  declarations: [HomePage, FinalWordLetterComponent, ScrambleWordLetterComponent, ProgressIndicatorComponent,
     PipesPipe, AveragePipe, CumulatePipe, CareerstatsComponent, KofiBtnComponent]
})
export class HomePageModule {}
