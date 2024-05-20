import { Component, ElementRef, HostListener, ViewChild, ɵɵsetComponentScope } from '@angular/core';
import { AlertController, MenuController, ModalController, Platform, ToastController } from '@ionic/angular';
import { Word } from '../classes/word';
import { Preferences } from '@capacitor/preferences';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';

import { Firestore, doc, query, where, collection, getDocs, setDoc, getDoc, updateDoc, addDoc } from '@angular/fire/firestore';
import { Auth, EmailAuthProvider, linkWithCredential, signInAnonymously, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Share } from '@capacitor/share';
import { GameStats } from '../classes/game-stats';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { CareerstatsComponent } from '../modals/careerstats/careerstats.component';
import { Careerstats } from '../classes/careerstats';
import { Router } from '@angular/router';
import { Animation, AnimationController } from '@ionic/angular';
import { ScrambleWordLetterComponent } from '../components/scramble-word-letter/scramble-word-letter.component';
import { Clipboard } from '@capacitor/clipboard';
import { updateProfile } from '@firebase/auth';
import { StatsService } from '../services/stats.service';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import { PostGameAccountCreationComponent } from '../modals/post-game-account-creation/post-game-account-creation.component';

dayjs.extend(utc);
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  // Keyboard listener

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    this.moveLetterFromKeyboard(event.key);
  }
  timestamp: Date;
  words: Array<Word> = [];
  activeWord: number = 0;
  letterArray: Array<string> = [];
  finalWord: Array<string> = [];
  TOTAL_TIME = 60;
  timer: number = this.TOTAL_TIME;
  timerInterval;
  solutionChecker;
  wordTimerInterval;
  getFirstLetter: boolean = true;
  getRandomLetter: boolean = true;
  randomLettersAllowed: number = 1;
  canSkip: boolean = true;
  skipsAllowed: number = 2;
  skippedWords: Array<number> = [];
  stashSkippedWord = [];
  solvedWords: Array<number> = [];
  powerupsUsed: Array<Array<string>> = [];
  hintsUsed: number = 0;
  puzzleNum: number;
  skipsUsed: number = 0;
  skipsUsedPerWord: Array<number> = [];
  anyLetterUsed: Array<number> = [];
  firstLetterUsed: Array<number> = [];
  finishedDate: Date;
  lockedIndexes: Array<number> = [];
  stashLockedIndexes = [];
  started: boolean = false;
  ended: boolean = false;
  doDaysMatch: boolean;
  serverDate: string;
  emojiNumberArray: Array<string> = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
  secondsPerWord: Array<number> = [];
  skippedSecondsPerWord: Array<number> = [];
  wordTimer: number = 0;
  checkedIndexes: Array<number> = [];
  gameResults: GameStats = {
    active: false
  } as GameStats;
  loading: boolean = true;
  timeUntil;
  stats;
  finalRowComponents: Array<ScrambleWordLetterComponent> = [];
  letterRowComponents: Array<ScrambleWordLetterComponent> = [];
  hintUsedOnLastLetter = false;
  todaysTop10: {
    uid: string,
    name: string,
    score: string,
    ttc: string,
    spw: string,
  }[] = [];
  authenticated : boolean = false;


  constructor(private alertCtrl: AlertController, private firestore: Firestore, public auth: Auth, private modalCtrl: ModalController, private menu: MenuController,
    private router: Router, private platform: Platform, private toastCtrl: ToastController, private statsService: StatsService
  ) {

  }

  async ngOnInit() {
    const isLoggedIn = await new Promise((resolve: any, reject: any) =>
      this.auth.onAuthStateChanged((user: any) =>
        resolve(user), (e: any) => reject(e)));

    if (!isLoggedIn) {
      signInAnonymously(this.auth);
    }

    this.auth.onAuthStateChanged(async (a) => {
      this.authenticated = this.auth.currentUser.email !== null;
      console.log(a);
      await this.getToday();
      await this.setupUser();

      this.countdown();
      if (this.doDaysMatch) {
        await this.getWords();
      }
      //Preferences.clear();
    })
  }

  async getToday() {
    let dbDate = await getDoc(doc(this.firestore, "today", "5lhhN8UFP7KU6DKgIpHr"));

    let serverDay = dbDate.data().today;
    this.puzzleNum = dbDate.data().puzzle.toString().padStart(3, "0");
    if (serverDay.includes('\'')) {
      serverDay = serverDay.replaceAll('\'', '');
    }
    this.serverDate = new Date(serverDay).toUTCString();
    let today = new Date().toUTCString();
    this.doDaysMatch = dayjs(today).utc().isSame(serverDay, 'day');
  }
  async setupUser() {
    let dbUser = await getDoc(doc(this.firestore, "users", this.auth.currentUser.uid));
    if (dbUser.exists()) {
      this.gameResults = dbUser.data() as GameStats;
    }
    else {
      // Create a query to search for documents with a matching email
      const ref = collection(this.firestore, 'pending_reward');
      const q = query(ref, where("email", "==", this.auth.currentUser.email));
      const docs = await getDocs(q);

      let purchased = false;
      if(docs) purchased = true;

      // Generate unique username for anonymous player
      let uniqueUsername: string = '';
      // Make sure random generated username does not exceed string length of 10
      while(uniqueUsername.length > 10 || uniqueUsername.length == 0) {
        uniqueUsername = uniqueNamesGenerator({
          dictionaries: [adjectives, animals],
          separator: '',
          style: 'capital',
          length: 2
        });
      }
      await updateProfile(this.auth.currentUser, {displayName: uniqueUsername});

      setDoc(doc(this.firestore, 'users', this.auth.currentUser.uid), {
        uid: this.auth.currentUser.uid,
        name: uniqueUsername,
        timesPlayed: 0,
        bestTime: 0,
        totalNumberOfWordsSolved: 0,
        active: false,
        lastPlayed: null,
        skipsUsed: 0,
        hintsUsed: 0,
        purchased: purchased,
        stats: {
          tens: 0,
          timeToComplete: 0,
          completionRate: 0,
          perfects: 0,
          perfectStreaks: 0,
          maxPerfectStreaks: 0
        }
      });
      this.gameResults = {
        uid: this.auth.currentUser.uid, active: false, bestTime: 0, timesPlayed: 0, totalNumberOfWordsSolved: 0, lastPlayed: null, hintsUsed: 0, skipsUsed: 0, stats: {
          tens: 0,
          timeToComplete: 0,
          completionRate: 0,
          perfects: 0,
          perfectStreaks: 0,
          maxPerfectStreaks: 0
        } as Careerstats
      } as GameStats;
    }
    let lastPlayed = dayjs(this.gameResults.lastPlayed).utc();
    let today = dayjs().utc();
    let daysBetween = today.diff(lastPlayed, 'days');
    if (daysBetween > 1) {
      // reset max perfect streak
      if (this.gameResults.stats.perfectStreaks >= this.gameResults.stats.maxPerfectStreaks) {
        this.gameResults.stats.maxPerfectStreaks = this.gameResults.stats.perfectStreaks;
      }
      this.gameResults.stats.perfectStreaks = 0;
      updateDoc(doc(this.firestore, "users", this.gameResults.uid), {
        stats: this.gameResults.stats,
      })
    }
    console.log(this.gameResults);

    this.loading = false;
  }

  async getWords() {
    let ref = collection(
      this.firestore,
      'words',
    );
    let q = query(ref, where("date", '==', dayjs().utc().format('MM/DD/YY')));
    const docs = await getDocs(q);
    let words = [];
    docs.forEach((d) => {
      d.data().words.forEach((w) => {
        words.push(w);
        words.sort((a, b) => {
          if (a['index'] > b['index']) {
            return 1;
          } else if (a['index'] < b['index']) {
            return -1;
          }
          return 0;
        })
      });
      this.words = words;
    })



    this.registerPageVisibility();
  }

  async registerPageVisibility() {
    let hidden;
    let visibilityChange;
    let doc = document as any;
    if (typeof doc.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support
      hidden = 'hidden';
      visibilityChange = 'visibilitychange';
    } else if (typeof doc.msHidden !== 'undefined') {
      hidden = 'msHidden';
      visibilityChange = 'msvisibilitychange';
    } else if (typeof doc.webkitHidden !== 'undefined') {
      hidden = 'webkitHidden';
      visibilityChange = 'webkitvisibilitychange';
    }

    window.document.addEventListener(visibilityChange, () => {
      if (!document[hidden]) {

        if (this.words.length === 0 && this.gameResults.active) {
          this.getWords();
        } else {
          this.getSaveState();
        }
      } else {
        clearInterval(this.timerInterval);
        clearInterval(this.solutionChecker);
        clearInterval(this.wordTimerInterval);
      }
    });
    await this.getSaveState();
    this.getTodaysTop10();
  }

  async getSaveState() {
    // Have they played before?
    if (this.gameResults.lastPlayed) {
      // They have played before, was it today?
      const lastPlayed = dayjs(this.gameResults.lastPlayed).utc();
      if (dayjs().utc().isSame(lastPlayed, 'day')) {
        // They played today.
        // Is it an active game or ended game?
        if (this.gameResults.active) {

          // Its an active game, grab storage
          const { value } = await Preferences.get({ key: 'state' });
          // Was anything stored in storage?
          if (value) {
            // an active game was found, lets apply the state
            let state = JSON.parse(value);
            this.secondsPerWord = state.secondsPerWord;
            this.solvedWords = state.solvedWords;
            this.powerupsUsed = state.powerupsUsed;
            this.skipsUsed = state.skipsUsed;
            this.hintsUsed = state.hintsUsed;
            this.anyLetterUsed = state.anyLetterUsed;
            this.firstLetterUsed = state.firstLetterUsed;
            this.skipsUsedPerWord = state.skipsUsedPerWord;
            this.timestamp = state.timestamp;
            this.endGame();
            return;
            const date1 = dayjs(state.timestamp)
            const now = dayjs();
            let timer = state.timer;
            timer -= now.diff(date1, 'second');
            // Has the timer run out since we've been gone?
            if (timer <= 0) {
              this.timer = 0;
              this.checkSolution(true);
              return;
            }

            // Timer is still good.
            // Game is still active.
            // Lets update our state
            this.activeWord = state.activeWord;
            this.letterArray = state.letterArray;
            this.finalWord = state.finalWord;
            this.timerInterval = state.timerInterval;
            this.solutionChecker = state.solutionChecker;
            this.getFirstLetter = state.getFirstLetter;
            this.getRandomLetter = state.getRandomLetter;
            this.canSkip = state.canSkip;
            this.skippedWords = state.skippedWords;
            this.solvedWords = state.solvedWords;
            this.lockedIndexes = state.lockedIndexes;
            this.started = state.started;
            this.ended = state.ended;
            this.timer = timer;

            this.startTimers();
          } else {
            // Nothing was stored, start a new game
            this.startTimers();

            this.setupGameBoard();
          }
        } else {
          const { value } = await Preferences.get({ key: 'state' });
          if (value) {
            let state = JSON.parse(value);
            // Its an inactive game, show results
            this.secondsPerWord = state.secondsPerWord;
            this.solvedWords = state.solvedWords;
            this.powerupsUsed = state.powerupsUsed;
            this.skipsUsed = state.skipsUsed;
            this.hintsUsed = state.hintsUsed;
            this.anyLetterUsed = state.anyLetterUsed;
            this.firstLetterUsed = state.firstLetterUsed;
            this.skipsUsedPerWord = state.skipsUsedPerWord;
            this.timestamp = state.timestamp;
          }
        }
      } else {
        this.setupGameBoard();
      }
    } else {
      if (this.gameResults.active) {
        // game is currenltly going, start the timers
        this.startTimers();
      }

      this.setupGameBoard();
    }
  }

  async setSaveState() {
    let state = {
      activeWord: this.activeWord,
      letterArray: this.letterArray,
      finalWord: this.finalWord,
      timer: this.timer,
      timerInterval: this.timerInterval,
      solutionChecker: this.solutionChecker,
      getFirstLetter: this.getFirstLetter,
      getRandomLetter: this.getRandomLetter,
      canSkip: this.canSkip,
      skippedWords: this.skippedWords,
      solvedWords: this.solvedWords,
      powerupsUsed: this.powerupsUsed,
      finishedDate: this.finishedDate,
      started: this.started,
      ended: this.ended,
      timestamp: this.serverDate,
      lockedIndexes: this.lockedIndexes,
      secondsPerWord: this.secondsPerWord,
      skipsUsed: this.skipsUsed,
      hintsUsed: this.hintsUsed,
      anyLetterUsed: this.anyLetterUsed,
      firstLetterUsed: this.firstLetterUsed,
      skipsUsedPerWord: this.skipsUsedPerWord,
    }
    await Preferences.set({
      key: 'state',
      value: JSON.stringify(state)
    });
  }

  setupGameBoard(skipLetterArray = false) {
    if (!skipLetterArray) {
      this.finalWord = [];

      this.letterArray = [...this.words[this.activeWord].text.toLowerCase()];

      this.letterArray.forEach(() => this.finalWord.push(''));

    }

    this.shuffle(skipLetterArray);
  }

  async startGame() {

    if (this.auth.currentUser.email === null) {
      const alertPopup = await this.alertCtrl.create({
        header: 'Log In or Create an Account',
        subHeader: 'Log In or create an account to see how you rank against other players and save your stats wherever you Sqram! ',
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
          },
          {
            text: 'Play Anonymous',
            handler: async (d) => {
              this.gameResults.active = true;
              this.gameResults.lastPlayed = this.serverDate;

              await updateDoc(doc(this.firestore, 'users', this.gameResults.uid), {
                active: true,
                lastPlayed: this.gameResults.lastPlayed
              });

              this.startTimers();
            }
          }
        ],
      });

      this.menu.close();
      await alertPopup.present();

    } else {
this.gameResults.active = true;
              this.gameResults.lastPlayed = this.serverDate;

              await updateDoc(doc(this.firestore, 'users', this.gameResults.uid), {
                active: true,
                lastPlayed: this.gameResults.lastPlayed
              });

              this.startTimers();
}
  }

  async checkSolution(skipPush) {
    // If we have words, start
    if (this.words.length > 0) {
      let solution = this.words[this.activeWord].text.toLowerCase();
      let guess = this.finalWord.join('').toLowerCase();
      this.setSaveState();

      // Is a solution found?
      if (solution === guess) {
        if (this.skippedSecondsPerWord[this.activeWord]) this.secondsPerWord[this.activeWord] = this.skippedSecondsPerWord[this.activeWord];
        if (isNaN(this.secondsPerWord[this.activeWord]))
          this.secondsPerWord[this.activeWord] = this.wordTimer;
        else this.secondsPerWord[this.activeWord] += this.wordTimer;
        this.wordTimer = 0;
        if (this.skippedWords[0] === this.activeWord) this.skippedWords.shift();

        // If so, push the active index to the solved array (if we don't want to skip that)
        if (!skipPush)
          this.solvedWords[this.activeWord] = this.activeWord;

        // If we have solved all the words, stop everything and show the win screen
        if (this.solvedWords.length === this.words.length && !this.solvedWords.includes(undefined)) {
          this.addTime(this.words[this.activeWord].text.length);
          this.setSaveState();
          this.endGame();
          clearInterval(this.timerInterval);
          clearInterval(this.solutionChecker);
          clearInterval(this.wordTimerInterval);
          // If we still have more words to do, update timer and move to the next one
        } else if (this.activeWord < this.words.length - 1 && !this.solvedWords.includes(this.activeWord + 1)) {
          this.letterRowComponents = [];
          this.finalRowComponents = [];
          if (!this.hintUsedOnLastLetter)
            this.addTime(this.words[this.activeWord].text.length);
          else {
            this.addTime(this.words[this.activeWord].text.length - 3);
          }
          if (!this.getRandomLetter)
            this.getRandomLetter = true;
          if (this.randomLettersAllowed < 9) {
            this.randomLettersAllowed += 1;
          }
          this.moveToNextRound();
          // If we have skipped any words, go back to them at this point
        } else if (this.skippedWords.length > 0) {
          this.addTime(this.words[this.activeWord].text.length);
          this.activeWord = this.skippedWords[0];
          this.finalWord = [];
          this.letterArray = [];
          this.lockedIndexes = [];

          this.lockedIndexes = this.stashLockedIndexes[0];
          this.letterArray = this.stashSkippedWord[0].letters;
          this.finalWord = this.stashSkippedWord[0].final;
          this.stashSkippedWord.shift();
          this.stashLockedIndexes.shift();
          //this.letterArray = this.stashSkippedWord.shift();
          //this.letterArray = ...this.skippedSecondsPerWord[0];
          this.setupGameBoard(true);
        }
        // No words found, just make sure the timer isnt over
      } else if (this.timer <= 0) {
        this.setSaveState();
        this.endGame();
        clearInterval(this.timerInterval);
        clearInterval(this.solutionChecker);
        clearInterval(this.wordTimerInterval);
      } else if (solution.length === guess.length) {
        // A full word has been entered, but it isn't right; Reset
        for (let i = 0; i < this.finalRowComponents.length; i++) {
          if(this.finalRowComponents[i])
            this.finalRowComponents[i].startWiggle();
        }

        setTimeout(() => {
          this.letterRowComponents = [];
          this.finalRowComponents = []
          for (let i = 0; i < this.finalWord.length; i++) {
            this.moveLetterBack(this.finalWord[i], i);
          }
          setTimeout(() => {
            for (let i = 0; i < this.letterRowComponents.length; i++) {
              this.letterRowComponents[i].startWiggle();
            }
          }, 100);
        }, 300)


      }
    }
  }

  gameOver() {
    this.setSaveState();
    this.endGame();
    clearInterval(this.solutionChecker);
    clearInterval(this.timerInterval);
    clearInterval(this.wordTimerInterval);
  }

  async goToCareer() {
    let modal = await this.modalCtrl.create({
      component: CareerstatsComponent,
      componentProps: {
        serverDate: this.serverDate,
        gameResults: this.gameResults
      }
    });

    await modal.present();
  }

  // Prompts anonymous users to create an account after the game
  async goToPostGameAccountCreation() {
    let modal = await this.modalCtrl.create({
      component: PostGameAccountCreationComponent,
    });

    await modal.present();
  }

  moveToNextRound() {
    if (this.activeWord === this.words.length - 1) {
      this.activeWord = this.skippedWords[0];
      this.finalWord = [];
      this.letterArray = [];
      this.lockedIndexes = [];
      this.hintUsedOnLastLetter = false;
      this.lockedIndexes = this.stashLockedIndexes[0];
      this.letterArray = this.stashSkippedWord[0].letters;
      this.finalWord = this.stashSkippedWord[0].final;
      this.stashSkippedWord.shift();
      this.stashLockedIndexes.shift();
      this.setupGameBoard(true);
    } else {
      this.activeWord++;
      this.finalWord = [];
      this.letterArray = [];
      this.lockedIndexes = [];
      this.hintUsedOnLastLetter = false;
      this.setupGameBoard();
    }
  }

  startTimers() {
    this.wordTimerInterval = setInterval(() => this.wordTimer += 100, 100);
    this.solutionChecker = setInterval(() => this.checkSolution(false), 100);
    this.timerInterval = setInterval(() => {
      this.timer -= 1;
      if (this.timer === 0) {
        this.gameOver();
      }
    }, 1000);
  }

  //Checks if the player made it into todays top 10
  async checkIfTop10() {

    //Get all the stats from players game
    let madeTop10 : boolean = false;
    let score = this.getStatus();
    if(score.includes('PERFECT!')) score = 'PERFECT!';

    let TTC : any;
    if(this.solvedWords.length !== this.words.length || (this.solvedWords.includes(null) || this.solvedWords.includes(undefined))) {
      TTC = 'DNF';
    }
    else TTC = this.secondsPerWord.reduce((acc, val) => acc + val, 0);
    console.log(this.secondsPerWord);
    let SPW = this.secondsPerWord.reduce((acc, val) => acc + val, 0) / this.secondsPerWord.length;
    console.log("user score: ", score, TTC, SPW);

    //Check if user can be in todays top 10
    let ref = collection(
      this.firestore,
      'words',
    );
    let q = query(ref, where("date", '==', dayjs().utc().format('MM/DD/YY')));
    const docs = await getDocs(q);
    docs.forEach(async d => {
      const data = d.data();

      //Get all the info from current top 10
      let top10UID = [];
      let top10Score = [];
      let top10TTC = [];
      let top10SPW = [];

      //If todays top 10 is not empty
      if(data.todays_top_10 && data.todays_top_10.length != 0) {
        for (let i = 0; i < data.todays_top_10.length; i++) {
          top10UID[i] = data.todays_top_10[i].uid;
          top10Score[i] = data.todays_top_10[i].score;
          top10TTC[i] = data.todays_top_10[i].ttc;
          top10SPW[i] = data.todays_top_10[i].spw;
        }

        for (let i = 0; i < top10UID.length; i++) {
          if(top10Score[i] == score) {
            if(TTC < top10TTC[i]) {
              top10UID.splice(i, 0, this.auth.currentUser.uid);
              top10Score.splice(i, 0, score);
              top10TTC.splice(i, 0, TTC);
              top10SPW.splice(i, 0, SPW);
              madeTop10 = true;
              break;
            }
            else if(TTC == top10TTC[i]) {
              if(SPW < top10SPW[i]) {
                top10UID.splice(i, 0, this.auth.currentUser.uid);
                top10Score.splice(i, 0, score);
                top10TTC.splice(i, 0, TTC);
                top10SPW.splice(i, 0, SPW);
                madeTop10 = true;
                break;
              }
              else if ((i === top10UID.length - 1) && top10UID.length < 10) {
                top10UID.push(this.auth.currentUser.uid);
                top10Score.push(score);
                top10TTC.push(TTC.toString(10));
                top10SPW.push(SPW.toString(10));
                madeTop10 = true;
                break;
              }
            }
            else if ((i === top10UID.length - 1) && top10UID.length < 10) {
              top10UID.push(this.auth.currentUser.uid);
              top10Score.push(score);
              top10TTC.push(TTC.toString(10));
              top10SPW.push(SPW.toString(10));
              madeTop10 = true;
              break;
            }
          }

          else if(score == 'PERFECT!' && top10Score[i] != 'PERFECT!') {
            top10UID.splice(i, 0, this.auth.currentUser.uid);
            top10Score.splice(i, 0, score);
            top10TTC.splice(i, 0, TTC);
            top10SPW.splice(i, 0, SPW);
            madeTop10 = true;
            break;
          }
          else if(parseInt(top10Score[i].split("/")[0]) < parseInt(score.split("/")[0])) {
            top10UID.splice(i, 0, this.auth.currentUser.uid);
            top10Score.splice(i, 0, score);
            top10TTC.splice(i, 0, TTC);
            top10SPW.splice(i, 0, SPW);
            madeTop10 = true;
            break;
          }
          else if ((i === top10UID.length - 1) && top10UID.length < 10) {
            top10UID.push(this.auth.currentUser.uid);
            top10Score.push(score);
            top10TTC.push(TTC.toString(10));
            top10SPW.push(SPW.toString(10));
            madeTop10 = true;
            break;
          }
        }
      }

      //If todays top 10 is empty
      else {
        top10UID.push(this.auth.currentUser.uid);
        top10Score.push(score);
        top10TTC.push(TTC.toString(10));
        top10SPW.push(SPW.toString(10));
        madeTop10 = true;
      }

      //Format and push data to Firestore
      let formatTop10 = [];
      top10UID = top10UID.slice(0, 10);
      top10Score = top10Score.slice(0, 10);
      top10TTC = top10TTC.slice(0, 10);
      top10SPW = top10SPW.slice(0, 10);

      for (let i = 0; i < top10UID.length; i++) {
        let f = {
          uid: top10UID[i],
          score: top10Score[i],
          ttc: top10TTC[i],
          spw: top10SPW[i]
        }
        formatTop10.push(f);
      }
      console.log(formatTop10);
      await updateDoc(doc(this.firestore, 'words', d.id), {
        todays_top_10: formatTop10
      });
    });

    //When everything is done let's update the scoreboards
    if(madeTop10) await this.getTodaysTop10();
  }

  async getTodaysTop10() {
    this.todaysTop10 = [];
    let ref = collection(
      this.firestore,
      'words',
    );
    let q = query(ref, where("date", '==', dayjs().utc().format('MM/DD/YY')));
    const docs = await getDocs(q);
    docs.forEach(async d => {
      const data = d.data();
      for (let i = 0; i < data.todays_top_10.length; i++) {

        //Get name from uid
        const uid : string = data.todays_top_10[i].uid;
        let name = '';
        const userDoc = await getDoc(doc(this.firestore, "users", uid));
        if (userDoc.exists) {
        const userData = userDoc.data();
          if (userData) {
            name = userData.name;
          }
        }

        //Fix ttc
        let ttc : string;
        if(data.todays_top_10[i].ttc != 'DNF') {
          let num : number = data.todays_top_10[i].ttc;
          ttc = (num/1000).toString(10);
          ttc = ttc + 's';
        } else ttc = 'DNF'

        //Fix spw
        let spw = (data.todays_top_10[i].spw/1000).toFixed(1) + "s";

        const s = {
          uid: uid,
          name: name,
          score: data.todays_top_10[i].score,
          ttc: ttc,
          spw: spw
        };
        this.todaysTop10.push(s);
      }
    });

    console.log(this.todaysTop10);
  }

  /**
 * Game Helpers
 */
  moveLetterFromKeyboard(key) {
    key = key.toLowerCase();

    if (key === 'backspace') {
      for (let i = this.finalWord.length - 1; i >= 0; i--) {
        if (this.finalWord[i] !== '') {
          this.moveLetterBack(this.finalWord[i], i);
          break;
        }
      }
    } else {
      for (let i = 0; i < this.letterArray.length; i++) {
        if (this.letterArray[i] === key) {
          this.moveLetter(key, i);
          break;
        }
      }
    }
  }

  isSkipped(index) {
    return this.skippedWords.includes(index);
  }
  isSolved(index) {
    return this.solvedWords.includes(index);
  }

  isLocked(index) {
    return this.lockedIndexes.includes(index);
  }

  firstLetterHint() {
    if (!this.getFirstLetter) return;
    this.getFirstLetter = !this.getFirstLetter;

    let realWorld = this.words[this.activeWord].text.toLowerCase();
    let letter = realWorld.split('')[0];

    if (this.finalWord[0] !== '') {
      this.moveLetterBack(this.finalWord[0], 0);
    }
    for (let i = 0; i < this.finalWord.length; i++) {
      if (this.finalWord[i] === letter) {
        this.moveLetterBack(this.finalWord[i], i);
        break;
      }
    }
    this.finalWord[0] = letter;
    try {
      setTimeout(() => {
        this.finalRowComponents[0].startExpand();
      }, 100)
    } catch (error) {
      console.log(error);
    }
    this.lockedIndexes.push(0);

    for (let i = 0; i < this.letterArray.length; i++) {
      if (this.letterArray[i] === letter) {
        this.letterArray[i] = '';
        break;
      }
    }

    if (!Array.isArray(this.powerupsUsed[this.activeWord])) this.powerupsUsed[this.activeWord] = [];
    if (!this.powerupsUsed[this.activeWord].includes('flh')) this.powerupsUsed[this.activeWord].push('flh');
    this.gameResults.hintsUsed = this.gameResults.hintsUsed ? this.gameResults.hintsUsed += 1 : 1;
    this.hintsUsed += 1;
    this.addTime(-6)
    this.wordTimer += 6000;
    this.firstLetterUsed[this.activeWord] = isNaN(this.firstLetterUsed[this.activeWord]) ? 1 : this.firstLetterUsed[this.activeWord] += 1;
  }

  randomLetterHint() {
    /** Changes from previous version:
      * Instead of choosing a random letter not played, pick
      * any letter.
      */
    const activeWord = this.words[this.activeWord].text;
    // Choose an index that is not locked
    // Could this spin forever? I hope not
    let index;
    do {
      index = Math.floor(Math.random() *
                           activeWord.length);
    } while (this.lockedIndexes.includes(index));

    const letterLower = activeWord[index].toLowerCase();
    let foundInLetterArray = false;

    // Check if selected letter is in letter array
    for (let i = 0; i < this.letterArray.length; i++) {
      if (this.letterArray[i] === letterLower) {
        // Found letter, remove from array, move
        // letter back to letter array, and set
        // correct letter in finalWord
        this.letterArray.splice(i, 1, '');
        if (this.finalWord[index] !== '') {
          this.moveLetterBack(this.finalWord[index], index);
        }
        foundInLetterArray = true;
        this.finalWord[index] = letterLower;
        break;
      }
    }
    // Letter must be from finalWord
    if (!foundInLetterArray) {
      // Move the letter back if exists and not correct letter
      if (this.finalWord[index] !== '' &&
         this.finalWord[index] !== letterLower) {
        this.moveLetterBack(this.finalWord[index], index);
      }
      // Make sure letter is not already in finalWord
      for (let i = 0; i < this.finalWord.length; i++) {
        if (this.finalWord[i] === letterLower &&
           !this.lockedIndexes.includes(i)) {
          this.finalWord.splice(i, 1, '');
          break;
        }
      }
      this.finalWord[index] = letterLower;
    }

    try {
      if (this.finalWord.includes('')) {
        setTimeout(() => {
          this.finalRowComponents[index].startExpand();
        }, 100);
      }
    } catch (error) {
      console.log(error);
    }

    if (!this.finalWord.includes('')) this.hintUsedOnLastLetter = true;
    this.lockedIndexes.push(index);
    if (!Array.isArray(this.powerupsUsed[this.activeWord])) this.powerupsUsed[this.activeWord] = [];
    if (!this.powerupsUsed[this.activeWord].includes('rlh')) this.powerupsUsed[this.activeWord].push('rlh');
    this.gameResults.hintsUsed = this.gameResults.hintsUsed ? this.gameResults.hintsUsed += 1 : 1;
    this.hintsUsed += 1;
    if (!this.hintUsedOnLastLetter) this.addTime(-3);
    this.wordTimer += 3000;
    this.randomLettersAllowed -= 1;
    this.anyLetterUsed[this.activeWord] = isNaN(this.anyLetterUsed[this.activeWord]) ? 1 : this.anyLetterUsed[this.activeWord] += 1;
    if (this.randomLettersAllowed === 0)
      this.getRandomLetter = !this.getRandomLetter;
  }

  skipWord() {
    this.skipsAllowed -= 1;

    if (this.skipsAllowed <= 0)
      this.canSkip = !this.canSkip;

    this.skippedWords.push(this.activeWord);
    this.stashSkippedWord.push({ final: this.finalWord, letters: this.letterArray });
    this.stashLockedIndexes.push(this.lockedIndexes);

    if (!Array.isArray(this.powerupsUsed[this.activeWord])) this.powerupsUsed[this.activeWord] = [];
    if (!this.powerupsUsed[this.activeWord].includes('skip')) this.powerupsUsed[this.activeWord].push('skip');

    this.gameResults.skipsUsed = this.gameResults.skipsUsed ? this.gameResults.skipsUsed += 1 : 1;
    this.skipsUsedPerWord[this.activeWord] = isNaN(this.skipsUsedPerWord[this.activeWord]) ? 1 : this.skipsUsedPerWord[this.activeWord] += 1;
    this.skipsUsed += 1;
    if (isNaN(this.skippedSecondsPerWord[this.activeWord]))
      this.skippedSecondsPerWord[this.activeWord] = this.wordTimer;
    else this.skippedSecondsPerWord[this.activeWord] += this.wordTimer;
    this.wordTimer = 0;
    this.moveToNextRound();
  }

  async moveLetter(letter, index) {
    if (this.timer === 0 || letter === '') return;
    this.letterArray.splice(index, 1, '');
    let foundIndex;
    for (let i = 0; i < this.finalWord.length; i++) {
      if (this.finalWord[i] === '') {
        this.finalWord[i] = letter;
        foundIndex = i;
        break;
      }
    }
    if (foundIndex !== this.finalWord.length - 1) {
      setTimeout(() => {
        try {
          this.finalRowComponents[foundIndex].startExpand();
        } catch (error) {
          console.log(error);
        }
      }, 100);
    }

    await Haptics.impact({ style: ImpactStyle.Light });
  }

  async moveLetterBack(letter, index) {
    if (this.isLocked(index)) return;
    if (this.timer === 0) return;

    this.finalWord.splice(index, 1, '');
    let foundIndex;
    for (let i = 0; i < this.letterArray.length; i++) {
      if (this.letterArray[i] === '') {
        this.letterArray[i] = letter;
        foundIndex = i;
        break;
      }
    }
    setTimeout(() => {
      try {
        this.letterRowComponents[foundIndex].startExpand();
      } catch (error) {
        console.log(error);
      }
    }, 100);
    await Haptics.impact({ style: ImpactStyle.Light });
  }

  async shareStats() {
    const { value } = await Preferences.get({ key: 'state' });
    let state = JSON.parse(value);
    this.secondsPerWord = state.secondsPerWord;
    this.solvedWords = state.solvedWords;

    let text, index;
    let solved = 0;
    this.solvedWords.forEach((w) => {
      if (w || w === 0) solved += 1;
    })
    text = "Sqram #" + this.puzzleNum + " " + solved + "/" + this.words.length + "\n\n";
    index = 0;
    for (let i = 0; i < this.words.length; i++) {
      let s = this.secondsPerWord[i];

      if (s) {
        if (this.powerupsUsed[i]) {
          text += this.powerupsUsed[i].includes('skip') ? "⏭️" : this.powerupsUsed[i].includes('rlh') || this.powerupsUsed[i].includes('flh') ? "💡" : null;
        } else {
          let whole = Math.round(s / 1000).toFixed(0);
          if (parseInt(whole) >= 10) {
            text += this.emojiNumberArray[this.emojiNumberArray.length - 1];

          } else {
            text += this.emojiNumberArray[parseInt(whole)];
          }
        }
      } else {
        text += "🛑";
      }

      if (i == 4) text += "\n";
    }

    text += "\n\n";

    let total = 0;
    for (let i of this.secondsPerWord) {
      total += i
    }
    if (this.solvedWords.length === this.words.length && (!this.solvedWords.includes(undefined) && !this.solvedWords.includes(null))) {
      text += (total / 1000).toFixed(1) + "s";

      if (this.isPerfect()) text += " PERFECT!";
    } else {
      text += "DNF";
    }


    text += "\nhttps://sqram.com/"

    if (!this.platform.is('ios') && !this.platform.is('android')) {
      await Clipboard.write({
        string: text
      });

      this.showToast("Copied to Clipboard")
    }
    await Share.share({
      title: 'Share your results with your friends!',
      text: text,
      dialogTitle: 'Share with your friends!',
    });
  }

  async showWinPrompt() {
    this.started = false;
    this.finishedDate = new Date();
    this.setSaveState();
    let action = await this.alertCtrl.create({
      header: 'Scramble',
      subHeader: 'You Win!',
      message: 'Be sure to share your score with your friends and come back tomorrow for all new words!',
      buttons: [
        {
          text: 'Share',
          role: 'confirm',
          handler: (e: Event) => {
            this.shareStats();
            return false;
          },
        },
      ],
      backdropDismiss: false
    })

    await action.present();

  }

  async showLosePrompt() {
    this.started = false;
    this.finishedDate = new Date();
    this.setSaveState();
    let action = await this.alertCtrl.create({
      header: 'Scramble',
      subHeader: 'You Lose!',
      message: 'Come back tomorrow and try again!',
      buttons: [
        {
          text: 'Share',
          role: 'confirm',
          handler: () => {
            this.shareStats();
            return false;
          },
        },
      ],
      backdropDismiss: false
    })

    await action.present();

  }

  shuffle(skipSet = false) {
    if (this.letterArray.includes('')) {
      if (!skipSet) this.letterArray = [...this.words[this.activeWord].text.toLowerCase()];
      let index = 0;
      this.letterArray.forEach((l) => {
        if (this.finalWord.includes(l) && this.isLocked(index)) this.letterArray.splice(index, 1, '');
        index++;
      })
      if (!skipSet) {
        for (let i = 0; i < this.finalWord.length; i++) {
          if (!this.isLocked(i)) this.finalWord[i] = '';
        }
      }

    }
    this.letterArray.sort(() => Math.random() - 0.5);

    let guess = this.letterArray.join('');
    if (guess === this.words[this.activeWord].text.toLowerCase()) this.shuffle();

  }

  async endGame() {
    let bestTime = this.gameResults.bestTime;

    if (this.TOTAL_TIME - this.timer < bestTime) this.gameResults.bestTime = this.TOTAL_TIME - this.timer;
    else this.gameResults.bestTime = this.TOTAL_TIME - this.timer;

    let solvedWords = 0;
    this.solvedWords.forEach((w) => {
      if (w || w === 0) solvedWords += 1;
    });
    this.gameResults.totalNumberOfWordsSolved += solvedWords;
    this.gameResults.active = false;

    if (this.gameResults.timesPlayed) {
      this.gameResults.timesPlayed += 1;
    } else this.gameResults.timesPlayed = 1;

    // See if user made it into todays top ten
    await this.checkIfTop10();

    this.figureStats().then(() => {

      // Prompt anonymous users to create an account after the game
      if(this.auth.currentUser.email == null) {
        this.goToPostGameAccountCreation();
      }
      else this.goToCareer();

      updateDoc(doc(this.firestore, "users", this.gameResults.uid), {
        active: this.gameResults.active,
        bestTime: this.gameResults.bestTime,
        totalNumberOfWordsSolved: this.gameResults.totalNumberOfWordsSolved,
        timesPlayed: this.gameResults.timesPlayed,
        stats: this.gameResults.stats,
        hintsUsed: this.gameResults.hintsUsed || 0,
        skipsUsed: this.gameResults.skipsUsed || 0
      })
    })

  }

  async figureStats() {
    return new Promise(async (resolve) => {
      let completedGames = 0;
      if (!this.gameResults.stats) {
        this.gameResults.stats = {
          tens: 0,
          timeToComplete: 0,
          completionRate: 0,
          perfects: 0,
          perfectStreaks: 0,
          maxPerfectStreaks: 0,
          gamesWon: 0,
          wordSolveRate: 0,
          timePerWord: 0
        }
      }
      if (this.solvedWords.length === this.words.length && !this.solvedWords.includes(undefined) && !this.solvedWords.includes(null)) {
        // They completed the game
        if (isNaN(this.gameResults.stats.gamesWon))
          this.gameResults.stats.gamesWon = 1;
        completedGames = this.gameResults.stats.gamesWon;
        this.gameResults.stats.tens += 1;
        if (!this.gameResults.stats.maxPerfectStreaks) this.gameResults.stats.maxPerfectStreaks = 0;

        if (this.isPerfect()) {
          // No hints or skips used, this is a perfect game
          this.gameResults.stats.perfects = this.gameResults.stats.perfects + 1;
          this.gameResults.stats.perfectStreaks = this.gameResults.stats.perfectStreaks + 1;

          if (this.gameResults.stats.perfectStreaks >= this.gameResults.stats.maxPerfectStreaks) {
            this.gameResults.stats.maxPerfectStreaks = this.gameResults.stats.perfectStreaks;
          }
        } else {
          if (this.gameResults.stats.perfectStreaks >= this.gameResults.stats.maxPerfectStreaks) {
            this.gameResults.stats.maxPerfectStreaks = this.gameResults.stats.perfectStreaks;
          }
          this.gameResults.stats.perfectStreaks = 0;
        }

        // Calculate time to complete average
        let total = 0;
        for (let i of this.secondsPerWord) {
          total += i
        }

        total = (total / 1000);

        if (!this.gameResults.stats.timeToComplete) this.gameResults.stats.timeToComplete = parseFloat(total.toFixed(1));
        else {
          if (!isNaN(total) && !isNaN(this.gameResults.stats.timeToComplete)) {
            this.gameResults.stats.timeToComplete = parseFloat(((total + this.gameResults.stats.timeToComplete) / 2).toFixed(1));
          }
        }
        // Done
      } else {
        // fix perfect logic here
        if (this.gameResults.stats.perfectStreaks >= this.gameResults.stats.maxPerfectStreaks) {
          this.gameResults.stats.maxPerfectStreaks = this.gameResults.stats.perfectStreaks;
        }
        this.gameResults.stats.perfectStreaks = 0;
      }

      // Calculate completion rate
      if (isNaN(this.gameResults.stats.gamesWon))
        this.gameResults.stats.gamesWon = 0;
      if (isNaN(this.gameResults.timesPlayed))
        this.gameResults.timesPlayed = 1;

      let completionRate = (this.gameResults.stats.tens / this.gameResults.timesPlayed) * 100;
      this.gameResults.stats.completionRate = parseFloat(completionRate.toFixed(1));
      // Done
      // calculate word solve rate. (total num of solved words / (10 * num Games Played))
      this.gameResults.stats.wordSolveRate = parseFloat(((this.gameResults.totalNumberOfWordsSolved / (10 * this.gameResults.timesPlayed)) * 100).toFixed(1));
      // DONE

      // Calculate time per word
      const arrAvg = arr => arr.reduce((a, b) => a + b, 0) / arr.length


      let average = parseFloat((arrAvg(this.secondsPerWord) / 1000).toFixed(1));
      this.gameResults.stats.timePerWord = this.gameResults.stats.timePerWord ? parseFloat(((this.gameResults.stats.timePerWord + average) / 2).toFixed(1)) : average;
      // Done

      let solvedWords = 0;
      this.solvedWords.forEach((w) => {
        if (w || w === 0) solvedWords += 1;
      });

      let statsObj = <any>{};

      let wordsUsedHints = [];
      let wordsSkipped = [];
      for (let i = 0; i < this.powerupsUsed.length; i++) {
        if (this.powerupsUsed[i]) {
          for (let j = 0; j < this.powerupsUsed[i].length; j++) {
            if (this.powerupsUsed[i][j] == 'flh' || this.powerupsUsed[i][j] == 'rlh') {
              wordsUsedHints[i] = ((this.anyLetterUsed[i] || 0 ) + (this.firstLetterUsed[i] || 0));
            }
            if (this.powerupsUsed[i][j] == 'skip') {
              wordsSkipped.push(i);
            }
          }
        }
      }

      let wordsNotSolved = [];
      for (let i = 0; i < this.words.length; i++) {
        let s = this.secondsPerWord[i];
        if (!s) {
          wordsNotSolved.push(i);
        }
      }
      /**
       * Need to calculate this data and pass it
       *
       * today's game date
       * isPerfect
       * numSolved (x/10)
       * skipsUsed
       * hintsUsed
       * solveTimePerWord
       * words DNF
       * words hints were used on
       * words skipped
       */
      let total = 0;
       for (let i of this.secondsPerWord) {
        total += i
      }

      let isTen = !this.solvedWords.includes(undefined) && !this.solvedWords.includes(null) && this.secondsPerWord.length === this.words.length

      total = parseFloat((total / 1000).toFixed(1));

      statsObj.today = dayjs().utc().format('MM/DD/YY');
      statsObj.wasTodayPerfect = this.isPerfect();
      statsObj.numSolved = solvedWords || 0;
      statsObj.skipsUsed = this.skipsUsed;
      statsObj.hintsUsed = this.hintsUsed;
      statsObj.solveTimePerWord = average || 0;
      statsObj.wordsNotSolved = wordsNotSolved;
      statsObj.wordsUsedHints = wordsUsedHints;
      statsObj.wordsSkipped = wordsSkipped;
      statsObj.timeForPerfect = this.isPerfect() ? (total || 0) : 0;
      statsObj.timeToComplete = isTen ? (total || 0) : 0;
      statsObj.isTen = isTen;
      await this.statsService.calculateGamesResults(statsObj);
      resolve(true);
    });
  }

  haventPlayedToday() {
    if (this.gameResults.lastPlayed && this.doDaysMatch) {
      const lastPlayed = dayjs(this.gameResults.lastPlayed).utc();
      return dayjs(this.serverDate).utc().get('D') === dayjs(lastPlayed).utc().get('D')
    }

    if (this.doDaysMatch) {
      return false;
    }

    return true;
  }

  countdown() {
    let tomorrow = dayjs(this.serverDate).utc().add(1, 'day').format();
    var countDownDate = new Date(tomorrow).getTime();

    // Update the count down every 1 second
    var x = setInterval(function () {

      // Get today's date and time
      var now = new Date().getTime();

      // Find the distance between now and the count down date
      var distance = countDownDate - now;

      // Time calculations for days, hours, minutes and seconds
      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours: any = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes: any = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds: any = Math.floor((distance % (1000 * 60)) / 1000);

      if (hours < 10) hours = "0" + hours.toString();
      if (minutes < 10) minutes = "0" + minutes.toString();
      if (seconds < 10) seconds = "0" + seconds.toString();

      this.timeUntil = hours + ":" + minutes + ":" + seconds;
      // If the count down is finished, write some text
      if (distance < 0) {
        clearInterval(x);
        this.timeUntil = "00:00:00";
        window.location.reload();
      }
    }.bind(this), 1000);
  }

  openMenu() {
    this.menu.enable(true, 'menu');
    this.menu.open('menu');
  }

  openDonate() {
    window.open("https://ko-fi.com/sqram", '_blank')
  }

  isPerfect() {
    for (let i = 0; i < this.powerupsUsed.length; i++) {
      if (this.powerupsUsed[i]) {
        for (let j = 0; j < this.powerupsUsed[i].length; j++) {
          if (this.powerupsUsed[i][j] == 'flh' || this.powerupsUsed[i][j] == 'rlh') {
            return false;
          }
        }
      }
    }

    if (this.solvedWords.includes(undefined) || this.solvedWords.includes(null) || this.secondsPerWord.length !== this.words.length) return false;

    return true;
  }

  getStatus() {
    let solved = 0;
    this.solvedWords.forEach((w) => {
      if (w || w === 0) solved += 1;
    })
    if (this.isPerfect()) {
      return solved + '/' +
        this.words.length + "\n" + "PERFECT!"
    }
    return solved + '/' +
      this.words.length
  }

  async goToLeaderboard() {
    if (this.auth.currentUser.email === null) {
      const alertPopup = await this.alertCtrl.create({
        header: 'Log In or create an account to see how you rank against friends and save your stats wherever you Sqram! ',
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

                await updateProfile(usercred.user, { displayName: d[2] });
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

  sqramChildCreated(item, index) {
    if (this.letterRowComponents.length <= this.letterArray.length)
      this.letterRowComponents[index] = item;
  }

  sqramFinalChildCreated(item, index) {
    if (this.finalRowComponents.length <= this.finalWord.length) {
      this.finalRowComponents[index] = item;
    }
  }

  isStateToday() {
    let today = dayjs().utc();
    let timestamp = dayjs(this.timestamp).utc();

    return today.isSame(timestamp, 'day');
  }

  addTime(amt) {
    if (amt < 0) {
      // Removing Time
      document.getElementById('timer').style.color = "red"
      let currentTime = this.timer;
      let quickInterval = setInterval(() => {
        if (this.timer > (currentTime + amt)) {
          this.timer -= 1;
        } else {
          clearInterval(quickInterval);

          document.getElementById('timer').style.color = "black"
        }
      }, 50)
    } else {
      // Adding Time
      let currentTime = this.timer;
      document.getElementById('timer').style.color = "green"

      let quickInterval = setInterval(() => {
        if (this.timer < (currentTime + amt)) {
          this.timer += 1;
        } else {
          clearInterval(quickInterval);

          document.getElementById('timer').style.color = "black"
        }
      }, 50)
    }
  }

  async showToast(msg) {
    let toast = await this.toastCtrl.create({
      message: msg,
      position: 'bottom',
      duration: 2500
    });
    toast.present();
  }

  //Add a friend by clicking on user on top 10 list
  async addTop10Friend(player : any) {
    const alertPopup = await this.alertCtrl.create({
      header: 'Add ' + player.name + ' as a friend',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'YES',
          handler: async () => {
            const name = player.name;
            const uid = player.uid;

            //Check if friend is already added
            let docs = await getDocs(query(collection(this.firestore, 'users', this.auth.currentUser.uid, 'friends'), where('name', '==', name)));
            if (!docs.empty) {
              this.showToast("Friend Already Added!");
              return;
            }

            //Make sure user doesn't add himself as friend
            if (uid == this.auth.currentUser.uid) {
              this.showToast("That's you!");
              return;
            }

            //Add friend
            try {
              addDoc(collection(this.firestore, 'users', this.auth.currentUser.uid, 'friends'), {
                uid: uid,
                name: name,
              })
              this.showToast('Added ' + name + ' as friend successfully!');
              return true;

            } catch (error) {
              console.error('Error adding document:', error);
              this.showToast('Something went wrong!');
              return;
            }
          }
        }
      ],
    });

    await alertPopup.present();
  }

  /**
   * End Game Helpers
   */

}

