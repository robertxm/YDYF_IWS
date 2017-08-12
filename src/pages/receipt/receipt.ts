import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { Signature } from '../signature/signature';
import { initBaseDB } from '../../providers/initBaseDB';
import { Md5 } from "ts-md5/dist/md5";
import { LocalStorage } from '../../providers/local-storage';
import { NativeService } from '../../providers/nativeservice';

@Component({
    selector: 'page-receipt',
    templateUrl: 'receipt.html',
})

export class ReceiptPage {

    //_SCORE_LIST: Array<any>;
    receiptInfo: ReceiptInfo;
    viewType: any;
    satDim: Array<any>;
    issueList: Array<any>;
    userid: string;
    username: string;
    type: number;
    readonly: boolean;
    titlestr:string = '';
    @ViewChild(SignaturePad) signaturePad: SignaturePad;
    @ViewChild('contentEl') contentEl: ElementRef;
    isEmpty = true;

    // tslint:disable-next-line:no-unused-variable
    private signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
        'minWidth': 1,
        'canvasHeight': 180
    };

    constructor(public navCtrl: NavController, public navParams: NavParams, public initBaseDB: initBaseDB, public localStorage: LocalStorage, public nativeservice: NativeService) {
        //this.viewType = navParams.get('viewType');
        this.satDim = [];
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
        if (this.type == 2){
            this.titlestr = '接待';
        } else {
            this.titlestr = '交付';
        }
        this.receiptInfo.additionNote = '';
        this.localStorage.getItem('curuser').then(val => {
            this.userid = val.userid; this.username = val.username;
        })
        this.initdata();
        //this.receiptInfo.ownerSign = "assets/img/little.jpg";
        // this._SCORE_LIST = [
        //     { name: "satisfactionDlvr", desc: "正式交付满意度" },
        //     { name: "satisfactionInspector", desc: "验房师满意度" },
        //     { name: "satisfactionSystem", desc: "验房系统满意度" },
        //     { name: "satisfactionQuality", desc: "工程质量满意度" },
        //     { name: "satisfactionLandscape", desc: "园林景观满意度" }];
    }

    initdata() {
        this.initBaseDB.getroomdetails(this.receiptInfo.roomId, this.receiptInfo.batchid, this.type).then(val => {
            console.log("roomdetails:" + JSON.stringify(val.rows.item(0)));
            if (val.rows.length > 0) {
                if (val.rows.item(0).CustId != 'undefined')
                    this.receiptInfo.ownerName = val.rows.item(0).CustId;
                if (val.rows.item(0).CustPhone != 'undefined') {
                    this.receiptInfo.ownerPhone = val.rows.item(0).CustPhone.substr(0, 3) + "########";
                    if (this.receiptInfo.ownerPhone == '########') {
                        this.receiptInfo.ownerPhone = '';
                    }
                }
                if (this.type == 3) {
                    console.log(val.rows.item(0).AmmeterReading);
                    if (val.rows.item(0).AmmeterReading > 0)
                        this.receiptInfo.electricMeter = val.rows.item(0).AmmeterReading;
                    if (val.rows.item(0).WaterMeterReading > 0)
                        this.receiptInfo.waterMeter = val.rows.item(0).WaterMeterReading;
                    if (val.rows.item(0).GasMeterReading > 0)
                        this.receiptInfo.gasMeter = val.rows.item(0).GasMeterReading;
                    if (val.rows.item(0).KeyRetentionStatus > 0)
                        this.receiptInfo.keyReserve = val.rows.item(0).KeyRetentionStatus;
                }
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
                this.initBaseDB.getimagedata(this.receiptInfo.projId, val.rows.item(0).ImgSign).then(v => {
                    if (v && v.rows.length > 0) {
                        //     this.receiptInfo.ownerSign = "assets/img/little.jpg";
                        // } else {
                        this.receiptInfo.ownerSign = 'data:image/png;base64,' + v.rows.item(0).src;
                    }
                })
                this.initBaseDB.getCustSatisfactions(this.receiptInfo.roomId, this.type).then(v2 => {
                    if (v2) {
                        for (var i = 0; i < v2.rows.length; i++) {
                            console.log(JSON.stringify(v2.rows.item(i)));
                            this.satDim.push({ dim: v2.rows.item(i).Dim, score: v2.rows.item(i).Score });
                        }
                    }

                })
                // this.receiptInfo.satisfactionDlvr = 5;
                // this.receiptInfo.satisfactionInspector = 3;
                // this.receiptInfo.satisfactionLandscape = 4;
                // this.receiptInfo.satisfactionQuality = 5;
                // this.receiptInfo.satisfactionSystem = 5;                
            }
        })
        this.initBaseDB.getroomissueinfo(this.receiptInfo.roomId, this.type).then(val => {
            if (val.rows.length > 0) {
                for (var j = 0; j < val.rows.length; j++) {
                    console.log(JSON.stringify(val.rows.item(j)));
                    this.issueList.push({ posi: val.rows.item(j).Position, desc: val.rows.item(j).IssueDesc, status: val.rows.item(j).IssueStatus });
                }
            }
        })
        // this.receiptInfo.issueList = [{ issueid: '1209ulsjdflsduf923klfjldsou', catagory: '顶蓬漏水', description: '严重漏水已造成鼓包', status: '已处理' },
        //         { issueid: 'lskdfjpowejflsdufpsldf', catagory: '灯光不亮', description: '完全不亮，开关面板发黑', status: '待处理' }
        //         ];
    }

    getStars(score: number) {
        var ret = [];
        for (var i = 0; i < score; i++) {
            ret.push(i);
        }
        return ret;
    }

    ionViewDidLoad() {
        // this.signaturePad is now available
        this.signaturePad.set('canvasWidth', this.contentEl.nativeElement.offsetWidth); // set szimek/signature_pad options at runtime
        this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
        document.getElementById("signPad").style.display = "none";
    }

    cansubmit(): boolean {
        let ret: boolean; ret = true;
        let err:string = "";
        if (this.type == 3) {
            if (!this.receiptInfo.electricMeter && this.receiptInfo.electricMeter != 0) {
                err = "电表读数必填. "; ret = false;
            }
            if (!this.receiptInfo.waterMeter && this.receiptInfo.waterMeter != 0) {
                err += "水表读数必填. ";  ret = false;
            }
            if (!this.receiptInfo.gasMeter && this.receiptInfo.gasMeter != 0) {
                err += "气表读数必填. "; ret = false;
            }
            if (!this.receiptInfo.keyReserve && this.receiptInfo.keyReserve != 0) {
                err += "钥匙留用必填. "; ret = false;
            }
            if (this.receiptInfo.electricMeter.toString() == '') {
                err += "电表读数只能填写数字. "; ret = false;
            }
            if (this.receiptInfo.waterMeter.toString() == '') {
                err += "水表读数只能填写数字. "; ret = false;
            }
            if (this.receiptInfo.gasMeter.toString() == '') {
                err += "气表读数只能填写数字. "; ret = false;
            }
            if (this.receiptInfo.keyReserve.toString() == '') {
                err += "钥匙留用只能填写数字. "; ret = false;
            }
            if (ret == false){
                this.nativeservice.alert(err).then(v=>{
                    return false;
                }).catch(v=>{
                    return false;
                })
            } else {
                return true;
            }
        } else {
           return ret;
        }        
    }

    doSubmit() {
        if (this.cansubmit()) {
            let promise = new Promise((resolve) => {
                resolve(100);
            });

            promise.then(v1 => {
                if (this.receiptInfo.ownerSign && this.receiptInfo.ownerSign != '') {
                    let tmpstr = 'data:image/png;base64,';
                    let val = this.receiptInfo.ownerSign.replace(tmpstr, '');
                    //let filename = Md5.hashStr(val).toString() + ".jpeg";
                    console.log('image2');
                    console.log(val);
                    return this.initBaseDB.updateImgData(this.receiptInfo.projId, this.receiptInfo.batchid, this.receiptInfo.buildingId, [val], 'png').then(v => {
                        console.log(v);
                        let fn: Array<any>; fn = []; fn = v;
                        console.log(fn[0]);
                        return fn[0];
                    }).catch(err => {
                        console.log('签名上传失败.' + err);
                        throw '签名上传失败.';
                    })
                } else {
                    return '';
                }
            }).then((v2: string) => {
                console.log(v2);
                let now = new Date();
                let sqls = [];

                let curtime: string = now.toLocaleDateString() + " " + now.getHours().toString() + ":" + now.getMinutes() + ":" + now.getSeconds();
                let sql = '';
                if (this.type == 3) {
                    sql = "update FormalRoomDetails set versionid = 0,RoomStatus = '已交付', Transdate ='" + curtime + "', Remark = '#Remark#',EngineerPhone = '#userid#',EngineerName = '#username#',ImgSign = '#imgsign#',AmmeterReading=#ammeter#,WaterMeterReading=#water#,GasMeterReading=#gas#,KeyRetentionStatus=#key# where roomid = '#roomid#' ";
                } else {
                    sql = "update OpenRoomDetails set versionid = 0,RoomStatus = '已接待', Transdate ='" + curtime + "', Remark = '#Remark#',EngineerPhone = '#userid#',EngineerName = '#username#',ImgSign = '#imgsign#' where roomid = '#roomid#' ";
                }
                sql = sql.replace('#Remark#', this.receiptInfo.additionNote).replace('#userid#', this.userid).replace('#username#', this.username).replace('#roomid#', this.receiptInfo.roomId);
                console.log(this.receiptInfo.electricMeter);
                if (v2) {
                    sql = sql.replace('#imgsign#', v2);
                } else {
                    sql = sql.replace('#imgsign#', "");
                }
                if (this.type == 3) {
                    if (this.receiptInfo.electricMeter == 0) {
                        sql = sql.replace('#ammeter#', '0');
                    } else {
                        sql = sql.replace('#ammeter#', this.receiptInfo.electricMeter.toString());
                    }
                    if (this.receiptInfo.waterMeter == 0) {
                        sql = sql.replace('#water#', '0');
                    } else {
                        sql = sql.replace('#water#', this.receiptInfo.waterMeter.toString());
                    }
                    if (this.receiptInfo.gasMeter == 0) {
                        sql = sql.replace('#gas#', '0');
                    } else {
                        sql = sql.replace('#gas#', this.receiptInfo.gasMeter.toString());
                    }
                    if (this.receiptInfo.keyReserve == 0) {
                        sql = sql.replace('#key#', '0');
                    } else {
                        sql = sql.replace('#key#', this.receiptInfo.keyReserve.toString());
                    }
                }
                //Transdate = '#datetime#', sql = sql.replace('#datetime#',now.toLocaleDateString()+)
                console.log(sql);
                sqls.push(sql);
                if (this.satDim.length > 0) {
                    sql = "insert into CustRoomSatisfactions (ProjId,VersionId,BuildingId,BatchId,RoomId,SatisfiedDim,Score,Type) values #value# "
                    let value = [];
                    for (var i = 0; i < this.satDim.length; i++) {
                        let tmpvalue = [];
                        tmpvalue.push("'" + this.receiptInfo.projId + "'");
                        tmpvalue.push(0);
                        tmpvalue.push("'" + this.receiptInfo.buildingId + "'");
                        tmpvalue.push("'" + this.receiptInfo.batchid + "'");
                        tmpvalue.push("'" + this.receiptInfo.roomId + "'");
                        tmpvalue.push("'" + this.satDim[i].dim + "'");
                        tmpvalue.push(this.satDim[i].score);
                        tmpvalue.push(this.type);
                        value.push("(#row#)".replace("#row#", tmpvalue.join(',')));
                    }
                    console.log(value.join(','));
                    sql = sql.replace('#value#', value.join(','));
                    sqls.push(sql);
                }
                return this.initBaseDB.currentdb().sqlBatch(sqls);
            }).then(v3 => {
                this.initBaseDB.updateuploadflag(this.receiptInfo.projId, this.receiptInfo.batchid, this.receiptInfo.buildingId, this.type);
            }).catch(err => {
                console.log(this.titlestr+'信息提交失败:' + err);                
            }).then(v4 => {
                this.navCtrl.pop();
            })
        }
    }

    doCancel() {
        if (this.navCtrl.canGoBack)
            this.navCtrl.pop();
    }

    doSignature() {
        //this.navCtrl.push(Signature);
        if (this.readonly == false) {
            document.getElementById("footbar").style.display = "none";
            document.getElementById("signPad").style.display = "";
        }
    }
    endSignature() {
        document.getElementById("footbar").style.display = "";
        document.getElementById("signPad").style.display = "none";
    }

    drawStart() {
        // will be notified of szimek/signature_pad's onBegin event
        console.log('begin drawing');
    }

    drawComplete() {
        // will be notified of szimek/signature_pad's onEnd event
        // this.isEmpty = true;
        this.receiptInfo.ownerSign = this.signaturePad.toDataURL();
        console.log(this.receiptInfo.ownerSign);
    }

    clearSign() {
        this.signaturePad.clear();
        this.receiptInfo.ownerSign = this.signaturePad.toDataURL();
        console.log(this.receiptInfo.ownerSign);
    }

    starClick(item: any, index: number) {
        if (this.readonly == false) {
            var normalClass = document.getElementById(item.dim + index).className.replace("-star-outline ", "-star ");
            var outlineClass = document.getElementById(item.dim + index).className.replace("-star ", "-star-outline ");
            for (var i = 1; i <= 5; i++) {
                if (i <= index) {
                    document.getElementById(item.dim + i).className = normalClass;
                    document.getElementById(item.dim + i)["ng-reflect-is-active"] = "true";
                } else {
                    document.getElementById(item.dim + i).className = outlineClass;
                    document.getElementById(item.dim + i)["ng-reflect-is-active"] = "false";
                }
            }
            item.score = index;
        }
    }
}

export class ReceiptInfo {
    projId: any; projName: string;
    buildingId: any; buildingName: string;
    floorId: any; floorName: string;
    roomId: any; roomName: string;
    ownerName: string; ownerPhone: string;
    electricMeter: number;
    waterMeter: number;
    gasMeter: number;
    keyReserve: number;
    dlvrDate: string;
    ownerSign: any;
    batchid: string;
    // satisfactionDlvr: number;
    // satisfactionInspector: number;
    // satisfactionSystem: number;
    // satisfactionQuality: number;
    // satisfactionLandscape: number;
    additionNote: string;
}