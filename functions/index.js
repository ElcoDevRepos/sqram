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
        await admin.auth().deleteUser(unusedAccounts[i]);
        await db.collection('users').doc(unusedAccounts[i]).delete();
    }
})