import admin from 'firebase-admin';
import config from "../utils/config.js"
import fs from 'fs';

try {
  const serviceAccount = JSON.parse(fs.readFileSync(config.firebaseConfig.serviceAccountPath));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Firebase Admin SDK initialization error:', error);
}

export const storage = admin.storage();
export const messaging = admin.messaging();