import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CecComponent } from './cec';

describe('CecComponent', () => {
  let component: CecComponent;
  let fixture: ComponentFixture<CecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CecComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
