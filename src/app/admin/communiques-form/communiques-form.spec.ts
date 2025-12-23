import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommuniquesForm } from './communiques-form';

describe('CommuniquesForm', () => {
  let component: CommuniquesForm;
  let fixture: ComponentFixture<CommuniquesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommuniquesForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommuniquesForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
