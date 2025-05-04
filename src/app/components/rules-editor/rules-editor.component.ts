import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Rule } from '../../models/rules.interface';
import { RulesService } from '../../services/rules.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

@Component({
  standalone: true,
  imports: [MatTableModule, CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatOptionModule, MatSelectModule, MatSortModule],
  selector: 'app-rules-editor',
  templateUrl: './rules-editor.component.html',
  styleUrls: ['./rules-editor.component.scss']
})
export class RulesEditorComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'rule_type', 'description', 'actions'];
  dataSource = new MatTableDataSource<Rule>([]);

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private rulesService: RulesService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadRules();
  }

  ngAfterViewInit(): void {
    if (!this.sort) {
      console.error('MatSort is not initialized.');
      return;
    }
    
    // Assign MatSort to the data source after ViewChild is initialized
    this.dataSource.sort = this.sort;

    // Set default sorting by Rule Type, then Name
    this.dataSource.sortingDataAccessor = (item: Rule, sortHeaderId: string) => {
      switch (sortHeaderId) {
        case 'rule_type':
          return item.rule_type.toLowerCase();
        case 'name':
          return item.name.toLowerCase();
        default:
          return (item as any)[sortHeaderId] as string | number;
      }
    };

    this.sort.active = 'rule_type';
    this.sort.direction = 'asc';

    // Trigger change detection to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.cdr.detectChanges();
  }

  loadRules(): void {
    this.rulesService.getAllRules().subscribe((rules: Rule[]) => {
      this.dataSource.data = rules;
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addNewRule(): void {
    const newRule: Rule = { name: '', rule_type: '', description: '' };
    this.dataSource.data = [...this.dataSource.data, newRule];
  }

  saveRule(rule: Rule): void {
    if (!rule.name || !rule.rule_type) {
      console.error('Name and Rule Type are required.');
      return;
    }
    this.rulesService.saveRule(rule.name, rule).then(() => {
      console.log('Rule saved successfully:', rule);
    });
  }

  deleteRule(rule: Rule): void {
    this.rulesService.deleteRule(rule.name).then(() => {
      console.log('Rule deleted successfully:', rule);
      this.dataSource.data = this.dataSource.data.filter((r) => r !== rule);
    });
  }
}
