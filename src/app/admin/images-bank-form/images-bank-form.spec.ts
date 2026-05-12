import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagesBankForm } from './images-bank-form';

describe('ImagesBankForm', () => {
  let component: ImagesBankForm;
  let fixture: ComponentFixture<ImagesBankForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImagesBankForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImagesBankForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
