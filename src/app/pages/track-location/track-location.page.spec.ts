import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrackLocationPage } from './track-location.page';

describe('TrackLocationPage', () => {
  let component: TrackLocationPage;
  let fixture: ComponentFixture<TrackLocationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackLocationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
