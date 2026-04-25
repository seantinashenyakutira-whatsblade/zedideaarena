const { db } = require('./src/config/firebase');

async function listUsers() {
  if (!db) return;
  const snapshot = await db.collection('users').get();
  console.log('Total Users:', snapshot.size);
  snapshot.forEach(doc => {
    console.log('ID:', doc.id, 'Data:', JSON.stringify(doc.data()));
  });
  process.exit(0);
}

listUsers();
