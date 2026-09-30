import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { NewslettersForm } from './newsletters-form';

describe('NewslettersForm', () => {
  let component: NewslettersForm;
  let fixture: ComponentFixture<NewslettersForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewslettersForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewslettersForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
