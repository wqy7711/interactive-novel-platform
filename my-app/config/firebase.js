import firebase from 'firebase/app';
import 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA_k_MdSbqy54zxCTDT4ByISZG6ZYwXRWw",
    authDomain: "interactive-novel-platform.firebaseapp.com",
    projectId: "interactive-novel-platform",
    storageBucket: "interactive-novel-platform.firebasestorage.app",
    messagingSenderId: "196226052108",
    appId: "1:196226052108:web:5c5352febb6ed0ab9d7e29"
  };

  // Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  export { firebase };