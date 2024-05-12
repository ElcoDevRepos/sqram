import { Component, OnInit } from '@angular/core';
import { Auth, EmailAuthProvider, linkWithCredential, updateProfile } from '@angular/fire/auth';
import { collection, where, getDocs, updateDoc, doc, Firestore, query } from '@angular/fire/firestore';
import { ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-post-game-account-creation',
  templateUrl: './post-game-account-creation.component.html',
  styleUrls: ['./post-game-account-creation.component.scss'],
})
export class PostGameAccountCreationComponent implements OnInit {

  username: string = '';
  email: string = '';
  password: string = '';

  constructor(
    private modalCtrl: ModalController,
    private firestore: Firestore,
    private toastCtrl: ToastController,
    private auth: Auth
  ) { }

  ngOnInit() {}

  close() {
    this.modalCtrl.dismiss();
  }

  async claim() {
    const responsesRef = collection(
      this.firestore,
      "users"
    );
    const q = query(responsesRef, where('name', '==', this.username));
    let docs = await getDocs(q);
    if (!docs.empty) {
      this.showToast("Username already exists");
      return;
    }
    const credential = EmailAuthProvider.credential(this.email, this.password);
    linkWithCredential(this.auth.currentUser, credential)
      .then(async (usercred) => {

        await updateProfile(usercred.user, { displayName: this.username });
        await updateDoc(doc(this.firestore, "users", this.auth.currentUser.uid), {
          name: this.username
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

  async showToast(msg) {
    let toast = await this.toastCtrl.create({
      message: msg,
      position: 'bottom',
      duration: 2500
    });
    toast.present();
  }

}