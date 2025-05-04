import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeaponProfilesComponent } from './weapon-profiles.component';

describe('WeaponProfilesComponent', () => {
  let component: WeaponProfilesComponent;
  let fixture: ComponentFixture<WeaponProfilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeaponProfilesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeaponProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
