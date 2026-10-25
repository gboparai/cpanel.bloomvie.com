import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AddBulkActivityService } from './add-bulk-activity.service';
import { environment } from '../../../environments/environment';

describe('AddBulkActivityService', () => {
  let service: AddBulkActivityService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AddBulkActivityService],
    });
    service = TestBed.inject(AddBulkActivityService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getTeacherAssignments with teacherID and centreID', () => {
    let response: any;
    service.getTeacherAssignments(12, 3).subscribe(res => (response = res));

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Centre/getTeacherAssignments?teacherID=12&centreID=3`
    );
    expect(req.request.method).toBe('GET');
    req.flush([{ classId: 1, className: 'Preschool' }]);

    expect(response).toEqual([{ classId: 1, className: 'Preschool' }]);
  });

  it('should call getFoodType endpoint', () => {
    service.getFoodType().subscribe();

    const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getMealType`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should call getMealType endpoint', () => {
    service.getMealType().subscribe();

    const req = httpTestingController.expectOne(`${environment.apiUrl}/Centre/getFoodType`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should post invalidRecords to downloadInvalidRecordsSheet with params', () => {
    const invalidRecords = [{ row: 1, error: 'Missing date' }];
    service.downloadInvalidRecordsSheet(invalidRecords, 5, 20).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Centre/DownloadInvalidActivityRecord?centreID=5&teacherID=20`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(invalidRecords);
    req.flush({ fileUrl: 'https://example.com/sheet.xlsx' });
  });
});
