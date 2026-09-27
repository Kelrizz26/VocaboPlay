import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDB9FjlUXI7PJfSt0vAzAqyYmtgSsyZpek",
  authDomain: "vocaboplay-8b7cb.firebaseapp.com",
  projectId: "vocaboplay-8b7cb",
  storageBucket: "vocaboplay-8b7cb.firebasestorage.app",
  messagingSenderId: "274822950411",
  appId: "1:274822950411:web:9fd8d09c065960876f210e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;