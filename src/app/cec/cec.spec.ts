import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cec } from './cec';

describe('Cec', () => {
  let component: Cec;
  let fixture: ComponentFixture<Cec>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cec]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cec);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
