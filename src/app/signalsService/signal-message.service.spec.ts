import { TestBed } from '@angular/core/testing';

import { SignalMessageService } from './signal-message.service';

describe('SignalMessageService', () => {
  let service: SignalMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignalMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
