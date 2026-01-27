import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pnbsf } from './pnbsf';

describe('Pnbsf', () => {
  let component: Pnbsf;
  let fixture: ComponentFixture<Pnbsf>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pnbsf]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pnbsf);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
