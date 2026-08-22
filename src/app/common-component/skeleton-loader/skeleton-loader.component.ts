import { Component, Input } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './skeleton-loader.component.html',
  styleUrls: ['./skeleton-loader.component.css'],
})
export class SkeletonLoaderComponent {
  @Input() skeletonShow: 'Skelton' | 'NoRecord' | '' = 'Skelton';
  @Input() skeletonShow2 = 'Skelton2';
  @Input() skeletonShowList = 'SkeltonList';
  @Input() skeletonShowList2 = 'SkeltonList2';
  @Input() skeletonShowList3 = 'SkeltonList3';
  @Input() tocSkeletonShow = 'tocSkeltonList';
  @Input() skeletonShowCalenderCard = 'SkeltonCalenderCard';
  @Input() holidaySkeleton = 'holidays';
  @Input() workTimeskeleton = 'workTimeskeleton';
  @Input() skeletonShow3 = 'Skelton3';
  @Input() planInfoskeletonShow = 'PlanInfo';



  @Input() viewType:
    | 'carousel'
    | 'table'
    | 'day-toggle'
    | 'age-Group'
    | 'facility'
    | 'add-Activity'
    | 'Add-Age-Group'
    | 'month-checkbox-list'
    | 'work-days-timing'
    | 'staff-assignment'
    | 'section-form'
    | 'card'
    | 'plan-feature-list'
    | 'manageDay'
    | 'counsellor'
    | 'StudentActivity'
    | 'chat'
    | 'profile'
    | 'logo'
    | 'attendance' 
    | 'profileImage'
    | 'user-info-card' 
    | 'activity-list'
    | 'calendar-cards'
    | 'photoRound'
    | 'toc-schedule'
    | 'weekly-availability'
    | 'plan-Information'
    | 'studentActivityEdit'
    
    = 'card';
  @Input() cardCount: number = 6;
  @Input() tableRows: number = 4;
  @Input() tableCols: number = 8;
  @Input() activityCount: number = 8;
  @Input() workDays: number = 8;

  get rows() {
    return Array(this.tableRows);
  }

  get cols() {
    return Array(this.tableCols);
  }

  get cards() {
    return Array(this.cardCount);
  }

  get activity() {
    return Array(this.activityCount);
  }

  get workDay() {
    return Array(this.workDays);
  }
}
