import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZeroCinqAnsComponent } from './zero-cinq-ans';

describe('ZeroCinqAnsComponent', () => {
  let component: ZeroCinqAnsComponent;
  let fixture: ComponentFixture<ZeroCinqAnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZeroCinqAnsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZeroCinqAnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
