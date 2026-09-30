import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { OffresEmploiForm } from './offres-emploi-form';

describe('OffresEmploiForm', () => {
  let component: OffresEmploiForm;
  let fixture: ComponentFixture<OffresEmploiForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffresEmploiForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffresEmploiForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
