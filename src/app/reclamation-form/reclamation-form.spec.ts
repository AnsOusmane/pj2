import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { ReclamationFormComponent } from './reclamation-form';

describe('ReclamationFormComponent', () => {
  let component: ReclamationFormComponent;
  let fixture: ComponentFixture<ReclamationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReclamationFormComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReclamationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
