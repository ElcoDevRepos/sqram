const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();
const defaultAuth = admin.auth();

exports.setToday = functions.pubsub.schedule("0 19 * * *").timeZone("America/Chicago").onRun(async (context) => {
    let puzzleDoc = await db.collection('today').doc('5lhhN8UFP7KU6DKgIpHr').get();
    let yesterday = puzzleDoc.data().puzzle || 0;
    let newPuzzle = parseInt(yesterday) + 1;
    db.collection('today').doc('5lhhN8UFP7KU6DKgIpHr').update({
        today: new Date().toUTCString(),
        puzzle: newPuzzle
    })
});

exports.resetStats = functions.pubsub.schedule("0 19 * * *").timeZone("America/Chicago").onRun(async (context) => {
    let usersCol = await db.collection('users').get();
    let promises = [];
    usersCol.forEach((doc) => {
            promises.push(
                db.collection('users').doc(doc.id).update({
                    bestTime: 0,
                    hintsUsed: 0,
                    skipsUsed: 0,
                    stats: {
                        completionRate: 0,
                        gamesWon: 0,
                        maxPerfectStreak: 0,
                        perfectStreaks: 0,
                        perfect: 0,
                        tens: 0,
                        timePerWord: 0,
                        timeToComplete: 0,
                        wordSolveRate: 0
                    },
                    statsBackup: {},
                    timesPlayed: 0,
                    totalNumberOfWordsSolved: 0
                })
            )
    })

    return Promise.all(promises);
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

exports.kofiPurchase = functions.https.onRequest((req, res) => {
    const data = req.body;
    
    // Extract the email from the JSON data
    const email = data.email;
    if (!email) {
        res.status(400).send('Email is missing in the JSON data');
        return;
    }
    
    //Get all users for Sqram
    defaultAuth.listUsers()
    .then((userRecords) => {
        let matchedUser = null;

        // Check for email match
        userRecords.users.forEach((user) => {
            if (user.email === email) {
                matchedUser = user;
            }
        });

        // User account found in Sqram
        if (matchedUser) {
            const uid = matchedUser.uid;

            // Search the users collection for the user
            const usersRef = db.collection('users');
            const query = usersRef.where('uid', '==', uid).limit(1);

            query.get()
            .then((snapshot) => {
                // No user found with the matching UID in Firestore
                if (snapshot.empty) {
                    res.send('No user found with the matching UID');
                } 
                // User found
                else {
                    snapshot.forEach((doc) => {
                    const user = doc.data();

                    // Add the "purchased" field to the user document and set it to true
                    const updatedUser = { ...user, purchased: true };

                    // Update the user document in Firestore
                    const docRef = doc.ref;
                    docRef.set(updatedUser)
                        .then(() => {
                            res.send('User found and updated');
                        })
                        .catch((error) => {
                            res.status(500).send('Error updating user: ' + error);
                        });
                    });
                }
            })
            .catch((error) => {
                // An error occurred while searching for the user in the "users" collection
                res.status(500).send('Error searching for user: ' + error);
            });
        }
        // Found no email match among Sqram accounts
        else {
        const pendingRewardRef = db.collection('pending_reward');
        
        // Create a new document in the "pending_reward" collection with the email
        pendingRewardRef.add({ email })
            .then(() => {
                res.send('Email added to pending rewards');
            })
            .catch((error) => {
                res.status(500).send('Error adding email to pending rewards: ' + error);
            });
        }
    })
    .catch((error) => {
      // An error occurred while retrieving the authenticated users
      res.status(500).send('Error retrieving authenticated users: ' + error);
    });
});
  