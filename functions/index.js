const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.setToday = functions.pubsub.schedule("0 0 * * *").onRun(async (context) => {
    db.collection('today').doc('5lhhN8UFP7KU6DKgIpHr').update({
        today: new Date().toUTCString()
    })    
});
