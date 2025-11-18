import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Decrets } from './decrets';

describe('Decrets', () => {
  let component: Decrets;
  let fixture: ComponentFixture<Decrets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Decrets]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Decrets);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
