import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialyseComponent } from './dialyse';

describe('DialyseComponent', () => {
  let component: DialyseComponent;
  let fixture: ComponentFixture<DialyseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialyseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialyseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
