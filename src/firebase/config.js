import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCVTuV2SEt9UdU8UitjEettxxcL3PJmo1c",
  authDomain: "phonebook-app-1a56d.firebaseapp.com",
  projectId: "phonebook-app-1a56d",
  storageBucket: "phonebook-app-1a56d.firebasestorage.app",
  messagingSenderId: "105552507751",
  appId: "1:105552507751:web:e1b832403e5ad6d544b5c2",
};

const app = initializeApp(firebaseConfig);

// Buat koneksi ke Firestore
export const db = getFirestore(app);
export const storage = getStorage(app);
