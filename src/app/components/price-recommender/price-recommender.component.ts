import { Component, OnInit, AfterViewInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuelService } from '../../services/fuel.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-price-recommender',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './price-recommender.component.html',
  styleUrl: './price-recommender.component.css'
})
export class PriceRecommenderComponent implements OnInit, AfterViewInit {
  public fuelService = inject(FuelService);
  private map!: L.Map;
  private userMarker?: L.Marker;
  private stationLayer = L.layerGroup();

  private gasStationIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });

  private targetIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });

  constructor() {
    effect(() => {
      const stations = this.fuelService.stations();
      if (this.map) {
        this.updateGasStationMarkers(stations);
      }
    });
  }

  ngOnInit() {
    this.fuelService.loadAllData();
  }

  ngAfterViewInit() {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map').setView([16.4023, 120.5960], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.stationLayer.addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.setSearchLocation(lat, lng);
    });
  }

  private setSearchLocation(lat: number, lon: number): void {
    if (this.userMarker) {
      this.map.removeLayer(this.userMarker);
    }

    this.userMarker = L.marker([lat, lon], { icon: this.targetIcon })
      .addTo(this.map)
      .bindPopup("Searching near this location...")
      .openPopup();

    this.fuelService.loadNearbyStations(lat, lon);
  }

  private updateGasStationMarkers(stations: any[]): void {
    this.stationLayer.clearLayers();

    stations.forEach(station => {
      const popupContent = `
        <div style="text-align: center;">
          <h4 style="margin: 0; color: #0056b3;">⛽ ${station.name}</h4>
          <p style="margin: 5px 0 0 0; font-size: 12px;"><b>Brand:</b> ${station.brand}</p>
        </div>
      `;

      L.marker([station.lat, station.lon], { icon: this.gasStationIcon })
        .addTo(this.stationLayer)
        .bindPopup(popupContent);
    });
  }
}