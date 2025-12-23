import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecretsForm } from './decrets-form';

describe('DecretsForm', () => {
  let component: DecretsForm;
  let fixture: ComponentFixture<DecretsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecretsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecretsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
