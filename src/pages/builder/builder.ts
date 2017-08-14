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
    assignfilterstr: string = "负责人";// + "∨";
    buildingfilterstr: string = "楼栋";// + "∨";
    floorfilterstr: string = "楼层";// + "∨";
    duedatefilterstr: string = "整改时限";// + "∨";
    sortingstr: string = "默认排序";// + "∨";
    sortingname: string = "default";
    returntimesfilterstr: string = "退回次数";// + "∨";  "∧"
    sortings: Array<any>;
    assigncolor: string = "light";
    buildcolor: string = "light";
    floorcolor: string = "light";
    duedatecolor: string = "light";
    returncolor: string = "light";
    sortingcolor: string = "light";
    assignarrow: string = "∨";
    buildarrow: string = "∨";
    floorarrow: string = "∨";
    duedatearrow: string = "∨";
    returnarrow: string = "∨";
    sortingarrow: string = "∨";
    constructor(public navCtrl: NavController, public navParams: NavParams, public actionSheetCtrl: ActionSheetController, public dialogs: Dialogs,
        public initBaseDB: initBaseDB, public nativeservice: NativeService, public localStorage: LocalStorage, private clipboard: Clipboard) {
        this.localStorage.getItem('curuser').then(val => {
            this.userid = val.userid;
            this.username = val.username;
            this.token = val.token;
        })
        this.sortings = [{ fieldstr: "默认排序", fieldname: "default" }, { fieldstr: "工序批次", fieldname: "BatchName" }, { fieldstr: "紧急程度", fieldname: "UrgencyId" }, { fieldstr: "整改时限", fieldname: "LimitDate" }, { fieldstr: "退回次数", fieldname: "ReturnNum" }];
    }

    ionViewDidEnter() {
        console.log("builderload");
        this.loadIssues();
    }

    doRefresh(refresher) {
        console.log('Begin async operation', refresher);
        setTimeout(() => {
            this.nativeservice.isConnecting().then(val => {
                if (val == true) {
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
                } else {
                    refresher.complete();
                }
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
            this.nativeservice.alert("请先选择要处理的问题项.");
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
                this.nativeservice.alert('错误: ' + reject);
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
            this.nativeservice.alert("请先选择要处理的问题项.");
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
            this.nativeservice.alert("请先选择要处理的问题项.");
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
                    if (val.needupd == 1) {
                        return this.nativeservice.isConnecting().then(val => {
                            console.log("is connecting" + val);
                            if (val == true) {
                                console.log('downlo');
                                this.nativeservice.showLoading("正在下载基础数据,请稍侯...")
                                return this.initBaseDB.downloadbuilderdata(this.token, this.projid);
                            } else {
                                return 1;
                            }
                        })
                    } else {
                        return 1;
                    }
                } else {
                    this.nativeservice.showToast("没有需要整改的项目问题")
                    throw '';
                }
            }).then((v2) => {
                return this.initBaseDB.getbuilderissuelist(this.projid, 1, this.assignfilterstr, this.buildingfilterstr, this.floorfilterstr, this.duedatefilterstr, this.returntimesfilterstr, this.sortingname);
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
    }

    presentfilter(groupbystr) {
        this.initBaseDB.getissuesuminfo(this.projid, 1, this.assignfilterstr, this.buildingfilterstr, this.floorfilterstr, this.duedatefilterstr, this.returntimesfilterstr, groupbystr).then(val => {
            if (val && val.length > 0) {
                let actionSheet = this.actionSheetCtrl.create({
                    title: '选择过滤条件',
                    buttons: [{ text: '取消', role: 'cancel', handler: () => { this.cancelfilter(groupbystr); } }]
                });
                if (groupbystr == "LimitDate") {
                    for (let s of val) {
                        if (s.fieldstr == "全部") {
                            actionSheet.addButton({ text: s.fieldstr + '  共 ' + s.counts + ' 条', handler: () => { this.filter(groupbystr, s); } });
                        } else {
                            let dt = new Date(s.fieldstr);
                            actionSheet.addButton({ text: dt.toLocaleDateString() + '  共 ' + s.counts + ' 条', handler: () => { this.filter(groupbystr, s); } });
                        }
                    }
                } else {
                    for (let s of val) {
                        actionSheet.addButton({ text: s.fieldstr + '  共 ' + s.counts + ' 条', handler: () => { this.filter(groupbystr, s); } });
                    }
                }
                actionSheet.present();
            }
        })
    }

    cancelfilter(groupbystr) {
        if (groupbystr == "ResponsibleName") {
            this.assigncolor = "light";
            this.assignarrow = "∨";
        } else if (groupbystr == "BuildingName") {            
            this.buildcolor = "light";
            this.buildarrow = "∨";
        } else if (groupbystr == "FloorName") {            
            this.floorcolor = "light";
            this.floorarrow = "∨";
        } else if (groupbystr == "LimitDate") {            
            this.duedatecolor = "light";
            this.duedatearrow = "∨";
        } else if (groupbystr == "ReturnNum") {            
            this.returncolor = "light";
            this.returnarrow = "∨";
        }
    }

    filter(groupbystr, item) {
        if (groupbystr == "ResponsibleName") {
            this.assignfilterstr = item.fieldstr;
            this.assigncolor = "light";
            this.assignarrow = "∨";
        } else if (groupbystr == "BuildingName") {
            this.buildingfilterstr = item.fieldstr;
            this.buildcolor = "light";
            this.buildarrow = "∨";
        } else if (groupbystr == "FloorName") {
            this.floorfilterstr = item.fieldstr;
            this.floorcolor = "light";
            this.floorarrow = "∨";
        } else if (groupbystr == "LimitDate") {
            let dt = new Date(item.fieldstr);
            this.duedatefilterstr = dt.toLocaleDateString();
            this.duedatecolor = "light";
            this.duedatearrow = "∨";
        } else if (groupbystr == "ReturnNum") {
            this.returntimesfilterstr = item.fieldstr;
            this.returncolor = "light";
            this.returnarrow = "∨";
        }
        this.refresh();
    }

    refresh(): Promise<any> {
        return new Promise((resolve) => {
            this.issuelist = []; this.teammembers = [];
            let promise = new Promise((resolve) => {
                resolve(100);
            });
            console.log("refreshIssues");
            this.nativeservice.showLoading("处理中，请稍侯...");
            resolve(promise.then((v1) => {
                return this.initBaseDB.getbuilderissuelist(this.projid, 1, this.assignfilterstr, this.buildingfilterstr, this.floorfilterstr, this.duedatefilterstr, this.returntimesfilterstr, this.sortingname);
            }).then((val: any) => {
                console.log("refresh end");
                if (val) {
                    this.issuelist = val;
                    this.needupd = val[8];
                    this.asscounts = val[4];
                    this.forfixcounts = val[5];
                    this.fixedcounts = val[6];
                    this.returncounts = val[7];
                }
                return 1;
            }).then((v: any) => {
                this.nativeservice.hideLoading();
                return 1;
            }).catch(err => {
                this.nativeservice.hideLoading();
                console.log('问题加载失败:' + err);
                throw '问题加载失败';
            }))
        })
    }

    assignfilter() {
        this.assignarrow = "∧";
        this.assigncolor = "primary";
        this.presentfilter("ResponsibleName");
    }

    buildfilter() {
        this.buildarrow = "∧";
        this.buildcolor = "primary";
        this.presentfilter("BuildingName");
    }

    floorfilter() {
        this.floorarrow = "∧";
        this.floorcolor = "primary";
        this.presentfilter("FloorName");
    }

    duedatefilter() {
        this.duedatearrow = "∧";
        this.duedatecolor = "primary";
        this.presentfilter("LimitDate");
    }

    returntimesfilter() {
        this.returnarrow = "∧";
        this.returncolor = "primary";
        this.presentfilter("ReturnNum");
    }

    presentsorting() {
        let actionSheet = this.actionSheetCtrl.create({
            title: '选择排序规则',
            buttons: [{ text: '取消', role: 'cancel', handler: () => { this.cancelsorting(); }}]
        });
        for (let s of this.sortings) {
            actionSheet.addButton({ text: s.fieldstr, handler: () => { this.sorting(s); } });
        }
        actionSheet.present();
    }

    sorting(item) {
        this.sortingstr = item.fieldstr;
        this.sortingname = item.fieldname;
        this.sortingcolor = "light";
        this.sortingarrow = "∨";
        this.refresh();
    }

    sortingclick() {
        this.sortingcolor = "primary";
        this.sortingarrow = "∧";
        this.presentsorting();
    }

    cancelsorting() {
        this.sortingcolor = "light";
        this.sortingarrow = "∨";
    }
}
