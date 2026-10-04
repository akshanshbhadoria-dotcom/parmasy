import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: false,
  styleUrl: './app.scss',
  template: '<router-outlet />',
})
export class App {
  protected readonly title = signal('pharmacy-frontend');
}
