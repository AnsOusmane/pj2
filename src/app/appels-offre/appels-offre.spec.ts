import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppelsOffre } from './appels-offre';

describe('AppelsOffre', () => {
  let component: AppelsOffre;
  let fixture: ComponentFixture<AppelsOffre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppelsOffre]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppelsOffre);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
