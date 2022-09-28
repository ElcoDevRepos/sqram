import { Component, OnInit } from '@angular/core';
import { AlertController, MenuController, ToastController } from '@ionic/angular';
import { Auth, EmailAuthProvider, linkWithCredential, signInWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Firestore, updateDoc, doc, query, where, collection, getDocs } from '@angular/fire/firestore';
import { addDoc, deleteDoc, getDoc } from '@firebase/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  displayName = "";
  friends = [];
  constructor(public menu: MenuController, private alertCtrl: AlertController, public auth: Auth, private firestore: Firestore, private router: Router, private toastCtrl: ToastController) { }

  ngOnInit() {
    this.auth.onAuthStateChanged(async (a) => {
      this.displayName = this.auth.currentUser.displayName;

      this.getFriends();
    });
  }

  getFriends() {
    this.friends = [];
    getDocs(collection(this.firestore, 'users', this.auth.currentUser.uid, "friends")).then((d) => {
      d.forEach((doc) => {
        this.friends.push(doc.data());
      })
    })
  }
  openMenu() {
    this.menu.enable(true, 'menu');
    this.menu.open('menu');
  }

  goHome() {
    this.router.navigate(['home'])
  }
  

  openDonate() {
    window.open("https://ko-fi.com/sqram", '_blank')
  }

  async updateName() {
    const alertPopup = await this.alertCtrl.create({
      header: 'Please enter your name',
      buttons: [
        {
          text: 'OK',
          handler: async (d) => {
            let name = d[0];
            if (name.length > 0) {
              name = name.replaceAll(' ', '');
              name = name.toLowerCase();
              const responsesRef = collection(
                this.firestore,
                "users"
              );
              const q = query(responsesRef, where('name', '==', name));
              let docs = await getDocs(q);
              if (docs.size === 0) {
                updateProfile(this.auth.currentUser, { displayName: name }).then(() => {
                  updateDoc(doc(this.firestore, 'users', this.auth.currentUser.uid), {
                    name
                  }).then(() => this.showToast("Profile Updated"))
                });
              }
              else 
              {
                this.showToast("That Name Already Exists!");
                return false;
              }
            }

            return true;
          }
        }
      ],
      inputs: [
        {
          type: 'text',
          placeholder: '',
          attributes: {
            maxlength: 10,
          },
        },
      ],
    });

    await alertPopup.present();
  }

  async addFriend() {
    const alertPopup = await this.alertCtrl.create({
      header: 'Enter a Friend\’s Name',
      buttons: [
        {
          text: 'OK',
          handler: async (d) => {
            let name = d[0];
            if (name === this.auth.currentUser.displayName) {
              this.showToast("Don't enter you're own name!");
              return;
            }
            name = name.toLowerCase();
            let docs = await getDocs(query(collection(this.firestore, 'users', this.auth.currentUser.uid, 'friends'), where('name', '==', name)));
            if (!docs.empty) {
              this.showToast("Friend Already Added!");
              return;
            }
            const responsesRef = collection(
              this.firestore,
              "users"
            );
            const q = query(responsesRef, where('name', '==', name));
            getDocs(q).then((docs) => {
              if (docs.empty) {
                this.showToast("Friend Does Not Exist");
                return;
              }
              docs.forEach((d) => {
                addDoc(collection(this.firestore, 'users', this.auth.currentUser.uid, 'friends'), {
                  uid: d.id,
                  name: d.data().name,
                }).then(() => {this.showToast("Friend Added");  this.getFriends()})
              })
            })

            return true;
          }
        }
      ],
      inputs: [
        {
          type: 'text',
          placeholder: '',
          attributes: {
            maxlength: 10,
          },
        },
      ],
    });

    await alertPopup.present();
  }

  async remove(name) {
    const alertPopup = await this.alertCtrl.create({
      header: 'Remove this friend?',
      buttons: [
        {
          text: 'Yes',
          role: 'destructive',
          handler: async (d) => {
            console.log(name);
            let docs = await getDocs(query(collection(this.firestore, 'users', this.auth.currentUser.uid, 'friends'), where('name', '==', name.name)));
            if (docs.empty) {
              this.showToast("Friend Not Found!");
              return;
            }
            console.log(docs.empty);
            docs.forEach((d) => {
              console.log(d.id);
              deleteDoc(doc(this.firestore, "users", this.auth.currentUser.uid, "friends", d.id)).then(() => this.getFriends())
            })

            return true;
          }
        },
        {
          text: 'No',
          handler: async (d) => {
            return true;
          }
        }
      ],
    });

    await alertPopup.present();
  }

  async goToLeaderboard() {
    if (this.auth.currentUser.email === null) {
      const alertPopup = await this.alertCtrl.create({
        header: 'Login or create an account to see how you rank against friends and save your stats wherever you Sqram! ',
        buttons: [
          {
            text: 'Create Account',
            handler: (d) => {
              this.claim()
            }
          },
          {
            text: 'Log In',
            handler: (d) => {
              this.login()
            }
          }
        ],


      });

      this.menu.close();
      await alertPopup.present();
    } else {
      this.router.navigate(['../leaderboard'])
    }
  }

  async claim() {
    const alertPopup = await this.alertCtrl.create({
      header: 'Enter New Account Info',
      buttons: [
        {
          text: 'OK',
          handler: (d) => {
            const credential = EmailAuthProvider.credential(d[0], d[1]);
            linkWithCredential(this.auth.currentUser, credential)
              .then(async (usercred) => {
                await updateProfile(usercred.user, {displayName: d[2]});
                await updateDoc(doc(this.firestore, "users", this.auth.currentUser.uid), {
                  name: d[2]
                })
                window.location.reload();
              }).catch((error) => {
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
            signInWithEmailAndPassword(this.auth, d[0], d[1]).then((u) => {
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

  async showToast(msg) {
    let toast = await this.toastCtrl.create({
      message: msg,
      position: 'bottom',
      duration: 2500
    });
    toast.present();
  }
}
