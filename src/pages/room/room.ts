import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { LocalStorage } from '../../providers/local-storage';
import { IssuePage } from '../issue/issue';
import { IssueviewPage } from '../issueview/issueview';
import { RejectPage } from '../reject/reject';
import { ReceiptPage } from '../receipt/receipt';
import { initBaseDB } from '../../providers/initBaseDB';

@Component({
	selector: 'page-room',
	templateUrl: 'room.html',
})
export class RoomPage implements OnInit {
	projid: string;
	batchid: string;
	type: number;
	buildingid: string;
	buildingname: string;
	roomid: string;
	roomname: string;
	dwgInfo: any;
	dwgFactor: number
	statList: any;
	listview: boolean;
	issues: Array<any>;
	username: string;
	readonly: boolean;
	projname: string;
	readycounts: number;
	forfixcounts: number;
	fixedcounts: number;
	passcounts: number;
	liststr: string;
	userrole: Array<string> = [];
	floorid: string;
	stage: any;
	constructor(public navCtrl: NavController, public params: NavParams, public initBaseDB: initBaseDB,
		public localStorage: LocalStorage, public loadingCtrl: LoadingController) {
		this.projid = this.params.get('projid');
		this.projname = this.params.get('projname');
		this.batchid = this.params.get('batchid');
		this.type = this.params.get('type');
		this.roomid = this.params.get('roomid');
		this.buildingid = this.params.get('buildingid');
		this.buildingname = this.params.get('buildingname');
		this.roomname = this.params.get('roomname');
		this.listview = false;
		this.liststr = "列表";
		this.localStorage.getItem('curuser').then(val => {
			this.username = val.username;
			this.userrole = val.userrole;
		})
		this.readonly = false;
		this.initBaseDB.getfloorid(this.roomid).then(val => {
			if (val && val.rows.length > 0) {
				this.floorid = val.rows.item(0).FloorId;
			}
		})
		this.dwgInfo = {};
		console.log("constructor");
	}

	listshowclick() {
		document.getElementById("apartimg").hidden = !document.getElementById("apartimg").hidden;
		this.listview = !this.listview;
		if (this.listview == true) {
			this.liststr = "户型图";
		} else {
			this.liststr = "列表";
		}
	}

	listclick(issueid) {
		this.navCtrl.push(IssueviewPage, { issueid: issueid, projid: this.projid, batchid: this.batchid, buildingid: this.buildingid, buildingname: this.buildingname, roomid: this.roomid, roomname: this.roomname, type: this.type });
	}

	getIssues(status: string): Array<object> {
		var ret = [];
		for (let issue of this.issues) {
			if (issue.status == status) {
				ret.push(issue);
			}
		}
		return ret;
	}

	doReject() {
		this.navCtrl.push(RejectPage, { "username": this.username, "roomid": this.roomid, "projid": this.projid, "projname": this.projname, "batchid": this.batchid, "buildingid": this.buildingid, "type": this.type });
	}

	doReceipt() {
		this.navCtrl.push(ReceiptPage, { "readonly": this.readonly, "username": this.username, "roomid": this.roomid, "projid": this.projid, "projname": this.projname, "batchid": this.batchid, "buildingid": this.buildingid, "buildingname": this.buildingname, "roomname": this.roomname, "type": this.type });
	};

	Receiptinfo() {
		this.navCtrl.push(ReceiptPage, { "readonly": this.readonly, "username": this.username, "roomid": this.roomid, "projid": this.projid, "projname": this.projname, "batchid": this.batchid, "buildingid": this.buildingid, "buildingname": this.buildingname, "roomname": this.roomname, "type": this.type });
	};

	drawIssue(issueid: string, issue: any) {
		let div = document.createElement('div'); console.log(this.dwgFactor);
		div.style.backgroundColor = this.initBaseDB.getstatuscolor(issue.status);
		div.style.width = '16px';
		div.style.height = '16px';
		div.style.borderRadius = '8px';
		div.style.position = 'absolute';
		div.style.left = (issue.x / this.dwgFactor - 8) + 'px';
		div.style.top = (issue.y / this.dwgFactor - 8) + 'px';
		div.onclick = (e) => {
			e.preventDefault();
			e.stopPropagation();
			// console.log(e);
			this.navCtrl.push(IssueviewPage, { issueid: issueid, projid: this.projid, batchid: this.batchid, buildingid: this.buildingid, buildingname: this.buildingname, roomid: this.roomid, roomname: this.roomname, type: this.type });
		}
		document.getElementById('stage').appendChild(div);
	}



	ionViewDidEnter() {
		this.issues = [];
		this.readycounts = 0; this.forfixcounts = 0; this.fixedcounts = 0; this.passcounts = 0;
		this.loadRommInfo();
	}

	stageClick(e: MouseEvent) {
		if (this.userrole.indexOf('A2') != -1) {
			let cX: number = Math.round(e.offsetX * this.dwgFactor);
			let cY: number = Math.round(e.offsetY * this.dwgFactor);
			let sec: string;
			if (this.dwgInfo.areas) {
				for (var i = 0; i < this.dwgInfo.areas.length; i++) {
					let a: any; a = this.dwgInfo.areas[i];
					let s = this.inPolygon(cX, cY, a.points);
					if (s == '1') {
						sec = a.name;
						break;
					}
					else
						sec = '';
				}
			}
			this.navCtrl.push(IssuePage, { projid: this.projid, batchid: this.batchid, buildingid: this.buildingid, buildingname: this.buildingname, roomid: this.roomid, roomname: this.roomname, x: cX, y: cY, section: sec, areas: this.dwgInfo.areas, type: this.type, floorid: this.floorid });
		}
	}

	loadRommInfo() {
		console.log("loadRommInfo");
		this.initBaseDB.getissuelist(this.projid, this.batchid, this.roomid, this.type).then(res => {
			console.log('getissuelist')
			this.issues = res[0];
			this.readycounts = res[1]; this.forfixcounts = res[2]; this.fixedcounts = res[3]; this.passcounts = res[4];
			this.issues.forEach(issue => {
				this.drawIssue(issue.id, issue);
			});
		})
		this.initBaseDB.getroomdetails(this.roomid, this.batchid).then(val => {
			if (val) {
				if (val.rows.item(0).RoomStatus == "已交付") {
					this.readonly = true;
				}
			}
		})
	}

	ngOnInit() {
		var stage = document.getElementById('stage');
		this.stage = stage;
		var jQuery = window['jQuery'];
		let $stage = jQuery(stage);
		var $ = window['$'];

		// create a manager for that element
		var Hammer = window['Hammer'];
		var manager = new Hammer.Manager(stage);

		// create recognizers
		var Pan = new Hammer.Pan();
		var Pinch = new Hammer.Pinch();
		// add the recognizers
		manager.add(Pan);
		manager.add(Pinch);
		// subscribe to events
		var liveScale = 1;
		var currentRotation = 0;
		manager.on('rotatemove', function (e) {
			var rotation = currentRotation + Math.round(liveScale * e.rotation);
			$.Velocity.hook($stage, 'rotateZ', rotation + 'deg');
		});
		manager.on('rotateend', function (e) {
			currentRotation += Math.round(e.rotation);
		});

		var deltaX = 0;
		var deltaY = 0;
		manager.on('panmove', function (e) {
			var dX = deltaX + (e.deltaX);
			var dY = deltaY + (e.deltaY);

			if (Math.abs(dX) < $stage.width() - 50)
				$.Velocity.hook($stage, 'translateX', dX + 'px');
			if (Math.abs(dY) < $stage.height() - 50)
				$.Velocity.hook($stage, 'translateY', dY + 'px');
		});
		manager.on('panend', function (e) {
			deltaX = deltaX + e.deltaX;
			deltaY = deltaY + e.deltaY;
		});

		// subscribe to events
		var currentScale = 1;
		function getRelativeScale(scale) {
			return scale * currentScale;
		}
		manager.on('pinchmove', function (e) {
			// do something cool
			var scale = getRelativeScale(e.scale);
			$.Velocity.hook($stage, 'scale', scale);
		});
		manager.on('pinchend', function (e) {
			// cache the scale
			currentScale = getRelativeScale(e.scale);
			liveScale = currentScale;
		});
		// this.initBaseDB.testsql(this.roomid).then(val => {

		console.log("getdrawinfo");
		this.initBaseDB.getdrawinfo(this.projid, this.roomid).then(val => {
			if (val) {
				this.dwgInfo = val[0]; console.log(this.dwgInfo);
				this.dwgFactor = this.dwgInfo.width / this.stage.offsetWidth;
				let src = 'data:image/jpeg;base64,' + this.dwgInfo.src;  //data:image/jpeg;base64,				
				this.stage.style.backgroundImage = 'url(' + src + ')';//this.stage.style.backgroundImage = 'url(' + this.dwgInfo.src + ')'; 				
			} else {
				this.stage.style.backgroundImage = '';
				this.stage.style.textAlign = "center";
				this.stage.style.lineHeight = "400px";
				this.stage.innerText = '没有数据！请返回。';
			}
		})
		// })
	}

	/**
	* @description 射线法判断点是否在多边形内部
	* @param {number} px 待判断点的X坐标
	* @param {number} py 待判断点的Y坐标 
	* @param {Array} poly 多边形顶点，数组成员的格式 [{ x: X坐标, y: Y坐标 },{ x: X坐标, y: Y坐标 }...]
	* @return {String} 点 p 和多边形 poly 的几何关系
	*/
	inPolygon(px: number, py: number, poly: [{ x: number, y: number }]) {
		var flag = false
		for (var i = 0, l = poly.length, j = l - 1; i < l; j = i, i++) {
			var sx = poly[i].x,
				sy = poly[i].y,
				tx = poly[j].x,
				ty = poly[j].y
			if ((sx === px && sy === py) || (tx === px && ty === py)) { return '1' }
			if ((sy < py && ty >= py) || (sy >= py && ty < py)) {
				var x = sx + (py - sy) * (tx - sx) / (ty - sy)
				if (x === px) { return '1' }
				if (x > px) { flag = !flag }
			}
		}
		return flag ? '1' : '0'
	}

}
