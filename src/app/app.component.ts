import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// 1. IMPORT the child components here
import { LogFormComponent } from './components/log-form/log-form.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PriceRecommenderComponent } from './components/price-recommender/price-recommender.component';

@Component({
  selector: 'app-root',
  standalone: true,
  // 2. REGISTER them in this array
  imports: [
    CommonModule,
    LogFormComponent,           // Add this
    DashboardComponent,        // Add this
    PriceRecommenderComponent  // Add this
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Fuel Log Tracker';
}