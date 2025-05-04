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
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Rule } from '../models/rules.interface';

@Injectable({
  providedIn: 'root',
})
export class RulesService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  // Get the user's rules collection reference
  private getUserRulesCollection(): CollectionReference<Rule> | null {
    const user = this.auth.currentUser;
    if (!user) {
      console.error('No user is logged in.');
      return null;
    }
    return collection(this.firestore, `users/${user.uid}/rules`) as CollectionReference<Rule>;
  }

  // Sanitize rule names to handle special characters
  private sanitizeRuleName(ruleName: string): string {
    return ruleName.replace(/[\/.#$[\]]/g, '_'); // Replace invalid characters with '_'
  }

  // Create or update a rule
  async saveRule(ruleName: string, rule: Rule): Promise<void> {
    const rulesCollection = this.getUserRulesCollection();
    if (!rulesCollection) {
      throw new Error('Cannot save rule: No user is logged in.');
    }

    // Sanitize the rule name before saving
    const sanitizedRuleName = this.sanitizeRuleName(ruleName);

    const ruleDoc: DocumentReference<Rule> = doc(rulesCollection, sanitizedRuleName) as DocumentReference<Rule>;
    await setDoc(ruleDoc, rule);
  }

  // Get a specific rule by name
  getRule(ruleName: string): Observable<Rule | null> {
    const rulesCollection = this.getUserRulesCollection();
    if (!rulesCollection) {
      console.error('Cannot fetch rule: No user is logged in.');
      return of(null);
    }

    // Sanitize the rule name before fetching
    const sanitizedRuleName = this.sanitizeRuleName(ruleName);

    const ruleDocRef: DocumentReference<Rule> = doc(rulesCollection, sanitizedRuleName) as DocumentReference<Rule>;
    return docData(ruleDocRef).pipe(
      map((data) => data ?? null), // Map undefined to null
      catchError((err) => {
        console.error('Error fetching rule:', err);
        return of(null); // Return null in case of an error
      })
    );
  }

  // Get all rules for the logged-in user
  getAllRules(): Observable<Rule[]> {
    const rulesCollection = this.getUserRulesCollection();
    if (!rulesCollection) {
      throw new Error('Cannot fetch rules: No user is logged in.');
    }
    return collectionData(rulesCollection, { idField: 'name' }).pipe(
      catchError((err) => {
        console.error('Error fetching rules:', err);
        return of([]); // Return an empty array in case of an error
      })
    );
  }

  // Delete a specific rule by name
  async deleteRule(ruleName: string): Promise<void> {
    const rulesCollection = this.getUserRulesCollection();
    if (!rulesCollection) {
      throw new Error('Cannot delete rule: No user is logged in.');
    }

    // Sanitize the rule name before deleting
    const sanitizedRuleName = this.sanitizeRuleName(ruleName);

    const ruleDocRef: DocumentReference<Rule> = doc(rulesCollection, sanitizedRuleName) as DocumentReference<Rule>;
    await deleteDoc(ruleDocRef);
  }
}
