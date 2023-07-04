import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';
import { GetResponseProducts } from 'src/app/services/product.service';


@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent {

  products: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  searchMode: boolean = false;

  //New properties for pagination
  thePageNumber: number = 1;
  thePageSize: number = 5;
  theTotalElements: number = 0;

  previousKeyword: string | null = null;


  constructor(private productService: ProductService,
              private route: ActivatedRoute,
              private cartService: CartService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  listProducts() {
    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    if (this.searchMode) {
      this.handleSearchProducts();
    } else {
      this.handleListProducts();
    }

  }

  handleListProducts() {

    //Check if "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      //get the "id" param string. convert string into a number using "+" symbol
      this.currentCategoryId = Number(this.route.snapshot.paramMap.get('id'));
    } else {
      // no category id available.. default to category id 1
      this.currentCategoryId = 1;
    }

    //Check if we have a different category than previous
    //Note: Angular will reuse a component if it is currently being viewed

    //if we hava a different category id than previous
    //then set thePageNumber back to 1
    if (this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1;
    }

    this.previousCategoryId = this.currentCategoryId;
    console.log(`Current categotyId = ${this.currentCategoryId}, Page Number = ${this.thePageNumber}`);

    //now get the products for the given category
    this.productService.getProductListPaginate(this.thePageNumber - 1,
      this.thePageSize,
      this.currentCategoryId).subscribe(this.processResult);
  }

  handleSearchProducts() {
    const theKeyword = this.route.snapshot.paramMap.get('keyword');

    //if we have different keyword than previous then set thePageNumber to 1
    if (this.previousKeyword != theKeyword) {
      this.thePageNumber = 1;
    }
    this.previousKeyword = theKeyword;

    console.log(`Keyword = ${theKeyword}, Page Number = ${this.thePageNumber}`);

    // search for the product using keyword
    if (theKeyword) {
      this.productService.searchProductPaginate(this.thePageNumber - 1, this.thePageSize, theKeyword).subscribe(this.processResult);
    }
  }

  // a method that adds item to cart
  addToCart(theProduct: Product){
    console.log(`Adding item into cart: ${theProduct.name}, ${theProduct.unitPrice}`);

    const theCartItem = new CartItem(theProduct);

    this.cartService.addToCart(theCartItem);
  }

  processResult = (data: GetResponseProducts) => {
    this.products = data._embedded.products;
    this.thePageNumber = data.page.number + 1;
    this.thePageSize = data.page.size;
    this.theTotalElements = data.page.totalElements;
  };

  updatePageSize(pageSize: number) {
    this.thePageSize = pageSize;
    this.thePageNumber = 1;
    this.listProducts();
  }
}
