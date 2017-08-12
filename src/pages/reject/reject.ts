import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { LocalStorage } from '../../providers/local-storage';
import { initBaseDB } from '../../providers/initBaseDB';

@Component({
  selector: 'page-reject',
  templateUrl: 'reject.html',
})
export class RejectPage {
  projid: string;
  batchid: string;
  roomid: string;
  rejectreason: string;
  plusdesc: string;
  showlog:boolean;
  logs:Array<any>;
  reasons:Array<string>;
  buildingid:string;
  type:number;
  username:string;
  constructor(public navCtrl: NavController, public navParams: NavParams, public initBaseDB: initBaseDB) {
    this.rejectreason = "";
    this.plusdesc = '';
    this.projid = this.navParams.get('projid');
    this.batchid = this.navParams.get('batchid');
    this.roomid = this.navParams.get('roomid');
    this.buildingid = this.navParams.get('buildingid');
    this.type = this.navParams.get('type');
    this.showlog = false;
    this.logs = [];
    this.reasons = []; 
    this.username = this.navParams.get('username');
    this.initBaseDB.currentdb().executeSql("select * from ReasonNoAccepts",[]).then(val=>{
      console.log(val);
      for (var i=0;i<val.rows.length;i++){
        console.log(JSON.stringify(val.rows.item(i)));
        this.reasons.push(val.rows.item(i).Name);
      }
      this.rejectreason = this.reasons[0];
    }).catch(err=>{
      console.log("err:"+err);
    })
  }

  showlogclick() {
    if (this.logs.length == 0){
      let sql = "select * from RoomNoAcceptLogs where projid = '#projid#' and batchid = '#batchid#' and roomid = '#roomid#'";
      sql = sql.replace('#projid#',this.projid).replace('#batchid#',this.batchid).replace('#roomid#',this.roomid);
      this.initBaseDB.currentdb().executeSql(sql,[]).then(val=>{
        for (var i=0;i<val.rows.length;i++){
          console.log(JSON.stringify(val.rows.item(i)));
          let dt = new Date(val.rows.item(i).TransDate);
          this.logs.push({reason:val.rows.item(i).ReasonNoAcceptId,plusdesc:val.rows.item(i).PlusDesc,date:dt.toLocaleString(),user:val.rows.item(i).UserName});
        }
      })
    }
    this.showlog = !this.showlog;
  }

  confirmclick() {
    console.log(this.rejectreason + this.plusdesc);
    let sql = "insert into RoomNoAcceptLogs (ProjId,BatchId,RoomId,BuildingId,PlusDesc,VersionId,ID,ReasonNoAcceptId,UserName,TransDate) values(#values#)";
    let now = new Date();
    
    let curtime:string = now.toLocaleDateString()+" "+now.getHours().toString()+":"+now.getMinutes()+":"+now.getSeconds();
        
    let value = [];
    value.push("'" + this.projid + "'");
    value.push("'" + this.batchid + "'");
    value.push("'" + this.roomid + "'");
    value.push("'" + this.buildingid + "'");
    value.push("'" + this.plusdesc + "'");
    value.push("0");
    value.push("'" + '' + now.valueOf() + Math.random() + "'");
    value.push("'" + this.rejectreason + "'");
    value.push("'" + this.username+ "'");
    value.push("'"+curtime+"'");
    sql = sql.replace('#values#', value.join(','));
    console.log(sql);
    this.initBaseDB.currentdb().executeSql(sql, []).then(v=>{
      this.initBaseDB.updateuploadflag(this.projid, this.batchid, this.buildingid, this.type).then(v2=>{
         this.navCtrl.pop();
      }).catch(er=>{
        console.log("提交失败:"+er);
      })      
    }).catch(err=>{
      console.log("提交失败:"+err);
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Reject');
  }

}
