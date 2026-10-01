import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { DecretsComponent } from './decrets';

describe('DecretsComponent', () => {
  let component: DecretsComponent;
  let fixture: ComponentFixture<DecretsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecretsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecretsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
