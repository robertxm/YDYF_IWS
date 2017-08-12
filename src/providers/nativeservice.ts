/**
  * Created by yanxiaojun617@163.com on 01-03.
  */
import { Injectable } from '@angular/core';
import { ToastController, LoadingController, Platform, Loading, AlertController } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';
import { File } from '@ionic-native/file';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Network } from '@ionic-native/network';
import { Dialogs } from '@ionic-native/dialogs';
import { Toast } from '@ionic-native/toast';
import { LocalStorage } from './local-storage';
//import {Position} from "../../typings/index";
import { APP_DOWNLOAD, APK_DOWNLOAD, APP_SERVE_URL } from "./Constants";
import { HttpService } from './HttpService';
import { FileOpener } from '@ionic-native/file-opener';

declare var LocationPlugin;
declare var AMapNavigation;
declare var cordova: any;

@Injectable()

export class NativeService {
  private loading: Loading;
  private loadingIsOpen: boolean = false;
  constructor(private platform: Platform,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private appVersion: AppVersion,
    private transfer: FileTransfer,
    private file: File,
    private inAppBrowser: InAppBrowser,
    private network: Network,
    private dialogs: Dialogs,
    private toast: Toast, public localStorage: LocalStorage, private httpService: HttpService, private fileOpener: FileOpener,
    private loadingCtrl: LoadingController) {
  }

  warn(info): void {
    console.log('%cNativeService/' + info, 'color:#e8c406');
  }

  alert(info): Promise<any> {
    return this.dialogs.alert(info, "提示", "确定")
  }

  /**
   * 通过浏览器打开url
   */
  openUrlByBrowser(url: string): void {
    this.inAppBrowser.create(url, '_system');
  }

  /**
   * 检查app是否需要升级
   */
  detection(token): Promise<any> {
    //这里连接后台判断是否需要升级,不需要升级就return
    let devstr = "";
    if (this.isAndroid()) {
      devstr = "android";
    } else if (this.isIos()) {
      devstr = "ios";
    }
    return this.httpService.get(APP_SERVE_URL + '/AppPack', { Token: token, type: devstr }).then(val => {
      console.log(val);
      let newversion = "";
      if (val && val.length > 0) {
        newversion = val[0][1][1];
        console.log(newversion);
        return newversion;
      } else {
        return newversion;
      }
    })
  }

  // detectionUpgrade(token) {
  //   //这里连接后台判断是否需要升级,不需要升级就return
  //   let devstr = "";
  //   if (this.isAndroid()) {
  //     devstr = "android";
  //   } else if (this.isIos()) {
  //     devstr = "ios";
  //   } else {
  //     return '';
  //   }
  //   let appversion = "";
  //   this.getVersionNumber().then(v => {
  //     appversion = v;
  //     this.httpService.get(APP_SERVE_URL + '/AppPack', { Token: token, type: devstr }).then(val => {
  //       console.log(val);
  //       let newversion = "";
  //       if (val && val.length > 0) {
  //         newversion = val[0][1][1];
  //         console.log(appversion); console.log(newversion);
  //         if (newversion != appversion) {
  //           this.alertCtrl.create({
  //             title: '升级',
  //             subTitle: '发现新版本,是否立即升级？',
  //             buttons: [{ text: '取消' },
  //             {
  //               text: '确定',
  //               handler: () => {
  //                 this.downloadApp(token);
  //               }
  //             }
  //             ]
  //           }).present();
  //         }
  //       }
  //     })
  //   })
  // }

  /**
   * 下载安装app
   */
  downloadApp(token) {
    if (this.isAndroid()) {
      let url = "";
      this.httpService.get(APK_DOWNLOAD, { token: token }).then(val => {
        if (val && val.length > 0) {
          url = APP_SERVE_URL.replace('/api', '') + val[0][1][0];
          console.log("url:" + url);
          let alert = this.alertCtrl.create({
            title: '下载进度：0%',
            enableBackdropDismiss: false,
            buttons: ['后台下载']
          });
          alert.present();

          const fileTransfer: FileTransferObject = this.transfer.create();
          const apk = this.file.externalRootDirectory + 'android.apk'; //apk保存的目录
          console.log(apk);
          fileTransfer.download(url, apk).then(() => {
            //window['INSTALL'].install(apk.replace('file://', ''));
            this.fileOpener.open(apk.replace('file://',''), 'application/vnd.android.package-archive')
              .then(() => console.log('File is opened'))
              .catch(e => console.log('Error openening file', e));
          });

          fileTransfer.onProgress((event: ProgressEvent) => {
            let num = Math.floor(event.loaded / event.total * 100);
            if (num === 100) {
              alert.dismiss();
            } else {
              let title = document.getElementsByClassName('alert-title')[0];
              title && (title.innerHTML = '下载进度：' + num + '%');
            }
          });
        }
      })

    } else if (this.isIos()) {
      this.openUrlByBrowser(APP_DOWNLOAD);
    }
  }

  /**
   * 是否真机环境
   * @return {boolean}
   */
  isMobile(): boolean {
    return this.platform.is('mobile') && !this.platform.is('mobileweb');
  }

  /**
   * 是否android真机环境
   * @return {boolean}
   */
  isAndroid(): boolean {
    return this.isMobile() && this.platform.is('android');
  }

  /**
   * 是否ios真机环境
   * @return {boolean}
   */
  isIos(): boolean {
    return this.isMobile() && (this.platform.is('ios') || this.platform.is('ipad') || this.platform.is('iphone'));
  }

  /**
   * 统一调用此方法显示提示信息
   * @param message 信息内容
   * @param duration 显示时长
   */
  showToast(message: string = '操作完成', duration: number = 2000): void {
    if (this.isMobile()) {
      this.toast.show(message, String(duration), 'center').subscribe();
    } else {
      this.toastCtrl.create({
        message: message,
        duration: duration,
        position: 'middle',
        showCloseButton: false
      }).present();
    }
  };


  /**
   * 统一调用此方法显示loading
   * @param content 显示的内容
   */
  showLoading(content: string = '', timeout: number = 300000): void {
    if (!this.loadingIsOpen) {
      this.loadingIsOpen = true;
      this.loading = this.loadingCtrl.create({
        content: content
      });
      this.loading.present();
      setTimeout(() => {//最长显示10秒
        this.loadingIsOpen && this.loading.dismiss();
        this.loadingIsOpen = false;
      }, timeout);
    }
  };

  /**
   * 关闭loading
   */
  hideLoading(): void {
    this.loadingIsOpen && this.loading.dismiss();
    this.loadingIsOpen = false;
  };


  /**
   * 获取网络类型 如`unknown`, `ethernet`, `wifi`, `2g`, `3g`, `4g`, `cellular`, `none`
   */
  getNetworkType(): string {
    var networktype: string;
    if (!this.isMobile()) {
      networktype = 'wifi';
    }
    else {
      networktype = navigator['connection'].type;
      console.log(networktype);
    }

    return networktype;
  }

  /**
   * 判断是否有网络
   * @returns {boolean}
   */
  isConnecting(): Promise<boolean> {
    return new Promise((resolve) => {
      //this.platform.ready().then((readySource) => {
      //  console.log('Platform ready from', readySource);
      let promise = new Promise((resolve) => {
        let networktype = this.getNetworkType();
        resolve(networktype);
      });

      resolve(promise.then((networktype) => {
        console.log(networktype);
        if (networktype == 'none') {
          this.showToast("您的当前网络不可用,请检查您的网络设置.");
          return false;
        }
        if (networktype == 'wifi')
          return true;
        else {
          console.log("checknetwork");
          return this.dialogs.confirm('你正使用2g/3g/4g/网络，是否同意上传和下载?', '', ['不允许', '同意'])
            .then(val => {
              if (val = 2) {
                console.log("ok checknetwork");
                this.localStorage.setItem('networkalways', true);
                return true;
              }
              else {
                console.log("false checknetwork");
                this.localStorage.setItem('networkalways', false);
                return false;
              }
            })
            .catch(e => { console.log('Error displaying dialog', e); return false });
        }
      }).then((v2) => {
        return v2;
      }).catch(err => {
        this.warn('网路检测失败:' + err);
        return false;
      }))
    })
  }

  /**
   * 获得app版本号,如0.01
   * @description  对应/config.xml中version的值
   * @returns {Promise<string>}
   */
  getVersionNumber(): Promise<string> {
    return new Promise((resolve) => {
      this.appVersion.getVersionNumber().then((value: string) => {
        resolve(value);
      }).catch(err => {
        this.warn('getVersionNumber:' + err);
      });
    });
  }

  /**
   * 获得app name,如ionic2_tabs
   * @description  对应/config.xml中name的值
   * @returns {Promise<string>}
   */
  getAppName(): Promise<string> {
    return new Promise((resolve) => {
      this.appVersion.getAppName().then((value: string) => {
        resolve(value);
      }).catch(err => {
        this.warn('getAppName:' + err);
      });
    });
  }

  encode64(input) {
    var keyStr = "ABCDEFGHIJKLMNOP" + "QRSTUVWXYZabcdef" + "ghijklmnopqrstuv"
      + "wxyz0123456789+/" + "=";
    var output = "";
    var chr1, chr2, chr3;// = "";
    var enc1, enc2, enc3, enc4;// = "";
    var i = 0;
    do {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2)
        + keyStr.charAt(enc3) + keyStr.charAt(enc4);
      chr1 = chr2 = chr3 = "";
      enc1 = enc2 = enc3 = enc4 = "";
    } while (i < input.length);

    return output;
  }

  base64decode(str) {
    let base64DecodeChars = new Array(
      -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
      -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
      -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
      52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
      -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
      15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
      -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
      41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
    var c1, c2, c3, c4;
    var i, len, out;
    len = str.length;
    i = 0;
    out = "";
    while (i < len) {
      /* c1 */
      do {
        c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
      } while (i < len && c1 == -1);
      if (c1 == -1)
        break;
      /* c2 */
      do {
        c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
      } while (i < len && c2 == -1);
      if (c2 == -1)
        break;
      out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
      /* c3 */
      do {
        c3 = str.charCodeAt(i++) & 0xff;
        if (c3 == 61)
          return out;
        c3 = base64DecodeChars[c3];
      } while (i < len && c3 == -1);
      if (c3 == -1)
        break;
      out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
      /* c4 */
      do {
        c4 = str.charCodeAt(i++) & 0xff;
        if (c4 == 61)
          return out;
        c4 = base64DecodeChars[c4];
      } while (i < len && c4 == -1);
      if (c4 == -1)
        break;
      out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
    }
    return out;
  }
  /**
   * 获得app包名/id,如com.kit.ionic2tabs
   * @description  对应/config.xml中id的值
   * @returns {Promise<string>}
   */
  getPackageName(): Promise<string> {
    return new Promise((resolve) => {
      this.appVersion.getPackageName().then((value: string) => {
        resolve(value);
      }).catch(err => {
        this.warn('getPackageName:' + err);
      });
    });
  }


  /**
   * 获得用户当前坐标
   * @return {Promise<Position>}
   */
  // getUserLocation(): Promise<Position> {
  //   return new Promise((resolve) => {
  //     if (this.isMobile()) {
  //       LocationPlugin.getLocation(data => {
  //         resolve({'lng': data.longitude, 'lat': data.latitude});
  //       }, msg => {
  //         alert(msg.indexOf('缺少定位权限') == -1 ? ('错误消息：' + msg) : '缺少定位权限，请在手机设置中开启');
  //         this.warn('getUserLocation:' + msg);
  //       });
  //     } else {
  //       this.warn('getUserLocation:非手机环境,即测试环境返回固定坐标');
  //       resolve({'lng': 113.350912, 'lat': 23.119495});
  //     }
  //   });
  // }

  /**
   * 地图导航
   * @param startPoint 开始坐标
   * @param endPoint 结束坐标
   * @param type 0实时导航,1模拟导航,默认为模拟导航
   * @return {Promise<string>}
   */
  // navigation(startPoint: Position, endPoint: Position, type = 1): Promise<string> {
  //   return new Promise((resolve) => {
  //     if (this.platform.is('mobile') && !this.platform.is('mobileweb')) {
  //       AMapNavigation.navigation({
  //         lng: startPoint.lng,
  //         lat: startPoint.lat
  //       }, {
  //         lng: endPoint.lng,
  //         lat: endPoint.lat
  //       }, type, function (message) {
  //         resolve(message);
  //       }, function (err) {
  //         alert('导航失败:' + err);
  //         this.warn('navigation:' + err);
  //       });
  //     } else {
  //       this.showToast('非手机环境不能导航');
  //     }
  //   });
  // }

}