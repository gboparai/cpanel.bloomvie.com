import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import * as CryptoJS from 'crypto-js';
import { TeachersJourneyComponent } from './teachers-journey.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProfileService } from '../../common-component/profile/profile.service';
import { DayCareDashboardService } from '../../day-care-management/daycare-dashboard/day-care-dashboard.service';
import { CommonService } from '../../common-component/common.service';
import { environment } from '../../../environments/environment';

describe('TeachersJourneyComponent', () => {
  let component: TeachersJourneyComponent;
  let fixture: ComponentFixture<TeachersJourneyComponent>;

  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;
  let mockDaycareDashService: jasmine.SpyObj<DayCareDashboardService>;
  let mockCommonService: jasmine.SpyObj<CommonService>;

  const encryptedId = CryptoJS.AES.encrypt('42', environment.secretKey).toString();

  beforeEach(async () => {
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockProfileService = jasmine.createSpyObj('ProfileService', ['GetUserById']);
    mockDaycareDashService = jasmine.createSpyObj('DayCareDashboardService', ['getStaffTransferedDetailsTeacherID']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['getS3FileByName', 'convertS3File']);

    mockDaycareDashService.getStaffTransferedDetailsTeacherID.and.returnValue(
      of({
        message: 'Success',
        result: [{ transferId: 1, centreName: 'Downtown Centre' }]
      })
    );

    mockProfileService.GetUserById.and.returnValue(
      of({
        message: 'Success',
        result: { id: 42, firstName: 'Sarah', s3ImageUrl: 'profile.jpg' }
      })
    );

    mockCommonService.convertS3File.and.returnValue('https://s3.amazonaws.com/profile.jpg');
    mockCommonService.getS3FileByName.and.returnValue(of(new Blob(['dummy'], { type: 'image/jpeg' })));

    await TestBed.configureTestingModule({
      imports: [TeachersJourneyComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: DayCareDashboardService, useValue: mockDaycareDashService },
        { provide: CommonService, useValue: mockCommonService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ id: encryptedId })
          }
        }
      ]
    })
    .overrideComponent(TeachersJourneyComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeachersJourneyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and decrypt route id', () => {
    expect(component).toBeTruthy();
    expect(component.id).toBe('42');
  });

  it('should fetch profile details and convert S3 file', () => {
    expect(mockProfileService.GetUserById).toHaveBeenCalledWith('42', 4);
    expect(component.profileData.firstName).toBe('Sarah');
    expect(component.profileData.s3Url).toBe('https://s3.amazonaws.com/profile.jpg');
    expect(component.skeletonShow).toBe('');
  });

  it('should handle profile details when s3ImageUrl is absent', () => {
    mockProfileService.GetUserById.and.returnValue(
      of({
        message: 'Success',
        result: { id: 42, firstName: 'Sarah', s3ImageUrl: '' }
      })
    );
    component.getProfileDetails();
    expect(component.profileData.s3Url).toBe('');
    expect(component.skeletonShow).toBe('');
  });

  it('should handle profile details error', () => {
    mockProfileService.GetUserById.and.returnValue(
      throwError(() => new Error('Profile fetch failed'))
    );
    component.getProfileDetails();
    expect(component.skeletonShow).toBe('');
  });

  it('should fetch staff transferred details and update transferRecordList', () => {
    component.id = '42';
    component.getStaffTransferedDetailsByCentreID();
    expect(mockDaycareDashService.getStaffTransferedDetailsTeacherID).toHaveBeenCalledWith(42, 3);
    expect(component.transferRecordList.length).toBe(1);
    expect(component.transferRecordList[0].centreName).toBe('Downtown Centre');
  });

  it('should fetch S3 file and create object url in getS3FileName', () => {
    spyOn(URL, 'createObjectURL').and.returnValue('blob:http://localhost/test');
    component.getS3FileName('test.png');
    expect(mockCommonService.getS3FileByName).toHaveBeenCalledWith('test.png');
  });
});
