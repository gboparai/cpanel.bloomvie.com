import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TocViewComponent } from './toc-view.component';

describe('TocViewComponent', () => {
  let component: TocViewComponent;
  let fixture: ComponentFixture<TocViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TocViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TocViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
