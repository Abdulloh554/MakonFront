import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  isSignInWithEmailLink,
  type Auth,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyBI1ShcOQjQeFrgg30H7HumWmpkGe3hoTY',
  authDomain: 'makon-c46d2.firebaseapp.com',
  projectId: 'makon-c46d2',
  storageBucket: 'makon-c46d2.firebasestorage.app',
  messagingSenderId: '684427381939',
  appId: '1:684427381939:web:14071f93b47cb0daa074c6',
  measurementId: 'G-QEYFSW4EC1',
}

let _app: FirebaseApp | null = null
let _auth: Auth | null = null

function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  }
  return _app
}

export function getAuthInstance(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp())
  }
  return _auth
}

export { sendSignInLinkToEmail, signInWithEmailLink, isSignInWithEmailLink }
