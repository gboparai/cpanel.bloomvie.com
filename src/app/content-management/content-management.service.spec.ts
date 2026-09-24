import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ContentManagementService } from './content-management.service';
import { environment } from '../../environments/environment';

describe('ContentManagementService', () => {
  let service: ContentManagementService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ContentManagementService]
    });
    service = TestBed.inject(ContentManagementService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call GetHomePageSection with params and handle success', () => {
      let response: any;
      service.GetHomePageSection('banner', 1).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/ContentManagement/getHomePageSectionByTypeName?Type=banner&UserID=1`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call GetSectionListBySectionAndTypeName with body and handle success', () => {
      let response: any;
      const payload = { section: 'header' };
      service.GetSectionListBySectionAndTypeName(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/ContentManagement/getContentBySectionAndTypeName`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle GetSectionListBySectionAndTypeName error (500)', () => {
      let errResp: any;
      service.GetSectionListBySectionAndTypeName({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/ContentManagement/getContentBySectionAndTypeName`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call getDayCareCentreContentMaster with body and handle success', () => {
      let response: any;
      const payload = { test: 123 };
      service.getDayCareCentreContentMaster(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/ContentManagement/getDayCareCentreContentMaster`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call manageContent with body and handle success', () => {
      let response: any;
      const payload = { content: 'hello' };
      service.manageContent(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/ContentManagement/manageContent`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getFrontentContentByType with param and handle success', () => {
      let response: any;
      service.getFrontentContentByType('footer').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/ContentManagement/getFrontentContentByType?Type=footer`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call ActiveInactiveContent with param and handle success', () => {
      let response: any;
      service.ActiveInactiveContent(1, 'active').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/ContentManagement/activeInactiveContentManageMent?id=1&type=active`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call AddHomePageImages with body and handle network timeout (0)', () => {
      let errResp: any;
      const fd = new FormData();
      service.AddHomePageImages(fd).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/UploadMultipleFiles`);
      req.error(new ProgressEvent('Network Error'));
      expect(errResp.status).toBe(0);
    });

    it('should call dayCareCentreContentMaster with body and handle success', () => {
      let response: any;
      const payload = { obj: 1 };
      service.dayCareCentreContentMaster(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/ContentManagement/dayCareCentreContentMaster`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle dayCareCentreContentMaster error (400)', () => {
      let errResp: any;
      service.dayCareCentreContentMaster({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/ContentManagement/dayCareCentreContentMaster`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call DaycareGalleryDelete with params and handle success', () => {
      let response: any;
      service.DaycareGalleryDelete(5, 'path').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/ContentManagement/daycareGalleryDelete?ContentMasterID=5&ImagePath=path`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call getDayCareGallery with params and handle success', () => {
      let response: any;
      service.getDayCareGallery(10, 'type').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/ContentManagement/getDayCareGallery?id=10&type=type`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });
  });

  describe('State Management', () => {
    it('should set and emit data via behavior subject', (done) => {
      const testData = { payload: 'hello' };

      service.PassData(testData);

      service.currentdata.subscribe(val => {
        if (val) {
          expect(val).toEqual(testData);
          done();
        }
      });
    });
  });
});
