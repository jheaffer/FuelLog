import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FuelService } from '../services/fuel.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-price-recommender',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './price-recommender.component.html',
  styleUrl: './price-recommender.component.css'
})
export class PriceRecommenderComponent implements OnInit {
  public fuelService = inject(FuelService);
  mapOpened = false;
  isDarkMode = true;
  today = new Date();

  // Location states: 'idle' | 'asking' | 'locating' | 'granted' | 'denied'
  locationStatus: 'idle' | 'asking' | 'locating' | 'granted' | 'denied' = 'idle';
  userLat: number = 16.4023;
  userLon: number = 120.5960;

  private map!: L.Map;
  private mapInitialized = false;
  private userMarker?: L.Marker;
  private stationLayer = L.layerGroup();
  private lightTileLayer!: L.TileLayer;
  private darkTileLayer!: L.TileLayer;

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

  private userLocationIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
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

  // Step 1: User clicks "Open Live Map" — show location permission prompt
  requestLocation() {
    this.locationStatus = 'asking';
  }

  // Step 2a: User allows location tracking
  allowLocation() {
    this.locationStatus = 'locating';

    if (!navigator.geolocation) {
      this.locationStatus = 'denied';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.userLat = position.coords.latitude;
        this.userLon = position.coords.longitude;
        this.locationStatus = 'granted';
        this.fuelService.loadNearbyStations(this.userLat, this.userLon);
      },
      () => {
        // Permission denied by browser or user
        this.locationStatus = 'denied';
      }
    );
  }

  // Step 2b: User skips location tracking — use default coords
  skipLocation() {
    this.locationStatus = 'granted';
    this.fuelService.loadNearbyStations(this.userLat, this.userLon);
  }

  // Step 3: Open the map
  openMap() {
    this.mapOpened = true;

    setTimeout(() => {
      if (!this.mapInitialized) {
        this.initMap();
        this.mapInitialized = true;
      } else {
        this.map.invalidateSize();
      }
    }, 100);
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;

    if (this.mapInitialized) {
      if (this.isDarkMode) {
        this.map.removeLayer(this.lightTileLayer);
        this.darkTileLayer.addTo(this.map);
      } else {
        this.map.removeLayer(this.darkTileLayer);
        this.lightTileLayer.addTo(this.map);
      }
    }
  }

  private initMap(): void {
    this.map = L.map('map').setView([this.userLat, this.userLon], 14);

    this.lightTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    });

    this.darkTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO'
    });

    if (this.isDarkMode) {
      this.darkTileLayer.addTo(this.map);
    } else {
      this.lightTileLayer.addTo(this.map);
    }

    this.stationLayer.addTo(this.map);

    // Show user's location marker if location was granted
    if (this.locationStatus === 'granted') {
      L.marker([this.userLat, this.userLon], { icon: this.userLocationIcon })
        .addTo(this.map)
        .bindPopup('<b>📍 You are here</b>')
        .openPopup();
    }

    const stations = this.fuelService.stations();
    if (stations.length > 0) {
      this.updateGasStationMarkers(stations);
    }

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
      .bindPopup('Searching near this location...')
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