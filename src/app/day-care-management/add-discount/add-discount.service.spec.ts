import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AddDiscountService } from './add-discount.service';
import { environment } from '../../../environments/environment';

describe('AddDiscountService', () => {
  let service: AddDiscountService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AddDiscountService]
    });
    service = TestBed.inject(AddDiscountService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    it('should call getCustomPlanByUserID and handle success', () => {
      service.getCustomPlanByUserID(1, 2).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SubscriptionPlans/getAllCustomPlanByUserID?ID=1&ageGroupID=2`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should call geDiscountByPlanID and handle error (404)', () => {
      let errResp: any;
      service.geDiscountByPlanID(10).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SubscriptionPlans/geDiscountByPlanID?planID=10`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call sendPaymentMailToParent with payload and handle success', () => {
      const payload = { data: 'test' };
      service.sendPaymentMailToParent(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SubscriptionPlans/sendPaymentMailToParent`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should call getAllSubscriptionPlansForFrontEnd with payload and handle success', () => {
      const payload = { test: true };
      service.getAllSubscriptionPlansForFrontEnd(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/Frontend/getAllSubscriptionPlansForFrontEnd`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should call sendDiscountFormMail with payload and handle success', () => {
      const payload = { form: 123 };
      service.sendDiscountFormMail(payload).subscribe();
      const req = httpTestingController.expectOne(`${environment.apiUrl}/DayCareCentreUser/sendDiscountFormMail`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should call getAllEnrolledStudentsRecord and handle error (500)', () => {
      let errResp: any;
      service.getAllEnrolledStudentsRecord(5).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/SubscriptionPlans/getAllEnrolledStudentsRecord?CentreID=5`);
      req.flush('Server Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });
  });
});
