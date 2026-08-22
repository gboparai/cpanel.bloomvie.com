import { HttpClient } from '@angular/common/http';
import {
  computed,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import * as CryptoJS from 'crypto-js';
import Swal from 'sweetalert2';
import { HttpHeaders } from '@angular/common/http';
import { DateTime } from 'luxon';

interface reginResponse {
  offsetString: string;
  offsetHours: number;
  offsetMinutes: number;
  totalOffsetMinutes: number;
}

interface daycareAdminInfo {
  dayCareCentreLogo: string;
  dayCareCentreName: string;
}

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private readonly secretKey = '12345678901234567890123456789012';
  private readonly IV = 'abcdef9876543210';

  private _platFormFee = signal<number>(0);
  readonly platFormFee = this._platFormFee.asReadonly();

  private countries = [
    {
      id: 1,
      name: 'United States',
      code: '+1',
      flag: 'https://flagcdn.com/us.svg',
    },
    {
      id: 2,
      name: 'Canada',
      code: '+1',
      flag: 'https://flagcdn.com/ca.svg',
    },
  ];

  private readonly serverRegion: any = {
    'America/Los_Angeles': 1,
    'Asia/Calcutta': 2,
    'Etc/UTC': 3,
  };

  setPlatFormFee(value: number) {
    this._platFormFee.set(value);
  }
  private readonly rootURL: string = environment.apiUrl;
  TimeList: any;
  private _triggerSignal = signal<boolean>(true);
  private _headerImage = signal<boolean>(true);

  public regionResponseSignal: WritableSignal<reginResponse> =


    signal<reginResponse>({
      offsetString: '',
      offsetHours: 0,
      offsetMinutes: 0,
      totalOffsetMinutes: 0,
    });

  triggerLogoSignal: WritableSignal<boolean> = signal(false);
  loadSideBar: WritableSignal<boolean> = signal(false);

  daycareCentreInformation: WritableSignal<daycareAdminInfo> = signal({
    dayCareCentreLogo: '',
    dayCareCentreName: '',
  });

  displaySpinner: WritableSignal<boolean> = signal(true);
  loadStep1: WritableSignal<boolean> = signal(false);
  loadStep2: WritableSignal<boolean> = signal(false);

  loadBreadcrumbSignal: WritableSignal<boolean> = signal(false);

  updateDisplaySpinner = (setValue: boolean) =>
    this.displaySpinner.set(setValue);

  updateBreadcrumb() {
    this.loadBreadcrumbSignal.set(!this.loadBreadcrumbSignal());
  }

  updateLoadSideBar() {
    this.loadSideBar.set(!this.loadSideBar());
  }

  updateTriggerLogoSignal() {
    this.triggerLogoSignal.set(!this.triggerLogoSignal);
  }

  triggerSignal = this._triggerSignal.asReadonly();
  headerImage = this._headerImage.asReadonly();

  constructor(private http: HttpClient) {
    this.getRegionResponse();
  }

  trigger() {
    this._triggerSignal.update((currentValue) => !currentValue);
  }

  updateHeaderImage() {
    this._headerImage.update((currentValue) => !currentValue);
  }

  findRegion(): number {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return this.serverRegion[timeZone] ? this.serverRegion[timeZone] : 4;
  }

  getRegionTime(timeZone: string): Observable<any> {
    return this.http.get<any>('https://timeapi.io/api/Time/current/zone', {
      params: { timeZone },
    });
  }

  getUtcOffset(region: string, dateTimeStr: string) {
    const zoned = DateTime.fromISO(dateTimeStr, { zone: region });

    const totalOffsetMinutes = zoned.offset; // e.g. -570
    const sign = totalOffsetMinutes >= 0 ? 1 : -1;

    const absMinutes = Math.abs(totalOffsetMinutes);
    const hours = Math.floor(absMinutes / 60);
    const minutes = absMinutes % 60;

    const offsetStr = `${sign === 1 ? '+' : '-'}${String(hours).padStart(
      2,
      '0'
    )}:${String(minutes).padStart(2, '0')}`;

    return {
      offsetString: offsetStr,
      offsetHours: sign * hours,
      offsetMinutes: sign * minutes,
      totalOffsetMinutes: totalOffsetMinutes,
    };
  }

  async getRegionResponse() {
    const regionRecord =
      (await this.findRegionTimeZone()) != 'no record found !!' &&
      (await this.findRegionTimeZone());

    this.regionResponseSignal.set(regionRecord);
  }

  async findRegionTimeZone(): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      this.getRegionTime(timeZone).subscribe((item: any) => {
        if (item) {
          let utcOffset = this.getUtcOffset(timeZone, item.dateTime);
          resolve(utcOffset);
        }
        resolve('no record found !!');
      });
    });
  }

  getCountryList(): Observable<any> {
    return this.http.get<any>(this.rootURL + '/Common/getCountryList');
  }
  getStateListByCountryID(CountryID: number): Observable<any> {
    return this.http.get<any>(this.rootURL + '/Common/getStatebyCountryID', {
      params: { CountryID },
    });
  }
  getCitiesListByStateID(StateID: number): Observable<any> {
    return this.http.get<any>(this.rootURL + '/Common/getCityByStateID', {
      params: { StateID },
    });
  }
  uploadImages(postData: FormData,): Observable<any> {
    return this.http.post<any>(this.rootURL + '/Common/uploadImages', postData);
  }

  manageMasterQualifications(data: FormData): Observable<any> {
    return this.http.post<any>(
      this.rootURL + '/Common/manageMasterQualifications',
      data
    );
  }

  activeInActiveQualificationID(id: any): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/Common/activeInActiveQualificationID',
      { params: { id } }
    );
  }

  manageDaycareCentreEventManagment(payload: any) {
    return this.http.post(
      `${this.rootURL}/Common/ManageDaycareCentreEventManagment`,
      payload
    );
  }

  getMasterEvent(userID: any, UserRoleID: any, type: any): Observable<any> {
    return this.http.get<any>(this.rootURL + '/Common/getMasterEvent', {
      params: { userID, UserRoleID, type },
    });
  }

  getEventsByDayCareId(DayCareId: any, studentID: any): Observable<any> {
    return this.http.get(this.rootURL + '/Dashboard/getEventsByDayCareId', {
      params: { DayCareId, studentID },
    });
  }

  deleteEvent(eventID: any, daycareID: any): Observable<any> {
    return this.http.get(this.rootURL + '/Common/deleteEventByDayCareId', {
      params: { eventID, daycareID },
    });
  }

  getMasterAllQualifications(
    userID: any,
    UserRoleID: any,
    type: any
  ): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/Common/getMasterAllQualifications',
      { params: { userID, UserRoleID, type } }
    );
  }

  activeInactiveDocument(ID: number): Observable<any> {
    return this.http.get<any>(this.rootURL + '/Common/activeInactiveDocument', {
      params: { ID },
    });
  }

  validateDuplicateRecord(
    table: string,
    key: string,
    value: any
  ): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/Common/validateDuplicateRecord',
      { params: { table, key, value } }
    );
  }

  manageDaycareOnBoarding(centreID: number, reference: string) {
    return this.http.get<any>(
      this.rootURL + '/Centre/manageDayCareOnBoarding',
      { params: { centreID, reference } }
    );
  }

  TokenMatchQueryParam(token: string): Observable<any> {
    return this.http.get<any>(this.rootURL + '/login/tokenMatch', {
      params: { token },
    });
  }

  encrypt(value: string): string {
    const key = CryptoJS.enc.Utf8.parse(this.secretKey);
    const iv = CryptoJS.enc.Utf8.parse(this.IV);
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(value),
      key,
      {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: iv,
      }
    );
    return encrypted.toString();
  }

  decrypt(encryptedText: string): string | null {
    try {
      const key = CryptoJS.enc.Utf8.parse(this.secretKey);
      const iv = CryptoJS.enc.Utf8.parse(this.IV);
      const replacedEncText = encryptedText.replace(/ /g, '+');

      if (!replacedEncText) {
        throw new Error('Empty encrypted text provided');
      }

      const bytes = CryptoJS.AES.decrypt(replacedEncText, key, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: iv,
      });

      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedText) {
        throw new Error('Decryption failed: Empty output');
      }

      return decryptedText;
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  GetS3FileByName(fileName: any): Observable<any> {
    const url = `${this.rootURL}+'/Common/GetS3FileByName?fileName=${fileName}`;
    return this.http.get(url, {
      responseType: 'blob',
    });
  }

  AcceptOrRejectTermsAndCondition(
    LoginUserID: number,
    statusID: number
  ): Observable<any> {
    return this.http.put(
      `${this.rootURL}/User/AcceptOrRejectTermsAndCondition`,
      null,
      { params: { LoginUserID, statusID } }
    );
  }

  //Isha
  // getUtcTime(UTCTime :any) {
  //   this.TimeList = UTCTime;
  //       const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  //       this.TimeList.forEach((item: { utctime: string; name: any; istTime?: string; localTime?: string; }) => {
  //         let utcDate: Date;

  //         // Force-parse UTC string
  //         if (item.utctime && !item.utctime.endsWith('Z')) {
  //           utcDate = new Date(item.utctime + 'Z'); // Add 'Z' = UTC marker if missing
  //         } else {
  //           utcDate = new Date(item.utctime);
  //         }

  //         if (isNaN(utcDate.getTime())) {
  //           console.error(`Invalid UTC date for item: ${item.name}`);
  //           item.localTime = 'Invalid Date';
  //           item.istTime = 'Invalid Date';
  //         } else {
  //           const userFormattedTime = new Intl.DateTimeFormat('en-US', {
  //             timeZone: userTimeZone,
  //             year: 'numeric',
  //             month: '2-digit',
  //             day: '2-digit',
  //             hour: '2-digit',
  //             minute: '2-digit',
  //             second: '2-digit',
  //             hour12: true
  //           }).format(utcDate);

  //           item.localTime = userFormattedTime;
  //           item.istTime = userFormattedTime;
  //         }

  //       });
  // }

  //Arsh Added on 30/04/25
  //  getUtcTime(UTCTime: any[]): any[] {
  //   const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  //   const currentLocalDateTime = new Date();
  //   const filteredList: any[] = [];

  //   UTCTime.forEach((item: any) => {
  //     const slotDate = item.slotDate;
  //     const slotTime = item.slotStartTime;
  //     const createdDate = item.createdDate;

  //     const utcSlotDateTime = new Date(`${slotDate}T${slotTime}Z`);
  //     const utcCreatedDateTime = new Date(createdDate);

  //     if (isNaN(utcSlotDateTime.getTime()) || isNaN(utcCreatedDateTime.getTime())) {
  //       return;
  //     }

  //     const localTimeString = new Intl.DateTimeFormat('en-US', {
  //       timeZone: userTimeZone,
  //       year: 'numeric',
  //       month: '2-digit',
  //       day: '2-digit',
  //       hour: '2-digit',
  //       minute: '2-digit',
  //       second: '2-digit',
  //       hour12: true
  //     }).format(utcSlotDateTime);

  //     item.localTime = localTimeString;

  //     if (utcSlotDateTime > currentLocalDateTime && utcCreatedDateTime <= currentLocalDateTime) {
  //       filteredList.push(item);
  //     }
  //   });
  //   return filteredList;
  // }

  //Arsh updated
  getUtcTime(UTCTime: any[]): any[] {
    // const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const todayIST = new Date().toLocaleDateString('en-CA', {
      timeZone: userTimeZone,
    });

    const filteredList: any[] = [];

    UTCTime.forEach((item: any) => {
      const createdUTC = new Date(item.createdDate);

      if (isNaN(createdUTC.getTime())) {
        return;
      }

      // Convert UTC to IST using formatter
      const createdISTString = createdUTC.toLocaleDateString('en-CA', {
        timeZone: userTimeZone,
      });

      if (createdISTString === todayIST || todayIST <= createdISTString) {
        // Optional: also attach readable time
        const slotDate = item.slotDate;
        const slotTime = item.slotStartTime;

        const utcSlotDateTime = new Date(`${slotDate}T${slotTime}Z`);
        item.localTime = utcSlotDateTime.toLocaleString('en-IN', {
          timeZone: userTimeZone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          year: 'numeric',
          month: 'short',
          day: '2-digit',
        });

        filteredList.push(item);
      }
    });

    return filteredList;
  }

  SubmitControlTypeAndLabelName(model: any): Observable<any> {

    return this.http.post(
      this.rootURL + '/Common/SubmitControlAndLabelForm',
      model
    );
  }

  GetControlAndLabelForm(id: number): Observable<any> {

    return this.http.get(this.rootURL + '/Common/GetControlAndLabelForm', {
      params: { centreID: id },
    });
  }

  sendEmailToParentAndStudent(userId: any): Observable<any> {

    return this.http.get(
      this.rootURL +
      '/SubscriptionPayment/sendMailToParentAndTeacherForPassword',
      { params: { userId } }
    );
  }

  duplicateRecordWarn() {
    Swal.fire({
      title: 'Duplicate Record Found',
      text: 'A record with the same information already exists. Please review the details.',
      icon: 'warning',
      confirmButtonText: 'OK',
    });
  }

  manageMasterDocument(postData: any): Observable<any> {
    return this.http.post<any>(
      this.rootURL + '/Common/manageMasterDocument',
      postData
    );
  }

  updateDayCareCentreCalculator(postData: any): Observable<any> {
    return this.http.post<any>(
      this.rootURL + '/DayCareCentreUser/AddOrUpdateDayCareCentreCalculator',
      postData
    );
  }

  getCalculatorValue(
    daycareTypeID: any,
    ID: any,
    activityName: any,
    typeOfLogic: any,
    activityDurationType: any
  ) {
    return this.http.get<any>(
      this.rootURL + '/DayCareCentreUser/getCalculatorValue',
      {
        params: {
          daycareTypeID,
          ID,
          activityName,
          typeOfLogic,
          activityDurationType,
        },
      }
    );
  }

  getCalculatorLogic(ID: any, durationType: any) {
    return this.http.get<any>(
      this.rootURL + '/DayCareCentreUser/getCalculatorLogicTypeByDccID',
      { params: { ID, durationType } }
    );
  }

  getCalculatordurationType(ID: any, activityName: any) {
    return this.http.get<any>(
      this.rootURL + '/DayCareCentreUser/getCalculatordurationType',
      { params: { ID, activityName } }
    );
  }

  getCalculatorActivityName(daycareType: any) {
    return this.http.get<any>(
      this.rootURL + '/DayCareCentreUser/getCalculatorActivityNameByDccType',
      { params: { daycareType } }
    );
  }

  getBloomvieSettings(userRoleID: any) {
    return this.http.get<any>(this.rootURL + '/Common/getBloomvieSettings', {
      params: { userRoleID },
    });
  }

  ActiveInActiveBloomvieSettings(ID: any) {
    return this.http.get<any>(
      this.rootURL + '/Common/ActiveInActiveBloomvieSettings',
      { params: { ID } }
    );
  }

  manageEmployeeJourney(data: any): Observable<any> {

    return this.http.post<any>(
      this.rootURL + '/Common/manageEmployeeJourney',
      data
    );
  }

  manageBloomvieSettings(data: any): Observable<any> {

    return this.http.post<any>(
      this.rootURL + '/Common/manageBloomvieSettings',
      data
    );
  }

  manageBloomvieRadiusSettings(data: any): Observable<any> {

    return this.http.post<any>(
      this.rootURL + '/Common/manageBloomvieRadiusSettings',
      data
    );
  }

  dayCareEmployeeSalary(data: any): Observable<any> {
    return this.http.post<any>(
      this.rootURL + '/Attendance/manageDayCareEmployeeSalary',
      data
    );
  }

  sendEmailStudentMediaRequest(
    id: number,
    PlanID: string,
    planencryptID: any,
    userencryptID: any,
    Type: any
  ): Observable<any> {

    return this.http.get<any>(
      this.rootURL + '/Common/sendEmailStudentMediaRequest',
      {
        params: {
          id,
          PlanID,
          planencryptID,
          userencryptID,
          Type,
        },
      }
    );
  }

  // mobile number format
  // mohit

  formatPhoneNumber(input: string): string {
    const digitsOnly = input.replace(/\D/g, '');
    let formatted = '';

    if (digitsOnly.length > 0) {
      formatted = digitsOnly.substring(0, 3);
    }
    if (digitsOnly.length > 3) {
      formatted += ' ' + digitsOnly.substring(3, 6);
    }
    if (digitsOnly.length > 6) {
      formatted += ' ' + digitsOnly.substring(6, 10);
    }

    return formatted.trim();
  }

  // mohit
  formatPostalCode(value: string): string {
    const input = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    if (!input) return '';

    // US ZIP Code
    if (/^\d/.test(input)) {
      if (input.length <= 5) {
        return input;
      } else {
        return input.substring(0, 5); // only 5-digit ZIP
      }
    }

    // Canadian Postal Code
    if (/^[A-Z]/.test(input)) {
      let formatted = '';
      if (input.length >= 1) formatted += input[0]; // A
      if (input.length >= 2) formatted += input[1]; // A1
      if (input.length >= 3) formatted += input[2]; // A1A
      if (input.length >= 4) formatted += ' ' + input[3]; // A1A 1
      if (input.length >= 5) formatted += input[4]; // A1A 1A
      if (input.length >= 6) formatted += input[5]; // A1A 1A1
      return formatted;
    }

    return input;
  }

  // description and name validations
  // mohit

  validateInput(value: string, type: any): string {
    const allowedPattern = /[^a-zA-Z0-9$%()\-_+{}\/\\?'`:.,& ]/g;

    if (type === 'name') {
      value = value.replace(allowedPattern, '');
      value = value.replace(/^[0-9]+/, '');
      return value.substring(0, 50);
    }

    if (type === 'description') {
      value = value.replace(allowedPattern, '');
      value = value.replace(/^[0-9]+/, '');
      return value.length > 500 ? value.substring(0, 500) : value;
    }

    return value;
  }

  // getS3FileByName(fileName: any): Observable<any> {
  //   return this.http.get(`${this.rootURL}/Common/GetS3FileByName`, {
  //     params: { fileName },
  //     responseType: 'blob',
  //   });
  // }

  // mohit

  getS3FileByName(fileName: any): Observable<Blob> {
    return this.http.get(`${this.rootURL}/Common/GetS3FileByName`, {
      params: { fileName },
      responseType: 'blob',
    });
  }

  // mohit

  convertS3File(base64: string, mime: string = 'image/jpeg'): string {
    const blob = this.base64ToBlob(base64, mime);
    return URL.createObjectURL(blob);
  }

  // mohit

  base64ToBlob(base64: string, mime: string = 'image/jpeg'): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = Array.from(slice).map((char) => char.charCodeAt(0));
      byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: mime });
  }

  // image and pdf convert
  // mohit

  base64ToBlobUrl(base64Data: string): string | null {
    try {
      if (!base64Data || !base64Data.includes(',')) return null;

      const [header, data] = base64Data.split(',');
      const mimeMatch = header.match(/data:(.*);base64/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';

      const byteCharacters = atob(data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = Array.from(slice).map((char) => char.charCodeAt(0));
        byteArrays.push(new Uint8Array(byteNumbers));
      }

      const blob = new Blob(byteArrays, { type: mimeType });
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error('base64ToBlobUrl error', err);
      return null;
    }
  }

  // download s3 image or pdf
  // mohit

  downloadFile(fileUrl: string, fileName: string, type: 'pdf' | 'image') {
    if (!fileUrl) return;

    let extension = 'pdf';

    if (type === 'image') {
      extension = 'jpg';
    } else if (type === 'pdf') {
      extension = 'pdf';
    }

    const fullFileName = `${fileName}.${extension}`;

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fullFileName;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // time format
  // mohit

  convertTimeStringToDate(timeStr: any): Date | null {
    if (!timeStr) return null;
    const [hour, minute] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  }

  // AmPm
  // mohit

  transform(value: string): string {
    if (!value) return '';
    const [h, m] = value.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')} ${ampm}`;
  }

  createPayment(postData: any): Observable<any> {
    return this.http.post(
      this.rootURL + '/Payment/manage-payment-record',
      postData
    );
  }

  createPaymentIntent(postData: any): Observable<any> {
    return this.http.post<any>(
      this.rootURL + '/Payment/create-payment-intent',
      postData
    );
  }

  getBloomvieOwner(): Observable<any> {
    return this.http.get<any>(this.rootURL + '/Common/getBloomvieOwner');
  }

  transferToConnectedAccount(payload: any): Observable<any> {
    return this.http.post<any>(
      this.rootURL + '/Payment/TransferToConnectAccount',
      payload
    );
  }
  updateIsOnboarding(ID: number): Observable<any> {
    return this.http.get<any>(this.rootURL + '/Common/updateIsOnboarding', {
      params: { ID },
    });
  }

  //mohit

  getCountriesFlag() {
    return this.countries;
  }

  getDefaultCountryFlag(flag: any): any {
    if (flag == 0) {
      return this.countries[0];
    } else {
      return this.countries[1];
    }
  }

  //for croppedImageFunction
  blobToFile(blob: Blob, fileName: string): File {
    return new File([blob], fileName, { type: blob.type });
  }



}
