import { Injectable } from '@angular/core';
import {
  Auth,
  browserSessionPersistence,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  user,
  User,
} from '@angular/fire/auth';
import { setPersistence } from 'firebase/auth';
import { from, Observable } from 'rxjs';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(private firebaseAuth: Auth, private firestore: Firestore) {
    this.user$ = user(this.firebaseAuth);
  }

  private setSessionStoragePersistence(): void {
    setPersistence(this.firebaseAuth, browserSessionPersistence);
  }

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.firebaseAuth, provider);
      console.log('Google-Login result:', result);
      const user = result.user;
      if (!user) {
        throw new Error('Google-Login error');
      }

      // Save user to Firestore
      const userRef = doc(this.firestore, `users/${user.uid}`);
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString(),
      }, { merge: true }); // Use merge to avoid overwriting existing data
    } catch (error) {
      console.error('Google-Login error:', error);
      throw error;
    }
  }

  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth).then(() => {
      sessionStorage.clear();
    });
    return from(promise);
  }
}