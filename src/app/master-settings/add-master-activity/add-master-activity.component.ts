import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddMasterActivityService } from './add-master-activity.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { BreadcrumbComponent } from '../../common-component/breadcrumb/breadcrumb.component';
declare var $:any;

@Component({
  selector: 'app-add-master-activity',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,ToastrModule,NgxPaginationModule,BreadcrumbComponent],
  templateUrl: './add-master-activity.component.html',
  styleUrl: './add-master-activity.component.css'
})
export class AddMasterActivityComponent {
  activityForm: any;
  activityList: any;
  isEditMode: boolean=false;
  activityValue: any;
contentP:number=1;
contentSize:number=5

  constructor(private fb:FormBuilder,private activityService:AddMasterActivityService,private toastr:ToastrService){
this.activityForm=fb.group({
  id:[0],
  activityName:['',Validators.required],
  activityDescription:['',Validators.required],
  activityDurationInMins:[null,Validators.required],
  isActive:true,
  activityMaterial:['',Validators.required],
  activityGroup:['',Validators.required],
  
})
  }

  ngOnInit(){
    this.GetActivityList();
  }

  onSubmit(){
    if(this.activityForm.valid){
      this.activityForm.patchValue({
        id:this.activityForm.id=null?0:this.activityForm.value.id
      })

      this.activityService.ManageActivity(this.activityForm.value).subscribe(data=>{
        if(data.message=="Ok"){
          if(this.activityForm.get("id").value>0)
          {
            this.toastr.success("Data updated successfully")
          }
          else{
            this.toastr.success("Data saved successfully")
          }
        }

        else if(data.message=="Activity group name already exists"){
          this.toastr.warning("Activity group name already exists")
                  }
                  
        $("#exampleModal").modal('hide'); 
        this.reset();
        this.isEditMode = false;
        this.GetActivityList();
        
      })
    }
    this.activityForm.markAllAsTouched();
  }



  GetActivityList(){
   const activityBo={
    searchText:"",
    isActive:true
   }
    this.activityService.GetAllActivities(activityBo).subscribe(data=>{
if(data.message=="Ok"){
  this.activityList=data.result

}
    })
  }

  onEdit(id:any){

    this.activityService.GetActivityById(id).subscribe(data=>{
      this.isEditMode = true;
      if(data.message=="OK"){
        this.activityValue=data.result;
        this.activityForm.patchValue({
          id:this.activityValue.activityID,
          activityName :this.activityValue.activityName,
          activityDescription :this.activityValue. activityDescription,
          activityDurationInMins:this.activityValue. activityDurationInMins,
          activityMaterial:this.activityValue.activityMaterial,  
          activityGroup:this.activityValue.activityGroup,
         
          isActive:this.activityValue.isActive
        })
      }
    })
  }


  activeInactive(id:any,isActive:any){
    var action="Activated";
    Swal.fire({
      title:"Confirmation",
      text:isActive? "Are you sure you want to deactivate the activity?":"Are you sure you want to activate the activity?",
      icon:"question",
      showCancelButton:true,
      confirmButtonColor:'#297084',
      cancelButtonColor:'#686767',
      confirmButtonText:isActive?"Confirm":"Confirm"
    }).then(result=>{
      if(result.isConfirmed){
        if(isActive==true){
          action="Deactivated"
        }
        this.activityService.ActiveInactiveById(id).subscribe(data=>{
          this.toastr.success("Activity has been " +action+ " successfully")
          this.GetActivityList();
        })
      }
      else{
        function check(){
          $("#check"+id).prop("checked",true)
        }
        function uncheck(){
          $("#check"+id).prop("checked",false)
        }
        isActive?check():uncheck()
      }
     
    })
  }


  get input(){
    return this.activityForm.controls;
  }


  reset(){
    this.activityForm.reset({
      id:0,
  activityName:'',
  activityDescription:'',
  activityDurationInMins:'',
  isActive:true,
  activityMaterial:'',
  activityGroup:'',
    })
  }

  cancel(){
       this.reset();
  }

  openAddActivityModal() {
    this.isEditMode = false;
    this.reset();   
  }

}
