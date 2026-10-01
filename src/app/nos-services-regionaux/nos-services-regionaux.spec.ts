import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NosServicesRegionauxComponent } from './nos-services-regionaux';

describe('NosServicesRegionauxComponent', () => {
  let component: NosServicesRegionauxComponent;
  let fixture: ComponentFixture<NosServicesRegionauxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NosServicesRegionauxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NosServicesRegionauxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
