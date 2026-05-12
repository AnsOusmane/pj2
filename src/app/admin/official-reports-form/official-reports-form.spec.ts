import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficialReportsForm } from './official-reports-form';

describe('OfficialReportsForm', () => {
  let component: OfficialReportsForm;
  let fixture: ComponentFixture<OfficialReportsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficialReportsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfficialReportsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
