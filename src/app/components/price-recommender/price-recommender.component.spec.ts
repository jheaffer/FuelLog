import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceRecommenderComponent } from './price-recommender.component';

describe('PriceRecommenderComponent', () => {
  let component: PriceRecommenderComponent;
  let fixture: ComponentFixture<PriceRecommenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceRecommenderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceRecommenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
