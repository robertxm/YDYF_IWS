import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { FloorPage } from '../floor/Floor';
import { LocalStorage } from '../../providers/local-storage';
import { initBaseDB } from '../../providers/initBaseDB';
import { Dialogs } from '@ionic-native/dialogs';
import { NativeService } from '../../providers/nativeservice';

@Component({
  selector: 'page-formalinspection',
  templateUrl: 'formalinspection.html'
})
export class FormalinspectionPage {
  batchbuildings: Array<any>;
  projid: string;
  projname: string;
  token: string;
  type: number;
  versionid: number;
  nodata: boolean = false;
  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public localStorage: LocalStorage,
    public initBaseDB: initBaseDB, public dialogs: Dialogs, public nativeservice: NativeService) {
    this.type = 3;
  }

  ionViewDidEnter() {
    this.batchbuildings = [];
    this.localStorage.getItem('curuser').then(val => {
      this.token = val.token;
    })

    this.localStorage.getItem('curproj').then(val => {
      if (val && val.projid) {
        console.log(this.projid);        
        this.projid = val.projid;
        this.projname = val.projname;
        this.versionid = val.versionid;
        this.initbatch();
      } else {
        this.nodata = true;
        this.nativeservice.alert("项目或App没授权，请联系系统管理员.");        
      }
    })
  }

  doRefresh(refresher) {
    console.log('Begin async operation', refresher);
    setTimeout(() => {
      this.nativeservice.showLoading("刷新中，请稍侯...");
      this.initBaseDB.refreshbatch(this.projid, this.type, this.token, this.versionid).then((batlist: Array<any>) => {
        if (batlist && batlist.length > 0) {
          this.batchbuildings = batlist;
          this.nodata = false;
          console.log(this.nodata);
        } else {
          this.nodata = true;
        }
        console.log("initbatch" + this.nodata);
        console.log(this.batchbuildings);        
        this.nativeservice.hideLoading();
        refresher.complete();
      }).catch(e => {
        this.nativeservice.hideLoading();
        refresher.complete();
      })
    }, 2000);
  }

  ngOnInit() {

  }

  initbatch() {
    this.initBaseDB.getbatch(this.projid, this.type, this.token, this.versionid).then((batlist: Array<any>) => {
      if (batlist && batlist.length > 0) {
        this.batchbuildings = batlist;
        this.nodata = false;
        console.log(this.nodata);
      } else {
        this.nodata = true;
      }
      console.log("initbatch" + this.nodata);
      console.log(this.batchbuildings);
      this.nativeservice.hideLoading();
    }).catch(e => {
      this.nativeservice.hideLoading();
    })
  }

  itemSelected(batchid, building) {
    if (building.needtype == 1) {
      this.downloadclicked(batchid, building).then(v => {
        this.navCtrl.push(FloorPage, { "projid": this.projid, "batchid": batchid, "building": building, "type": this.type, "projname": this.projname });
      })
    }
    else if (building.needtype == 0) {
      this.navCtrl.push(FloorPage, { "projid": this.projid, "batchid": batchid, "building": building, "type": this.type, "projname": this.projname });
    }
    else {
      this.dialogs.confirm('有数据未更新，请先更新数据', '', ['暂不更新', '立即更新']).then(val => {
        if (val == 1) {
          this.navCtrl.push(FloorPage, { "projid": this.projid, "batchid": batchid, "building": building, "type": this.type, "projname": this.projname });
        }
        else {
          if (building.needtype == 1) {
            this.downloadclicked(batchid, building).then(v => {
              this.navCtrl.push(FloorPage, { "projid": this.projid, "batchid": batchid, "building": building, "type": this.type, "projname": this.projname });
            })
          }
          else if (building.needtype == 2) {
            this.uploadclicked(batchid, building).then(v => {
              this.navCtrl.push(FloorPage, { "projid": this.projid, "batchid": batchid, "building": building, "type": this.type, "projname": this.projname });
            })
          }
          else if (building.needtype == 3) {
            this.updateclicked(batchid, building).then(v => {
              this.navCtrl.push(FloorPage, { "projid": this.projid, "batchid": batchid, "building": building, "type": this.type, "projname": this.projname });
            })
          }
        }
      })
    }
  }

  uploadclicked(batchid, building): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      resolve(promise.then((v1) => {
        return this.nativeservice.isConnecting();
      }).then((val: boolean) => {
        if (val == false) {
          return "not connecting";
        } else {
          this.nativeservice.showLoading("上传中...");
          return this.initBaseDB.uploadbuildinginfo(this.token, this.projid, batchid, building.buildingid, this.type);
        }
      }).then((v) => {
        console.log(v);
        building.needtype = 0;
        this.nativeservice.hideLoading();
        if (v != "not connecting")
          this.nativeservice.showToast('上传完成.');
        return 100;
      }).catch(err => {
        this.nativeservice.hideLoading();
        console.log('楼栋上传错误:' + err);
      }))
    })
  }

  downloadclicked(batchid, building): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      resolve(promise.then((v1) => {
        return this.nativeservice.isConnecting();
      }).then((val: boolean) => {
        if (val == false) {
          throw '';//resolve(10);
        } else {
          this.nativeservice.showLoading("下载中...", 200000);
          return this.initBaseDB.downloadbuildinginfo(this.token, this.projid, batchid, building.buildingid, this.type);
        }
      }).then((v) => {
        building.needtype = 0;
        this.nativeservice.hideLoading();
        this.nativeservice.showToast('下载完成.');
        return 100;
      }).catch(err => {
        this.nativeservice.hideLoading();
        console.log('楼栋下载错误:' + err);
      }))
    })
  }

  updateclicked(batchid, building): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      resolve(promise.then((v1) => {
        return this.nativeservice.isConnecting();
      }).then((val: boolean) => {
        if (val == false) {
          return "not connecting";
        } else {
          this.nativeservice.showLoading("更新中...");
          return this.initBaseDB.updatebuildinginfo(this.token, this.projid, batchid, building.buildingid, this.type);
        }
      }).then((v) => {
        building.needtype = 0;
        this.nativeservice.hideLoading();
        if (v != "not connecting")
          this.nativeservice.showToast('更新完成.');
        return 100;
      }).catch(err => {
        this.nativeservice.hideLoading();
        console.log('楼栋更新错误:' + err);
      }))
    })
  }
}
