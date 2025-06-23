// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUIB2d6T2ikzATqTcj0ycVs5vp9zvle-g",
  authDomain: "ws-bc134.firebaseapp.com",
  databaseURL: "https://ws-bc134-default-rtdb.firebaseio.com",
  projectId: "ws-bc134",
  storageBucket: "ws-bc134.appspot.com",
  messagingSenderId: "910197064731",
  appId: "1:910197064731:web:b7d0853db0904119c864be",
  measurementId: "G-Z1JT4EGSX3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
window.firestore = firebase.firestore(); 