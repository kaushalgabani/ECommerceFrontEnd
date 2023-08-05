import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];

  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  constructor() { }

  addToCart(theCartItem: CartItem) {
    //check if we already have item in the cart
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem | null = null;

    if (this.cartItems.length > 0) {
      //find the item in the cart based on item id
      existingCartItem = this.cartItems.find(tmpCartItem => tmpCartItem.id === theCartItem.id) as CartItem | null;
    }

    //check if we found it
    alreadyExistsInCart = (existingCartItem != undefined);

    if (existingCartItem != null) {
      //increment the quantity 
      existingCartItem.quantity++;
    } else {
      //add item to the array
      this.cartItems.push(theCartItem);
    }

    // calculate cart total price and total quantity
    this.computeCartTotals();
  }

  removeFromCart(theCartItem: CartItem) {
    theCartItem.quantity--;
    if (theCartItem.quantity === 0) {
      this.remove(theCartItem);
    } else {
      this.computeCartTotals();
    }
  }

  remove(theCartItem: CartItem) {
    // get index of item from an array
    const itemIndex = this.cartItems.findIndex(tmpIndex => tmpIndex.id === theCartItem.id);

    // if found, remove the item from the array at the given index
    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);

      this.computeCartTotals();
    }
  }

  computeCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let tmpCartItem of this.cartItems) {
      totalPriceValue += tmpCartItem.quantity * tmpCartItem.unitPrice;
      totalQuantityValue += tmpCartItem.quantity;
    }

    // publish the new values, all the subscribers will receive new data
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    // log cart data 
    this.logCartData(totalPriceValue, totalQuantityValue);
  }

  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    console.log('Contents of the cart');

    for (let tmpCartItem of this.cartItems) {
      const subTotalPrice = tmpCartItem.quantity * tmpCartItem.unitPrice;
      console.log(`Item name: ${tmpCartItem.name}, Quantity: ${tmpCartItem.quantity}, Unit Price: ${tmpCartItem.unitPrice}, Sub Total Price: ${subTotalPrice}`);
    }

    console.log(`Total Price: ${totalPriceValue.toFixed(2)}, Total Quantity: ${totalQuantityValue}`);
    console.log(`-----------------------------`);
  }
}
