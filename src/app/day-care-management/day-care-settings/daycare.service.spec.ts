import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DaycareService } from './daycare.service';
import { environment } from '../../../environments/environment';

describe('DaycareService', () => {
  let service: DaycareService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DaycareService],
    });
    service = TestBed.inject(DaycareService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('externalBilling reactive state', () => {
    it('should emit updated external billing state via externalBilling$', (done: DoneFn) => {
      let emissions: boolean[] = [];

      service.externalBilling$.subscribe(val => {
        emissions.push(val);
        if (emissions.length === 2) {
          expect(emissions).toEqual([false, true]);
          done();
        }
      });

      service.notifyExternalBillingChanged(true);
    });
  });

  describe('HTTP operations', () => {
    it('should post getAllActivites', () => {
      const payload = { centerId: 5 };
      service.getAllActivites(payload).subscribe();

      const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getAllActivities`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush([]);
    });

    it('should post assignmentActivitesForDayCare with structure', () => {
      service.assignmentActivitesForDayCare(5, [1, 2], [3]).subscribe();

      const req = httpTestingController.expectOne(
        `${environment.apiUrl}/Common/assignmentActivitesForDayCare`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        CenterId: 5,
        activityIds: [1, 2],
        unselectedActivity: [3],
      });
      req.flush({ success: true });
    });

    it('should post assignFacilityForDayCare with structure', () => {
      service.assignFacilityForDayCare(5, [10], [20]).subscribe();

      const req = httpTestingController.expectOne(
        `${environment.apiUrl}/Common/assignFacilityForDayCare`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        CenterId: 5,
        activityIds: [10],
        unselectedfacility: [20],
      });
      req.flush({ success: true });
    });
  });
});
