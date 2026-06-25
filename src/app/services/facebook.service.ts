import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FacebookPost {
  id: string;
  message: string;
  image_url: string | null;
  permalink_url: string | null;
  created_time: string | null;
  media_type: string;
}

export interface FacebookFeedResponse {
  configured: boolean;
  cached?: boolean;
  stale?: boolean;
  posts: FacebookPost[];
}

@Injectable({
  providedIn: 'root'
})
export class FacebookService {

  private apiUrl = `${environment.apiBaseUrl}/facebook`;

  constructor(private http: HttpClient) {}

  // GET → publications de la page Facebook (via l'API Graph côté backend)
  getPosts(): Observable<FacebookFeedResponse> {
    return this.http.get<FacebookFeedResponse>(`${this.apiUrl}/posts`);
  }
}
