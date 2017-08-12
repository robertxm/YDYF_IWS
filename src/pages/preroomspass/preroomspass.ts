import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { initBaseDB } from '../../providers/initBaseDB';
import { Md5 } from "ts-md5/dist/md5";
import { LocalStorage } from '../../providers/local-storage';

@Component({
    selector: 'page-preroomspass',
    templateUrl: 'preroomspass.html',
})

export class PreroomspassPage {
    receiptInfo: ReceiptInfo;
    viewType: any;
    issueList: Array<any>;
    userid: string;
    username: string;
    type: number;
    readonly: boolean;
    @ViewChild('contentEl') contentEl: ElementRef;
    isEmpty = true;

    // tslint:disable-next-line:no-unused-variable
    private signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
        'minWidth': 1,
        'canvasHeight': 180
    };

    constructor(public navCtrl: NavController, public navParams: NavParams, public initBaseDB: initBaseDB, public localStorage: LocalStorage) {
        this.issueList = [];
        this.receiptInfo = new ReceiptInfo();
        this.readonly = navParams.get('readonly');
        this.receiptInfo.projId = navParams.get('projid');
        this.receiptInfo.projName = navParams.get('projname');
        this.receiptInfo.buildingId = navParams.get('buildingid');
        this.receiptInfo.buildingName = navParams.get('buildingname');
        this.receiptInfo.batchid = navParams.get('batchid');
        // this.receiptInfo.floorId = '013lsjd;fl9lslfklskflsf';
        // this.receiptInfo.floorName = '五楼';
        this.receiptInfo.roomId = navParams.get('roomid');
        this.receiptInfo.roomName = navParams.get('roomname');
        this.type = navParams.get('type');
        this.receiptInfo.additionNote = '';
        this.localStorage.getItem('curuser').then(val => {
            this.userid = val.userid; this.username = val.username;
        })
        this.initdata();
    }

    initdata() {
        this.initBaseDB.getroomdetails(this.receiptInfo.roomId, this.receiptInfo.batchid, this.type).then(val => {
            console.log("roomdetails:" + JSON.stringify(val.rows.item(0)));
            if (val.rows.length > 0) {
                let dt: Date;
                if (val.rows.item(0).TransDate) {
                    dt = new Date(val.rows.item(0).TransDate);
                    console.log(dt);
                    console.log(dt.toLocaleDateString());
                } else {
                    dt = new Date();
                    console.log(dt.toLocaleDateString() + "  " + dt.toLocaleTimeString());
                }

                this.receiptInfo.dlvrDate = dt.toLocaleString();
                console.log(this.receiptInfo.dlvrDate);
                this.receiptInfo.additionNote = val.rows.item(0).Remark;
            }
        })
    }


    ionViewDidLoad() {

    }

    cansubmit(): boolean {
        let ret: boolean; ret = true;

        return ret;
    }

    doSubmit() {
        if (this.cansubmit()) {
            let promise = new Promise((resolve) => {
                resolve(100);
            });

            promise.then(v1 => {
                let now = new Date();
                let sqls = [];
                let curtime: string = now.toLocaleDateString() + " " + now.getHours().toString() + ":" + now.getMinutes() + ":" + now.getSeconds();
                let sql = '';
                sql = 'insert into PreRoomDetails(RoomId,TransDate,RoomStatus,Remark,EngineerPhone,EngineerName,ProjId,VersionId,ID,BatchId,BuildingId) values (#values#) ';

                let tmpvalue = [];
                tmpvalue.push("'" + this.receiptInfo.roomId + "'");
                tmpvalue.push("'" + curtime + "'");
                tmpvalue.push("'已通过'");
                tmpvalue.push("'" + this.receiptInfo.additionNote + "'");
                tmpvalue.push("'" + this.userid + "'");
                tmpvalue.push("'" + this.username + "'");
                tmpvalue.push("'" + this.receiptInfo.projId + "'");
                tmpvalue.push("0");
                tmpvalue.push("''");                
                tmpvalue.push("'" + this.receiptInfo.batchid + "'");
                tmpvalue.push("'" + this.receiptInfo.buildingId + "'");
                sql = sql.replace('#values#', tmpvalue.join(','));
                console.log(sql);
                sqls.push(sql);
                return this.initBaseDB.currentdb().sqlBatch(sqls);
            }).then(v3 => {
                this.initBaseDB.updateuploadflag(this.receiptInfo.projId, this.receiptInfo.batchid, this.receiptInfo.buildingId, this.type);
            }).catch(err => {
                console.log('通过信息提交失败:' + err);                
            }).then(v4 => {
                this.navCtrl.pop();
            })
        }
    }

    doCancel() {
        if (this.navCtrl.canGoBack)
            this.navCtrl.pop();
    }
}

export class ReceiptInfo {
    projId: any; projName: string;
    buildingId: any; buildingName: string;
    floorId: any; floorName: string;
    roomId: any; roomName: string;
    dlvrDate: string;  
    batchid: string;
    additionNote: string;
}