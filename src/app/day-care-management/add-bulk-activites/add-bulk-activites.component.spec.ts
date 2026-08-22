import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBulkActivitesComponent } from './add-bulk-activites.component';

describe('AddBulkActivitesComponent', () => {
  let component: AddBulkActivitesComponent;
  let fixture: ComponentFixture<AddBulkActivitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBulkActivitesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddBulkActivitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
