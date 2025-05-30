import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInput, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Weapon, WeaponProfile } from '../../models/weapon-profile.interface';
import { WeaponsService } from '../../services/weapons.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { RulesService } from '../../services/rules.service';
import { forkJoin, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-weapon-profiles',
  standalone: true,
  imports: [
    MatTableModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatButtonToggleGroup,
    MatOptionModule,
    MatSelectModule,
    MatChipsModule,    
    MatChipInput
  ],
  templateUrl: './weapon-profiles.component.html',
  styleUrls: ['./weapon-profiles.component.scss']
})
export class WeaponProfilesComponent implements OnInit {

    displayedColumns: string[] = [
      'weaponName',
      'profileName',
      'range_short',
      'range_long',
      'accuracy_short',
      'accuracy_long',
      'strength',
      'armor_penetration',
      'damage',
      'ammo_roll',
      'traits',
      'actions'
    ];
  dataSource = new MatTableDataSource<Weapon>([]);

  readonly separatorKeysCodes: number[] = [ENTER, COMMA]; // Keys to separate chips

  constructor(private weaponsService: WeaponsService, private rulesService: RulesService) {}

  ngOnInit(): void {
    this.loadWeapons();
  }

  loadWeapons(): void {
    this.weaponsService.getAllWeapons().subscribe((weapons: Weapon[]) => {
      this.dataSource.data = weapons;
      console.log('Loaded weapons:', weapons);
    });
  }

  addTrait(weapon: WeaponProfile, event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add the trait if it is not empty
    if (value) {
      weapon.traits.push(value);
    }

    // Clear the input field
    event.chipInput!.clear();
  }

  removeTrait(weapon: WeaponProfile, index: number): void {
    if (index >= 0) {
      weapon.traits.splice(index, 1);
    }
  }

  saveWeapon(weapon: Weapon): void {
    console.log('Saving weapon:', weapon);

    // Get the set of traits from the weapon
    const traits = new Set(weapon.profiles.flatMap(profile => profile.traits));
    console.log('Traits to check:', traits);

    // Check for missing rules in the RulesService
    this.rulesService.getAllRules().pipe(
      take(1), // Ensure the observable completes after the first emission
      switchMap((existingRules) => {
        const existingRuleNames = new Set(existingRules.map((rule) => rule.name.toLowerCase()));

        // Find traits that are missing as rules
        const missingTraits = Array.from(traits).filter(
          (trait) => !existingRuleNames.has(trait.toLowerCase())
        );

        console.log('Missing traits (to create as rules):', missingTraits);

        // Create rules for missing traits
        const createTraitRules = missingTraits.map((trait) =>
          this.rulesService.saveRule(trait, {
            name: trait,
            rule_type: 'weapon_trait',
            description: '',
          })
        );

        return forkJoin(createTraitRules.length > 0 ? createTraitRules : [of(null)]);
      })
    ).subscribe({
      next: () => {
        // Save the weapon after ensuring all traits have rules
        this.weaponsService.saveWeapon(weapon.name, weapon).then(() => {
          console.log('Weapon saved successfully:', weapon);
        }).catch((error) => {
          console.error('Error saving weapon:', error);
        });
      },
      error: (err) => {
        console.error('Error checking or creating rules for traits:', err);
      }
    });
  }

  addNewWeapon(): void {
    const newWeapon: Weapon = {
      name: '',
      profiles: [
        {
          name: '',
          range: { short: '', long: '' },
          accuracy: { short: '', long: '' },
          strength: '',
          damage: '',
          armor_penetration: '',
          ammo_roll: '',
          traits: []
        }
      ] // Initialize with an empty profile
    };
    this.dataSource.data = [...this.dataSource.data, newWeapon];
  }

  deleteWeapon(weapon: Weapon): void {
    this.dataSource.data = this.dataSource.data.filter(w => w !== weapon);

    this.weaponsService.deleteWeapon(weapon.name).then(() => {
      this.loadWeapons(); // Reload weapons after deletion
    }).catch(error => {
      console.error('Error deleting weapon:', error);
    });

    console.log('Deleted weapon:', weapon);
  }

  addProfileToWeapon(weapon: Weapon): void {
    const newProfile: WeaponProfile = {
      name: '',
      range: { short: '', long: '' },
      accuracy: { short: '', long: '' },
      strength: '',
      damage: '',
      armor_penetration: '',
      ammo_roll: '',
      traits: []
    };

    weapon.profiles.push(newProfile);
    console.log('Added new profile to weapon:', weapon);
  }

  removeLastProfileFromWeapon(weapon: Weapon): void {
    if (weapon.profiles.length > 0) {
      const removedProfile = weapon.profiles.pop();
      console.log('Removed profile:', removedProfile, 'from weapon:', weapon);
    } else {
      console.warn('No profiles to remove from weapon:', weapon);
    }
  }
}
