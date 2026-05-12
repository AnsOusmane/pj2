import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideosForm } from './videos-form';

describe('VideosForm', () => {
  let component: VideosForm;
  let fixture: ComponentFixture<VideosForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideosForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideosForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
