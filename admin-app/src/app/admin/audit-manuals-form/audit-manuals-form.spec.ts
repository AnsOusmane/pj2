import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { AuditManualsForm } from './audit-manuals-form';

describe('AuditManualsForm', () => {
  let component: AuditManualsForm;
  let fixture: ComponentFixture<AuditManualsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditManualsForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
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
