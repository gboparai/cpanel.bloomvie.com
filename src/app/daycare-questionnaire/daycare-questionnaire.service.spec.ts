import { TestBed } from '@angular/core/testing';

import { DaycareQuestionnaireService } from './daycare-questionnaire.service';

describe('DaycareQuestionnaireService', () => {
  let service: DaycareQuestionnaireService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DaycareQuestionnaireService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
