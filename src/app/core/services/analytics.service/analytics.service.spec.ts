import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';

import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }]
    });
    service = TestBed.inject(AnalyticsService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });
});
