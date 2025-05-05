import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GangService, Gang } from '../../services/gang.service';
import { DataImportService } from '../../services/data-import.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
  ],
  standalone: true,
})
export class DashboardComponent implements OnInit {
  generatedLink: string | null = null;
  importedGang: Gang | null = null;
  importError: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dataImportService: DataImportService,
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      if (!user) {
        this.router.navigate(['/login']);
      }
    });
  }

  generateYakTribeLink(gangId: string): void {
    if (!gangId) {
      this.generatedLink = null;
      return;
    }
    this.generatedLink = `https://yaktribe.games/underhive/json/gang/${gangId}.json`;
  }

  importFromJson(jsonString: string): void {
    try {
      this.dataImportService.importFromJson(jsonString).subscribe({
        next: (importedGang: Gang) => {
          this.importedGang = importedGang;
          this.importError = null;

          console.log('Imported gang:', importedGang);
          this.router.navigate(['/gang', importedGang.gang_id]);
        },
        error: (err) => {
          console.error('Error importing gang:', err);
          this.importedGang = null;
          this.importError = 'Failed to import gang. Invalid JSON format.';
        },
      });
    } catch (err) {
      console.error('Unexpected error:', err);
      this.importedGang = null;
      this.importError = 'An unexpected error occurred.';
    }
  }

}
