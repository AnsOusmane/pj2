import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { ActualitesFormComponent } from './actualites-form';

describe('ActualitesFormComponent', () => {
  let component: ActualitesFormComponent;
  let fixture: ComponentFixture<ActualitesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualitesFormComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActualitesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
