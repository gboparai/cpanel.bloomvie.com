import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonLoaderComponent } from './skeleton-loader.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('SkeletonLoaderComponent', () => {
  let component: SkeletonLoaderComponent;
  let fixture: ComponentFixture<SkeletonLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonLoaderComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(SkeletonLoaderComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkeletonLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the SkeletonLoaderComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.skeletonShow).toBe('Skelton');
    expect(component.viewType).toBe('card');
    expect(component.cardCount).toBe(6);
    expect(component.tableRows).toBe(4);
    expect(component.tableCols).toBe(8);
    expect(component.activityCount).toBe(8);
    expect(component.workDays).toBe(8);
  });

  it('should return correct array lengths from getters', () => {
    expect(component.rows.length).toBe(4);
    expect(component.cols.length).toBe(8);
    expect(component.cards.length).toBe(6);
    expect(component.activity.length).toBe(8);
    expect(component.workDay.length).toBe(8);
  });

  it('should reflect custom counts in getters', () => {
    component.cardCount = 10;
    component.tableRows = 2;
    component.tableCols = 5;

    expect(component.cards.length).toBe(10);
    expect(component.rows.length).toBe(2);
    expect(component.cols.length).toBe(5);
  });
});
