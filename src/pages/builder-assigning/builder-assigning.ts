import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-builder-assigning',
  templateUrl: 'builder-assigning.html',
})
export class BuilderAssigning {

  persons = [{id:'1090390293',name:'李小龙',phone:'13709881234'},
  {id:'1092393832',name:'黄龙城',phone:'13709880392'},
  {id:'1073838727',name:'吴波',phone:'13709880399'},
  {id:'1079237721',name:'李德江',phone:'13458859323'},
  {id:'1108377282',name:'刘德华',phone:'13694830992'},
  {id:'1297384923',name:'郭富城',phone:'13890002882'},
  {id:'1384943232',name:'黎明',phone:'13908747882'},];
  issues = [];
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.issues = navParams.get('issues');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BuilderAssigning');
  }

  personclick(id:string){
     if (this.issues == undefined || this.issues.length < 1) {
      alert("未选择有效的问题，请返回！");
    } else {
      for (var i = 0; i < this.issues.length; i++) {
        alert("SET person "+ id + " to " + this.issues[i]);
      }
    }
    this.navCtrl.pop();
  }

}
