const { db } = require('./src/config/firebase');

async function checkUser() {
  if (!db) {
    console.log('Database not initialized');
    return;
  }
  const uid = 'dev-user-123'; // The UID used in handleDevLogin
  const doc = await db.collection('users').doc(uid).get();
  if (doc.exists) {
    console.log('User Status:', doc.data().kyc_status);
    console.log('Is Verified:', doc.data().is_verified);
  } else {
    console.log('User dev-user-123 not found in Firestore.');
  }
  process.exit(0);
}

checkUser();
