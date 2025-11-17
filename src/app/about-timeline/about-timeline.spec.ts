import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutTimelineComponent } from './about-timeline';

describe('AboutTimeline', () => {
  let component: AboutTimelineComponent;
  let fixture: ComponentFixture<AboutTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutTimelineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
