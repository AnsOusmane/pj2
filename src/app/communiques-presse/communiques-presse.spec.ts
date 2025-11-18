import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommuniquesPresse } from './communiques-presse';

describe('CommuniquesPresse', () => {
  let component: CommuniquesPresse;
  let fixture: ComponentFixture<CommuniquesPresse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommuniquesPresse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommuniquesPresse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
