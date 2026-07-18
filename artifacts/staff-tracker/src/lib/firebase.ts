import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOYEv9tBAcGxQzPVEEhQqQ6EI_saSz39U",
  authDomain: "train-booking-41cd9.firebaseapp.com",
  projectId: "train-booking-41cd9",
  storageBucket: "train-booking-41cd9.firebasestorage.app",
  messagingSenderId: "837662420324",
  appId: "1:837662420324:web:7df66c1dc8fb76f51a5e71"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Helper to trigger a live update
export const triggerLiveUpdate = async () => {
  try {
    const docRef = doc(db, "system", "live_update");
    await setDoc(docRef, { lastUpdated: Date.now() });
  } catch (error) {
    console.error("Failed to trigger live update", error);
  }
};
