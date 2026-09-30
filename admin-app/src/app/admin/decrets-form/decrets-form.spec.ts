import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { DecretsForm } from './decrets-form';

describe('DecretsForm', () => {
  let component: DecretsForm;
  let fixture: ComponentFixture<DecretsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecretsForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecretsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
