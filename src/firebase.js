const firebaseConfig = {
  apiKey: "AIzaSyBLCgNWImiDnqQJiwiPQIaw1Mm_9AmDH4Y",
  authDomain: "space-adventure-1e49b.firebaseapp.com",
  databaseURL: "https://space-adventure-1e49b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "space-adventure-1e49b",
  storageBucket: "space-adventure-1e49b.appspot.com",
  messagingSenderId: "424242158078",
  appId: "1:424242158078:web:1b6c4a79bee150178f48af"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
export const auth = firebaseApp.auth();
export const gameAppDB = firebaseApp.database();
