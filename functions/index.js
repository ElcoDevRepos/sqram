const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.setToday = functions.pubsub.schedule("0 19 * * *").timeZone("America/Chicago").onRun(async (context) => {
    db.collection('today').doc('5lhhN8UFP7KU6DKgIpHr').update({
        today: new Date().toUTCString()
    })
});

exports.eraseInactiveAccounts = functions.pubsub.schedule("0 0 1 */1 *").timeZone("America/Chicago").onRun(async (context) => {
    function calculateDaysBetweenDates(date1, date2) {
        var oneDay = 24 * 60 * 60 * 1000;
        var date1InMillis = date1.getTime();
        var date2InMillis = date2.getTime();
        var days = Math.round(Math.abs(date2InMillis - date1InMillis) / oneDay);
        return days;
    }
    let nullPlayedRef = await db.collection('users').where("lastPlayed", "==", null).get();
    let unusedAccounts = [];
    nullPlayedRef.forEach((doc) => {
        unusedAccounts.push(doc.id)
    });

    let oldAccountRef = await db.collection('users').where("lastPlayed", "!=", null).get();
    oldAccountRef.forEach((doc) => {
        let timePlayed = doc.data().lastPlayed;
        let today = new Date();

        let timeBetween = calculateDaysBetweenDates(today, new Date(timePlayed));

        if (timeBetween > 60) {
            // Haven't played in 60 days, delete their account.
            unusedAccounts.push(doc.id);
        }
    })

    for (let i = 0; i < unusedAccounts.length; i++) {
        try {
            const uidExists = await admin.auth().getUser(unusedAccounts[i]);
            if (uidExists.uid)
                await admin.auth().deleteUser(unusedAccounts[i]);
        } catch (error) {
            console.log(error);
        }
        try {
            await db.collection('users').doc(unusedAccounts[i]).delete();
        } catch (error) {
        }
    }
})

exports.backupPlayerStats = functions.pubsub.schedule("0 19 * * *").timeZone("America/Chicago").onRun(async () => {
    let promises = [];
    let allAccounts = await db.collection('users').where("lastPlayed", "!=", null).get();
    allAccounts.forEach((acc) => {
        if (acc.data().stats) {
            let account = acc.data();
            let stats = account.stats;
            let hasNaNData = false;

            let statKeys = Object.keys(stats);
            for (let i = 0; i < statKeys.length; i++) {
                let key = statKeys[i];
                if (isNaN(stats[key])) {
                    hasNaNData = true;
                    break;
                }
            }

            if (hasNaNData) {
                if (account.statsBackup) {
                    promises.push(db.collection('users').doc(acc.id).update({ 
                        stats: account.statsBackup.stats, 
                        timePlayed: account.statsBackup.timesPlayed,
                        totalNumberOfWordsSolved: account.statsBackup.totalNumberOfWordsSolved,
                        bestTime:  account.statsBackup.bestTime,
                        hintsUsed: account.statsBackup.hintsUsed,
                        skipsUsed: account.statsBackup.skipsUsed
                     }));
                } else {}
            } else {
                account.statsBackup = {
                    stats: account.stats,
                    timesPlayed: account.timesPlayed,
                    totalNumberOfWordsSolved: account.totalNumberOfWordsSolved,
                    bestTime: account.bestTime,
                    hintsUsed: account.hintsUsed,
                    skipsUsed: account.skipsUsed
                }

                promises.push(db.collection('users').doc(acc.id).update({ statsBackup: account.statsBackup }));
            }
        }
    })

    return Promise.all(promises);
})