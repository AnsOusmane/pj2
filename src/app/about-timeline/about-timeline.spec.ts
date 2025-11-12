import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutTimeline } from './about-timeline';

describe('AboutTimeline', () => {
  let component: AboutTimeline;
  let fixture: ComponentFixture<AboutTimeline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutTimeline]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutTimeline);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
