import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GangDetailsComponent } from './gang-details.component';

describe('GangDetailsComponent', () => {
  let component: GangDetailsComponent;
  let fixture: ComponentFixture<GangDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GangDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GangDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
