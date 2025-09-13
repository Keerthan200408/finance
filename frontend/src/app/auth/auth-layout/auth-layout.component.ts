import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  template: '<router-outlet></router-outlet>',
  styles: [':host { display: block; }']
})
export class AuthLayoutComponent { }