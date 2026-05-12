import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Actualite {
  id?: number;
  title: string;
  content?: string;
  image_url?: string;
  link?: string;
  published_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActualitesService {

  private apiUrl = `${environment.apiBaseUrl}/actualites`;

  constructor(private http: HttpClient) {}

  // 📌 GET
  getAllActualites(): Observable<Actualite[]> {
    return this.http.get<Actualite[]>(this.apiUrl);
  }

  // 📌 POST JSON (sans image upload)
  createActualite(payload: Actualite): Observable<Actualite> {
    return this.http.post<Actualite>(this.apiUrl, payload);
  }

  // 📌 POST MULTIPART (AVEC IMAGE UPLOAD)
  createActualiteWithUpload(formData: FormData): Observable<Actualite> {
    return this.http.post<Actualite>(this.apiUrl, formData);
  }
}