import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZeroCinqAns } from './zero-cinq-ans';

describe('ZeroCinqAns', () => {
  let component: ZeroCinqAns;
  let fixture: ComponentFixture<ZeroCinqAns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZeroCinqAns]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZeroCinqAns);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
