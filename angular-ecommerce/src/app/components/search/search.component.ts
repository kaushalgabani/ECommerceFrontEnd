import { Component } from '@angular/core';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {

  constructor(private router: Router){}

  ngOnInit(){

  }

  doSearch(value: string){
    console.log(`Value=${value}`);
    this.router.navigateByUrl(`/search/${value}`);
  }
}
