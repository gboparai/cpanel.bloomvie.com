import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaycareQuestionnaireComponent } from './daycare-questionnaire.component';

describe('DaycareQuestionnaireComponent', () => {
  let component: DaycareQuestionnaireComponent;
  let fixture: ComponentFixture<DaycareQuestionnaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DaycareQuestionnaireComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DaycareQuestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
