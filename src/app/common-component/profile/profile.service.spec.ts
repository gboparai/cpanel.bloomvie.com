import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProfileService } from './profile.service';
import { environment } from '../../../environments/environment';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProfileService],
    });
    service = TestBed.inject(ProfileService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call GetUserById with ID and userRoleID', () => {
    let response: any;
    service.GetUserById(15, 2).subscribe(res => (response = res));

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/User/getUserProfileByID?ID=15&userRoleID=2`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ id: 15, firstName: 'Jane' });

    expect(response).toEqual({ id: 15, firstName: 'Jane' });
  });

  it('should post UserMasterBO in ManageUser', () => {
    let response: any;
    const userModel = { id: 15, email: 'jane@example.com' };
    service.ManageUser(userModel).subscribe(res => (response = res));

    const req = httpTestingController.expectOne(`${environment.apiUrl}/User/manageUser`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(userModel);
    req.flush({ success: true });

    expect(response).toEqual({ success: true });
  });

  it('should post MasterDocumentBO array in ManageMasterDocument', () => {
    const docs = [{ docId: 1, docName: 'License.pdf' }];
    service.ManageMasterDocument(docs).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Common/manageMasterDocument`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(docs);
    req.flush({ success: true });
  });

  it('should fetch master document by id and type', () => {
    service.GetMasterDocumentbyId(12, 'identification').subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/User/getMasterDocumentByID?userID=12&type=identification`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should call getSubscriptionPlanByUserId with params', () => {
    service.getSubscriptionPlanByUserId(12, 3, 'billing', 88).subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Frontend/getSubscriptionplanByUserId?Id=12&UserRoleID=3&tab=billing&studentID=88`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ plan: 'Monthly' });
  });

  it('should call getTOCUserCentreListById with ID', () => {
    service.getTOCUserCentreListById('user-77').subscribe();

    const req = httpTestingController.expectOne(
      `${environment.apiUrl}/Frontend/getTOCUserCentreListById?ID=user-77`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
