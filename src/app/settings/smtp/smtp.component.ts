import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import {
  AfterViewInit,
  Component,
  Input,
  input,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
import { SmtpListComponent } from './smtp-list/smtp-list.component';
import { SmtpService } from './smtp.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { SwitcherComponentComponent } from '../../common-component/switcher-component/switcher-component.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-smtp',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    SmtpListComponent,
    BreadcrumbComponent,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    ToastrModule,
    SwitcherComponentComponent,
  ],
  templateUrl: './smtp.component.html',
  styleUrl: './smtp.component.css',
})
export class SmtpComponent {
  @ViewChild(SmtpListComponent) SmtpListComponent!: SmtpListComponent;
  smtpform: any;
  submittedData: any;
  selectedId: any;
  smtpId: any;
  smtpValues: any;
  list: any;
  smtpList: any;
  centreID: number = 0;
  userID: number = 0;

  constructor(
    private smtpService: SmtpService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private cookies: CookieService
  ) {
    this.smtpform = fb.group({
      id: [0],
      UserID: this.userID,
      centreID: this.centreID,
      username: [
        null,
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
        ],
      ],
      password: [null, Validators.required],
      host: ['', Validators.required],
      port: ['', Validators.required],
      ssl: false,
      enableConsole: true,
      isActive: true,
      fromEmail: [
        null,
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
        ],
      ], //Added on 18/08/25
    });
  }
  ngOnInit() {
    this.centreID = parseInt(this.cookies.get('CentreID'));
    this.userID = parseInt(this.cookies.get('UserId'));
    this.SmtpListComponent.GetList();
  }

  handleIdSelected(id: string) {
    this.selectedId = id;
    this.spinner.show();
    if (!this.selectedId) {
      this.spinner.hide();
      this.toastr.error('Invalid ID selected.');
      return;
    }

    this.smtpService.GetSMTPSettingbyId(this.selectedId).subscribe((data) => {
      if (data.message == 'Success') {
        this.smtpValues = data.result;
        this.smtpform.patchValue({
          id: this.smtpValues.id,
          UserID: this.userID,
          centreID: this.centreID,
          username: this.smtpValues.username,
          password: this.smtpValues.password,
          host: this.smtpValues.host,
          port: this.smtpValues.port,
          ssl: this.smtpValues.ssl,
          enableConsole: this.smtpValues.enableConsole,
          isActive: this.smtpValues.isActive,
          fromEmail: this.smtpValues.fromEmailID //Added on 18/08/25
        });
        window.scrollTo(0, 0);
        this.spinner.hide();
      } else {
        this.spinner.hide();
        this.toastr.error('Error patching values');
      }
    });
  }

  // GetList() {
  //   this.smtpService.GetAllSMTPSettings().subscribe(data => {
  //     if (data.message === "Success") {
  //       this.smtpList = data.result
  //     }
  //   })
  // }

  onSubmit() {
    this.spinner.show();
    if (this.smtpform.valid) {
      this.smtpform.patchValue({
        id: this.smtpform.value.id == null ? 0 : this.smtpform.value.id,
        UserID: this.userID,
        centreID: this.centreID,
      });
      this.smtpService.ManageSMTP(this.smtpform.value).subscribe((data) => {
        if (data.message === 'Success') {
          if (this.smtpform.get('id').value > 0) {
            this.toastr.success('SMTP updated successfully.');
          } else {
            this.toastr.success('SMTP saved successfully.');
          }
          setTimeout(() => {
            this.spinner.hide();
          }, 1000);
        }
        this.SmtpListComponent.GetList();
        this.reset();
      });
    } else {
      this.smtpform.markAllAsTouched();
    }
  }

  get input() {
    return this.smtpform.controls;
  }

  reset() {
    this.smtpform.reset({
      id: 0,
      username: '',
      password: '',
      host: '',
      port: '',
      ssl: false,
      enableConsole: true,
      isActive: true,
    });
  }
}
