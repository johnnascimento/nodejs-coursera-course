import { Component, OnInit, Inject } from '@angular/core';

import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';

import { Promotion } from '../shared/promotion';
import { PromotionService } from '../services/promotion.service';

import { Leader } from "../shared/leader";
import { LeaderService } from "../services/leader.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  dish: Dish;
  dishErrMsg: string;
  promotion: Promotion;
  leader: Leader;

  constructor(
    private dishServices: DishService,
    private promotionService: PromotionService,
    private leaderService: LeaderService,
    @Inject('BaseURL') private BaseURL: string) {}

  ngOnInit() {
    this.dishServices.getFeaturedDish()
      .subscribe((dish) => this.dish = dish,
        errmsg => this.dishErrMsg = errmsg);

    this.promotionService.getFeaturedPromotion()
      .subscribe((promotion) => this.promotion = promotion);

      this.leaderService.getFeaturedLeader()
      .subscribe((leader) => this.leader = leader);
  }
}