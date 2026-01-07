import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanSesameComponent } from './plan-sesame';

describe('PlanSesameComponent', () => {
  let component: PlanSesameComponent;
  let fixture: ComponentFixture<PlanSesameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanSesameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanSesameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
