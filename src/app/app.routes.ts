import { Routes } from '@angular/router';
import { RulesEditorComponent } from './components/rules-editor/rules-editor.component';
import { AuthGuard } from './guards/auth.guard'; // Ensure this is the correct path
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { GangDetailsComponent } from './components/gang-details/gang-details.component'; // Import the GangDetailsComponent
import { WeaponProfilesComponent } from './components/weapon-profiles/weapon-profiles.component';
import { GangerSpecialRulesEditorComponent } from './components/ganger-special-rules-editor/ganger-special-rules-editor.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'rules', component: RulesEditorComponent, canActivate: [AuthGuard] },
  { path: 'weapons', component: WeaponProfilesComponent, canActivate: [AuthGuard] },
  { path: 'ganger-special-rules', component: GangerSpecialRulesEditorComponent, canActivate: [AuthGuard] },
  { path: 'gang/:gang_id', component: GangDetailsComponent, canActivate: [AuthGuard] }, // Add gang details route
  { path: '**', redirectTo: 'login' }, // Redirect unknown routes to login
];
