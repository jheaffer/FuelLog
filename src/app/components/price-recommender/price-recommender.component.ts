import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuelService } from '../../services/fuel.service';

@Component({
  selector: 'app-price-recommender',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './price-recommender.component.html'
})
export class PriceRecommenderComponent implements OnInit {
  // Inject the service to access the signals
  public fuelService = inject(FuelService);

  ngOnInit() {
    // Call the API the moment the component loads
    this.fuelService.loadAllData();
  }
}