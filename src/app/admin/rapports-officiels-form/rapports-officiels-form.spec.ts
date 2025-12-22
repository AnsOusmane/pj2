import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RapportsOfficielsForm } from './rapports-officiels-form';

describe('RapportsOfficielsForm', () => {
  let component: RapportsOfficielsForm;
  let fixture: ComponentFixture<RapportsOfficielsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RapportsOfficielsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RapportsOfficielsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
