import { Injectable } from '@angular/core';
import { collection, query, where, getDocs, Firestore } from '@angular/fire/firestore';
import { doc, updateDoc } from '@firebase/firestore';
import * as dayjs from 'dayjs';

@Injectable({
  providedIn: 'root'
})
export class StatsService {

  constructor(private firestore: Firestore) { }

  async calculateGamesResults(game) {
    console.log(game);
    let ref = collection(
      this.firestore,
      'words',
    );
    let q = query(ref, where("date", '==', dayjs().utc().format('MM/DD/YY')));
    const docs = await getDocs(q);
    let todaysWordDoc;
    let id;
    docs.forEach((d) => {
      id = d.id;
      todaysWordDoc = d.data();
    })
    if (game.wasTodayPerfect) {
      game.numSolved += 1;
    }
    if (!todaysWordDoc.stats) {
      todaysWordDoc.stats = {
        scores: [0,0,0,0,0,0,0,0,0,0,0,0],
        totalGamesPlayed: 1,
        skipsUsed: game.skipsUsed || 0,
        hintsUsed: game.hintsUsed || 0,
        solveTimePerWord: game.solveTimePerWord || 0,
        wordsSkipped: [0,0,0,0,0,0,0,0,0,0,0],
        wordsHinted: [0,0,0,0,0,0,0,0,0,0,0],
        wordsNotSolved: [0,0,0,0,0,0,0,0,0,0,0],
        bestPerfectTime: game.wasTodayPerfect ? game.timeForPerfect || 0 : 0,
        averageTimeToComplete: game.isTen ? game.timeToComplete || 0 : 0,
        averageTimeToPerfect: game.wasTodayPerfect ? game.timeForPerfect || 0 : 0
      };
      todaysWordDoc.stats.scores[game.numSolved] += 1;
      for (let i = 0; i < game.wordsSkipped.length; i++) {
        todaysWordDoc.stats.wordsSkipped[game.wordsSkipped[i]] = 1;
      }
      for (let i = 0; i < game.wordsUsedHints.length; i++) {
        todaysWordDoc.stats.wordsHinted[game.wordsUsedHints[i]] = 1;
      }
      for (let i = 0; i < game.wordsNotSolved.length; i++) {
        todaysWordDoc.stats.wordsNotSolved[game.wordsNotSolved[i]] = 1;
      }
    } else {
      todaysWordDoc.stats.scores[game.numSolved] += 1;
      todaysWordDoc.stats.totalGamesPlayed += 1;
      todaysWordDoc.stats.skipsUsed += game.skipsUsed;
      todaysWordDoc.stats.hintsUsed += game.hintsUsed;
      todaysWordDoc.stats.solveTimePerWord = ((game.solveTimePerWord || 0) + todaysWordDoc.stats.solveTimePerWord) / 2;
      todaysWordDoc.stats.averageTimeToComplete = game.isTen ? ((todaysWordDoc.stats.averageTimeToComplete || 0) + (game.timeToComplete || 0)) / 2 : todaysWordDoc.stats.averageTimeToComplete;
      todaysWordDoc.stats.averageTimeToPerfect = game.wasTodayPerfect ? ((todaysWordDoc.stats.averageTimeToPerfect || 0) + (game.timeForPerfect || 0)) / 2 : todaysWordDoc.stats.averageTimeToPerfect;

      for (let i = 0; i < game.wordsSkipped.length; i++) {
        todaysWordDoc.stats.wordsSkipped[game.wordsSkipped[i]] += 1;
      }
      for (let i = 0; i < game.wordsUsedHints.length; i++) {
        todaysWordDoc.stats.wordsHinted[i] += game.wordsUsedHints[i] || 0;
      }
      for (let i = 0; i < game.wordsNotSolved.length; i++) {
        todaysWordDoc.stats.wordsNotSolved[game.wordsNotSolved[i]] = 1;
      }
      if (game.wasTodayPerfect && game.timeForPerfect < todaysWordDoc.stats.bestPerfectTime && game.timeForPerfect > 0) {
        todaysWordDoc.stats.bestPerfectTime = game.timeForPerfect;
      }
    }
   
    updateDoc(doc(this.firestore, "words", id), {
      stats: todaysWordDoc.stats
    })
  }
}
