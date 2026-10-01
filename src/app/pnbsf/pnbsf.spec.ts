import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PnbsfComponent } from './pnbsf';

describe('PnbsfComponent', () => {
  let component: PnbsfComponent;
  let fixture: ComponentFixture<PnbsfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PnbsfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PnbsfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
