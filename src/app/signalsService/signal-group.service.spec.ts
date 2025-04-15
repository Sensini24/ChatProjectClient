import { TestBed } from '@angular/core/testing';

import { SignalGroupService } from './signal-group.service';

describe('SignalGroupService', () => {
  let service: SignalGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignalGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
