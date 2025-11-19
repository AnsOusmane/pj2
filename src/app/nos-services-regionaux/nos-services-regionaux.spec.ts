import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NosServicesRegionaux } from './nos-services-regionaux';

describe('NosServicesRegionaux', () => {
  let component: NosServicesRegionaux;
  let fixture: ComponentFixture<NosServicesRegionaux>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NosServicesRegionaux]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NosServicesRegionaux);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
