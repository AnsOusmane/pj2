import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuidesForm } from './guides-form';

describe('GuidesForm', () => {
  let component: GuidesForm;
  let fixture: ComponentFixture<GuidesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuidesForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuidesForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
