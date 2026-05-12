import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestimonialsForm } from './testimonials-form';

describe('TestimonialsForm', () => {
  let component: TestimonialsForm;
  let fixture: ComponentFixture<TestimonialsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestimonialsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestimonialsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
