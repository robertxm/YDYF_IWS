import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, ActionSheetController } from 'ionic-angular';
import { BuilderCloseIssue } from '../../pages/builder-close-issue/builder-close-issue';
import { BuilderIssuePosition } from '../../pages/builder-issue-position/builder-issue-position';
import { initBaseDB } from '../../providers/initBaseDB';
import { ShowimgPage } from '../../pages/imageeditor/showimg';
import { AssignreturnPage } from '../../pages/assignreturn/assignreturn';
import { NativeService } from '../../providers/nativeservice';

@Component({
  selector: 'page-builder-issue-detail',
  templateUrl: 'builder-issue-detail.html',
})
export class BuilderIssueDetail {

  issueid: string;
  projid: string;
  projname: string;
  // buildingid = '10930414234';
  // buildingname = '18号楼';
  // floorid = '10920419kdsjf023';
  // floorname = '21楼';
  // roomid = 'ieko098390293lkfs123df';
  // roomname = '2001单元';
  // area = '北阳台';
  // catagory = '墙面';
  // description = '掉漆严重';
  // photos_before = [
  //   { src: '../../assets/img/ydyf-001.jpg' },
  //   { src: '../../assets/img/ydyf-002.jpg' }
  // ];
  // photos_after = [{ src: '../../assets/img/ydyf-004.jpg' }];
  // reg_date = '2017-05-10 09:44';
  // assign_date = '2017-06-17 17:57';
  // due_date = '2017-06-03';
  // over_days = 19;
  // return_times = 3;
  // ownerid = '10293810012323';
  // ownername = '李小龙';
  // assigntoid = '1290301390123';
  // assigntoname = '黄飞鸿';
  status = 'pending';
  status_name = '待整改';
  return_log: Array<any>;
  // return_log = [
  //   { return_person: '吴宁', return_date: '2017-06-17 18:49', return_message: '维修后仍然有缺陷' },
  //   { return_person: '肖振宇', return_date: '2017-06-19 08:25', return_message: '维修后仍然有缺陷' },
  //   { return_person: '吴宁', return_date: '2017-06-25 10:08', return_message: '维修后仍然有缺陷' }
  // ];
  userid: string;
  username: string;
  issue: any;
  registertime: string;
  duetime: string;
  assigntime: string;
  fixedtime: string = "";
  fixeddesc: string = "";
  images: Array<any>;
  imagesfixed: Array<any>;
  teammembers: Array<any>;
  constructor(public navCtrl: NavController, public navParams: NavParams, public initBaseDB: initBaseDB, private modalCtrl: ModalController, public nativeservice: NativeService, public actionSheetCtrl: ActionSheetController) {
    this.issueid = navParams.get('Id');
    this.projid = navParams.get('projid');
    this.projname = navParams.get('projname');
    this.userid = navParams.get('userid');
    this.username = navParams.get('username');
    this.issue = navParams.get('issue');
    this.teammembers = []; this.teammembers = navParams.get('teammembers');
  }

  loadissueinfo() {
    this.images = []; this.imagesfixed = [];
    this.return_log = [];
    this.initBaseDB.getbuilderissueinfo(this.issueid, this.issue.type).then((v: any) => {
      let issuelist: any;  console.log(v);console.log(v[1]);
      let val: any; val = v[0];
      issuelist = val.rows.item(0);
      console.log(JSON.stringify(val.rows.item(0)));
      this.fixeddesc = issuelist.fixedDesc;
      if (this.fixeddesc == 'undefined'){
        this.fixeddesc = '';
      }
      let dt = new Date(issuelist.RegisterDate);
      this.registertime = dt.toLocaleString();
      if (issuelist.LimitDate) {
        dt = new Date(issuelist.LimitDate)
        this.duetime = dt.toLocaleString();
      }

      if (issuelist.AppointDate) {
        dt = new Date(issuelist.AppointDate);
        this.assigntime = dt.toLocaleString();
      }

      if (issuelist.ReFormDate) {
        dt = new Date(issuelist.ReFormDate);
        this.fixedtime = dt.toLocaleString();
      }

      if (issuelist.ImgBefore1) {
        this.initBaseDB.getimagedata(this.projid, issuelist.ImgBefore1).then((v1: any) => {
          this.images.push('data:image/jpeg;base64,' + v1.rows.item(0).src);
          if (issuelist.ImgBefore2) {
            this.initBaseDB.getimagedata(this.projid, issuelist.ImgBefore2).then((v2: any) => {
              this.images.push('data:image/jpeg;base64,' + v2.rows.item(0).src);
              if (issuelist.ImgBefore3) {
                this.initBaseDB.getimagedata(this.projid, issuelist.ImgBefore3).then((v3: any) => {
                  this.images.push('data:image/jpeg;base64,' + v3.rows.item(0).src);
                }).catch(err => {
                  console.log('图片3加载失败' + err);
                })
              }
            }).catch(err => {
              console.log('图片2加载失败' + err);
            })
          }

        }).catch(err => {
          console.log('图片1加载失败' + err);
        })
      }

      if (issuelist.ImgAfter1) {
        this.initBaseDB.getimagedata(this.projid, issuelist.ImgAfter1).then((v1: any) => {
          this.imagesfixed.push('data:image/jpeg;base64,' + v1.rows.item(0).src);
          if (issuelist.ImgAfter2) {
            this.initBaseDB.getimagedata(this.projid, issuelist.ImgAfter2).then((v2: any) => {
              this.imagesfixed.push('data:image/jpeg;base64,' + v2.rows.item(0).src);
              if (issuelist.ImgAfter3) {
                this.initBaseDB.getimagedata(this.projid, issuelist.ImgAfter3).then((v3: any) => {
                  this.imagesfixed.push('data:image/jpeg;base64,' + v3.rows.item(0).src);
                }).catch(err => {
                  console.log('图片3加载失败' + err);
                })
              }
            }).catch(err => {
              console.log('图片2加载失败' + err);
            })
          }

        }).catch(err => {
          console.log('图片1加载失败' + err);
        })
      }
      console.log("log:" + v[1]);
      let log: any; log = v[1];
      for (var i = 0; i < log.rows.length; i++) {
        console.log(JSON.stringify(log.rows.item(i)));
        dt = new Date(log.rows.item(i).LogDate);
        this.return_log.push({ return_person: log.rows.item(i).UserName, return_date: dt.toLocaleString(), return_message: log.rows.item(i).ReturnReason })
      }
    })
  }

  ionViewDidLoad() {
    this.loadissueinfo();
  }
  //results.push({ reason: result, img: this.imagesafter,fixeddesc:this.fixeddesc });
  fixedclick() {
    const modal = this.modalCtrl.create(BuilderCloseIssue, {
      username: this.username, images: this.images, overdays: this.issue.overdays
    });
    modal.onDidDismiss((result: any) => {
      console.log(result);
      if (result) {
        console.log('if');
        this.initBaseDB.updateFixedCompleteSingle(this.projid, this.issueid, result[0].img, result[0].fixeddesc, result[0].reason, this.username, this.userid).then(v => {
          this.nativeservice.showToast('完成整改成功.');
          this.navCtrl.pop();
        })
      }
    });
    modal.present();
  }

  assignchange() {
    console.log('assignchange');
    this.presentActionSheet();
  }

  presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: '选择负责人',
      buttons: [{ text: '取消', role: 'cancel' }]
    });
    for (let s of this.teammembers) {
      actionSheet.addButton({ text: s.phone + ' ' + s.name, handler: () => { this.assignto(s); } });
    }
    // for (let s of this.staffs) {
    //   actionSheet.addButton({ text: s.id + ' ' + s.name, handler: () => { this.assignto(s); } });
    // }
    actionSheet.present();
  }

  assignto(staff: any) {
    this.initBaseDB.updateResponsible(this.projid, "'" + this.issueid + "'", staff, this.username, this.userid).then(v => {
      this.nativeservice.showToast('变更负责人成功.');
      this.navCtrl.pop();
    })
  }

  positionview() {
    this.navCtrl.push(BuilderIssuePosition, { "issueid": this.issueid, "type": this.issue.type });
  }

  returnassign() {
    const modal = this.modalCtrl.create(AssignreturnPage, {
    });
    modal.onDidDismiss(result => {
      if (result) {
        console.log(result);
        if (this.issue.status == "待派单") {
          this.initBaseDB.returnbuilderassign(this.projid, this.issueid, this.username, this.userid, result, this.issue.type).then(val => {
            this.nativeservice.showToast('退回成功.');
            this.navCtrl.pop();
          })
        } else {
          this.initBaseDB.returnassign(this.projid, this.issueid, this.username, this.userid, result, this.issue.type).then(val => {
            this.nativeservice.showToast('退回成功.');
            this.navCtrl.pop();
          })
        }
      }
    });
    modal.present();
  }

  showBigImage(imagesrc, fixedflag: number = 0) {  //传递一个参数（图片的URl）
    let i = 0;
    if (fixedflag == 0) {
      this.images.forEach(element => {
        if (element == imagesrc) {
          this.navCtrl.push(ShowimgPage, { imgdata: this.images, num: i });
        }
        i++;
      })
    } else {
      this.imagesfixed.forEach(element => {
        if (element == imagesrc) {
          this.navCtrl.push(ShowimgPage, { imgdata: this.imagesfixed, num: i });
        }
        i++;
      })
    }
  };

}
