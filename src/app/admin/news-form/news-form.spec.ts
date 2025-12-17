import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsForm } from './news-form';

describe('NewsForm', () => {
  let component: NewsForm;
  let fixture: ComponentFixture<NewsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
