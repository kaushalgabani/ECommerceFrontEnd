import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckOutFormService } from 'src/app/services/check-out-form.service';
import { Validation } from 'src/app/validators/validation';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {

  checkoutFormGroup: FormGroup = new FormGroup({});

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardMonths: number[] = [];
  creditCardYears: number[] = [];

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(private formBuilder: FormBuilder, private checkOutForm: CheckOutFormService, private cartService: CartService) { }

  ngOnInit() {
    //Review cart details
    this.reviewCartDetails();

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: ['', [Validators.required, Validators.minLength(3), Validation.notOnlyWhiteSpace]],
        lastName: ['', [Validators.required, Validators.minLength(3), Validation.notOnlyWhiteSpace]],
        email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]]
      }),
      shippingAddress: this.formBuilder.group({
        country: ['', Validators.required],
        street: ['', [Validators.required, Validators.minLength(3), Validation.notOnlyWhiteSpace]],
        city: ['', [Validators.required, Validators.minLength(3), Validation.notOnlyWhiteSpace]],
        state: ['', Validators.required],
        zipCode: ['', [Validators.required, Validators.minLength(6), Validation.notOnlyWhiteSpace]]
      }),
      billingAddress: this.formBuilder.group({
        country: ['', Validators.required],
        street: ['', [Validators.required, Validators.minLength(3), Validation.notOnlyWhiteSpace]],
        city: ['', [Validators.required, Validators.minLength(3), Validation.notOnlyWhiteSpace]],
        state: ['', Validators.required],
        zipCode: ['', [Validators.required, Validators.minLength(6), Validation.notOnlyWhiteSpace]]
      }),
      creditCard: this.formBuilder.group({
        cardType: ['', Validators.required],
        nameOnCard: ['', [Validators.required, Validators.minLength(3), Validation.notOnlyWhiteSpace]],
        cardNumber: ['', [Validators.required, Validators.pattern('[0-9]{16}')]],
        securityCode: ['', [Validators.required, Validators.pattern('[0-9]{3}')]],
        expiorationMonth: ['', Validators.required],
        expiorationYear: ['', Validators.required]
      })
    });

    // Populate months
    const stateMonth: number = new Date().getMonth() + 1;
    console.log("Start month: ", stateMonth);

    this.checkOutForm.getCreditCardMonths(stateMonth).subscribe(
      data => {
        console.log("Retrieve credit card months: ", JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );

    // Populate years
    this.checkOutForm.getCreditCardYears().subscribe(
      data => {
        console.log("Retrieve credit card years: ", JSON.stringify(data));
        this.creditCardYears = data;
      }
    )

    // Populate countries
    this.checkOutForm.getCountries().subscribe(
      data => {
        console.log("Retrieve countries: ", JSON.stringify(data));
        this.countries = data;
      }
    )
  }

  get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }

  get shippingStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingState() { return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }
  get shippingZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode'); }

  get billingStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingCity() { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingState() { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }
  get billingZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }

  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType'); }
  get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get creditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode'); }
  get creditCardExpMonth() { return this.checkoutFormGroup.get('creditCard.expiorationMonth'); }
  get creditCardExpYear() { return this.checkoutFormGroup.get('creditCard.expiorationYear'); }

  copyShippingAddToBillingAdd(event: any) {
    if (event.target.value) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates = [];
    }
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expiorationYear); //get selected year value from the form

    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.checkOutForm.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieve credit card months: ", JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);

    this.checkOutForm.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        } else {
          this.billingAddressStates = data;
        }

        //select first item by default
        formGroup?.get('state')?.setValue(data[0]);
      }
    );
  }

  reviewCartDetails() {
    //subscribe totalQuantity
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

    //subscribe totalPrice
    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );
  }

  onSubmit() {
    console.log("Handling the submit button");

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
    }

    console.log(this.checkoutFormGroup.get("customer")?.value);

    console.log("The shipping address country is " + this.checkoutFormGroup.get('shippingAddress')?.value.country.name);
    console.log("The shipping address state is " + this.checkoutFormGroup.get('shippingAddress')?.value.state.name);
  }
}
