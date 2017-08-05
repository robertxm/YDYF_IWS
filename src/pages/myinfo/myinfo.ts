import { Component } from '@angular/core';
import { NavController, NavParams} from 'ionic-angular';
import {AboutPage} from '../about/about'
import {ChangePWPage} from '../changepw/changepw'

@Component({
  selector: 'page-myinfo',
  templateUrl: 'myinfo.html'
})
export class MyinfoPage {
  username:string;
  canchangePW:boolean = false;
  constructor(public navCtrl: NavController, public params: NavParams) {
    this.username = this.params.get('username');
    this.canchangePW = this.params.get('canchangePW');
  }

  changePWclick(){
    this.navCtrl.push(ChangePWPage,{"first":false});
  }
  
}
