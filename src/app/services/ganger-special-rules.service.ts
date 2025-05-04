import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  docData,
  setDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  collectionData,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface GangerSpecialRule {
  ganger_type: string;
  rules: string[]; // List of special rules for the ganger type
}

@Injectable({
  providedIn: 'root',
})
export class GangerSpecialRulesService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  // Get the user's ganger special rules collection reference
  private getUserGangerSpecialRulesCollection(): CollectionReference<GangerSpecialRule> | null {
    const user = this.auth.currentUser;
    if (!user) {
      console.error('No user is logged in.');
      return null;
    }
    return collection(
      this.firestore,
      `users/${user.uid}/ganger_special_rules`
    ) as CollectionReference<GangerSpecialRule>;
  }

  // Get special rules for a specific ganger type
  getSpecialRulesByGangerType(gangerType: string): Observable<GangerSpecialRule | null> {
    const rulesCollection = this.getUserGangerSpecialRulesCollection();
    if (!rulesCollection) {
      console.error('Cannot fetch special rules: No user is logged in.');
      return of(null);
    }
    const ruleDocRef: DocumentReference<GangerSpecialRule> = doc(
      rulesCollection,
      gangerType
    ) as DocumentReference<GangerSpecialRule>;
    return docData(ruleDocRef).pipe(
      catchError((err) => {
        console.error('Error fetching special rules by ganger type:', err);
        return of(null); // Return null in case of an error
      }),
      map((data) => data || null) // Map undefined to null
    );
  }

  // Get all special rules for the logged-in user
  getAllSpecialRules(): Observable<GangerSpecialRule[]> {
    const rulesCollection = this.getUserGangerSpecialRulesCollection();
    if (!rulesCollection) {
      throw new Error('Cannot fetch special rules: No user is logged in.');
    }
    return collectionData(rulesCollection, { idField: 'ganger_type' });
  }

  // Create or update special rules for a specific ganger type
  async saveSpecialRules(gangerType: string, rules: string[]): Promise<void> {
    const rulesCollection = this.getUserGangerSpecialRulesCollection();
    if (!rulesCollection) {
      throw new Error('Cannot save special rules: No user is logged in.');
    }
    const ruleDoc: DocumentReference<GangerSpecialRule> = doc(
      rulesCollection,
      gangerType
    ) as DocumentReference<GangerSpecialRule>;
    await setDoc(ruleDoc, { ganger_type: gangerType, rules });
  }

  // Delete special rules for a specific ganger type
  async deleteSpecialRule(gangerType: string): Promise<void> {
    const rulesCollection = this.getUserGangerSpecialRulesCollection();
    if (!rulesCollection) {
      throw new Error('Cannot delete special rule: No user is logged in.');
    }
    const ruleDocRef = doc(rulesCollection, gangerType);
    await deleteDoc(ruleDocRef);
  }
}
