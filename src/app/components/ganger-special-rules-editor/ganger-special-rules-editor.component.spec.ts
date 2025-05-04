import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GangerSpecialRulesEditorComponent } from './ganger-special-rules-editor.component';

describe('GangerSpecialRulesEditorComponent', () => {
  let component: GangerSpecialRulesEditorComponent;
  let fixture: ComponentFixture<GangerSpecialRulesEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GangerSpecialRulesEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GangerSpecialRulesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
