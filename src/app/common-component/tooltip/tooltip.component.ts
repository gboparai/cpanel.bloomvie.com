import { Component,Input } from '@angular/core';

@Component({
  selector: 'app-tooltip',
   standalone: true, 
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.css']
})
export class TooltipComponent {
  @Input() employee:{
    fullName?:string;
    email?:string;
    profile?:string
  }={
    fullName:'',
    email:'',
    profile:''
  };
}
