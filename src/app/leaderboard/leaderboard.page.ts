import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { getDoc, doc, Firestore, collection, getDocs, addDoc, orderBy, limit } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { query, where } from '@firebase/firestore';
import { AlertController, MenuController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.page.html',
  styleUrls: ['./leaderboard.page.scss'],
})
export class LeaderboardPage implements OnInit {
  friends: Array<any> = [];
  activeBoard: string = "perfects";
  boardType: string = "friends";
  top100: Array<any> = [];
  constructor(public auth: Auth, private firestore: Firestore, private menu: MenuController, private alertCtrl: AlertController,
    private router: Router, private toastCtrl: ToastController) { }

  ngOnInit() {
    this.auth.onAuthStateChanged(async (a) => {

      this.getFriends();
    });

    this.getTop100();
  }

  segmentChanged(ev) {
    this.boardType = ev.detail.value;
    this.friends = [];
    if (this.boardType === 'friends') {
      this.getFriends();
    } else {
      this.getWorldwide();
    }
  }

  getWorldwide() {
    getDocs(query(collection(this.firestore, 'users'), where("name", "!=", null))).then((d) => {
      let tFriends = [];
      d.forEach((doc) => {
        tFriends.push(doc.data());
      })

      this.sortFriends(tFriends);
    })
  }

  getFriends() {
    this.friends = [];
    getDocs(collection(this.firestore, 'users', this.auth.currentUser.uid, "friends")).then((d) => {
      let tFriends = [];
      d.forEach((doc) => {
        tFriends.push(doc.data());
      })
      getDoc(doc(this.firestore, "users", this.auth.currentUser.uid)).then((u) => {
        tFriends.push(u.data());
        this.sortFriends(tFriends);
      })
    })
  }

  goHome() {
    this.router.navigate(['home'])
  }

  async sortFriends(tFriends) {
    for (let i = 0; i < tFriends.length; i++) {
      let userDoc = await getDoc(doc(this.firestore, 'users', tFriends[i].uid));
      this.friends.push(userDoc.data());
    }

    const r_sort = (a, b, field, tieBreaker, asc) => {
      let reverse = asc ? 1 : -1;
      let fields = field.split(".");
      let tieBreakerFields = tieBreaker.split(".");
      if (a[fields[0]][fields[1]] > b[fields[0]][fields[1]]) {
          return 1 * reverse;
      }
      else if (b[fields[0]][fields[1]] > a[fields[0]][fields[1]]) {
          return -1 * reverse;
      }
      else {
        if (a[tieBreakerFields[0]][tieBreakerFields[1]] > b[tieBreakerFields[0]][tieBreakerFields[1]]) {
          return 1 * -reverse;
        }
        else if (b[tieBreakerFields[0]][tieBreakerFields[1]] > a[tieBreakerFields[0]][tieBreakerFields[1]]) {
            return -1 * -reverse;
        }
        else {
            return 0;
        }
      } }

    for (let i = 0; i < this.friends.length; i++) {
      this.friends[i].stats.perfectRate = ((this.friends[i].stats.perfects) / (this.friends[i].timesPlayed)) * 100 || 0;
    }

    if (this.activeBoard === 'perfects') {
      this.friends.sort((a,b)=> r_sort(a, b, 'stats.perfectRate', "stats.completionRate", false));
    } else {
      this.friends.sort((a,b)=> r_sort(a, b, 'stats.completionRate', "stats.timeToComplete", false));
    }
  }

  switchBoard(board) {
    this.activeBoard = board;
    let tFriends = this.friends;
    this.friends = [];

    this.sortFriends(tFriends);
  }

  openMenu() {
    this.menu.enable(true, 'menu');
    this.menu.open('menu');
  }

  openDonate() {
    window.open("https://ko-fi.com/sqram", '_blank')
  }

  async addFriend() {
    const alertPopup = await this.alertCtrl.create({
      header: 'Enter a Friend\'s Name',
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
          attributes: {
            maxlength: 10,
          },
        },
      ],
    });

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

  async getTop100() {
    let top100 = [];
    let ref = collection(this.firestore, "users");
    let q = query(ref, orderBy('stats.tens', 'desc'), limit(100));
    const doc = await getDocs(q);
    doc.forEach(user => {
      top100.push({
        "uid": user.data().uid,
        "name": user.data().name || 'Anonymous',
        "score": user.data().stats.tens,
        "compRate": user.data().stats.completionRate,
        "ttc": user.data().stats.timeToComplete
      })
    });
    this.top100 = top100;

    console.log("Unsorted Top 100");
    console.log(top100);

  }

}
