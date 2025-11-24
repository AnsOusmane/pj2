import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssuranceMaladie } from './assurance-maladie';

describe('AssuranceMaladie', () => {
  let component: AssuranceMaladie;
  let fixture: ComponentFixture<AssuranceMaladie>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssuranceMaladie]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssuranceMaladie);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
