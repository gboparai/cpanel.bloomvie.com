
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../common.service';
import { BreadcrumbComponent } from './../../breadcrumb/breadcrumb.component';

import { Component, OnInit } from '@angular/core';
import { PaymnetsService } from '../../../day-care-management/payment-dashboard/paymnets.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-invoice',
  standalone: true,
  imports: [BreadcrumbComponent, CommonModule],
  templateUrl: './view-invoice.component.html',
  styleUrl: './view-invoice.component.css'
})
export class ViewInvoiceComponent implements OnInit {
  PaymentId: any;
  InvoiceDetails: any = [];


  constructor(private commonservice: CommonService, private router: Router, private route: ActivatedRoute, private paymentService: PaymnetsService) {


  }

  ngOnInit(): void {
    const enc_id = this.route.snapshot.queryParamMap.get('enc_id');
    if (enc_id) {
      const decryptedId = this.commonservice.decrypt(enc_id);
      this.PaymentId = decryptedId && !isNaN(Number(decryptedId)) ? parseInt(decryptedId, 10) : 0;
      if (this.PaymentId > 0) {
        this.getSubscriptionByID(this.PaymentId)
      }

    }
  }

  getSubscriptionByID(id: any) {
    this.paymentService.getSubscriptionByID(id).subscribe(data => {
      if (data.message == "OK") {
        this.InvoiceDetails = data.result
      }
    })
  }

}
