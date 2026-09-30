import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { UserCreateForm } from './user-create-form';

describe('UserCreateForm', () => {
  let component: UserCreateForm;
  let fixture: ComponentFixture<UserCreateForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCreateForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserCreateForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
