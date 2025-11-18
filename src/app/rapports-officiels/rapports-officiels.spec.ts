import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RapportsOfficiels } from './rapports-officiels';

describe('RapportsOfficiels', () => {
  let component: RapportsOfficiels;
  let fixture: ComponentFixture<RapportsOfficiels>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RapportsOfficiels]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RapportsOfficiels);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
