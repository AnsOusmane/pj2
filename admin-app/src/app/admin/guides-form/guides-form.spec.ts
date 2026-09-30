import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { GuidesForm } from './guides-form';

describe('GuidesForm', () => {
  let component: GuidesForm;
  let fixture: ComponentFixture<GuidesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuidesForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
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
