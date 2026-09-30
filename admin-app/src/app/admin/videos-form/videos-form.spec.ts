import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { VideosFormComponent } from './videos-form';

describe('VideosFormComponent', () => {
  let component: VideosFormComponent;
  let fixture: ComponentFixture<VideosFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideosFormComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideosFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
