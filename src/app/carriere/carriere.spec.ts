import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarriereComponent } from './carriere';

describe('Careers', () => {
  let component: CarriereComponent;
  let fixture: ComponentFixture<CarriereComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarriereComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarriereComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
