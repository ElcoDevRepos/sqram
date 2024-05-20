import { Component, OnInit } from '@angular/core';
import { Auth, signOut, EmailAuthProvider, linkWithCredential, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from '@angular/fire/auth';
import { updateDoc, doc, Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';
import { AlertController, MenuController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  authenticated: boolean = false;
  constructor(private auth: Auth, private alertCtrl: AlertController, public menu: MenuController, private firestore: Firestore, private toastCtrl: ToastController) { }

  ngOnInit() {
    this.auth.onAuthStateChanged(async (a) => {
      this.authenticated = this.auth.currentUser.email !== null;
    })

  }

  async claim() {
    const alertPopup = await this.alertCtrl.create({
      header: 'Enter New Account Info',
      buttons: [
        {
          text: 'OK',
          handler: async (d) => {
            const responsesRef = collection(
              this.firestore,
              "users"
            );
            const q = query(responsesRef, where('name', '==', d[2]));
            let docs = await getDocs(q);
            if (!docs.empty) {
              this.showToast("Username already exists");
              return;
            }
            const credential = EmailAuthProvider.credential(d[0], d[1]);
            linkWithCredential(this.auth.currentUser, credential)
              .then(async (usercred) => {
                this.authenticated = this.auth.currentUser.email !== null;
                await updateProfile(usercred.user, {displayName: d[2]});
                await updateDoc(doc(this.firestore, "users", this.auth.currentUser.uid), {
                  name: d[2]
                })
                window.location.reload();
              }).catch((error: Error) => {
                if (error.message.includes("auth/email-already-in-use")) {
                  this.showToast("Email Already in Use!");
                } else if (error.message.includes("auth/weak-password")) {
                  this.showToast("Password should be at least 6 characters.")
                }
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
          placeholder: 'Password',
        },
        {
          type: 'text',
          placeholder: 'Username',
          attributes: {
            maxlength: 10,
          },
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
          placeholder: 'Password',
        },
      ],
    });

    this.menu.close();
    await alertPopup.present();

  }

  async forgotPassword() {
    const alertPopup = await this.alertCtrl.create({
      header: 'Please enter your email',
      buttons: [
        {
          text: 'OK',
          handler: (d) => {
            const msg = 'If this user exists, an email will be sent to reset the password.';
            sendPasswordResetEmail(this.auth, d[0])
              // Could say if email exists or not, but exposes information
              .finally(() => {
              this.showToast(msg);
            });
          },
          role: 'ok'
        }
      ],
      inputs: [
        {
          type: 'email',
          placeholder: 'Email',
        },
      ],
    });

    this.menu.close();
    await alertPopup.present();

  }

  async logout() {
    signOut(this.auth).then(() => window.location.reload());
  }

  async follow() {
    window.open("https://twitter.com/sqramdotcom", '_blank')
  }

  async showToast(msg) {
    let toast = await this.toastCtrl.create({
      message: msg,
      position: 'bottom',
      duration: 2500
    });
    toast.present();
  }

}
