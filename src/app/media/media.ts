import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../environments/environment';

import { NewslettersService } from '../services/newsletters.service';
import { VideosService } from '../services/videos.service';
import { TestimonialsService } from '../services/testimonials.service';
import { ActualitesService } from '../services/actualites.service';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './media.html',
  styleUrls: ['./media.css']
})
export class MediaComponent implements OnInit {

  activeTab = 'actualites';

  selectedVideo: any = null;
  selectedActualite: any = null; // ✅ MODAL ACTUALITE

  newsletters: any[] = [];
  videos: any[] = [];
  temoignages: any[] = [];
  actualites: any[] = [];

  isLoadingNewsletters = false;
  isLoadingVideos = false;
  isLoadingTestimonials = false;
  isLoadingActualites = false;

  newslettersError: string | null = null;
  videosError: string | null = null;
  testimonialsError: string | null = null;
  actualitesError: string | null = null;

  constructor(
    private sanitizer: DomSanitizer,
    private newslettersService: NewslettersService,
    private videosService: VideosService,
    private testimonialsService: TestimonialsService,
    private actualitesService: ActualitesService
  ) {}

  ngOnInit(): void {
    this.loadNewsletters();
    this.loadVideos();
    this.loadTestimonials();
    this.loadActualites();
  }

  // =====================================================
  // HELPERS
  // =====================================================

  media(path: string | null | undefined): string {
    if (!path) return 'assets/studio.png';

    if (path.startsWith('http')) return path;

    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    return `${environment.mediaBaseUrl}/${cleanPath}`;
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/studio.png';
  }

  // =====================================================
  // NEWSLETTERS
  // =====================================================

  loadNewsletters(): void {

    this.isLoadingNewsletters = true;
    this.newslettersError = null;

    this.newslettersService.getAllNewsletters().subscribe({

      next: (data: any[]) => {

        this.newsletters = data.map((item) => {

          const cover =
            item.cover_url ||
            item.cover ||
            item.image ||
            item.image_url ||
            item.photo;

          const file =
            item.file ||
            item.pdf ||
            item.document ||
            item.file_url;

          return {
            ...item,

            title: item.title || item.titre || 'Newsletter',
            excerpt: item.excerpt || item.description || item.content || '',
            date: item.date || item.created_at || item.published_at,

            cover: cover
              ? this.media(cover)
              : 'assets/studio.png',

            file_url: file
              ? this.media(file)
              : null
          };
        });

        this.isLoadingNewsletters = false;
      },

      error: () => {
        this.newslettersError = 'Impossible de charger les newsletters.';
        this.isLoadingNewsletters = false;
      }
    });
  }

  openNewsletter(n: any): void {
    if (n.file_url) window.open(n.file_url, '_blank');
    else if (n.link) window.open(n.link, '_blank');
  }

  // =====================================================
  // VIDEOS
  // =====================================================

  loadVideos(): void {

    this.isLoadingVideos = true;

    this.videosService.getAllVideos().subscribe({

      next: (data: any[]) => {

        this.videos = data.map((v) => ({

          ...v,

          thumbnail_url: v.thumbnail
            ? this.media(`uploads/thumbnails/${v.thumbnail}`)
            : 'assets/studio.png',

          video_url: v.video
            ? this.media(`uploads/videos/${v.video}`)
            : null
        }));

        this.isLoadingVideos = false;
      },

      error: () => {
        this.videosError = 'Impossible de charger les vidéos.';
        this.isLoadingVideos = false;
      }
    });
  }

  openVideoModal(video: any): void {

    let embedUrl: SafeResourceUrl | null = null;

    if (video.embed_url) {
      embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(video.embed_url);
    }

    this.selectedVideo = {
      title: video.title,
      description: video.description,
      embed_url: embedUrl,
      video_url: video.video_url
    };
  }

  closeModal(): void {
    this.selectedVideo = null;
  }

  // =====================================================
  // TEMOIGNAGES
  // =====================================================

  loadTestimonials(): void {

    this.isLoadingTestimonials = true;

    this.testimonialsService.getAllTestimonials().subscribe({

      next: (data: any[]) => {

        this.temoignages = data.map((item) => {

          const photo =
            item.photo_url ||
            item.photo ||
            item.image ||
            item.avatar;

          return {
            ...item,

            name: item.name || item.nom || 'Utilisateur',
            quote: item.quote || item.message || item.content || '',
            location: item.location || item.region || '',

            photo_url: photo
              ? this.media(photo)
              : 'assets/avatar.png'
          };
        });

        this.isLoadingTestimonials = false;
      },

      error: () => {
        this.testimonialsError = 'Impossible de charger les témoignages.';
        this.isLoadingTestimonials = false;
      }
    });
  }

  // =====================================================
  // ACTUALITES
  // =====================================================

  loadActualites(): void {

    this.isLoadingActualites = true;

    this.actualitesService.getAllActualites().subscribe({

      next: (data: any[]) => {

        this.actualites = data.map((item) => {

          const image =
            item.image_url ||
            item.image ||
            item.photo ||
            item.cover;

          return {
            ...item,

            title: item.title || item.titre || 'Actualité',
            content: item.content || item.description || '',
            published_at: item.published_at || item.date || item.created_at,

            image_url: image
              ? this.media(image)
              : 'assets/studio.png'
          };
        });

        this.isLoadingActualites = false;
      },

      error: () => {
        this.actualitesError = 'Impossible de charger les actualités.';
        this.isLoadingActualites = false;
      }
    });
  }

  // =====================================================
  // 🔵 MODAL ACTUALITE
  // =====================================================

  openActualite(actualite: any): void {
    this.selectedActualite = actualite;
  }

closeActualite(): void {
  this.selectedActualite = null;
}
}