import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCreateForm } from './user-create-form';

describe('UserCreateForm', () => {
  let component: UserCreateForm;
  let fixture: ComponentFixture<UserCreateForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCreateForm]
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
