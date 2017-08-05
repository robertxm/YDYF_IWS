import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { LocalStorage } from '../../providers/local-storage';
import { NativeService } from '../../providers/nativeservice';
import { APP_SERVE_URL } from '../../providers/Constants';
import { HttpService } from '../../providers/HttpService';
import { initBaseDB } from '../../providers/initBaseDB';

@Component({
  selector: 'page-addphonecontacts',
  templateUrl: 'addphonecontacts.html'
})
export class AddphonecontactsPage {
  items: Array<any>;
  projid: string;
  token: string;
  constructor(public navCtrl: NavController, public params: NavParams, public localStorage: LocalStorage, public nativeservice: NativeService,
    private httpService: HttpService, public initBaseDB: initBaseDB) {
    this.items = [];
    this.items = this.params.get('items');
    this.projid = this.params.get('projid');
    this.localStorage.getItem("curuser").then(val => {
      this.token = val.token;
    })
    // this.items.push({name:'name1', phone:'234576890198', added: false, btnname: "添加"});
    // this.items.push({name:'name2', phone:'221576890198', added: true, btnname: "已添加"});
    // this.items.push({name:'name3', phone:'323576890198', added: true, btnname: "已添加"});
    // this.items.push({name:'name4', phone:'438576890198', added: false, btnname: "添加"});
  }

  addclick(item) {
    this.nativeservice.isConnecting().then((val: boolean) => {
      if (val == true) {
        this.httpService.post(APP_SERVE_URL + '/AppLogin/AddUser', { Token: this.token, ProjId: this.projid, UserId: item.phone, Name: item.name }).then(res => {
          console.log(res);
          if (res[0][0][0] == "true") {
            let now = new Date();
            let id = "builder" + now.getTime().toString();
            let userid = res[0][0][2];
            let values = ["'" + id + "'", "'" + this.projid + "'", "'" + userid + "'", item.phone, "'" + item.name + "'"];
            this.initBaseDB.addProjTeamMembers(this.projid, item.phone, values.join(",")).then(val => {
              let i = this.items.indexOf(item);
              this.items[i].added = true;
              this.items[i].btnname = "已添加";
              this.nativeservice.showToast("添加成功.");
            }).catch(e => {
              alert(e);
              console.log(e);
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
