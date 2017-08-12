import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { LocalStorage } from '../../providers/local-storage';
import { initBaseDB } from '../../providers/initBaseDB';
import { TabsPage } from '../tabs/tabs';
import { NativeService } from '../../providers/nativeservice';
import { Md5 } from "ts-md5/dist/md5";
import { APP_SERVE_URL } from '../../providers/Constants';
import { HttpService } from '../../providers/HttpService';

@Component({
  selector: 'page-changepw',
  templateUrl: 'changepw.html'
})
export class ChangePWPage {
  confirmedpassword: string;
  password: string;
  userid: string;
  token: string;
  vendrole: boolean;
  first: boolean;
  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public localStorage: LocalStorage, public initBaseDB: initBaseDB, public params: NavParams,
    public nativeservice: NativeService, private httpService: HttpService) {
    this.first = this.params.get('first');
    this.localStorage.getItem("curuser").then(val => {
      this.userid = val.userid;
      this.token = val.token;
      this.vendrole = val.vendrole;
    })
    // let elements = document.querySelectorAll(".tabbar");
    // if (elements != null) {
    //   Object.keys(elements).map((key) => {
    //     elements[key].style.display = 'none';
    //   });
    // }
  }

  changeclick() {
    if (this.password != this.confirmedpassword)
      this.nativeservice.alert("两次输入不一致,请重新输入!");
    else {
      this.nativeservice.isConnecting().then((val: boolean) => {
        if (val == true) {
          this.httpService.get(APP_SERVE_URL + '/AppLogin/PWChange', { token: this.token, password: this.nativeservice.encode64(this.userid + "$" + this.password) }).then(res => {
            this.initData(res[0]).then(v => {
              this.nativeservice.showToast("修改成功");
              this.navCtrl.pop();
            })
          }).catch(e=>{
            console.log(e);
            this.nativeservice.showToast("修改失败");
          })          
        }})
      }

  }

    ionViewWillLeave() {
      // let elements = document.querySelectorAll(".tabbar");
      // if (elements != null) {
      //   Object.keys(elements).map((key) => {
      //     elements[key].style.display = 'flex';
      //   });
      // }
    }

    ionViewCanLeave(): boolean {
      // here we can either return true or false
      // depending on if we want to leave this view
      if (this.first == false) {
        return true;
      } else {
        return false;
      }
    }

    initData(items): Promise < any > {
      return new Promise((resolve) => {
        console.log(items);
        let duetime = items[1].AllowEnd;
        console.log(duetime);
        this.first = false;
        if (duetime > new Date().getTime()) {
          resolve(this.localStorage.setItem('curuser', { userid: this.userid, token: items[1].Token, duetime: items[1].AllowEnd, username: items[1].username, vendrole: this.vendrole }));
        } else {
          resolve(1);
        }
      })
    }
  }
