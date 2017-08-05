import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { BuilderIssueDetail } from "../builder-issue-detail/builder-issue-detail";
import { initBaseDB } from '../../providers/initBaseDB';
import { NativeService } from '../../providers/nativeservice';
import { LocalStorage } from '../../providers/local-storage';
import { Dialogs } from '@ionic-native/dialogs';
import { Clipboard } from '@ionic-native/clipboard';

@Component({
  selector: 'page-builder',
  templateUrl: 'builder.html',
})
export class BuilderPage {
  issues = [];
  selectedIssues = [];
  selectedTab = "待派单";
  selectAll = false;
  stage = "前期交付";
  isMultiSelect = false;

  projid: string;
  projname: string;
  issuelist: Array<any>
  teammembers: Array<any>
  userid: string;
  username: string;
  token: string;
  needupd: boolean;
  asscounts: number = 0;
  forfixcounts: number = 0;
  fixedcounts: number = 0;
  returncounts: number = 0;
  showflag: boolean = false;
  exportissueurl: string = "";
  constructor(public navCtrl: NavController, public navParams: NavParams, public actionSheetCtrl: ActionSheetController, public dialogs: Dialogs,
    public initBaseDB: initBaseDB, public nativeservice: NativeService, public localStorage: LocalStorage, private clipboard: Clipboard) {
    this.localStorage.getItem('curuser').then(val => {
      this.userid = val.userid;
      this.username = val.username;
      this.token = val.token;
    })
  }

  ionViewDidEnter() {
    console.log("builderload");
    this.loadIssues();
  }

  doRefresh(refresher) {
    console.log('Begin async operation', refresher);
    setTimeout(() => {
      this.initBaseDB.uploadbuilderinfo(this.token, this.projid).then(v => {
        this.loadIssues().then(val => {
          console.log('Async operation has ended');
          refresher.complete();
        }).catch(e => {
          refresher.complete();
        })
      }).catch(e => {
        refresher.complete();
      })
    }, 2000);
  }

  itemClick(issueid: string) {
    console.log('ITEM CLICK');
    for (let issue of this.getIssues(this.selectedTab)) {
      if (issue['id'] == issueid)
        issue['selected'] = !issue['selected'];
    }
  }

  clearSelection() {
    for (let issue of this.getIssues(this.selectedTab)) { issue['selected'] = false; }
  }

  itemHold() {
    console.log("ITEM HOLD");
    this.isMultiSelect = true;
  }

  exportIssues() {
    if (this.existsSeletedIssues()) {
      console.log(this.selectedTab);
      let issjson = [];
      let iss1 = [], iss2 = [], iss3 = [], iss4 = [];
      for (let issue of this.getIssues(this.selectedTab)) {
        console.log(issue['type']);
        if (issue['selected']) {
          if (issue['type'] == 1) {
            iss1.push({ Id: issue['id'] });
          } else if (issue['type'] == 2) {
            iss2.push({ Id: issue['id'] });
          } else if (issue['type'] == 3) {
            iss3.push({ Id: issue['id'] });
          // } else if (issue['type'] == 4) {
          //   iss4.push({ Id: issue['id'] });
          }
        }
      }
      console.log(iss1);
      console.log(iss2);
      console.log(iss3);
      
      if (iss1.length > 0) {
        issjson.push({ TableName: "PreCheckIssues", data: iss1 });
      }
      if (iss2.length > 0) {
        issjson.push({ TableName: "OpenCheckIssues", data: iss2 });
      }
      if (iss3.length > 0) {
        issjson.push({ TableName: "FormalCheckIssues", data: iss3 });
      }
      // if (iss4.length > 0) {
      //   issjson.push({ TableName: "ServiceCheckIssues", data: iss4 });
      // }
      console.log(issjson);
      console.log(JSON.stringify(issjson));
      this.initBaseDB.exportIssue(this.token, JSON.stringify(issjson)).then((val: any) => {
        console.log(val);
        this.exportissueurl = val;
        if (this.exportissueurl) {
          this.showflag = true;
        }
      })
    } else {
      alert("请先选择要处理的问题项.");
    }
  }

  copytoclipboard() {
    this.clipboard.copy(this.exportissueurl);

    this.clipboard.paste().then(
      (resolve: string) => {
        this.showflag = false;
        this.nativeservice.showToast("复制成功.");        
      },
      (reject: string) => {
        alert('Error: ' + reject);
      }
    );
  }

  showDetail(issue) {
    //alert(issue['issueId']);
    this.navCtrl.push(BuilderIssueDetail, { "Id": issue.id, "issue": issue, "projid": this.projid, "projname": this.projname, "userid": this.userid, "username": this.username, "teammembers": this.teammembers });
  }

  changeAssignto() {
    if (this.existsSeletedIssues()) {
      this.presentActionSheet();
    } else {
      alert("请先选择要处理的问题项.");
    }
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
    let idrange = [];
    for (let issue of this.getIssues(this.selectedTab)) {
      if (issue['selected']) {
        idrange.push("'" + issue['id'] + "'");
      }
    }
    console.log(idrange.join(','));
    this.nativeservice.showLoading("处理中,请稍后...");
    this.initBaseDB.updateResponsible(this.projid, idrange.join(','), staff, this.username, this.userid).then(v => {
      this.loadIssues().then(v => {
        this.nativeservice.hideLoading();
        this.nativeservice.showToast("处理完成.");
      }).catch(e => {
        this.nativeservice.hideLoading();
      })
    }).catch(e => {
      this.nativeservice.hideLoading();
    })
    // for (issue of this.getSeletedIssues()) {
    //   // issue.ResponsibleName = staff.name;
    //   // issue['assigntoname'] = staff['name'];

    // }
  }

  markCompleted() {
    if (this.existsSeletedIssues()) {
      this.dialogs.confirm('确定当前选中的问题都已整改完毕？', '', ['取消', '确定']).then(val => {
        console.log("valupd:" + val);
        if (val == 2) {
          let idrange = [];
          console.log("true");
          for (let issue of this.getIssues(this.selectedTab)) {
            if (issue['selected']) {
              idrange.push("'" + issue['id'] + "'");
            }
          }
          console.log(idrange.join(','));
          this.nativeservice.showLoading("处理中,请稍后...");
          this.initBaseDB.updateFixedCompleteMutil(this.projid, idrange.join(','), this.username, this.userid).then(v => {
            this.loadIssues().then(v => {
              this.nativeservice.hideLoading();
              this.nativeservice.showToast("处理完成.");
            }).catch(e => {
              this.nativeservice.hideLoading();
            })
          }).catch(e => {
            this.nativeservice.hideLoading();
          })
        }
      })
    } else {
      alert("请先选择要处理的问题项.");
    }

  }

  existsSeletedIssues(): boolean {
    for (let issue of this.getIssues(this.selectedTab)) {
      if (issue['selected']) {
        return true;
      }
    }
    return false;
  }

  getSeletedIssues(): Array<object> {
    var ret = [];
    for (let issue of this.getIssues(this.selectedTab)) {
      if (issue['selected']) {
        ret.push(issue);
      }
    }
    return ret;
  }

  getIssues(status: string): Array<object> {
    if (this.issuelist) {
      if (status == "待派单") {
        return this.issuelist[0];
      } else if (status == "待整改") {
        return this.issuelist[1];
      } else if (status == "已整改") {
        return this.issuelist[2];
      } else {
        return this.issuelist[3];
      }
    } else {
      return [];
    }

  }

  loadIssues(): Promise<any> {
    return new Promise((resolve) => {
      this.issuelist = []; this.teammembers = [];
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      console.log("loadIssues");
      resolve(promise.then((v1) => {
        return this.localStorage.getItem("curproj");
      }).then((val: any) => {
        console.log(val);
        if (val && val != null) {
          this.projid = val.projid; this.projname = val.projname;
          if (val.needupd == 1){
            this.nativeservice.showLoading("正在下载基础数据,请稍侯...")
            return this.initBaseDB.downloadbuilderdata(this.token, this.projid);
          } else {
            return 1;
          }          
        } else {
          this.nativeservice.showToast("没有需要整改的项目问题")
          throw '';
        }
      }).then((v2)=>{
        return this.initBaseDB.getbuilderissuelist(this.projid, 1);
      }).then((val: any) => {
        if (val) {
          this.issuelist = val;
          this.needupd = val[8];
          this.asscounts = val[4];
          this.forfixcounts = val[5];
          this.fixedcounts = val[6];
          this.returncounts = val[7];
        }
        return this.initBaseDB.getProjTeam(this.projid);
      }).then((v: any) => {
        this.teammembers = v;
        this.nativeservice.hideLoading();
        return 1;
      }).catch(err => {
        this.nativeservice.hideLoading();
        console.log('问题加载失败:' + err);
        throw '问题加载失败';
      }))
    })

    // this.issues = [{
    //   selected: false,
    //   issueId: '1505100031',
    //   prjid: 'sldfkjsf029323', prjname: '同美花园2期',
    //   buildingid: '10930414234', buildingname: '18号楼',
    //   floorid: '10920419kdsjf023', floorname: '21楼',
    //   roomid: 'ieko098390293lkfs123df', roomname: '2001单元',
    //   catagory: '墙面', description: '掉漆严重',
    //   duedate: '2017-06-03', overdays: 19, returntimes: 3,
    //   ownerid: '10293810012323', ownername: '李小龙',
    //   assigntoid: '1290301390123', assigntoname: '黄飞鸿',
    //   status: '已整改'
    // }, {
    //   selected: false,
    //   issueId: '1505100032',
    //   prjid: 'sldfkjsf029323', prjname: '同美花园2期',
    //   buildingid: '73187318381', buildingname: '13号楼',
    //   floorid: '194182479u8uf38', floorname: '10楼',
    //   roomid: 'ieko098390293lkfs123df', roomname: '0912单元',
    //   catagory: '照明', description: '开关破损',
    //   duedate: '2017-06-05', overdays: 0, returntimes: 1,
    //   ownerid: '10293810012323', ownername: '李小龙',
    //   assigntoid: '1290301390123', assigntoname: '黄飞鸿',
    //   status: '待整改'
    // }, {
    //   selected: false,
    //   issueId: '1505100033',
    //   prjid: 'sldfkjsf029323', prjname: '同美花园2期',
    //   buildingid: '10930414234', buildingname: '18号楼',
    //   floorid: '10920419kdsjf023', floorname: '21楼',
    //   roomid: 'ieko098390293lkfs123df', roomname: '2001单元',
    //   catagory: '墙面', description: '掉漆严重',
    //   duedate: '2017-06-03', overdays: 3, returntimes: 0,
    //   ownerid: '10293810012323', ownername: '李小龙',
    //   assigntoid: '1290301390123', assigntoname: '黄飞鸿',
    //   status: '已整改'
    // }, {
    //   selected: false,
    //   issueId: '1505100034',
    //   prjid: 'sldfkjsf029323', prjname: '同美花园2期',
    //   buildingid: '10930414234', buildingname: '18号楼',
    //   floorid: '10920419kdsjf023', floorname: '21楼',
    //   roomid: 'ieko098390293lkfs123df', roomname: '2001单元',
    //   catagory: '墙面', description: '掉漆严重',
    //   duedate: '2017-06-03', overdays: 3, returntimes: 1,
    //   ownerid: '10293810012323', ownername: '李小龙',
    //   assigntoid: '1290301390123', assigntoname: '黄飞鸿',
    //   status: '被退回'
    // }, {
    //   selected: false,
    //   issueId: '1505100035',
    //   prjid: 'sldfkjsf029323', prjname: '同美花园2期',
    //   buildingid: '10930414234', buildingname: '18号楼',
    //   floorid: '10920419kdsjf023', floorname: '21楼',
    //   roomid: 'ieko098390293lkfs123df', roomname: '2001单元',
    //   catagory: '墙面', description: '掉漆严重',
    //   duedate: '2017-06-03', overdays: 0, returntimes: 0,
    //   ownerid: '10293810012323', ownername: '李小龙',
    //   assigntoid: '', assigntoname: '',
    //   status: '待指派'
    // }, {
    //   selected: false,
    //   issueId: '1505100036',
    //   prjid: 'sldfkjsf029323', prjname: '同美花园2期',
    //   buildingid: '10930414234', buildingname: '18号楼',
    //   floorid: '10920419kdsjf023', floorname: '21楼',
    //   roomid: 'ieko098390293lkfs123df', roomname: '2001单元',
    //   catagory: '墙面', description: '掉漆严重',
    //   duedate: '2017-06-03',
    //   ownerid: '10293810012323', ownername: '李小龙',
    //   assigntoid: '1290301390123', assigntoname: '黄飞鸿',
    //   status: '已整改'
    // }, {
    //   selected: false,
    //   issueId: '1505100037',
    //   prjid: 'sldfkjsf029323', prjname: '同美花园2期',
    //   buildingid: '10930414234', buildingname: '18号楼',
    //   floorid: '10920419kdsjf023', floorname: '21楼',
    //   roomid: 'ieko098390293lkfs123df', roomname: '2001单元',
    //   catagory: '墙面', description: '掉漆严重',
    //   duedate: '2017-06-03', overdays: 4, returntimes: 0,
    //   ownerid: '10293810012323', ownername: '李小龙',
    //   assigntoid: '1290301390123', assigntoname: '黄飞鸿',
    //   status: '待整改'
    // }, {
    //   selected: false,
    //   issueId: '1505100038',
    //   prjid: 'sldfkjsf029323', prjname: '同美花园2期',
    //   buildingid: '10930414234', buildingname: '18号楼',
    //   floorid: '10920419kdsjf023', floorname: '21楼',
    //   roomid: 'ieko098390293lkfs123df', roomname: '2001单元',
    //   catagory: '墙面', description: '掉漆严重',
    //   duedate: '2017-06-03', overdays: 0, returntimes: 4,
    //   ownerid: '10293810012323', ownername: '李小龙',
    //   assigntoid: '1290301390123', assigntoname: '黄飞鸿',
    //   status: '被退回'
    // }];
  }

}
