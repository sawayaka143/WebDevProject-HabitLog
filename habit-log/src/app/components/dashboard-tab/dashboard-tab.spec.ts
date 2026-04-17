import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTabComponent } from './dashboard-tab';

describe('DashboardTabComponent', () => {
  let component: DashboardTabComponent;
  let fixture: ComponentFixture<DashboardTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardTabComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
