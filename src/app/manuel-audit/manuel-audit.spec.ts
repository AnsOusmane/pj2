import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManuelAudit } from './manuel-audit';

describe('ManuelAudit', () => {
  let component: ManuelAudit;
  let fixture: ComponentFixture<ManuelAudit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManuelAudit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManuelAudit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
