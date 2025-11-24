import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cesarienne } from './cesarienne';

describe('Cesarienne', () => {
  let component: Cesarienne;
  let fixture: ComponentFixture<Cesarienne>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cesarienne]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cesarienne);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
