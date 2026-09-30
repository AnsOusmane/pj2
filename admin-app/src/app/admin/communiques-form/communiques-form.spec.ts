import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { CommuniqueFormComponent } from './communiques-form';

describe('CommuniqueFormComponent', () => {
  let component: CommuniqueFormComponent;
  let fixture: ComponentFixture<CommuniqueFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommuniqueFormComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommuniqueFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
