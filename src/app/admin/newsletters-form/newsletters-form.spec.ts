import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewslettersForm } from './newsletters-form';

describe('NewslettersForm', () => {
  let component: NewslettersForm;
  let fixture: ComponentFixture<NewslettersForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewslettersForm]
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
