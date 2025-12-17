import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsService } from '../../services/news';

@Component({
  selector: 'app-news-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './news-form.html'
})
export class NewsFormComponent {
  news = {
    title: '',
    content: '',
    image: null as File | null
  };

  constructor(private service: NewsService) {}

  onFileSelected(event: any) {
    this.news.image = event.target.files[0];
  }

  submit() {
    const formData = new FormData();
    formData.append('title', this.news.title);
    formData.append('content', this.news.content);
    if (this.news.image) {
      formData.append('image', this.news.image);
    }

    this.service.addNews(formData).subscribe(() => {
      alert('News ajoutée avec image');
      this.news = { title: '', content: '', image: null };
      (document.getElementById('fileInput') as HTMLInputElement).value = '';
    });
  }
}
