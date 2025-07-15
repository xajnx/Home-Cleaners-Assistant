import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBSfgukd3a5mTee0dKvZMyo00u1GgUAMs",
    authDomain: "home-cleaner-s-assistant.firebaseapp.com",
    projectID: "home-cleaner-s-assistant",
    storageBucket: "home-cleaner-s-assistant.firebasestorage.app",
    messageSenderId: "7698291775",
    appId: "1:769829171175:web:12a073e2819aa7d2cc5742",
    measurementId: "G-58HJ4Y6LEF"
};

const app = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);

