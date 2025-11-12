import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tuto-screen',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './tuto-screen-component.html',
  styleUrls: ['./tuto-screen-component.css']
})
export class TutoScreenComponent implements OnInit {
  videos: any[] = [];
  currentSet = 0; // pour gérer les sets de 3 vidéos

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('assets/videos/videos.json').subscribe({
      next: (data) => {
        this.videos = data;
      },
      error: (err) => console.error('Erreur chargement vidéos :', err)
    });
  }

  nextSet() {
    if ((this.currentSet + 1) * 3 < this.videos.length) {
      this.currentSet++;
    }
  }

  prevSet() {
    if (this.currentSet > 0) this.currentSet--;
  }

  get currentVideos() {
    return this.videos.slice(this.currentSet * 3, (this.currentSet + 1) * 3);
  }

  close() {
    document.body.dispatchEvent(new Event('closeTuto'));
  }
}
