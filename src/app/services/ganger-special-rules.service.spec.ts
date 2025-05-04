import { TestBed } from '@angular/core/testing';

import { GangerSpecialRulesService } from './ganger-special-rules.service';

describe('GangerSpecialRulesService', () => {
  let service: GangerSpecialRulesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GangerSpecialRulesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
