import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SuuplyService {
  rootUrl = environment.apiUrl;

 constructor(private http : HttpClient) { }


 manageSuuplyRequest(supplyrequest:any)
 {
  return this.http.post(this.rootUrl+"/Common/manageSupplyRequest",supplyrequest)
 }

 getSuuplyRequest(CentreadminId:any,status:string)
 {
  return this.http.get(this.rootUrl+"/Common/getSupplyRequest",{params:{CentreadminId,status}})
 }


 approveOrRejectSupplyRequest(statusId:any,itemId:any,loginId:any)
 {
  return this.http.get(this.rootUrl+"/Common/approveOrRejectSupplyRequest",{params:{statusId,itemId,loginId}})
 }


 getSupplyRequestByLoginId(loginUserId:any)
 {
  return this.http.get(this.rootUrl+"/Common/getSupplyRequestByLoginId",{params:{loginUserId}})
 }

 getSupplyRequestById(itemId:any)
 {
  return this.http.get(this.rootUrl+"/Common/getSupplyRequestById",{params:{itemId}})
 }

 DeleteSupply(itemId:any,Message:any)
 {
  return this.http.delete(this.rootUrl+"/Common/DeleteSupply",{params:{itemId,Message}})
 }

 getAllExpenseTypes(){
  return this.http.get(this.rootUrl+"/Common/getAllExpenseTypes")
 }

reviewSupplyRequest(purchasedItem:any){
  return this.http.post(this.rootUrl +"/Common/reviewSupplyRequest",purchasedItem)
}

}
