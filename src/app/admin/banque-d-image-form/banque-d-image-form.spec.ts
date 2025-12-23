import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BanqueImagesFormComponent } from './banque-d-image-form';

describe('BanqueImagesFormComponent', () => {
  let component: BanqueImagesFormComponent;
  let fixture: ComponentFixture<BanqueImagesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BanqueImagesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BanqueImagesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
