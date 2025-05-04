import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { GideonNavComponent } from './gideon-nav.component';

describe('GideonNavComponent', () => {
  let component: GideonNavComponent;
  let fixture: ComponentFixture<GideonNavComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GideonNavComponent],
      imports: [
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatSidenavModule,
        MatToolbarModule,
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GideonNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});
