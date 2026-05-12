// src/app/services/testimonials.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Testimonial {
  id?: number;
  name: string;
  location?: string;
  photo_url?: string;
  quote: string;

  created_at?: string; // <-- important
}

@Injectable({
  providedIn: 'root'
})
export class TestimonialsService {

  private apiUrl = `${environment.apiBaseUrl}/testimonials`;

  constructor(private http: HttpClient) {}

  getAllTestimonials(): Observable<Testimonial[]> {
    return this.http.get<Testimonial[]>(this.apiUrl);
  }

  createTestimonial(payload: any): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }
}