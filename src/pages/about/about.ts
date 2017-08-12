import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { NativeService } from '../../providers/nativeservice';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  appversion: string;
  token: string;
  versionstr: string;
  constructor(public navCtrl: NavController, public params: NavParams, private nativeService: NativeService, private alertCtrl: AlertController) {
    this.token = this.params.get('token');
    this.versionstr = '已是最新版本';
    this.nativeService.getVersionNumber().then(val => {
      this.appversion = val;
      this.nativeService.detection(this.token).then(v => {
        if (v && v != '') {
          if (v != this.appversion) {
            this.versionstr = '点击更新最新版本:' + v;
          }
        }
      })
    })
  }

  download() {
    if (this.versionstr != "已是最新版本") {
      this.alertCtrl.create({
        title: '升级',
        subTitle: '发现新版本,是否立即升级？',
        buttons: [{ text: '取消' },
        {
          text: '确定',
          handler: () => {
            this.nativeService.downloadApp(this.token);
          }
        }
        ]
      }).present();
    }
    //this.nativeService.downloadApp(this.token)
  }
}
