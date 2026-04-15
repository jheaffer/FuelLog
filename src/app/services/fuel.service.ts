import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class FuelService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  logs = signal<any[]>([]);
  stations = signal<any[]>([]);

  // 1. ADD THIS FUNCTION - It connects the form to the backend
  addLog(log: any) {
    this.http.post<any>(`${this.apiUrl}/logs`, log).subscribe({
      next: (newLog) => {
        // This updates the UI instantly without refreshing
        this.logs.update(current => [newLog, ...current]);
        alert('Log added to MongoDB!');
      },
      error: (err) => console.error('Could not save log:', err)
    });
  }

  // Ensure this exists for your Dashboard/Price Recommender
  loadAllData() {
    this.http.get<any[]>(`${this.apiUrl}/logs`).subscribe(data => this.logs.set(data));
    this.http.get<any[]>(`${this.apiUrl}/prices`).subscribe(data => this.stations.set(data));
  }
}