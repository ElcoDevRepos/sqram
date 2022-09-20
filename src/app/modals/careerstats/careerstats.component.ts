import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-careerstats',
  templateUrl: './careerstats.component.html',
  styleUrls: ['./careerstats.component.scss'],
})
export class CareerstatsComponent implements OnInit {
  serverDate;
  timeUntil;
  gameResults;
  constructor(private navParams: NavParams, private modalCtrl: ModalController) { }

  ngOnInit() {
    this.serverDate = this.navParams.data.serverDate;
    this.gameResults = this.navParams.data.gameResults;
    
    console.log(this.gameResults);
    this.countdown();
  }

  close() {
    this.modalCtrl.dismiss();
  }

  countdown() {
    let tomorrow = dayjs(this.serverDate).add(1, 'day').utc().format();
    var countDownDate = new Date(tomorrow).getTime();

    // Update the count down every 1 second
    var x = setInterval(function () {
      
      // Get today's date and time
      var now = new Date().getTime();

      // Find the distance between now and the count down date
      var distance =  countDownDate - now;

      // Time calculations for days, hours, minutes and seconds
      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours:any = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes:any = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds:any = Math.floor((distance % (1000 * 60)) / 1000);

      if (hours < 10) hours = "0" + hours.toString();
      if (minutes < 10) minutes = "0" + minutes.toString();
      if (seconds < 10) seconds = "0" + seconds.toString();

      this.timeUntil = hours + ":" + minutes + ":" + seconds;

      // If the count down is finished, write some text
      if (distance < 0) {
        clearInterval(x);
        this.timeUntil = "00:00:00";
      }
    }.bind(this), 1000);
  }

}
