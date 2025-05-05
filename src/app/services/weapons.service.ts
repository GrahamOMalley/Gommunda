import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  docData,
  setDoc,
  deleteDoc,
  updateDoc,
  CollectionReference,
  DocumentReference,
  collectionData,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, of, forkJoin, combineLatest } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Weapon } from '../models/weapon-profile.interface';

@Injectable({
  providedIn: 'root',
})
export class WeaponsService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  // Sanitize weapon names to handle special characters
  private sanitizeName(name: string): string {
    // Replace invalid Firebase characters: '/', '.', '#', '$', '[', or ']'
    return name.replace(/[\/.#$[\]]/g, '_');
  }

  // Get the user's weapon profiles collection reference
  private getUserWeaponsCollection(): CollectionReference<Weapon> | null {
    const user = this.auth.currentUser;
    if (!user) {
      console.error('No user is logged in.');
      return null;
    }
    return collection(this.firestore, `users/${user.uid}/weapon-profiles`) as CollectionReference<Weapon>;
  }

  // Create or update a weapon
  async saveWeapon(weaponName: string, weapon: Weapon): Promise<void> {
    const weaponsCollection = this.getUserWeaponsCollection();
    if (!weaponsCollection) {
      throw new Error('Cannot save weapon: No user is logged in.');
    }
    const sanitizedWeaponName = this.sanitizeName(weaponName);
    const weaponDoc: DocumentReference<Weapon> = doc(weaponsCollection, sanitizedWeaponName) as DocumentReference<Weapon>;
    await setDoc(weaponDoc, weapon);
  }

  // Get a specific weapon by name
  getWeapon(weaponName: string): Observable<Weapon | null> {
    const weaponsCollection = this.getUserWeaponsCollection();
    if (!weaponsCollection) {
      console.error('Cannot fetch weapon: No user is logged in.');
      return of(null);
    }
    const sanitizedWeaponName = this.sanitizeName(weaponName);
    const weaponDocRef: DocumentReference<Weapon> = doc(weaponsCollection, sanitizedWeaponName) as DocumentReference<Weapon>;
    return docData(weaponDocRef).pipe(
      map((data) => data ?? null), // Map undefined to null
      catchError((err) => {
        console.error('Error fetching weapon:', err);
        return of(null); // Return null in case of an error
      })
    );
  }

  // Get all weapons for the logged-in user
  getAllWeapons(): Observable<Weapon[]> {
    const weaponsCollection = this.getUserWeaponsCollection();
    if (!weaponsCollection) {
      throw new Error('Cannot fetch weapons: No user is logged in.');
    }
    return collectionData(weaponsCollection, { idField: 'name' }).pipe(
      catchError((err) => {
        console.error('Error fetching weapons:', err);
        return of([]); // Return an empty array in case of an error
      })
    );
  }

  // Get multiple weapons by their names
  getWeaponsByNames(weaponNames: string[]): Observable<Weapon[]> {
    const weaponsCollection = this.getUserWeaponsCollection();
    if (!weaponsCollection) {
      console.error('Cannot fetch weapons: No user is logged in.');
      return of([]);
    }

    // Create an array of observables for each weapon name
    const weaponObservables = weaponNames.map(weaponName => {
      const sanitizedWeaponName = this.sanitizeName(weaponName);
      const weaponDocRef: DocumentReference<Weapon> = doc(weaponsCollection, sanitizedWeaponName) as DocumentReference<Weapon>;
      return docData(weaponDocRef).pipe(
        catchError(err => {
          console.error(`Error fetching weapon ${sanitizedWeaponName}:`, err);
          return of(undefined); // Return undefined for this weapon in case of an error
        })
      );
    });

    // Combine all observables into a single observable array
    return combineLatest(weaponObservables).pipe(
      map(weapons => {
        // Filter out null and undefined values
        const validWeapons = weapons.filter((weapon): weapon is Weapon => weapon != null);
        return validWeapons;
      }),
      catchError(err => {
        console.error('Error in combineLatest:', err);
        return of([]); // Return an empty array in case of an error
      })
    );
  }

  // Delete a specific weapon by name
  async deleteWeapon(weaponName: string): Promise<void> {
    const weaponsCollection = this.getUserWeaponsCollection();
    if (!weaponsCollection) {
      throw new Error('Cannot delete weapon: No user is logged in.');
    }
    const sanitizedWeaponName = this.sanitizeName(weaponName);
    const weaponDocRef: DocumentReference<Weapon> = doc(weaponsCollection, sanitizedWeaponName) as DocumentReference<Weapon>;
    await deleteDoc(weaponDocRef);
  }
}
