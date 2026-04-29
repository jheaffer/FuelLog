import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FuelService } from '../services/fuel.service';

@Component({
  selector: 'app-log-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './log-form.component.html'
})
export class LogFormComponent {
  private fuelService = inject(FuelService);
  entry = { stationName: '', liters: 0, cost: 0 };

  save() {
    this.fuelService.addLog({ ...this.entry });
    this.entry = { stationName: '', liters: 0, cost: 0 };
  }
}