import { Component, OnInit } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import {
  Firestore,
  query,
  where,
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  collectionData,
} from '@angular/fire/firestore';
import { Word } from '../classes/word';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';

import { AlertController, ItemReorderEventDetail } from '@ionic/angular';
dayjs.extend(utc);

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  word: string;
  hint: string;
  username: string;
  password: string;
  loggedIn: boolean = false;
  chosenDate: string = dayjs(new Date().toISOString()).utc().toISOString();
  words: Array<Word> = [];
  activeDoc: string;
  view: string = 'words';
  statWords: Array<any> = [];
  activeStats;
  activeGames;
  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.getWords();
    this.getStats();
    //this.getActiveGames();
  }

  async getWords() {
    this.words = [];
    let ref = collection(this.firestore, 'words');
    let q = query(
      ref,
      where(
        'date',
        '==',
        dayjs(new Date(this.chosenDate).toISOString()).format('MM/DD/YY')
      )
    );
    const docs = await getDocs(q);
    let words = [];
    if (docs.size == 0) {
      this.activeDoc = null;
      addDoc(collection(this.firestore, 'words'), {
        date: dayjs(this.chosenDate).format('MM/DD/YY'),
        words: [],
        todays_top_10: [],
      });
      this.getWords();
    } else {
      docs.forEach((d) => {
        this.activeDoc = d.id;
        d.data().words.forEach((w) => {
          words.push(w);
        });
        words.sort((a, b) => {
          if (a['index'] > b['index']) {
            return 1;
          } else if (a['index'] < b['index']) {
            return -1;
          }
          return 0;
        });
        this.words = words;
      });
    }
  }

  async getStats() {
    const docs = await getDocs(collection(this.firestore, 'words'));
    docs.forEach((doc) => {
      this.statWords.push(doc.data());
    });

    for (let i = 0; i < this.statWords.length; i++) {
      let date = dayjs(this.chosenDate).utc().format('MM/DD/YY');
      if (this.statWords[i].date === date) {
        this.activeStats = this.statWords[i].stats;
        break;
      }
    }
    console.log(this.activeStats);
    this.calculateStats();
  }

  async getActiveGames() {
    let ref = collection(this.firestore, 'users');
    let q = query(ref, where('active', '==', true));
    const docs = await collectionData(q);
    docs.subscribe((data) => {
      let count = 0;
      let today = dayjs().utc();
      console.log();
      data.forEach((d) => {
        let gameDate = dayjs(d.lastPlayed).utc();
        if (today.isSame(gameDate, 'day')) {
          console.log(today.get('hour'));
          console.log(gameDate.get('hour'));
          console.log(today.diff(gameDate, 'hours'));
          count++;
        }
      });

      this.activeGames = count;
    });
  }

  calculateStats() {
    console.log(this.words);
  }

  async login() {
    try {
      await signInWithEmailAndPassword(this.auth, this.username, this.password);
      this.loggedIn = true;
    } catch (error) {
      alert(error);
    }
  }

  isValidWord() {
    return true;
  }
  async submit() {
    if (!this.isValidWord()) return;

    if (this.activeDoc) {
      let ref = doc(this.firestore, 'words', this.activeDoc);
      let temp = [...this.words];
      temp.push({
        index: this.words.length,
        text: this.word,
        hint: this.hint,
      });

      await updateDoc(ref, {
        words: temp,
      });
    }
    this.word = '';
    this.hint = '';
    this.getWords();
  }

  doReorder(ev: any) {
    // The `from` and `to` properties contain the index of the item
    // when the drag started and ended, respectively
    console.log('Dragged from index', ev.detail.from, 'to', ev.detail.to);
    this.words[ev.detail.to].index = ev.detail.from;
    this.words[ev.detail.from].index = ev.detail.to;

    let ref = doc(this.firestore, 'words', this.activeDoc);
    updateDoc(ref, {
      words: this.words,
    });
    // Finish the reorder and position the item in the DOM based on
    // where the gesture ended. This method can also be called directly
    // by the reorder group
    ev.detail.complete();
  }

  async dateChanged() {
    await this.getWords();
    await this.getStats();
  }

  async dateChangedStat() {
    await this.getWords();
    await this.getStats();
  }

  async delete(index) {
    let temp = [...this.words];
    temp.splice(index, 1);
    let ref = doc(this.firestore, 'words', this.activeDoc);

    await updateDoc(ref, {
      words: temp,
    });

    this.getWords();
  }

  async edit(index) {
    const alert = await this.alertCtrl.create({
      header: "Please enter the word's info",
      buttons: [
        {
          text: 'Submit',
          role: 'confirm',
          handler: async (data) => {
            console.log(data);
            let temp = [...this.words];
            temp[index].hint = data[1];
            temp[index].text = data[0];

            let ref = doc(this.firestore, 'words', this.activeDoc);

            await updateDoc(ref, {
              words: temp,
            });
            this.getWords();
          },
        },
      ],
      inputs: [
        {
          value: this.words[index].text,
          placeholder: 'Word (max 7 characters)',
          attributes: {
            maxlength: 7,
          },
        },
        {
          value: this.words[index].hint,
          placeholder: 'Hint  (max 15 characters)',
          attributes: {
            maxlength: 25,
          },
        },
      ],
    });

    await alert.present();
  }
}
