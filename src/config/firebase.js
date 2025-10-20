import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDRT4mshNmh5wkgB_BfU0IRrGnTcFD2mjI",
  authDomain: "dev-notes-pro.firebaseapp.com",
  projectId: "dev-notes-pro",
  storageBucket: "dev-notes-pro.appspot.com",
  messagingSenderId: "800013122219",
  appId: "1:800013122219:web:37ff314fd573235a8ed5ee",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
