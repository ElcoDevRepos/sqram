import { Component, OnInit } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import { Firestore, query, where, collection, getDocs, updateDoc, doc, addDoc } from '@angular/fire/firestore';
import { Word } from '../classes/word';
import * as dayjs from 'dayjs';
import { AlertController, ItemReorderEventDetail } from '@ionic/angular';

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
  chosenDate: string = new Date().toISOString();
  words: Array<Word> = [];
  activeDoc: string;
  constructor(private auth: Auth, private firestore: Firestore, private alertCtrl: AlertController) { }

  ngOnInit() {
    this.getWords();
  }

  async getWords() {
    this.words = [];
    let ref = collection(
      this.firestore,
      'words',
    );
    let q = query(ref, where("date", '==', dayjs(this.chosenDate).format('MM/DD/YY')));
    const docs = await getDocs(q);
    let words = [];
    if (docs.size == 0) {
      this.activeDoc = null;
      addDoc(collection(this.firestore, "words"), {
        date: dayjs(this.chosenDate).format('MM/DD/YY'),
        words: []
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
        })
        this.words = words;
      })
    }
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
    if (!this.isValidWord()) return
    
    if (this.activeDoc) {
      let ref = doc(
        this.firestore,
        'words',
        this.activeDoc
      );
      let temp = [...this.words];
      temp.push({
        index: this.words.length,
        text: this.word,
        hint: this.hint
      });
  
      await updateDoc(ref, {
        words: temp
      })
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

    let ref = doc(
      this.firestore,
      'words',
      this.activeDoc
    );
    updateDoc(ref, {
      words: this.words
    })
    // Finish the reorder and position the item in the DOM based on
    // where the gesture ended. This method can also be called directly
    // by the reorder group
    ev.detail.complete();
  }

  dateChanged() {
    this.getWords();
  }

  async delete(index) {
    let temp = [...this.words];
    temp.splice(index, 1);
    let ref = doc(
      this.firestore,
      'words',
      this.activeDoc
    );

    await updateDoc(ref, {
      words: temp
    })

    this.getWords();
  }

  async edit(index) {
    const alert = await this.alertCtrl.create({
      header: 'Please enter the word\'s info',
      buttons: [
        {
          text: 'Submit',
          role: 'confirm',
          handler: async (data) => {
            console.log(data);
            let temp = [...this.words];
            temp[index].hint = data[1];
            temp[index].text = data[0];

            let ref = doc(
              this.firestore,
              'words',
              this.activeDoc
            );
        
            await updateDoc(ref, {
              words: temp
            })
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

