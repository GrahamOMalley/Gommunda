import { TestBed } from '@angular/core/testing';

import { GangService } from './gang.service';

describe('GangService', () => {
  let service: GangService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GangService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
