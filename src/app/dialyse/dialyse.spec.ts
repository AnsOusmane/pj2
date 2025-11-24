import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dialyse } from './dialyse';

describe('Dialyse', () => {
  let component: Dialyse;
  let fixture: ComponentFixture<Dialyse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dialyse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dialyse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
