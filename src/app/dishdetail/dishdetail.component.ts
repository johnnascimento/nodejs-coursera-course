import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { subscribeOn, switchMap } from 'rxjs/operators';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { DishDetailFeedback } from '../shared/dishDetailFeedBack';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
    selector: 'app-dishdetail',
    templateUrl: './dishdetail.component.html',
    styleUrls: ['./dishdetail.component.scss'],
    animations: [
        trigger('visibility', [
            state('shown', style({
                transform: 'scale(1.0)',
                opacity: 1
            })),
            state('hidden', style({
                transform: 'scale(0.5)',
                opacity: 0
            })),
            transition('shown => hidden', animate('0.1s ease-in-out')),
            transition('hidden => shown', animate('0.4s ease-in-out'))
        ])
    ]
})
export class DishdetailComponent implements OnInit {

    @ViewChild('dishfform') feedbackFormDirective;

    dish: Dish;
    dishcopy: Dish;
    errMsg: string;
    dishIds: string[];
    prev: string;
    next: string;
    dishDetailFeedbackForm: FormGroup;
    dishDetailFeedback: DishDetailFeedback;
    visibility = 'shown';

    formErrors = {
        'author': '',
        'comment': ''
    };

    validationMessages = {
        'author': {
            'required':      'Name is required.',
            'minlength':     'Name must be at least 2 characters long.',
            'maxlength':     'Name cannot be more than 25 characters long.'
        },
        'comment': {
            'required':      'Message is required.',
            'minlength':     'Message must be at least 2 characters long.',
        }
    };

    constructor(
        private dishService: DishService,
        private route: ActivatedRoute,
        private location: Location,
        private fb: FormBuilder,
        @Inject('BaseURL') private BaseURL: string) {}

    createForm(): void {
        this.dishDetailFeedbackForm = this.fb.group({
            author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
            rating: 0,
            comment: ['', [Validators.required, Validators.minLength(2)] ],
            date: new Date().toISOString()
        });

        this.dishDetailFeedbackForm.valueChanges
            .subscribe(data => this.onValueChanged(data));

        this.onValueChanged(); // (re)set validation messages now
    }

    onValueChanged(data?: any) {
        if (!this.dishDetailFeedbackForm) { return; }

        const form = this.dishDetailFeedbackForm;

        for (const field in this.formErrors) {
            if (this.formErrors.hasOwnProperty(field)) {
                // clear previous error message (if any)
                this.formErrors[field] = '';
                const control = form.get(field);

                if (control && control.dirty && !control.valid) {
                    const messages = this.validationMessages[field];

                    for (const key in control.errors) {
                        if (control.errors.hasOwnProperty(key)) {
                            this.formErrors[field] += messages[key] + ' ';
                        }
                    }
                }
            }
        }
    }

    resetFormInputs(formValue) {
        formValue.reset({
            author: '',
            rating: '',
            comment: '',
            date: ''
        });

        this.feedbackFormDirective.resetForm();
    }

    insertComment(data?) {
        this.dishcopy.comments.push(data);
    }

    onSubmit() {
        this.dishDetailFeedback = this.dishDetailFeedbackForm.value;

        if(!this.dishDetailFeedbackForm.invalid) {
            this.insertComment(this.dishDetailFeedback);
            this.resetFormInputs(this.dishDetailFeedbackForm);
            this.dishService.putDish(this.dishcopy)
                .subscribe(dish => {
                    this.dish = dish;
                    this.dishcopy = dish;
                }),
                errmsg => {
                    this.dish = null;
                    this.dishcopy = null;
                    this.errMsg = <any>errmsg;
                }
        }
    }

    ngOnInit() {
        this.createForm();

        this.dishService.getDishIds()
            .subscribe(dishIds => this.dishIds = dishIds);
        this.route.params
            .pipe(
                switchMap(
                    (params: Params) => {
                        this.visibility = 'hidden';
                        return this.dishService.getDish(params['id']);
                    }
                )
            )
            .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id);
                setTimeout(
                    () => {
                        this.visibility = 'shown';
                    }, 1500
                );
            },
            errmsg => this.errMsg = <any>errmsg);
    }

    setPrevNext(dishId: string) {
        const index = this.dishIds.indexOf(dishId);
        this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
        this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
    }

    goBack(): void {
        this.location.back();
    }
}