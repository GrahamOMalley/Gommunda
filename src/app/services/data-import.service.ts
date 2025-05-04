import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, of, forkJoin } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { Gang, GangService } from './gang.service';
import { RulesService } from './rules.service';
import { Rule } from '../models/rules.interface';
import { WeaponsService } from './weapons.service';
import { GangerSpecialRulesService } from './ganger-special-rules.service';

@Injectable({
  providedIn: 'root',
})
export class DataImportService {
  constructor(
    private http: HttpClient,
    private gangService: GangService,
    private rulesService: RulesService,
    private weaponsService: WeaponsService,
    private gangerSpecialRulesService: GangerSpecialRulesService // Add the appropriate type for this service
  ) {}


  importFromJson(jsonString: string): Gang {
    try {
      const parsedResponse = JSON.parse(jsonString);

      if (!parsedResponse.gang) {
        console.warn('No gang data found:', parsedResponse.message || 'Unknown error');
        throw new Error(parsedResponse.message || 'No gang data found in the provided JSON.');
      }

      const data = parsedResponse.gang;

      // Map the YakTribe data to your Gang interface
      const importedGang: Gang = {
        gang_id: data.gang_id,
        gang_name: data.gang_name,
        gang_type: data.gang_type,
        gang_rating: data.gang_rating,
        credits: data.credits,
        reputation: data.reputation,
        wealth: data.wealth,
        alignment: data.alignment,
        allegiance: data.allegiance,
        gang_notes: data.gang_notes,
        gangers: data.gangers.map((ganger: any) => ({
          ganger_id: ganger.ganger_id,
          name: ganger.name,
          type: ganger.type,
          cost: ganger.cost,
          equipment: ganger.equipment,
          skills: ganger.skills,
          injuries: ganger.injuries,
          image: ganger.image,
          status: ganger.status,
          notes: ganger.notes,
          m: ganger.m,
          ws: ganger.ws,
          bs: ganger.bs,
          s: ganger.s,
          t: ganger.t,
          w: ganger.w,
          i: ganger.i,
          a: ganger.a,
          ld: ganger.ld,
          cl: ganger.cl,
          wil: ganger.wil,
          int: ganger.int,
          xp: ganger.xp,
          specialRules: [],
        })),
        gang_image: data.gang_image,
      };

      console.log('Mapped imported gang:', importedGang);
      return importedGang;
    } catch (e) {
      console.error('Error parsing JSON:', e);
      throw new Error('Invalid JSON format or no gang data found.');
    }
  }

  private parseGangResponse(response: string): Gang {
    try {
      const parsedResponse = JSON.parse(response);

      if (!parsedResponse.gang) {
        console.warn('No gang data found:', parsedResponse.message || 'Unknown error');
        throw new Error(parsedResponse.message || 'No gang data found for the provided ID.');
      }

      const data = parsedResponse.gang;

      // Map the YakTribe data to your Gang interface
      const importedGang: Gang = {
        gang_id: data.gang_id,
        gang_name: data.gang_name,
        gang_type: data.gang_type,
        gang_rating: data.gang_rating,
        credits: data.credits,
        reputation: data.reputation,
        wealth: data.wealth,
        alignment: data.alignment,
        allegiance: data.allegiance,
        gang_notes: data.gang_notes,
        gangers: data.gangers.map((ganger: any) => ({
          ganger_id: ganger.ganger_id,
          name: ganger.name,
          type: ganger.type,
          cost: ganger.cost,
          equipment: ganger.equipment,
          skills: ganger.skills,
          injuries: ganger.injuries,
          image: ganger.image,
          status: ganger.status,
          notes: ganger.notes,
          m: ganger.m,
          ws: ganger.ws,
          bs: ganger.bs,
          s: ganger.s,
          t: ganger.t,
          w: ganger.w,
          i: ganger.i,
          a: ganger.a,
          ld: ganger.ld,
          cl: ganger.cl,
          wil: ganger.wil,
          int: ganger.int,
          xp: ganger.xp,
          specialRules: [],
        })),
        gang_image: data.gang_image,
      };

      console.log('Mapped imported gang:', importedGang);
      return importedGang;
    } catch (e) {
      console.error('Error parsing YakTribe response:', e);
      throw new Error('Invalid response format or no gang data found.');
    }
  }

  private processGangData(importedGang: Gang): Observable<Gang> {
    const uniqueSkills = this.extractUniqueSkills(importedGang);
    const { weapons, equipment } = this.classifyEquipment(importedGang);

    console.log('Unique skills:', Array.from(uniqueSkills));
    console.log('Weapons:', Array.from(weapons));
    console.log('Equipment:', Array.from(equipment));

    return forkJoin([
      this.createMissingRules(uniqueSkills, equipment),
      this.createMissingWeapons(weapons),
      this.createMissingGangerSpecialRules(importedGang.gangers), // Add this call
    ]).pipe(
      map(() => importedGang) // Pass the gang to the next step
    );
  }

  private extractUniqueSkills(importedGang: Gang): Set<string> {
    const uniqueSkills = new Set<string>();
    importedGang.gangers.forEach((ganger) => {
      if (ganger.skills && Array.isArray(ganger.skills)) {
        ganger.skills.forEach((skill: string) => uniqueSkills.add(skill));
      }
    });
    return uniqueSkills;
  }

  private classifyEquipment(importedGang: Gang): { weapons: Set<string>; equipment: Set<string> } {
    const uniqueEquipment = new Set<string>();
    importedGang.gangers.forEach((ganger) => {
      if (ganger.equipment && Array.isArray(ganger.equipment)) {
        ganger.equipment.forEach((item: any) => uniqueEquipment.add(item.name));
      }
    });

    const weaponKeywords = [
      "axe",
      "blade",
      "bolter",
      "bow",
      "cannon",
      "carbine",
      "club",
      "crossbow",
      "flamer",
      "grenade",
      "gun",
      "knife",
      "knive",
      "launcher",
      "melta",
      "pistol",
      "rifle",
      "shotgun",
      "stub",
      "sword",
      "whip",
      "talon",
      "claw",
      "pike",
      "missile",
      "launcher",
    ];
    const weapons = new Set<string>();
    const equipment = new Set<string>();

    uniqueEquipment.forEach((item) => {
      const lowerCaseItem = item.toLowerCase();
      if (weaponKeywords.some((keyword) => lowerCaseItem.includes(keyword))) {
        weapons.add(item);
      } else {
        equipment.add(item);
      }
    });

    return { weapons, equipment };
  }

  private createMissingRules(uniqueSkills: Set<string>, equipment: Set<string>): Observable<void> {
    console.log('createMissingRules called'); // Debug log

    return this.rulesService.getAllRules().pipe(
      take(1), // Ensure this observable completes after the first emission
      switchMap((existingRules: Rule[]) => {
        console.log('Fetched existing rules:', existingRules); // Debug log

        const existingRuleNames = new Set(existingRules.map((rule) => this.sanitizeName(rule.name)));

        const missingSkills = Array.from(uniqueSkills).filter(
          (skill) => !existingRuleNames.has(this.sanitizeName(skill))
        );
        const missingEquipment = Array.from(equipment).filter(
          (item) => !existingRuleNames.has(this.sanitizeName(item))
        );

        console.log('Missing skills (to create as rules):', missingSkills);
        console.log('Missing equipment (to create as rules):', missingEquipment);

        const createSkillRules = missingSkills.map((skill) =>
          from(
            this.rulesService.saveRule(this.sanitizeName(skill), {
              name: skill,
              rule_type: 'gang_skill',
              description: '',
            })
          )
        );

        const createEquipmentRules = missingEquipment.map((item) =>
          from(
            this.rulesService.saveRule(this.sanitizeName(item), {
              name: item,
              rule_type: 'equipment',
              description: '',
            })
          )
        );

        const allRuleCreations = [...createSkillRules, ...createEquipmentRules];

        if (allRuleCreations.length === 0) {
          console.log('No rules to create'); // Debug log
          return of(undefined);
        }

        return forkJoin(allRuleCreations).pipe(
          map(() => undefined),
          catchError((err) => {
            console.error('Error creating rules:', err);
            return of(undefined);
          })
        );
      })
    );
  }

  private createMissingWeapons(weapons: Set<string>): Observable<void> {
    console.log('createMissingWeapons called'); // Debug log

    return this.weaponsService.getAllWeapons().pipe(
      take(1), // Ensure this observable completes after the first emission
      switchMap((existingWeapons) => {
        console.log('Fetched existing weapons:', existingWeapons); // Debug log

        const existingWeaponNames = new Set(
          existingWeapons.map((weapon) => this.sanitizeName(weapon.name))
        );

        const missingWeapons = Array.from(weapons).filter(
          (weapon) => !existingWeaponNames.has(this.sanitizeName(weapon))
        );

        console.log('Missing weapons (to create):', missingWeapons);

        const createWeaponObservables = missingWeapons.map((weapon) =>
          from(
            this.weaponsService.saveWeapon(this.sanitizeName(weapon), {
              name: this.sanitizeName(weapon),
              range: { short: '', long: '' },
              accuracy: { short: '', long: '' },
              strength: '',
              damage: '',
              armor_penetration: '',
              ammo_roll: '',
              traits: [],
            })
          )
        );

        if (createWeaponObservables.length === 0) {
          console.log('No weapons to create'); // Debug log
          return of(undefined);
        }

        return forkJoin(createWeaponObservables).pipe(
          map(() => undefined),
          catchError((err) => {
            console.error('Error creating weapons:', err);
            return of(undefined);
          })
        );
      })
    );
  }

  private createMissingGangerSpecialRules(gangers: { type: string }[]): Observable<void> {
    console.log('createMissingGangerSpecialRules called'); // Debug log

    // Extract unique ganger types
    const uniqueGangerTypes = new Set(gangers.map((ganger) => ganger.type));

    return this.gangerSpecialRulesService.getAllSpecialRules().pipe(
      take(1), // Ensure this observable completes after the first emission
      switchMap((existingRules) => {
        console.log('Fetched existing ganger special rules:', existingRules); // Debug log

        const existingGangerTypes = new Set(existingRules.map((rule) => rule.ganger_type));

        // Find missing ganger types
        const missingGangerTypes = Array.from(uniqueGangerTypes).filter(
          (type) => !existingGangerTypes.has(type)
        );

        console.log('Missing ganger types (to create special rules):', missingGangerTypes);

        // Create default special rules for missing ganger types
        const createSpecialRulesObservables = missingGangerTypes.map((type) =>
          from(
            this.gangerSpecialRulesService.saveSpecialRules(type, [])
          )
        );

        if (createSpecialRulesObservables.length === 0) {
          console.log('No ganger special rules to create'); // Debug log
          return of(undefined);
        }

        return forkJoin(createSpecialRulesObservables).pipe(
          map(() => undefined),
          catchError((err) => {
            console.error('Error creating ganger special rules:', err);
            return of(undefined);
          })
        );
      })
    );
  }

  // Sanitize rule names to handle special characters
  private sanitizeName(ruleName: string): string {
    return ruleName.replace(/[\/.#$[\]]/g, '_'); // Replace invalid characters with '_'
  }

  private saveGang(importedGang: Gang): Observable<Gang> {
    return from(this.gangService.createGang(importedGang)).pipe(
      map(() => {
        console.log('Gang successfully saved:', importedGang);
        return importedGang;
      })
    );
  }
}
