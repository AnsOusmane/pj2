import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionsvisionComponent } from './missionsvision';

describe('Missionsvision', () => {
  let component: MissionsvisionComponent;
  let fixture: ComponentFixture<MissionsvisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissionsvisionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MissionsvisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
