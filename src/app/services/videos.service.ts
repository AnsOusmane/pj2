// src/app/services/videos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Video {
  id?: number;
  title: string;
  description?: string;
  thumbnail_url?: string;
  embed_url: string;
  duration?: string;
  views?: number;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VideosService {

  private apiUrl = `${environment.apiBaseUrl}/videos`;

  constructor(private http: HttpClient) {}

  // Récupérer toutes les vidéos
  getAllVideos(): Observable<Video[]> {
    return this.http.get<Video[]>(this.apiUrl);
  }

  // Récupérer uniquement les vidéos actives
  getActiveVideos(): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.apiUrl}?active=true`);
  }

  // ======================
  // AJOUTER UNE VIDÉO
  // ======================
  addVideo(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}`, formData);
  }

  // Optionnel : Mettre à jour une vidéo
  updateVideo(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }

  // Optionnel : Supprimer une vidéo
  deleteVideo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}