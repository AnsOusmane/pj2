import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanSesame } from './plan-sesame';

describe('PlanSesame', () => {
  let component: PlanSesame;
  let fixture: ComponentFixture<PlanSesame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanSesame]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanSesame);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
