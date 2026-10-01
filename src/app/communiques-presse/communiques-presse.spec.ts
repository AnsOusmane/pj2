import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { CommuniquesPresseComponent } from './communiques-presse';

describe('CommuniquesPresseComponent', () => {
  let component: CommuniquesPresseComponent;
  let fixture: ComponentFixture<CommuniquesPresseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommuniquesPresseComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommuniquesPresseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
