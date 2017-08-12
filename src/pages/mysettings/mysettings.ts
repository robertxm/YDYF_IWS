import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AboutPage } from '../about/about'
import { Dialogs } from '@ionic-native/dialogs';
import { LocalStorage } from '../../providers/local-storage';
import { NativeService } from '../../providers/nativeservice';
import { LoginPage } from '../login/login';
import { initBaseDB } from '../../providers/initBaseDB';

@Component({
  selector: 'page-mysettings',
  templateUrl: 'mysettings.html'
})
export class MysettingsPage {
  username: string;
  networkchecked: boolean;
  first: boolean;
  projname: string;
  projnames: Array<string>;
  projids: Array<string>;
  projid: string;
  versionids: Array<number>;
  needupds: Array<number>;
  vendrole: boolean;
  token: string;
  constructor(public navCtrl: NavController, private dialogs: Dialogs, public params: NavParams, public localStorage: LocalStorage, public initBaseDB: initBaseDB,
    public nativeservice: NativeService) {
    this.username = this.params.get('username');
    this.vendrole = this.params.get('vendrole');
    this.token = this.params.get('token');
    this.first = false;
  }
  ngOnInit() {
    this.localStorage.getItem('networkalways').then(val => {
      this.networkchecked = !val;
      if (this.networkchecked == false) {
        this.first = true;
      }
    });
    this.localStorage.getItem('curproj').then(val => {
      this.projname = val.projname;
      this.projid = val.projid;
    })
    this.projnames = [];
    this.projids = [];
    this.versionids = [];
    this.needupds = [];
    this.initBaseDB.getProjVersion().then(val => {
      let items: Array<any>;
      items = val;
      console.log('items,' + val);
      for (var i = 0; i < items.length; i++) {
        console.log(items[i]);
        this.projnames.push(items[i].projname);
        this.projids.push(items[i].projid);
        this.versionids.push(items[i].version);
        this.needupds.push(items[i].needupd);
      }
    })
  }
  networkchange(event) {
    console.log(event.checked);
    console.log(this.networkchecked);
    this.networkchecked = event.checked;
    this.localStorage.setItem('networkalways', this.networkchecked);
    this.nativeservice.showToast("设置成功");
  }

  projchange(event) {
    console.log(this.versionids);
    let i = this.projnames.indexOf(this.projname, 0);
    
    this.localStorage.setItem('curproj', { projid: this.projids[i], projname: this.projname, versionid: this.versionids[i], needupd: this.needupds[i] }).then(val => {
      this.localStorage.getItem('curuser').then(v => {
        this.nativeservice.showLoading('处理中，请稍侯...')
        this.initBaseDB.checkandupdprojversion(this.projids[i], v.token, this.versionids[i], v.vendrole).then(v => {
          console.log(v);
          this.nativeservice.hideLoading();
          this.nativeservice.showToast("设置成功");
        }).catch(err=>{
          this.nativeservice.hideLoading();
        })
      })
    }).catch(e => alert(e));
  }

  aboutclick() {
    this.navCtrl.push(AboutPage);
  }

  logoutclick() {
    this.initBaseDB.checkuploadflag(this.projid, this.vendrole).then(v => {
      if (v == true) {
        this.dialogs.confirm('存在未上传数据，是否先上传数据？', '', ['暂不上传', '全部上传'])
          .then(val => {
            if (val == 2) {
              this.initBaseDB.uploadall(this.projid, this.token, this.vendrole);
            } else {
              this.dialogs.confirm('确定要退出吗?', '', ['取消', '确定'])
                .then(val => {
                  if (val == 2) {
                    this.localStorage.removeitem('curuser');
                    this.localStorage.removeitem('curproj');
                    this.navCtrl.push(LoginPage);
                  }
                })
                .catch(e => console.log('Error displaying dialog', e));
            }
          })
      } else {
        this.dialogs.confirm('确定要退出吗?', '', ['取消', '确定'])
          .then(val => {
            if (val == 2) {
              this.localStorage.removeitem('curuser');
              this.localStorage.removeitem('curproj');
              this.navCtrl.push(LoginPage);
            }
          })
          .catch(e => console.log('Error displaying dialog', e));
      }
    })

  }

  clearcacheclick() {
    this.dialogs.confirm('清除数据将清除您全部已下载的楼栋数据和未上传的问题数据。', '', ['放弃清除', '继续清除'])
      .then(val => {
        if (val == 2) {
          //清除楼栋基础包、动态包
          this.nativeservice.showLoading("清除中...", 30000);
          this.initBaseDB.cleardynamicData(this.projid, this.vendrole).then(v => {
            this.nativeservice.hideLoading();
            this.nativeservice.showToast("清除完成.");
          }).catch(e => {
            this.nativeservice.hideLoading();
            console.log('清除失败')
          })
        }
      })
      .catch(e => console.log('Error displaying dialog', e));
  }
}
