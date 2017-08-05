import { Component } from '@angular/core';
import { NavController, NavParams, ViewController} from 'ionic-angular';
import {AboutPage} from '../about/about'

@Component({
  selector: 'page-issuereturn',
  templateUrl: 'issuereturn.html'
})
export class IssuereturnPage {
  returnreason:string;
  otherdesc:string;
  constructor(public navCtrl: NavController, public params: NavParams, private viewCtrl: ViewController) {
    this.returnreason = "还未维修处理";
    this.otherdesc = '';
  }

  confirmclick(){
    console.log(this.returnreason+this.otherdesc);
    let result = this.returnreason;
    if (this.returnreason == '其他'){
      result = this.otherdesc;
    }
    this.viewCtrl.dismiss(result);
  }
  
}
