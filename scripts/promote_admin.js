const { db } = require('./src/config/firebase');

async function promoteAdmin() {
  const uid = 'dev-user-123';
  try {
    await db.collection('users').doc(uid).set({
      role: 'admin',
      is_verified: true
    }, { merge: true });
    console.log(`✅ User ${uid} promoted to Admin!`);
  } catch (error) {
    console.error('❌ Failed to promote admin:', error.message);
  }
}

promoteAdmin();
