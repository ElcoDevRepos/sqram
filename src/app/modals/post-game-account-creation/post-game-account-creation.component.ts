import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-post-game-account-creation',
  templateUrl: './post-game-account-creation.component.html',
  styleUrls: ['./post-game-account-creation.component.scss'],
})
export class PostGameAccountCreationComponent implements OnInit {

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {}

  close() {
    this.modalCtrl.dismiss();
  }

}