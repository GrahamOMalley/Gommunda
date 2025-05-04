import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  docData,
  setDoc,
  CollectionReference,
  DocumentReference,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { catchError, map, Observable, of } from 'rxjs';
import { collectionData } from '@angular/fire/firestore';
import { Gang } from '../models/gang.interface';

export type { Gang };

@Injectable({
  providedIn: 'root',
})
export class GangService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  // Get the user's gangs collection reference
  private getUserGangsCollection(): CollectionReference<Gang> | null {
    const user = this.auth.currentUser;
    if (!user) {
      console.error('No user is logged in.');
      return null;
    }
    return collection(
      this.firestore,
      `users/${user.uid}/gangs`
    ) as CollectionReference<Gang>;
  }

  getGangById(gangId: string): Observable<Gang | null> {
    const gangsCollection = this.getUserGangsCollection();
    if (!gangsCollection) {
      console.error('Cannot fetch gang: No user is logged in.');
      return of(null);
    }
    const gangDocRef: DocumentReference<Gang> = doc(
      gangsCollection,
      gangId
    ) as DocumentReference<Gang>;
    return docData(gangDocRef, { idField: 'gang_id' }).pipe(
      catchError((err) => {
        console.error('Error fetching gang by ID:', err);
        return of(null); // Return null in case of an error
      }),
      map((data) => data || null) // Map undefined to null
    );
  }

  getUserGangs(): Observable<Gang[]> {
    const gangsCollection = this.getUserGangsCollection();
    if (!gangsCollection) {
      throw new Error('Cannot fetch gangs: No user is logged in.');
    }
    return collectionData(gangsCollection, { idField: 'gang_id' });
  }

  // Create a new gang for the logged-in user
  async createGang(gang: Gang): Promise<void> {
    const gangsCollection = this.getUserGangsCollection();
    if (!gangsCollection) {
      throw new Error('Cannot create gang: No user is logged in.');
    }
    const gangDoc: DocumentReference<Gang> = doc(
      gangsCollection,
      gang.gang_id || undefined
    ); // Use gang_id or auto-generate
    await setDoc(gangDoc, gang);
  }
}
