import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Indisponibles } from './indisponibles';

describe('Indisponibles', () => {
  let component: Indisponibles;
  let fixture: ComponentFixture<Indisponibles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Indisponibles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Indisponibles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
