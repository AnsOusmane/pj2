import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReclamationForm } from './reclamation-form';

describe('ReclamationForm', () => {
  let component: ReclamationForm;
  let fixture: ComponentFixture<ReclamationForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReclamationForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReclamationForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
