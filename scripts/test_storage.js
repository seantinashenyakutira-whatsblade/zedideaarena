const { storage } = require('./src/config/firebase');

async function testStorage() {
  if (!storage) {
    console.error('❌ Storage not initialized.');
    return;
  }

  try {
    const bucket = storage.bucket();
    const [metadata] = await bucket.getMetadata();
    console.log('✅ Storage connected!');
    console.log(`Working with bucket: ${metadata.name}`);
  } catch (error) {
    console.error('❌ Storage connection failed:', error.message);
    console.log('Tip: Ensure FIREBASE_STORAGE_BUCKET is set in .env');
  }
}

testStorage();
