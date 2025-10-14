import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBMockKeyForDevelopment",
  authDomain: "gnucash-clone.firebaseapp.com",
  projectId: "gnucash-clone",
  storageBucket: "gnucash-clone.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijk"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
