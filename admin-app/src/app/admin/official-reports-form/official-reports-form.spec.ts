import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { OfficialReportsForm } from './official-reports-form';

describe('OfficialReportsForm', () => {
  let component: OfficialReportsForm;
  let fixture: ComponentFixture<OfficialReportsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficialReportsForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
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
