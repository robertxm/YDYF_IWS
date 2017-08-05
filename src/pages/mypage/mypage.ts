import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AboutPage } from '../about/about'
import { MyinfoPage } from '../myinfo/myinfo'
import { MysettingsPage } from '../mysettings/mysettings'
import { LocalStorage } from '../../providers/local-storage';
import { MyTeamPage } from '../myteam/myteam';

@Component({
  selector: 'page-mypage',
  templateUrl: 'mypage.html'
})
export class MyPage {
  username: string;
  vendrole: boolean;
  userrole: Array<string> = [];
  constructor(public navCtrl: NavController, public localStorage: LocalStorage) {

    this.localStorage.getItem('curuser').then(val => {
      this.username = val.username;
      this.vendrole = val.vendrole;
      this.userrole = val.userrole;
    })    
  }

  aboutclick() {
    this.navCtrl.push(AboutPage);
  }

  myinfoclick() {
    this.navCtrl.push(MyinfoPage, { username: this.username, canchangePW:this.userrole.indexOf('B1') != -1 });
  }

  mysettingsclick() {
    this.navCtrl.push(MysettingsPage, { username: this.username, vendrole:this.vendrole });
  }
   
  myteamclick() {
    this.navCtrl.push(MyTeamPage);
  }
}
