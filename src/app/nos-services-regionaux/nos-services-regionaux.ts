import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';

interface ServiceRegional {
  region: string;
  adresse: string;
  telephone: string;
  email: string;
  horaires: string;
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-nos-services-regionaux',
  standalone: true,
  templateUrl: './nos-services-regionaux.html',
  styleUrls: ['./nos-services-regionaux.css'],
})
export class NosServicesRegionauxComponent implements AfterViewInit {

  map!: L.Map;
  routingControl: any;

  services: ServiceRegional[] = [
    {
      region: 'Dakar',
      adresse: 'Ouest Foire, Dakar',
      telephone: '33 800 00 11',
      email: 'sr-dakar@csu.sn',
      horaires: 'Lun–Ven : 08h–17h',
      lat: 14.7501703,
      lng: -17.4688052
    },
  { region: 'Thiès', adresse: '', telephone: '', email: '', horaires: '', lat: 14.7910, lng: -16.9359 },
    { region: 'Diourbel', adresse: 'Route de Bambey, Diourbel', telephone: '33 800 00 33', email: 'sr-diourbel@csu.sn', horaires: 'Lun–Ven : 08h–17h', lat: 14.6550, lng: -16.2333 },
    { region: 'Kaolack', adresse: 'Quartier Léboul, Kaolack', telephone: '33 800 00 44', email: 'sr-kaolack@csu.sn', horaires: 'Lun–Ven : 08h–17h', lat: 14.1650, lng: -16.0750 },
    { region: 'Fatick', adresse: 'Boulevard Sérigne Touba, Fatick', telephone: '33 800 00 55', email: 'sr-fatick@csu.sn', horaires: 'Lun–Ven : 08h–17h', lat: 14.3375, lng: -16.4100 },
    { region: 'Kaffrine', adresse: 'Route de Malem Hodar, Kaffrine', telephone: '33 800 00 66', email: 'sr-kaffrine@csu.sn', horaires: 'Lun–Ven : 08h–17h', lat: 14.1050, lng: -15.5500 },
    { region: 'Louga', adresse: 'Rue de la Gouvernance, Louga', telephone: '33 800 00 77', email: 'sr-louga@csu.sn', horaires: 'Lun–Ven : 08h–17h', lat: 15.6100, lng: -16.2222 },
    { region: 'Matam', adresse: 'Route de Ourossogui, Matam', telephone: '33 800 00 88', email: 'sr-matam@csu.sn', horaires: 'Lun–Ven : 08h–17h', lat: 15.6560, lng: -13.2572 },
    { region: 'Kédougou', adresse: 'Centre-ville administratif, Kédougou', telephone: '33 800 00 99', email: 'sr-kedougou@csu.sn', horaires: 'Lun–Ven : 08h–17h', lat: 12.5600, lng: -12.1800 },
    { region: 'Kolda', adresse: 'Route de Médina Chérif, Kolda', telephone: '33 800 01 10', email: 'sr-kolda@csu.sn', horaires: 'Lun–Ven : 08h–17h', lat: 12.8833, lng: -14.9500 },
    { region: 'Saint-Louis', adresse: 'Île Nord, Saint-Louis', telephone: '33 800 01 11', email: 'sr-saintlouis@csu.sn', horaires: 'Lun–Ven : 08h–17h', lat: 16.0500, lng: -16.5000 },
    { region: 'Sédhiou', adresse: 'Boulevard du Fleuve, Sédhiou', telephone: '33 800 01 12', email: 'sr-sedhiou@csu.sn', horaires: 'Lun–Ven : 08h–17h', lat: 12.7081, lng: -15.5569 },
    { region: 'Tambacounda', adresse: 'Route de Goudiry, Tambacounda', telephone: '33 800 01 13', email: 'sr-tambacounda@csu.sn', horaires: 'Lun–Ven : 08h–17h', lat: 13.7700, lng: -13.6800 },
    { region: 'Ziguinchor', adresse: 'Boulevard de France, Ziguinchor', telephone: '33 800 01 14', email: 'sr-ziguinchor@csu.sn', horaires: 'Lun–Ven : 08h–17h', lat: 12.5600, lng: -16.2800 }
  ];

  userLat: number | null = null;
  userLng: number | null = null;

  nearest: ServiceRegional | null = null;
  distanceToNearestKm: number | null = null;

  ngAfterViewInit(): void {
    this.initMap();
    this.getUser();
  }

  //--------------------------------------------------------------------
  // 📍 Initialisation carte
  //--------------------------------------------------------------------
  private initMap() {
    this.map = L.map('map').setView([14.7, -14.7], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
      .addTo(this.map);
  }

  //--------------------------------------------------------------------
  // 📍 Récupération position utilisateur
  //--------------------------------------------------------------------
  private getUser() {
    navigator.geolocation.getCurrentPosition(
      pos => {
        this.userLat = pos.coords.latitude;
        this.userLng = pos.coords.longitude;
        this.findNearestAndRoute();
      },
      () => {
        this.userLat = 14.75;
        this.userLng = -17.47;
        this.findNearestAndRoute();
      },
      { enableHighAccuracy: true }
    );
  }

  //--------------------------------------------------------------------
  // 📌 Calcul Haversine (distance réelle en km)
  //--------------------------------------------------------------------
  private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  //--------------------------------------------------------------------
  // ⭐ Trouver le SR le plus proche + distance + tracer itinéraire
  //--------------------------------------------------------------------
  private findNearestAndRoute() {
    let min = Infinity;
    let closest: ServiceRegional | null = null;

    for (const sr of this.services) {
      const d = this.haversine(this.userLat!, this.userLng!, sr.lat, sr.lng);

      if (d < min) {
        min = d;
        closest = sr;
      }
    }

    this.nearest = closest;
    this.distanceToNearestKm = min; // <--- distance correcte en km

    if (closest) this.drawRealItinerary();
  }

  //--------------------------------------------------------------------
  // 🚗 Itinéraire OSRM
  //--------------------------------------------------------------------
private drawRealItinerary() {
  if (!this.userLat || !this.userLng || !this.nearest) return;

  if (this.routingControl) {
    this.map.removeControl(this.routingControl);
  }

  this.routingControl = L.Routing.control({
    waypoints: [
      L.latLng(this.userLat, this.userLng),
      L.latLng(this.nearest.lat, this.nearest.lng)
    ],
    router: L.Routing.osrmv1({
      serviceUrl: 'https://router.project-osrm.org/route/v1'
    }),
    lineOptions: {
      styles: [
        {
          color: 'green',
          weight: 5
        }
      ],
      extendToWaypoints: true,
      missingRouteTolerance: 0
    },
    show: false,
    addWaypoints: false,
    routeWhileDragging: false
  })
    .on('routesfound', (e: any) => {
      const route = e.routes[0];

      // Conversion en km
      this.distanceToNearestKm = route.summary.totalDistance / 1000;
    })
    .addTo(this.map);
}


  //--------------------------------------------------------------------
  // 🌍 Ouvrir Google Maps
  //--------------------------------------------------------------------
  openItinerary() {
    if (!this.nearest) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${this.nearest.lat},${this.nearest.lng}`,
      '_blank'
    );
  }
}
