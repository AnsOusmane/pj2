import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutoScreenComponent } from './tuto-screen-component';

describe('TutoScreenComponent', () => {
  let component: TutoScreenComponent;
  let fixture: ComponentFixture<TutoScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutoScreenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TutoScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
