import { Component,effect } from '@angular/core';
import { HeaderComponent } from '../../layout/header/header.component';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { ChildParentDetailsComponent } from './child-parent-details/child-parent-details.component';
import { ChildRoutineComponent } from './child-routine/child-routine.component';
import { PickupPersonComponent } from './pickup-person/pickup-person.component';
import { CookieService } from 'ngx-cookie-service';
import { CommonService } from '../../common-component/common.service';
declare var $: any;
@Component({
  selector: 'app-parent-onboarding',
  standalone: true,
  imports: [
    HeaderComponent,
    RouterLink,
    RouterModule,
    ChildParentDetailsComponent,
    ChildRoutineComponent,
    PickupPersonComponent,
  ],
  templateUrl: './parent-onboarding.component.html',
  styleUrl: './parent-onboarding.component.css',
})
export class ParentOnboardingComponent {
  isFirstFormSubmitted: boolean = false;
  constructor(
    private activatedRoute: ActivatedRoute,
    private cookie: CookieService,
    private commonService:CommonService
  ) {
    effect(()=>{
      const loadStep1 = this.commonService.loadStep1();
      const loadStep2 = this.commonService.loadStep2();
      if(loadStep1 && loadStep2) {
        this.commonService.updateDisplaySpinner(false);
      }
    })
  }
  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe({
      next: (params) => {
        const encryptedId = params['id'];
        if (params['Update']) {
          this.cookie.set('Update', 'true');
        } else {
          this.cookie.set('Update', 'false');
        }

        const secretKey = 'encrypt!135790';

        if (encryptedId) {
          try {
            const bytes = CryptoJS.AES.decrypt(encryptedId, secretKey);
            const decryptedId = bytes.toString(CryptoJS.enc.Utf8);

            if (decryptedId) {
              // alert(`Decrypted ID: ${decryptedId}`);
            } else {
              // alert('Decryption failed. Invalid ID.');
            }
          } catch (error) {
            console.error('Error decrypting ID:', error);
            // alert('Failed to decrypt the ID.');
          }
        }
      },
      error: (error) => {
        console.error('Error reading query parameters:', error);
      },
    });
  }

  onFirstFormSubmit() {
    this.isFirstFormSubmitted = true;
  }
  preventTabClick(event: Event) {
    if (!this.isFirstFormSubmitted) {
      event.preventDefault();
    }
  }
  ToActiveAnotherTab(): void {
    $('.nav-pills .nav-link[href="#child-routine"]').addClass('active');
    $('.nav-pills .nav-link[href="#child-parent-basic-deatils"]').removeClass(
      'active'
    );
  }
}
