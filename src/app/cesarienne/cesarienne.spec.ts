import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CesarienneComponent } from './cesarienne';

describe('CesarienneComponent', () => {
  let component: CesarienneComponent;
  let fixture: ComponentFixture<CesarienneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CesarienneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CesarienneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
