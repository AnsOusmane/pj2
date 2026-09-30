import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { ImagesBankForm } from './images-bank-form';

describe('ImagesBankForm', () => {
  let component: ImagesBankForm;
  let fixture: ComponentFixture<ImagesBankForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImagesBankForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImagesBankForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
