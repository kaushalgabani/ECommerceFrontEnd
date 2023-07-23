import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { CheckOutFormService } from 'src/app/services/check-out-form.service';

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

  countries: Country[] =[];

  shippingAddressStates: State[] =[];
  billingAddressStates: State[] =[];

  constructor(private formBuilder: FormBuilder, private checkOutForm: CheckOutFormService) { }

  ngOnInit() {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: ['', [Validators.required, Validators.minLength(3)]],
        lastName: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]]
      }),
      shippingAddress: this.formBuilder.group({
        country: [''],
        street: [''],
        city: [''],
        state: [''],
        zipCode: ['']
      }),
      billingAddress: this.formBuilder.group({
        country: [''],
        street: [''],
        city: [''],
        state: [''],
        zipCode: ['']
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expiorationMonth: [''],
        expiorationYear: ['']
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
      data=>{
        console.log("Retrieve countries: ", JSON.stringify(data));
        this.countries = data;
      }
    )
  }

  get firstName() {return this.checkoutFormGroup.get('customer')?.get('firstName');}
  get lastName() {return this.checkoutFormGroup.get('customer')?.get('lastName');}
  get email() {return this.checkoutFormGroup.get('customer')?.get('email');}

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
      data=>{
        console.log("Retrieve credit card months: ", JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );
  }

  getStates(formGroupName: string){
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);

    this.checkOutForm.getStates(countryCode).subscribe(
      data => {
        if(formGroupName === 'shippingAddress'){
          this.shippingAddressStates = data;
        }else{
          this.billingAddressStates = data;
        }

        //select first item by default
        formGroup?.get('state')?.setValue(data[0]);
      }
    );
  }

  onSubmit() {
    console.log("Handling the submit button");

    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
    }

    console.log(this.checkoutFormGroup.get("customer")?.value);

    console.log("The shipping address country is " +this.checkoutFormGroup.get('shippingAddress')?.value.country.name);
    console.log("The shipping address state is " +this.checkoutFormGroup.get('shippingAddress')?.value.state.name);
  }
}
