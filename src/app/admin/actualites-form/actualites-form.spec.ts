import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualitesForm } from './actualites-form';

describe('ActualitesForm', () => {
  let component: ActualitesForm;
  let fixture: ComponentFixture<ActualitesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualitesForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActualitesForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
