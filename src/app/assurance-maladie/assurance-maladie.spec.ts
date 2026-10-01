import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { AssuranceMaladieComponent } from './assurance-maladie';

describe('AssuranceMaladieComponent', () => {
  let component: AssuranceMaladieComponent;
  let fixture: ComponentFixture<AssuranceMaladieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssuranceMaladieComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssuranceMaladieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
