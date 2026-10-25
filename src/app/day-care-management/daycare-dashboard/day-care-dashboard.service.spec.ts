import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DayCareDashboardService } from './day-care-dashboard.service';
import { environment } from '../../../environments/environment';

describe('DayCareDashboardService', () => {
  let service: DayCareDashboardService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DayCareDashboardService],
    });
    service = TestBed.inject(DayCareDashboardService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get daycare by ID', () => {
    service.getDayCareByID(12).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Centre/getCentreByID?ID=12`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ id: 12, name: 'Bloomvie Daycare' });
  });

  it('should get daycare dashboard counts', () => {
    service.getDayCareDashBoardCount(12).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Dashboard/getDayCareDashBoardCount?DayCareID=12`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ totalStudents: 45, totalStaff: 8 });
  });

  it('should get events by daycare ID', () => {
    service.getEventsByDayCareId(12).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Dashboard/getEventsByDayCareId?DayCareId=12`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get activities by centre ID', () => {
    service.getActivitesByCenterId(12).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Dashboard/getActivitesByCenterId?DayCareId=12`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should call getStaffTransferedDetailsByCentreID', () => {
    service.getStaffTransferedDetailsByCentreID(5, 2, 'active', 'all').subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Common/getStaffTransferedDetailsByCentreID?centreID=5&UserRoleID=2&status=active&type=all`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
