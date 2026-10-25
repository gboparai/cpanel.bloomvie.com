import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ManageClassroomService } from './manage-classroom.service';
import { environment } from '../../../../environments/environment';

describe('ManageClassroomService', () => {
  let service: ManageClassroomService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ManageClassroomService],
    });
    service = TestBed.inject(ManageClassroomService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should post classes formData in ManageClasses', () => {
    const payload = [{ className: 'Toddler A' }];
    service.ManageClasses(payload).subscribe();

    const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/manageClasses`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true });
  });

  it('should get class by ID for editing', () => {
    service.editClass(10).subscribe();

    const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/getClassesByID?id=10`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 10, name: 'Toddler A' });
  });

  it('should get sections by class ID', () => {
    service.getSectionByClassID(22).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Classroom/getSectionByClassID?classID=22`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should get age groups by centre ID', () => {
    service.GetAllAgeGroup(5).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Centre/getAllAgeGroupByCentreID?CentreID=5`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should toggle active/inactive classroom by ID', () => {
    service.ActiveInactiveClassroom(15).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Classroom/activeInactiveclassByID?id=15`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ success: true });
  });

  it('should check duplicate class name in onClassDuplicateCheck', () => {
    service.onClassDuplicateCheck(5, 'Preschool A').subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Centre/onClassDuplicateCheck?centreID=5&className=Preschool%20A`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ isDuplicate: false });
  });

  it('should post checkSlotExists', () => {
    const slot = { slotId: 1, startTime: '09:00' };
    service.checkSlotExists(slot).subscribe();

    const req = httpTestingController.expectOne(`${environment.apiUrl}/Classroom/checkSlotExists`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(slot);
    req.flush({ exists: false });
  });

  it('should call getClassroomCapacityByClassID', () => {
    service.getClassroomCapacityByClassID(5, 20).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Classroom/getClassroomCapacityByClassID?daycareID=5&inputCapacity=20`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ available: true });
  });
});
