import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, Injectable, signal, WritableSignal } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Subject } from '@microsoft/signalr';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../common-component/common.service';

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  isOnboardedAccount = signal<boolean>(false);
  connectedAccountId = signal<string>('');
  stripeOnboardingUrl = signal<string>('');
  stripeOnboardingStepsCount = signal<number>(0);

  onboardingState = computed(() => ({
    isOnboardedAccount: this.isOnboardedAccount(),
    connectedAccountId: this.connectedAccountId(),
    stripeOnboardingUrl: this.stripeOnboardingUrl(),
  }));

  public isOnboarding: boolean = false;
  public onBoardingData: any = {};

  private readonly rootURL: string = environment.apiUrl;
  public currentTab: string = 'Tab-1';
  constructor(
    private http: HttpClient,
    private router: Router,
    private cookie: CookieService,
    private commonService: CommonService
  ) {}
  getDayCareOnBoardingCurrentTab(dayCareID: number): Observable<any> {
    return this.http.get<any>(this.rootURL + '/Centre/getDayCareOnboarding', {
      params: { dayCareID },
    });
  }

  getCurrentTab(): void {
    const steps = [
      { step: this.onBoardingData.isCompleteStep1, tab: 'Tab-1' },
      { step: this.onBoardingData.isCompleteStep2, tab: 'Tab-2' },
      { step: this.onBoardingData.isCompleteStep3, tab: 'Tab-3' },
      { step: this.onBoardingData.isCompleteStep4, tab: 'Tab-4' },
      { step: this.onBoardingData.isCompleteStep5, tab: 'Tab-5' },
      { step: this.onBoardingData.isCompleteStep6, tab: 'Tab-6' },
      { step: this.onBoardingData.isCompleteStep7, tab: 'Tab-7' },
      { step: this.onBoardingData.isCompleteStep8, tab: 'Tab-8' },
    ];
    const incompleteStep = steps.find((step) => !step.step);
    if (incompleteStep) {
      this.currentTab = incompleteStep.tab;
    } else {
      this.router.navigate(['/daycare-dashboard']);
    }
  }

  onChangeTab(tab: string) {
    this.currentTab = tab;
  }

  getAccountDetails(id: number, steps?: string): Observable<any> {
    let stripeSteps = steps ? steps : '';
    return this.http.get<any>(this.rootURL + '/Centre/getAccountDetails', {
      params: { id, stripeSteps },
    });
  }

  manageChildrenList(postData: any): Observable<any> {
    return this.http.post<any>(
      this.rootURL + '/DayCareCentreUser/uploadBulkChildrenData',
      postData
    );
  }

  handleNext(completedTab: string): void {
    const messages: { [key: string]: string } = {
      'Tab-1':
        "Daycare center registered successfully. Please click 'Next' to continue.",
      'Tab-2':
        "General settings have been added successfully. Please click 'Next' to continue.",
      'Tab-3':
        "Work timing have been added successfully. Please click 'Next' to continue.",
      'Tab-4':
        "Daycare classes have been added successfully.  Please click 'Next' to continue.",
      'Tab-5':
        "Daycare staff have been added successfully.  Please click 'Next' to continue.",
      'Tab-6': "Class Assign Successfully. Please click 'Next' to continue.",
      'Tab-7':
        "Social media links have been added successfully. Please click 'Next' to continue.",
      'Tab-8':
        "Leave's management have been added successfully. Please click 'Next' to continue.",
    };
    const content = messages[completedTab] || 'Action completed successfully.';
    Swal.fire({
      title: 'On-Boarding',
      text: content,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Next',
      cancelButtonText: 'Cancel',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.getCurrentTab();
      }
    });
  }

  download(centreId: any): Observable<any> {
    return this.http.get(
      this.rootURL + '/DayCareCentreUser/childrenBulUploadByCenterID',
      { params: { centreId } }
    );
  }

  getInterestedDayCare(UserType: any): Observable<any> {
    return this.http.get<any>(
      this.rootURL + '/Dashboard/getInterestedDayCare',
      { params: { UserType } }
    );
  }
}
