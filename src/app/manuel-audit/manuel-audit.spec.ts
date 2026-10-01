import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManuelAuditComponent } from './manuel-audit';

describe('ManuelAuditComponent', () => {
  let component: ManuelAuditComponent;
  let fixture: ComponentFixture<ManuelAuditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManuelAuditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManuelAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
