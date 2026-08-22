import { Component, ViewChild } from '@angular/core';
import { AllJobPostingPlansService } from './all-job-posting-plans.service';
import { CommonModule, NgFor } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbComponent } from "../common-component/breadcrumb/breadcrumb.component";
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../common-component/common.service';
import { finalize, firstValueFrom, lastValueFrom } from 'rxjs';
import { StripeCardComponent, StripeService } from 'ngx-stripe';

declare var $: any;
@Component({
  selector: 'app-all-job-posting-plans',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BreadcrumbComponent],
  templateUrl: './all-job-posting-plans.component.html',
  styleUrl: './all-job-posting-plans.component.css',
})
export class AllJobPostingPlansComponent {
  @ViewChild('cardElem') cardElement!: StripeCardComponent;
  AllJobPostingPlans: any = [];
  DaycareID: any;
  jobPostingPlan: any;
  public submitted: boolean = false;

  private connectedAccountId: string = '';
  selectedPendingPayments: any[] = [];
  JobPostingPlanPaymentForm: FormGroup;
  planPrice: number = 0;
  UserID: number = 0;

  constructor(
    private allJobPostingPlanService: AllJobPostingPlansService,
    private cookie: CookieService,
    private commonService: CommonService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private stripeService: StripeService,

  ) {
    this.JobPostingPlanPaymentForm = this.formBuilder.group({
      planID: [null],
      price: [null],
      featureID: [null],
    });
  }

  ngOnInit() {
    this.DaycareID = this.cookie.get('CentreID');
    this.UserID = parseInt(this.cookie.get('UserId'));
    this.getAllJobPostingPlans();
  }

  getAllJobPostingPlans() {
    this.allJobPostingPlanService.getAllJobPostingPlans().subscribe(
      (data) => {
        if (data.message === 'Success') {
          this.AllJobPostingPlans = data.result;
        }
      },
      (error) => { }
    );
  }

  JobPostPlanBuy(id: number, featureID: number) {
    $('#jobPostPlanBuyButton_' + id).prop('disabled', true);
    let model = {
      planID: id,
      centreID: this.DaycareID,
      featureID: featureID,
      CentreAdminID: this.UserID,
    };
    this.allJobPostingPlanService.JobPostPlanBuy(model).subscribe(
      (data) => {
        if (data.message === 'Success') {
          const AllJobCounts = data.result;
          this.cookie.set('jobPostCount', AllJobCounts);
          Swal.fire({
            icon: 'success',
            title: 'Plan Upgraded Successfully',
            text: 'You have purchased the plan',
            confirmButtonText: 'Ok',
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/job-portal']);
            }
          });

          $('#jobPostPlanBuyButton_' + id).prop('disabled', false);
        } else if (data.message === 'Already have job counts') {
          Swal.fire({
            icon: 'info',
            title:
              data.result > 1
                ? `Already have ${data.result} job postings left`
                : `Already have ${data.result} job posting left`,
            text:
              data.result > 1
                ? 'there are still job postings left'
                : 'there is still job posting left',
            confirmButtonText: 'Ok',
          });

          $('#jobPostPlanBuyButton_' + id).prop('disabled', false);
        }
      },
      (error) => { }
    );
  }

  // paymnet apis 

  async confirmPayment(clientSecret: string): Promise<{
    paymentIntentId: string | null;
    status: string | null;
    payment_method: string | any;
    currency: string | any;
    amountInCents: number | any;
  }> {
    try {
      const { firstName, lastName, email, phoneNumber } =
        this.JobPostingPlanPaymentForm.value;
      const result = await this.stripeService
        .confirmCardPayment(clientSecret, {
          payment_method: {
            card: this.cardElement.element,
            billing_details: {
              name: `${firstName} ${lastName}`,
              email,
              phone: phoneNumber,
            },
          },
        })
        .toPromise();

      if (result?.error) {
        console.error('Stripe Error:', result.error.message);
        Swal.fire({
          icon: 'error',
          title: 'Payment Failed',
          text: result.error.message,
        });
        return {
          paymentIntentId: null,
          status: 'failed',
          payment_method: null,
          currency: null,
          amountInCents: 0,
        };
      }

      const paymentIntentId = result?.paymentIntent?.id || null;
      const paymentStatus = result?.paymentIntent?.status || null;
      const totalAmountInCents = result?.paymentIntent?.amount || 0;

      if (!paymentIntentId) {
        console.warn('Payment Intent ID not received.');
        Swal.fire({
          icon: 'warning',
          title: 'Payment Incomplete',
          text: 'We could not confirm your payment. Please try again.',
        });

        return {
          paymentIntentId: null,
          status: paymentStatus,
          payment_method: null,
          currency: null,
          amountInCents: 0,
        };
      }
      return {
        paymentIntentId,
        status: paymentStatus,
        payment_method: result?.paymentIntent?.payment_method,
        currency: result?.paymentIntent.currency,
        amountInCents: totalAmountInCents,
      };
    } catch (error) {
      console.error('Payment Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Unexpected Error',
        text: 'An error occurred while confirming the payment.',
      });
      return {
        paymentIntentId: null,
        status: null,
        payment_method: null,
        currency: null,
        amountInCents: 0,
      };
    }
  }

  async proceedToPay(): Promise<any> {
    const clearBO = this.selectedPendingPayments.map((item: any) => ({
      planID: item.planID,
      dueDate: item.monthDueDate,
      paymentDate: item.paymentDate,
      parentID: 1,
      totalPlanAmount: item.planAmount,
      totalPaidAmount: item.totalPaidAmount,
      studentID: 12,
      discount: item.discount,
      paymentType: 'Online',
    }));

    // try {
    //   const response = await lastValueFrom(
    //     this.parentDashboardservice.ClearStudentPendingPayments(
    //       clearBO,
    //       this.centreID
    //     )
    //   );
    //   return response;
    // } catch (error: any) {
    //   return null;
    // }
  }

  async transferToConnectedAccount(
    paymentIntentId: string,
    totalAmountInCents: number
  ): Promise<any> {
    try {
      const platformFeeInCents = Math.round(
        totalAmountInCents * (this.commonService.platFormFee() / 100)
      );
      const payload = {
        connectAccountId: this.connectedAccountId,
        totalAmountInCents,
        platformFeeInCents,
        paymentIntentId,
      };
      const response = await this.commonService
        .transferToConnectedAccount(payload)
        .toPromise();

      if (response.message == 'Success') {
        return response;
      } else {
      }
    } catch (error) {
      throw error;
    }
  }


  calculateTotal(): number {
    return this.selectedPendingPayments
      .map((item: { totalPaidAmount: number }) => item.totalPaidAmount)
      .reduce((acc, val) => acc + val, 0);
  }

  async createPaymentIntent(): Promise<string> {
    const payload = {
      amount: this.calculateTotal(),
      connectedAccountId: this.connectedAccountId,
    };
    const response = await lastValueFrom(
      this.commonService.createPaymentIntent(payload)
    );
    return response.clientSecret;
  }



  async handlePayment(
    subscriptionPlanPaymentId: number[],
    transactionId: string,
    paymentStatus: string,
    paymentMethod: string,
    currency: string
  ): Promise<any | null> {
    try {
      const formValues = this.JobPostingPlanPaymentForm.value;
      const payload = {
        firstName: formValues.firstName?.trim() || '',
        lastName: formValues.lastName?.trim() || '',
        email: formValues.email?.toLowerCase() || '',
        phoneNumber: formValues.phoneNumber?.toLowerCase() || '',
        subscriptionPlanPaymentId,
        paymentStatus: paymentStatus,
        paymentIntentId: transactionId,
        currency: currency,
        paymentMethod: paymentMethod,
        amount: this.calculateTotal(),
      };

      const paymentResponse = await this.commonService
        .createPayment(payload)
        .toPromise();
      return paymentResponse.result;
    } catch (error) {
      throw error;
    }
  }

  async handlePaymentResponse() {
    $('#staticBackdrop').modal('hide');
    Swal.fire({
      title: 'Success',
      text: 'The payment has been completed successfully.',
      icon: 'success',
      confirmButtonText: 'OK',
    });
  }

  async onSubmitPayment() {
    try {
      if (this.JobPostingPlanPaymentForm.invalid) {
        this.JobPostingPlanPaymentForm.markAllAsTouched();
        return;
      }
      this.spinner.show();
      this.submitted = true;
      // stripe apis
      const clientSecret = await this.createPaymentIntent();
      const {
        paymentIntentId,
        status,
        payment_method,
        currency,
        amountInCents,
      } = await this.confirmPayment(clientSecret);
      if (!paymentIntentId || !status) {
        console.warn('Payment was not successful. Status:', status);
        return;
      }
      if (status === 'succeeded') {
        const subscriptionPaymentResponse = await this.proceedToPay();
        if (subscriptionPaymentResponse) {
          await this.transferToConnectedAccount(paymentIntentId, amountInCents);
          const subscriptionPalnPaymentId =
            subscriptionPaymentResponse.result.subscriptionPlanPaymentIdList;
          await this.handlePayment(
            subscriptionPalnPaymentId,
            paymentIntentId,
            status,
            payment_method,
            currency
          );
          await this.handlePaymentResponse();
          this.JobPostingPlanPaymentForm.reset();
        }
      } else if (status === 'requires_payment_method') {
        Swal.fire({
          icon: 'warning',
          title: 'Payment Incomplete',
          text: 'Payment requires a valid payment method.',
          confirmButtonText: 'Update Payment Method',
        });
      } else if (status === 'canceled') {
        Swal.fire({
          icon: 'info',
          title: 'Payment Cancelled',
          text: 'You have cancelled the payment process.',
          confirmButtonText: 'OK',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Payment Failed',
          text: `The payment status is "${status}". Please try again.`,
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Payment Process Error:', error);
    } finally {
      this.spinner.hide();
      this.submitted = false;
    }
  }

  // payment apis


}
