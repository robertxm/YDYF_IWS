import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { LocalStorage } from '../../providers/local-storage';
import { NativeService } from '../../providers/nativeservice';
import { APP_SERVE_URL } from '../../providers/Constants';
import { HttpService } from '../../providers/HttpService';
import { initBaseDB } from '../../providers/initBaseDB';

@Component({
  selector: 'page-addmembermanual',
  templateUrl: 'addmembermanual.html'
})
export class AddmembermanualPage {
  projid: string;
  name: string;
  phone: string;
  token: string;
  constructor(public navCtrl: NavController, public params: NavParams, public localStorage: LocalStorage, public nativeservice: NativeService,
    private httpService: HttpService, public initBaseDB: initBaseDB) {
    this.projid = this.params.get('projid');
    this.name = ""; this.phone = '';
    this.localStorage.getItem("curuser").then(val => {
      this.token = val.token;
    })
  }

  submitclick() {
    console.log({ token: this.token, Projid: this.projid, Userid: this.phone, Name: this.name });
    this.nativeservice.isConnecting().then((val: boolean) => {
      if (val == true) {
        this.httpService.post(APP_SERVE_URL + '/AppLogin/AddUser', { Token: this.token, ProjId: this.projid, UserId: this.phone, Name: this.name }).then(res => {
          console.log(res);
          if (res[0][0][0] == "true") {
            let now = new Date();
            let id = "builder" + now.getTime().toString();
            let userid = res[0][0][2];
            let values = ["'" + id + "'", "'" + this.projid + "'", "'" + userid + "'", this.phone, "'" + this.name + "'"];
            this.initBaseDB.addProjTeamMembers(this.projid, this.phone, values.join(",")).then(val => {
              this.nativeservice.showToast("添加成功.");
              this.navCtrl.pop();
            })
          }
          else {
            this.nativeservice.showToast("添加失败.");
            console.log(res[0][0][1]);
          }
        }).catch(e => {
          alert(e);
          console.log(e);
        })
      }
    })
  }
}
