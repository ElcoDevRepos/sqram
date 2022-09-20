import { Careerstats } from "./careerstats";

export class GameStats {
    lastPlayed: string;
    bestTime: number;
    totalNumberOfWordsSolved: number;
    uid: string;
    active: boolean;
    timesPlayed: number;
    stats: Careerstats;
    skipsUsed: number;
    hintsUsed: number;
}
