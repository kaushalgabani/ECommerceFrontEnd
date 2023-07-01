import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/common/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent {

  products!: Product[];
  currentCategoryId!  : number;
  searchMode!: boolean;

  constructor(private productService: ProductService, private route: ActivatedRoute){}

  ngOnInit(){
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  listProducts(){
    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    if(this.searchMode){
      this.handleSearchProducts();
    }else{
      this.handleListProducts();
    }

  }

  handleListProducts(){

    //Check if "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if(hasCategoryId){
      //get the "id" param string. convert string into a number using "+" symbol
      this.currentCategoryId = Number(this.route.snapshot.paramMap.get('id'));
    }else{
      // no category id available.. default to category id 1
      this.currentCategoryId = 1;
    }
    //now get the products for the given category
    this.productService.getProductList(this.currentCategoryId).subscribe(data => {
      this.products = data;
    })
  }

  handleSearchProducts(){
    const theKeyword = this.route.snapshot.paramMap.get('keyword');

    // search for the product using keyword
    if(theKeyword){
      this.productService.searchProducts(theKeyword).subscribe(
        data=>{
          this.products = data;
        });
    }
  }
}
