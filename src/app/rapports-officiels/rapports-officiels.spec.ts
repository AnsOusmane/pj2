import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RapportsOfficielsComponent } from './rapports-officiels';

describe('RapportsOfficielsComponent', () => {
  let component: RapportsOfficielsComponent;
  let fixture: ComponentFixture<RapportsOfficielsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RapportsOfficielsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RapportsOfficielsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
