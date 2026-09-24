import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DaycareQuestionnaireService } from './daycare-questionnaire.service';
import { environment } from '../../environments/environment';

describe('DaycareQuestionnaireService', () => {
  let service: DaycareQuestionnaireService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DaycareQuestionnaireService]
    });
    service = TestBed.inject(DaycareQuestionnaireService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call SubmitControlAndLabelForm with payload and handle success', () => {
      let response: any;
      const payload = { test: 123 };
      service.SubmitControlAndLabelForm(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/SubmitControlAndLabelForm`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call SubmitControlFieldAnswers with payload and handle error (400)', () => {
      let errResp: any;
      service.SubmitControlFieldAnswers({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Common/SubmitControlFieldAnswers`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call SubmitSection with payload and handle success', () => {
      let response: any;
      const payload = { section: 'yes' };
      service.SubmitSection(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/SubmitSection`);
      expect(req.request.method).toBe('POST');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call GetSectionByCentreID with params and handle success', () => {
      let response: any;
      service.GetSectionByCentreID(10, 'urlpath').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/GetSectionByCentreID?centreID=10&url=urlpath`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call ActiveInActiveSections with payload and handle success', () => {
      let response: any;
      const payload = { active: true };
      service.ActiveInActiveSections(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/ActiveInActiveSections`);
      expect(req.request.method).toBe('POST');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle CopyIsMasterTrueSections error (500)', () => {
      let errResp: any;
      service.CopyIsMasterTrueSections(1, 2, 3).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/CopyIsMasterTrueSections?centreID=1&userID=2&userRoleID=3`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call CopyIsMasterTrueFields with payload and handle success', () => {
      let response: any;
      service.CopyIsMasterTrueFields({}).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/CopyIsMasterTrueFields`);
      expect(req.request.method).toBe('POST');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call GetSectionByIDAndCentreID with params and handle success', () => {
      let response: any;
      service.GetSectionByIDAndCentreID(1, 2).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/GetSectionByIDAndCentreID?sectionID=1&centreID=2`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call GetControlFieldById with params and handle success', () => {
      let response: any;
      service.GetControlFieldById(1).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/GetControlFieldById?controlID=1`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call SubmitEditedSection with payload and handle success', () => {
      let response: any;
      service.SubmitEditedSection({}).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/SubmitEditedSection`);
      expect(req.request.method).toBe('POST');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call SaveEditedSelectiveValue with payload and handle success', () => {
      let response: any;
      service.SaveEditedSelectiveValue({}).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/SaveEditedSelectiveValue`);
      expect(req.request.method).toBe('POST');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call ActiveOrInActiveSelectiveValue with payload and handle network timeout (0)', () => {
      let errResp: any;
      service.ActiveOrInActiveSelectiveValue({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/ActiveOrInActiveSelectiveValue`);
      req.error(new ProgressEvent('Timeout'));
      expect(errResp.status).toBe(0);
    });

    it('should call ActiveOrInActiveControlField with payload and handle success', () => {
      let response: any;
      service.ActiveOrInActiveControlField({}).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/ActiveOrInActiveControlField`);
      expect(req.request.method).toBe('POST');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call SubmitEditedControlField with payload and handle success', () => {
      let response: any;
      service.SubmitEditedControlField({}).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DynamicForm/SubmitEditedControlField`);
      expect(req.request.method).toBe('POST');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });
  });
});
