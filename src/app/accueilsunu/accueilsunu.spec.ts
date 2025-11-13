import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccueilsunuComponent } from './accueilsunu';

describe('Accueilsunu', () => {
  let component: AccueilsunuComponent;
  let fixture: ComponentFixture<AccueilsunuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccueilsunuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccueilsunuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
