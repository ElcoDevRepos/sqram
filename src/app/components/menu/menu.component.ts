import { Component, OnInit } from '@angular/core';
import { Auth, signOut, EmailAuthProvider, linkWithCredential, signInWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { AlertController, MenuController } from '@ionic/angular';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  authenticated: boolean = false;
  constructor(private auth: Auth, private alertCtrl: AlertController, public menu: MenuController) { }

  ngOnInit() {
    this.auth.onAuthStateChanged(async (a) => {
      this.authenticated = this.auth.currentUser.email !== null;
    })

  }

  async claim() {
    const alertPopup = await this.alertCtrl.create({
      header: 'Please enter your new account info',
      buttons: [
        {
          text: 'OK',
          handler: (d) => {
            const credential = EmailAuthProvider.credential(d[0], d[1]);
            linkWithCredential(this.auth.currentUser, credential)
              .then(async (usercred) => {
                this.authenticated = this.auth.currentUser.email !== null;
                await updateProfile(usercred.user, {displayName: d[2]});
                window.location.reload();
              }).catch((error) => {
                alert("Account linking error: " + error);
              });
          }
        }
      ],
      inputs: [
        {
          type: 'email',
          placeholder: 'Email',
        },
        {
          type: 'password',
          placeholder: 'password',
        },
        {
          type: 'text',
          placeholder: 'username',
        },
      ],
    });

    this.menu.close();
    await alertPopup.present();

  }

  async login() {
    const alertPopup = await this.alertCtrl.create({
      header: 'Please enter your info',
      buttons: [
        {
          text: 'OK',
          handler: (d) => {
            signInWithEmailAndPassword(this.auth,d[0], d[1]).then((u) => {
              window.location.reload();
            })
          }
        }
      ],
      inputs: [
        {
          type: 'email',
          placeholder: 'Email',
        },
        {
          type: 'password',
          placeholder: 'password',
        },
      ],
    });

    this.menu.close();
    await alertPopup.present();

  }

  async logout() {
    signOut(this.auth).then(() => window.location.reload());
  }

}
