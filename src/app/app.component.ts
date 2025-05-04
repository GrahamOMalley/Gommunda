import { Component } from '@angular/core';
import { GideonNavComponent } from "./components/gideon-nav/gideon-nav.component";

@Component({
  selector: 'app-root',
  imports: [GideonNavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'gommunda-frontend';
}
