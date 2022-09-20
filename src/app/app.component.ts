import { Component } from '@angular/core';
import { FirebaseAnalytics } from "@capacitor-community/firebase-analytics";
import { SwUpdate } from '@angular/service-worker'
import { UpdateService } from './services/update.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private sw: UpdateService) {
    this.initFirebase();
    this.sw.checkForUpdates();
  }

  async initFirebase() {
    await FirebaseAnalytics.initializeFirebase({
      apiKey: "AIzaSyBPe7WXHeUfaa3mrkkXaEJuhGdI1-hGZ9c",
      authDomain: "scramble-web-game.firebaseapp.com",
      projectId: "scramble-web-game",
      storageBucket: "scramble-web-game.appspot.com",
      messagingSenderId: "28581531407",
      appId: "1:28581531407:web:0fa1349f431a9a3cd6387a",
      measurementId: "G-F0E5W0WNS3"
    });
    await FirebaseAnalytics.setCollectionEnabled({
      enabled: true,
    });
  }
}
