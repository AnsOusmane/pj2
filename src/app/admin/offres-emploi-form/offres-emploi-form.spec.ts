import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffresEmploiForm } from './offres-emploi-form';

describe('OffresEmploiForm', () => {
  let component: OffresEmploiForm;
  let fixture: ComponentFixture<OffresEmploiForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffresEmploiForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffresEmploiForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
