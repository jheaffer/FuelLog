import { Component, inject, OnInit, computed } from '@angular/core';
import { FuelService } from '../services/fuel.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public fuelService = inject(FuelService);

  totalSpent = computed(() =>
    this.fuelService.logs().reduce((sum, log) => sum + log.cost, 0)
  );

  ngOnInit() {
    this.fuelService.loadAllData();
  }
}