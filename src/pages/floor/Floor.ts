import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { RoomPage } from '../room/room';
import { LocalStorage } from '../../providers/local-storage';
import { initBaseDB } from '../../providers/initBaseDB';

@Component({
  selector: 'page-floor',
  templateUrl: 'Floor.html'
})
export class FloorPage {
  buildingid: string;
  floors: Array<any>;
  floorsready: Array<any>;
  floorsforfix: Array<any>;
  floorsfixed: Array<any>;
  floorspass: Array<any>;
  selectedTab: string;
  buildingname: string;
  projid: string;
  batchid: string;
  type: number;
  readystr:string;
  passstr:string;
  projname:string;
  allcounts:number;
  readycounts:number;
  forfixcounts:number;
  fixedcounts:number;
  passcounts:number;
  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public params: NavParams, public initBaseDB: initBaseDB, public localStorage: LocalStorage) {
    let building: any; building = this.params.get('building');
    this.buildingid = building.buildingid;
    this.buildingname = building.buildingname;
    this.projid = this.params.get('projid');
    this.projname = this.params.get('projname');
    this.batchid = this.params.get('batchid');
    this.type = this.params.get('type');
    if (this.type == 3){
      this.readystr = "待交付";
      this.passstr = "已交付";
    // } else if (this.type == 3){
    //   this.readystr = "待交付";
    //   this.passstr = "已交付";
    // } else if (this.type == 3){
    //   this.readystr = "待交付";
    //   this.passstr = "已交付";
    } else {
      this.readystr = "待接待";
      this.passstr = "已接待";
    }
  }

  itemSelected(room) {
    this.navCtrl.push(RoomPage, { "projid":this.projid, "projname":this.projname ,"batchid":this.batchid,"buildingid":this.buildingid,"buildingname":this.buildingname,"type":this.type,"roomid": room.roomid,"roomname":room.name });
  }

  ionViewWillEnter() {
    var tFloors: Array<any>;
    var tRooms: Array<any>;
    var thouses: any;
    var tstatus: Array<any>;
    this.floors = [];
    this.floorsready = [];
    this.floorsforfix = [];
    this.floorsfixed = [];
    this.floorspass = [];
    this.allcounts = 0;this.readycounts = 0;this.forfixcounts = 0;this.fixedcounts = 0;this.passcounts = 0;
    this.selectedTab = '全部';
    this.initBaseDB.getfloors(this.projid, this.batchid, this.buildingid, this.type).then(val => {      
      this.floors = val[0].items; this.allcounts = val[0].counts;
      this.floorsready = val[1].items; this.readycounts = val[1].counts;
      this.floorsforfix = val[2].items; this.forfixcounts = val[2].counts;
      this.floorsfixed = val[3].items; this.fixedcounts = val[3].counts;
      this.floorspass = val[4].items; this.passcounts = val[4].counts;
    })


  }

}
