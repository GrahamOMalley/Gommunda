import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatChipInput } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatTableDataSource } from '@angular/material/table';
import { MatChipInputEvent } from '@angular/material/chips';
import { GangerSpecialRulesService, GangerSpecialRule } from '../../services/ganger-special-rules.service';
import { forkJoin, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { RulesService } from '../../services/rules.service';

@Component({
  selector: 'app-ganger-special-rules-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatChipInput,
    MatCardModule,
    MatTooltipModule,
    MatToolbarModule,
    MatGridListModule,
  ],
  templateUrl: './ganger-special-rules-editor.component.html',
  styleUrls: ['./ganger-special-rules-editor.component.scss'],
})
export class GangerSpecialRulesEditorComponent implements OnInit {
  displayedColumns: string[] = ['ganger_type', 'rules', 'actions'];
  dataSource = new MatTableDataSource<GangerSpecialRule>([]);
  readonly separatorKeysCodes: number[] = [ENTER, COMMA]; // Keys to separate chips

  constructor(private gangerSpecialRulesService: GangerSpecialRulesService,
    private rulesService: RulesService
  ) {}

  ngOnInit(): void {
    this.loadRules();
  }

  loadRules(): void {
    this.gangerSpecialRulesService.getAllSpecialRules().subscribe((rules) => {
      this.dataSource.data = rules;
    });
  }

  addNewRule(): void {
    const newRule: GangerSpecialRule = { ganger_type: '', rules: [] };
    this.dataSource.data = [...this.dataSource.data, newRule];
  }

  saveRule(rule: GangerSpecialRule): void {
    if (!rule.ganger_type) {
      console.error('Ganger type is required.');
      return;
    }

    // Check and add missing rules
    this.rulesService.getAllRules().pipe(
      take(1), // Ensure the observable completes after the first emission
      switchMap((existingRules) => {
        const existingRuleNames = new Set(existingRules.map((r) => r.name.toLowerCase()));

        // Find missing rules
        const missingRules = rule.rules.filter(
          (r) => !existingRuleNames.has(r.toLowerCase())
        );

        console.log('Missing rules to add:', missingRules);

        // Add missing rules to the RulesService
        const addMissingRules = missingRules.map((missingRule) =>
          this.rulesService.saveRule(missingRule, {
            name: missingRule,
            rule_type: 'ganger_special_rule',
            description: '', // Add a default description if needed
          })
        );

        return forkJoin(addMissingRules.length > 0 ? addMissingRules : [of(null)]);
      })
    ).subscribe({
      next: () => {
        // Save the ganger's special rules after ensuring all rules are added
        this.gangerSpecialRulesService.saveSpecialRules(rule.ganger_type, rule.rules).then(() => {
          console.log('Rule saved successfully:', rule);
        });
      },
      error: (err) => {
        console.error('Error checking or adding missing rules:', err);
      },
    });
  }

  deleteRule(rule: GangerSpecialRule): void {
    this.gangerSpecialRulesService.deleteSpecialRule(rule.ganger_type).then(() => {
      console.log('Rule deleted successfully:', rule);
      // Update the local data source after successful deletion
      this.dataSource.data = this.dataSource.data.filter((r) => r !== rule);
    }).catch((error) => {
      console.error('Error deleting rule:', error);
    });
  }

  addRule(rule: GangerSpecialRule, event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      rule.rules.push(value);
    }
    event.chipInput!.clear();
  }

  removeRule(rule: GangerSpecialRule, index: number): void {
    if (index >= 0) {
      rule.rules.splice(index, 1);
    }
  }
}
