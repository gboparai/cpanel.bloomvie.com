import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddMasterFacilityComponent } from './add-master-facility.component';
import { AddMasterFacilityService } from './add-master-facility.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('AddMasterFacilityComponent (spec.component)', () => {
  let component: AddMasterFacilityComponent;
  let fixture: ComponentFixture<AddMasterFacilityComponent>;
  let mockFacilityService: jasmine.SpyObj<AddMasterFacilityService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockCookie: jasmine.SpyObj<CookieService>;

  beforeEach(async () => {
    mockFacilityService = jasmine.createSpyObj('AddMasterFacilityService', [
      'ManageFacility',
      'GetAllFacilities',
      'GetFacilityById',
      'ActiveInactiveFacilityId',
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'warning', 'error']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockCookie = jasmine.createSpyObj('CookieService', ['get']);

    mockCookie.get.and.returnValue('1');
    mockFacilityService.GetAllFacilities.and.returnValue(
      of({ message: 'Success', result: [] })
    );

    await TestBed.configureTestingModule({
      imports: [AddMasterFacilityComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AddMasterFacilityService, useValue: mockFacilityService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: CookieService, useValue: mockCookie },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(AddMasterFacilityComponent, {
        set: {
          imports: [ReactiveFormsModule],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AddMasterFacilityComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default facility form state', () => {
    expect(component.faciltityForm).toBeDefined();
    expect(component.faciltityForm.value.facilityID).toBe(0);
    expect(component.faciltityForm.value.isActive).toBeTrue();
  });

  it('should call GetAllFacilities on ngOnInit', () => {
    component.ngOnInit();
    expect(mockFacilityService.GetAllFacilities).toHaveBeenCalled();
  });
});
