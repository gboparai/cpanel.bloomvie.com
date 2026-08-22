import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { CommonModule, DatePipe, NgFor } from '@angular/common';
import { WorkTimingService } from './work-timings.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinner, NgxSpinnerService, Spinner } from 'ngx-spinner';
import { CookieService } from 'ngx-cookie-service';
import { BloomvieSubscriptionFeaturesComponent } from '../../bloomvie-management/bloomvie-subscription-features/bloomvie-subscription-features.component';
import { json } from 'stream/consumers';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../common-component/common.service';
import Swal from 'sweetalert2';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { ManageDaycareService } from '../manage-daycare/manage-daycare.service';
import flatpickr from 'flatpickr';
import { SkeletonLoaderComponent } from '../../common-component/skeleton-loader/skeleton-loader.component';
declare const $: any;

@Component({
  selector: 'app-work-timings',
  standalone: true,
  imports: [
    DatePipe,
    BreadcrumbComponent,
    NgFor,
    ReactiveFormsModule,
    CommonModule,
    SkeletonLoaderComponent,
  ],
  templateUrl: './work-timings.component.html',
  styleUrls: ['./work-timings.component.css'],
  providers: [DatePipe],
})
export class WorkTimingsComponent implements OnInit, AfterViewInit {
  ClientWorkingDaysForm: FormGroup;
  workingDaysData: any;
  selectedDaysCount: number = 0;
  public centreID: number = 0;
  public loginUserID: number = 0;
  public holidayForm: any;
  public holidays: any[] = [];
  public seasonalBreakList: any[] = [];
  public seasonalBreakForm: any;
  public arrayIndex: any;
  private dateInputs: any;

  public isSunday: boolean = true;
  public isSaturday: boolean = true;
  public isFriday: boolean = true;
  public isThursday: boolean = true;
  public isWednesday: boolean = true;
  public isTuesday: boolean = true;
  public isMonday: boolean = true;

  UserRoleID: any;
  startDatePickerInstance: any;
  endDatePickerInstance: any;
  isEdit: any;
  onEditSeasonal: any;
  currentYear: number = new Date().getFullYear();

  holidaySkeleton = 'holidays';
  workTimeskeleton = 'workTimeskeleton';
  skeletonShow = 'Skelton';

  constructor(
    private fb: FormBuilder,
    private workTimingsService: WorkTimingService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private cookie: CookieService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private commonService: CommonService,
    public onBoardingService: OnboardingService,
    private daycareManageService: ManageDaycareService
  ) {
    this.ClientWorkingDaysForm = this.fb.group({
      id: [0],
      workingDaysCount: [0],
      centreID: [0],
      mon: [false],
      monStartTime: [''],
      monEndTime: [''],
      tues: [false],
      tuesStartTime: [''],
      tuesEndTime: [''],
      wed: [false],
      wedStartTime: [''],
      wedEndTime: [''],
      thu: [false],
      thuStartTime: [''],
      thuEndTime: [''],
      fri: [false],
      friStartTime: [''],
      friEndTime: [''],
      sat: [false],
      satStartTime: [''],
      satEndTime: [''],
      sun: [false],
      sunStartTime: [''],
      sunEndTime: [''],
      loginUserID: [0],
    });

    this.holidayForm = this.fb.group({
      id: [0],
      centreID: [0],
      holidayName: [null, [Validators.required]],
      holidayDate: [null, [Validators.required]],
    });

    // this.seasonalBreakForm = fb.group({
    //   id: [0],
    //   title: [null, [Validators.required]],
    //   startDate: [null, [Validators.required]],
    //   endDate: [null, [Validators.required]],
    //   isActive: [null],
    // });

    this.seasonalBreakForm = fb.group({
      id: [0],
      title: [null],
      startDate: [null],
      endDate: [null],
      isActive: [null],
    });
  }
  ngOnInit(): void {
    this.initDatePickers();
    this.route.queryParamMap.subscribe((params) => {
      let enc_id: any = params.get('enc_id');
      if (enc_id) {
        const decryptedId = this.commonService.decrypt(enc_id);
        this.centreID =
          decryptedId && !isNaN(Number(decryptedId))
            ? parseInt(decryptedId, 10)
            : 0;
      } else if (this.cookie.check('CentreID')) {
        this.centreID = parseInt(this.cookie.get('CentreID'));
      }

      if (this.centreID) {
        if (this.cookie.check('UserId')) {
          this.loginUserID = parseInt(this.cookie.get('UserId'));
        }
        this.loadWorkTimings();
        this.getHolidayList();
        this.getSeasonalHolidays();
      }
    })

    //Added on 28/07/25
    this.seasonalBreakForm.get('title')?.valueChanges.subscribe((titleValue: string) => {
      const startDate = this.seasonalBreakForm.get('startDate');
      const endDate = this.seasonalBreakForm.get('endDate');

      if (titleValue?.trim()) {
        startDate?.setValidators(Validators.required);
        endDate?.setValidators(Validators.required);

        startDate?.markAsTouched();
        endDate?.markAsTouched();
      } else {
        startDate?.clearValidators();
        endDate?.clearValidators();
      }
      startDate?.updateValueAndValidity();
      endDate?.updateValueAndValidity();
    });
    //End
  }

  initDatePickers(): void {
    const self = this;
    const currentDate = new Date();

    // Start Date Picker
    this.startDatePickerInstance = flatpickr('#startDate', {
      mode: 'single',
      dateFormat: 'm-d-Y', // Correct flatpickr format for MM-DD-YYYY
      allowInput: true,
      minDate: currentDate,
      onChange(selectedDates: any) {
        if (selectedDates.length === 1) {
          const selectedDate = selectedDates[0];
          self.seasonalBreakForm.patchValue({
            startDate: self.datePipe.transform(selectedDate, 'MM-dd-yyyy'), // Angular DatePipe
          });

          const nextDay = new Date(selectedDate);
          nextDay.setDate(nextDay.getDate() + 1);
          self.endDatePickerInstance.set('minDate', nextDay);
        }
      },
      locale: {
        firstDayOfWeek: 1,
      },
    });

    this.endDatePickerInstance = flatpickr('#endDate', {
      mode: 'single',
      dateFormat: 'm-d-Y',
      allowInput: true,
      minDate: currentDate,
      onChange(selectedDates: any) {
        if (selectedDates.length === 1) {
          const selectedDate = selectedDates[0];
          self.seasonalBreakForm.patchValue({
            endDate: self.datePipe.transform(selectedDate, 'MM-dd-yyyy'),
          });
        }
      },
      locale: {
        firstDayOfWeek: 1,
      },
    });
  }

  ngAfterViewInit(): void {
    this.dateInputs = document.getElementsByName('date-input') as any;

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // JS months are 0-based
    const currentDate = today.getDate();

    const formattedMinDate = `${currentMonth}-${currentDate}-${currentYear}`;

    this.dateInputs.forEach((input: any) => {
      input.flatpickr({
        dateFormat: 'm-d-Y', // <-- Updated to MM-DD-YYYY
        minDate: formattedMinDate,
        // maxDate: `12-31-${currentYear}`, // Optional if needed
      });
    });
  }

  // ngAfterViewInit(): void {
  //   this.dateInputs = document.getElementsByName('date-input') as any;
  //   const currentYear = new Date().getFullYear();

  //   this.dateInputs.forEach((input: any) => {
  //     input.flatpickr({
  //       dateFormat: 'd/m/Y',
  //       minDate: `01/01/${currentYear}`,
  //       maxDate: `31/12/${currentYear}`,
  //     });
  //   });
  // }

  get holidayFormControls() {
    return this.holidayForm.controls;
  }

  get seasonalBreakFormControls() {
    return this.seasonalBreakForm.controls;
  }

  enableInputWithTime(e: any, controlName: any) {
    const isChecked = e.target.checked;
    const daySpan = e.target.parentNode;

    if (isChecked) {
      daySpan.classList.remove('uncheck');
    } else {
      daySpan.classList.add('uncheck');
    }

    const cnameStart = this.ClientWorkingDaysForm.get(
      controlName + 'StartTime'
    );
    const cnameEnd = this.ClientWorkingDaysForm.get(controlName + 'EndTime');

    if (!cnameStart || !cnameEnd) {
      console.error('Form controls not found');
      return;
    }

    if (isChecked) {
      cnameStart.setValidators(Validators.required);
      cnameEnd.setValidators(Validators.required);
      cnameStart.setValue('09:00');
      cnameEnd.setValue('17:00');
    } else {
      cnameStart.clearValidators();
      cnameEnd.clearValidators();
      cnameStart.setValue('');
      cnameEnd.setValue('');
    }

    cnameStart.updateValueAndValidity();
    cnameEnd.updateValueAndValidity();
    this.updateSelectedDaysCount();
  }

  updateSelectedDaysCount() {
    const days = ['mon', 'tues', 'wed', 'thu', 'fri', 'sat', 'sun'];
    this.selectedDaysCount = days.reduce((count, day) => {
      return this.ClientWorkingDaysForm.get(day)?.value ? count + 1 : count;
    }, 0);
    this.ClientWorkingDaysForm.get('workingDaysCount')?.setValue(
      this.selectedDaysCount
    );

    this.workTimeskeleton = '';
  }

  async onSubmit() {
    if (this.ClientWorkingDaysForm.invalid) {
      this.ClientWorkingDaysForm.markAllAsTouched();
      return;
    }
    if (this.ClientWorkingDaysForm.value.workingDaysCount == 0) {
      this.toastr.warning('Please select at least one working day.');
      return;
    }
    this.spinner.show();
    this.ClientWorkingDaysForm.patchValue({
      centreID: this.centreID,
      loginUserID: this.loginUserID,
      id: this.ClientWorkingDaysForm.value.id ?? 0,
    });

    const formData = this.ClientWorkingDaysForm.value;
    try {
      const response = await this.workTimingsService
        .saveWorkTimings(formData)
        .toPromise();
      if (response.message === 'ok') {
        await this.assignHolidays();
        await this.manageSeasonalBreak();
        this.updateSelectedDaysCount();
        this.loadWorkTimings();

        this.commonService
          .manageDaycareOnBoarding(this.centreID, 'ManageDaycareWorkCalendar')
          .subscribe((result: any) => {
            if (result.message == 'Success') {
              if (this.onBoardingService.isOnboarding) {
                if (!this.onBoardingService.onBoardingData.isCompleteStep3) {
                  this.onBoardingService.onBoardingData.isCompleteStep3 = true;
                  this.onBoardingService.handleNext('Tab-3');
                } else {
                  this.toastr.success('Working days updated successfully');
                  this.onBoardingService.getCurrentTab();
                }
              } else {
                this.toastr.success('Working days updated successfully');
              }
            }
          });
      }
    } catch (error: any) {
      this.toastr.error(error.message);
    } finally {
      this.spinner.hide();
    }
  }

  changeTheClass(apiResult: string) {
    switch (apiResult) {
      case 'mon':
        const element = document.getElementById('Monday');
        if (element) {
          element.classList.remove('uncheck');
        }
        break;

      case 'tue':
        const elementTue = document.getElementById('Tuesday');
        if (elementTue) {
          elementTue.classList.remove('uncheck');
        }
        break;

      case 'wed':
        const elementWed = document.getElementById('Wednesday');
        if (elementWed) {
          elementWed.classList.remove('uncheck');
        }
        break;

      case 'thu':
        const elementThu = document.getElementById('Thursday');
        if (elementThu) {
          elementThu.classList.remove('uncheck');
        }
        break;

      case 'fri':
        const elementFri = document.getElementById('Friday');
        if (elementFri) {
          elementFri.classList.remove('uncheck');
        }
        break;

      case 'sat':
        const elementSat = document.getElementById('Saturday');
        if (elementSat) {
          elementSat.classList.remove('uncheck');
        }
        break;

      case 'sun':
        const elementSun = document.getElementById('Sunday');
        if (elementSun) {
          elementSun.classList.remove('uncheck');
        }
        break;
    }
  }

  loadWorkTimings() {
    this.workTimingsService
      .getCentreWorkingDaysByCentreID(this.centreID)
      .subscribe(
        (response) => {
          if (response && response.message === 'Success' && response.result) {
            this.updateSelectedDaysCount();
            const data = response.result;

            this.isMonday = !data.mon;
            this.isTuesday = !data.tues;
            this.isWednesday = !data.wed;
            this.isThursday = !data.thu;
            this.isFriday = !data.fri;
            this.isSaturday = !data.sat;
            this.isSunday = !data.sun;

            this.ClientWorkingDaysForm.patchValue({
              id: data.id,
              centreID: data.centreID,
              mon: data.mon,
              monStartTime: data.monStartTime,
              monEndTime: data.monEndTime,
              tues: data.tues,
              tuesStartTime: data.tuesStartTime,
              tuesEndTime: data.tuesEndTime,
              wed: data.wed,
              wedStartTime: data.wedStartTime,
              wedEndTime: data.wedEndTime,
              thu: data.thu,
              thuStartTime: data.thuStartTime,
              thuEndTime: data.thuEndTime,
              fri: data.fri,
              friStartTime: data.friStartTime,
              friEndTime: data.friEndTime,
              sat: data.sat,
              satStartTime: data.satStartTime,
              satEndTime: data.satEndTime,
              sun: data.sun,
              sunStartTime: data.sunStartTime,
              sunEndTime: data.sunEndTime,
              workingDaysCount: data.workingDaysCount //Added on 21/08/25
            });

            var weekList = ['sun', 'mon', 'tues', 'wed', 'thu', 'fri', 'sat'];
            weekList.forEach((element) => {
              if (data[element] === true) {
                const parentSpan = $(`input[name='${element}']`).parent();
                parentSpan.removeClass('uncheck');
              }
            });
          } else {
            this.workTimeskeleton = '';
            // console.error('No data found or error in fetching data');
          }
          setTimeout(() => {
            this.spinner.hide();
          }, 300);
        },
        (error) => {
          this.spinner.hide();
        }
      );
  }

  resetForm() {
    this.ClientWorkingDaysForm.reset();
  }

  getHolidayList() {
    this.holidays = [];
    this.holidaySkeleton = 'holidays';
    this.workTimingsService.getCentreHolidayList(this.centreID).subscribe({
      next: (response) => {
        if (response.message === 'Success') {
          this.holidays = this.formatHolidayList(response.result);
        }
        this.holidaySkeleton = '';
      },
      error: (err) => {
        this.toastr.error(err.message);
        this.holidaySkeleton = '';
      },
    });
  }

  formatHolidayList(
    list: {
      id: number;
      holidayName: string;
      holidayDate: string;
      isActive: boolean;
      isDefaultHoliday: boolean;
    }[]
  ) {
    const tempHolidayList: { month: string; holidays: any[] }[] = [];
    list.forEach((item) => {
      const date = new Date(item.holidayDate);
      const month = date.toLocaleString('default', { month: 'long' });
      const monthEntry = tempHolidayList.find(
        (element) => element.month === month
      );
      if (monthEntry) {
        monthEntry.holidays.push({
          id: item.id,
          holidayInfo:
            this.formatDateWithOrdinal(item.holidayDate) +
            ' ' +
            item.holidayName,
          isActive: item.isActive,
          isDefaultHoliday: item.isDefaultHoliday,
        });
      } else {
        tempHolidayList.push({
          month: month,
          holidays: [
            {
              id: item.id,
              holidayInfo:
                this.formatDateWithOrdinal(item.holidayDate) +
                ' ' +
                item.holidayName,
              isActive: item.isActive,
              isDefaultHoliday: item.isDefaultHoliday,
            },
          ],
        });
      }
    });
    return tempHolidayList;
  }

  formatDateWithOrdinal(dateString: string) {
    const date = new Date(dateString);
    const day: number = date.getDate();
    const suffix = this.getOrdinalSuffix(day);
    const month = date.toLocaleString('default', { month: 'long' });
    return `${day}${suffix} ${month}`;
  }

  getOrdinalSuffix(day: number) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  async assignHolidays(): Promise<string> {
    if (this.holidays.length > 0) {
      const holidayListID: number[] = [];
      const elementList: any[] = $(
        "input[name='holiday-check']:checked"
      ).toArray();
      elementList.forEach((element) => {
        holidayListID.push(parseInt(element.value));
      });
      try {
        const response = await this.workTimingsService
          .activeInactiveHolidays(this.centreID, holidayListID)
          .toPromise();
        if (response.message === 'Success') {
          this.getHolidayList();
        }
        this.spinner.hide();
      } catch (error: any) {
        this.toastr.error(error.error.message);
      }
    }
    return 'ok';
  }

  onSubmitHoliday() {
    if (this.holidayForm.valid) {
      this.spinner.show();
      const jsonData = this.holidayForm.value;
      jsonData['id'] = jsonData.id > 0 ? jsonData.id : 0;
      jsonData['holidayDate'] = this.formatDateString(jsonData.holidayDate);
      jsonData['centreID'] = this.centreID;
      this.workTimingsService.manageDaycareCentreHoliday(jsonData).subscribe({
        next: (response) => {
          if (response.message === 'Success') {
            $('#exampleModal').modal('hide');
            this.toastr.success(response.activity);
            this.holidayForm.reset({ id: 0 });
            this.getHolidayList();
            this.isEdit = null;
          }
          setTimeout(() => {
            this.spinner.hide();
          }, 300);
        },
        error: (err) => {
          this.toastr.error(err.message);
          this.spinner.hide();
        },
      });
    } else {
      this.holidayForm.markAllAsTouched();
    }
  }

  formatDateString(stringDate: string) {
    const [day, month, year] = stringDate.split('/');
    const date = new Date(`${year}-${month}-${day}`);
    return date.toISOString();
  }

  onDeleteSessionalHoliday(index: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this holiday?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.seasonalBreakList.splice(index, 1);
        this.seasonalBreakForm.reset();
        Swal.fire('Deleted!', 'The holiday has been removed.', 'success');
      }
    });
  }


  isAllFieldsEmpty(): boolean {
    const form = this.seasonalBreakForm;
    return !form.get('title')?.value?.trim() &&
      !form.get('startDate')?.value?.trim() &&
      !form.get('endDate')?.value?.trim();
  }

  addSeasonalBreak() {
    if (this.seasonalBreakForm.valid) {
      const jsonData = this.seasonalBreakForm.value;
      jsonData['id'] = jsonData.id > 0 ? jsonData.id : 0;
      jsonData['startDate'] = this.formatDateString(jsonData.startDate);
      jsonData['endDate'] = this.formatDateString(jsonData.endDate);
      jsonData['centreID'] = this.centreID;

      // validate date
      if (new Date(jsonData.startDate) > new Date(jsonData.endDate)) {
        Swal.fire({
          title: 'Invalid Date Range',
          text: 'The start date cannot be later than the end date.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
        return;
      }
      if (this.arrayIndex === 0 || this.arrayIndex > 0) {
        this.seasonalBreakList[this.arrayIndex] = jsonData;
        this.toastr.success('Seasonal break updated in list successfully.');
      } else {
        this.seasonalBreakList.push(jsonData);
        this.toastr.success('Seasonal break added in list successfully.');
      }
      this.disableDatesForSeasonalBreaks();
      this.seasonalBreakForm.reset();
      this.arrayIndex = null;
    } else {
      this.seasonalBreakForm.markAllAsTouched();
    }
  }

  disableDatesForSeasonalBreaks() {
    const selectedDateRangeArray = this.seasonalBreakList.map((breaks: any) => {
      const [from, to] = [
        breaks.startDate.split('T')[0].split('-').reverse().join('-'),
        breaks.endDate.split('T')[0].split('-').reverse().join('-'),
      ];
      return {
        from: from,
        to: to,
      };
    });
    for (let i = 0; i < this.dateInputs.length; i++) {
      if (i !== 2) {
        const flatpickrInstance = this.dateInputs[i]._flatpickr;
        flatpickrInstance.set('disable', selectedDateRangeArray);
      }
    }
  }

  getSeasonalHolidays() {
    this.skeletonShow = 'Skeleton';
    this.workTimingsService.getSeasonalHolidays(this.centreID).subscribe({
      next: (response) => {
        if (response.message === 'Success') {
          this.seasonalBreakList = response.result;
          this.skeletonShow = '';

          this.disableDatesForSeasonalBreaks();
        } else {
          this.skeletonShow = '';
        }
      },
      error: (err) => {
        this.toastr.error(err.message);
      },
    });
  }

  isExpiredHoliday(endDate: string): boolean {
    const today = new Date();
    const end = new Date(endDate);
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    return end < today;
  }


  onEditSeasonalHoliday(arrIndex: number) {
    this.onEditSeasonal = arrIndex;
    const jsonData = this.seasonalBreakList[arrIndex];
    jsonData.startDate = this.datePipe.transform(
      jsonData.startDate,
      'MM-dd-YYYY'
    );
    jsonData.endDate = this.datePipe.transform(jsonData.endDate, 'MM-dd-YYYY');
    this.seasonalBreakForm.patchValue(jsonData);
    this.arrayIndex = arrIndex;
  }

  async manageSeasonalBreak(): Promise<string> {
    if (this.seasonalBreakList.length > 0) {
      try {
        const response = await this.workTimingsService
          .manageSeasonalBreaks(this.seasonalBreakList)
          .toPromise();
        if (response.message === 'Success') {
          this.getSeasonalHolidays();
        }
      } catch (error: any) {
        this.toastr.error(error.error.message);
      }
    }
    return 'ok';
  }

  clearForm() {
    this.onEditSeasonal = null;
  }

  activeInactiveSeasonalHoliday(isActive: boolean, ID: number) {
    Swal.fire({
      title: 'Confirmation',
      text: isActive
        ? 'Are you sure you want to inactivate this seasonal holidays?'
        : 'Are you sure you want to activate this seasonal holidays?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.workTimingsService.activeInactiveSeasonalHoliday(ID).subscribe({
          next: (response) => {
            if (response.message === 'Success') {
              this.toastr.success(response.activity);
              this.getSeasonalHolidays();
            }
            setTimeout(() => {
              this.spinner.hide();
            }, 200);
          },
          error: (err) => {
            this.spinner.hide();
            this.toastr.error(err.message);
          },
        });
      } else {
        const checkbox: any = document.getElementById('class_check' + ID);
        if (checkbox) {
          checkbox.checked = isActive;
        }
      }
    });
  }

  editHoliday(arrIndex: number, ID: number) {
    const holiday = this.holidays[arrIndex].holidays.find(
      (x: any) => x.id === ID
    );
    this.isEdit = holiday;

    if (holiday) {
      const [dayWithSuffix, month, ...nameParts] =
        holiday.holidayInfo.split(' ');
      const day = dayWithSuffix.replace(/\D/g, '');
      const date = new Date(`${month} ${day}, ${new Date().getFullYear()}`);
      const formattedDate = `${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date
          .getDate()
          .toString()
          .padStart(2, '0')}-${date.getFullYear()}`;

      this.holidayForm.patchValue({
        id: holiday.id,
        holidayName: nameParts.join(' '),
        holidayDate: formattedDate,
      });

      $('#exampleModal').modal('show');
    }
  }

  deleteHoliday(ID: number) {
    Swal.fire({
      title: 'Confirmation',
      text: 'Are you sure you want to delete this item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.workTimingsService.deleteHoliday(ID).subscribe(
          (response) => {
            if (response.message === 'Success') {
              this.getHolidayList();
              this.toastr.success('The item has been deleted successfully.');
            } else {
              Swal.fire(
                'Error!',
                'There was an issue deleting the item. Please try again.',
                'error'
              );
            }
          },
          (error) => {
            Swal.fire(
              'Error!',
              'There was an issue deleting the item. Please try again.',
              'error'
            );
          }
        );
      }
    });
  }
}
