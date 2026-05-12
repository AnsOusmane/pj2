import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditManualsForm } from './audit-manuals-form';

describe('AuditManualsForm', () => {
  let component: AuditManualsForm;
  let fixture: ComponentFixture<AuditManualsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditManualsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditManualsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
