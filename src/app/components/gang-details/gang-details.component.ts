import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GangService } from '../../services/gang.service';
import { WeaponsService } from '../../services/weapons.service';
import { RulesService } from '../../services/rules.service';
import { GangerSpecialRule, GangerSpecialRulesService } from '../../services/ganger-special-rules.service';
import { Gang } from '../../models/gang.interface';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Weapon } from '../../models/weapon-profile.interface';
import { Rule } from '../../models/rules.interface';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-gang-details',
  templateUrl: './gang-details.component.html',
  styleUrl: './gang-details.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    FormsModule,
    MatTableModule,
    NgIf
  ]
})
export class GangDetailsComponent implements OnInit, OnDestroy {
  private routeSub: Subscription | null = null;
  gang$: Observable<Gang | null> = of(null);
  gangWeapons$: Observable<Weapon[]> = of([]);
  rules$: Observable<Rule[]> = of([]); // New Observable for matched rules
  showGangerImages = false; // Default value for showing ganger images
  ruleTypeOrder: string[] = ['gang_skill', 'ganger_special_rule', 'weapon_trait', 'equipment']; // Order of rule types
  groupedRules: Record<string, Rule[]> = {};
  ruleTypeDisplayNames: { [key: string]: string } = {
    gang_skill: 'Gang Skills',
    ganger_special_rule: 'Ganger Special Rules',
    weapon_trait: 'Weapon Traits',
    equipment: 'Equipment'
  };
  viewportWidth: number = window.innerWidth; // Initialize with the current width


  constructor(
    private route: ActivatedRoute,
    private gangService: GangService,
    private weaponsService: WeaponsService,
    private rulesService: RulesService,
    private gangerSpecialRulesService: GangerSpecialRulesService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.pipe(
      switchMap(paramMap => this.loadGang(paramMap.get('gang_id')))
    ).subscribe(gang => {
      if (gang) {
        this.gang$ = of(gang);
        this.loadWeapons(gang);
        this.loadSpecialRules(gang);
        this.loadRules(gang); // Renamed method
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from the route subscription to avoid memory leaks
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.viewportWidth = document.documentElement.clientWidth; // Exclude scrollbar width
  }

  
  // Get equipment list (placeholder implementation)
  getEquipmentList(ganger: any): string {
    return ganger.equipment.map((item: any) => item.name).join(', ');
  }

  getWeapon(weaponName: string, gangWeapons: Weapon[]): Weapon | null {

    //remove any Weapon that doesn't have a name property
    gangWeapons = gangWeapons.filter(w => w?.name);

    if (!weaponName || !gangWeapons) {
      return null; // Return null if inputs are invalid
    }
    return gangWeapons.find(w => w.name === weaponName) || null;
  }

  private loadGang(gangId: string | null): Observable<Gang | null> {
    if (gangId) {
      return this.gangService.getGangById(gangId).pipe(
        catchError(err => {
          console.error('Failed to fetch gang details', err);
          return of(null); // Return null in case of an error
        })
      );
    }
    return of(null); // Return null if no gang_id is present
  }

  private loadWeapons(gang: Gang): void {
    const uniqueWeapons = new Set<string>();
    gang.gangers.forEach(member => {
      if (member.equipment) {
        const weaponNames = member.equipment.map(e => e.name);
        weaponNames.forEach(weaponName => uniqueWeapons.add(weaponName));
      }
    });

    // Use WeaponsService to fetch weapon profiles for unique weapons
    this.gangWeapons$ = this.weaponsService.getWeaponsByNames(Array.from(uniqueWeapons));
  }

  private loadSpecialRules(gang: Gang): void {
    gang.gangers.forEach(ganger => {
      this.gangerSpecialRulesService.getSpecialRulesByGangerType(ganger.type).subscribe(specialRule => {
        ganger.specialRules = specialRule?.rules || []; // Populate the specialRules array
      });
    });
  }

  private loadRules(gang: Gang): void {
    this.rules$ = this.rulesService.getAllRules().pipe(
      switchMap(allRules =>
        this.gangWeapons$.pipe(
          map(gangWeapons => {
            // Step 1: Traverse the gang structure to collect all relevant names
            const ruleNames = new Set<string>();

            // Add ganger skills, special rules, and equipment names
            gang.gangers?.forEach(ganger => {
              ganger.skills?.forEach(skill => ruleNames.add(skill));
              ganger.specialRules?.forEach(specialRule => ruleNames.add(specialRule));
              ganger.equipment?.forEach(equipment => ruleNames.add(equipment.name));
            });

            // Step 2: Add unique weapon traits from gangWeapons
            gangWeapons?.forEach(weapon => {
              if (weapon) {
                weapon.profiles?.forEach(profile => {
                  profile.traits?.forEach(trait => ruleNames.add(trait));
                });
              }
            });

            // Step 3: Match the collected names with the loaded rules
            return allRules.filter(rule => ruleNames.has(rule.name));
          })
        )
      ),
      catchError(err => {
        console.error('Failed to load rules:', err);
        return of([]); // Return an empty array in case of an error
      })
    );

    // Log the matched rules to the console for debugging
    this.rules$.subscribe(matchedRules => {
      console.log('Matched Rules:', matchedRules);
      this.groupedRules = matchedRules.reduce((acc, rule) => {
        if (!acc[rule.rule_type]) {
          acc[rule.rule_type] = [];
        }
        acc[rule.rule_type].push(rule);
        return acc;
      }, {} as Record<string, Rule[]>);

      console.log('Grouped Rules by Type:', this.groupedRules);
    });
  }
}
