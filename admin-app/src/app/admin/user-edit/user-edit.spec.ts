import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { UserEditForm } from './user-edit';

describe('UserEditForm', () => {
  let component: UserEditForm;
  let fixture: ComponentFixture<UserEditForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserEditForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserEditForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
