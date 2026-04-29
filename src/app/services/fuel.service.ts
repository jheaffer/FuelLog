import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class FuelService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  logs = signal<any[]>([]);
  stations = signal<any[]>([]);

  loadAllData() {
    this.http.get<any[]>(`${this.apiUrl}/logs`).subscribe(data => this.logs.set(data));
    this.loadNearbyStations(16.4023, 120.5960);
  }

  loadNearbyStations(lat: number, lon: number) {
    this.http.get<any[]>(`${this.apiUrl}/nearby-stations?lat=${lat}&lon=${lon}`)
      .subscribe(data => this.stations.set(data));
  }

  addLog(log: any) {
    this.http.post(`${this.apiUrl}/logs`, log).subscribe(newLog => {
      this.logs.update(all => [newLog as any, ...all]);
    });
  }
}