// Configuração e inicialização do Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAski3dWwJScJKy8htzIHDC9jOJePj0Lws",
  authDomain: "laudosrealizados.firebaseapp.com",
  databaseURL: "https://laudosrealizados-default-rtdb.firebaseio.com",
  projectId: "laudosrealizados",
  storageBucket: "laudosrealizados.firebasestorage.app",
  messagingSenderId: "941678509867",
  appId: "1:941678509867:web:0ec4cedbd61ffbc1f38f6e",
  measurementId: "G-GSQSJ0GFQN"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
