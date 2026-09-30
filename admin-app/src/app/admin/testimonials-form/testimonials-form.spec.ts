import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { TestimonialsFormComponent } from './testimonials-form';

describe('TestimonialsFormComponent', () => {
  let component: TestimonialsFormComponent;
  let fixture: ComponentFixture<TestimonialsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestimonialsFormComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestimonialsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
