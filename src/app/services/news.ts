import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class NewsService {
api = 'http://localhost:3000/api/news';


constructor(private http: HttpClient) {}


getNews() {
return this.http.get<any[]>(this.api);
}

addNews(data: FormData) {
  return this.http.post(this.api, data);
}
}