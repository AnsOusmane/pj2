import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NewsService } from '../../services/news';
import { register } from 'swiper/element/bundle';

register();

@Component({
  selector: 'app-actualites',
  standalone: true,
  imports: [CommonModule, DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './actualites.html',
})
export class ActualitesComponent implements AfterViewInit {
  news: any[] = [];
  swiperActiveIndex = 0;

  @ViewChild('swiper', { static: false }) swiperRef!: ElementRef;

  constructor(private newsService: NewsService) {}

  ngOnInit() {
    this.newsService.getNews().subscribe(data => {
      this.news = data;
    });
  }

  ngAfterViewInit() {
    const swiperEl = this.swiperRef.nativeElement;
    swiperEl.addEventListener('slidechange', (event: any) => {
      this.swiperActiveIndex = event.detail[0].realIndex;
    });
  }
}
