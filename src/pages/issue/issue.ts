import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { LocalStorage } from '../../providers/local-storage';
import { NativeService } from "../../providers/nativeservice";
//import { ImgeditorPage } from '../../pages/imageeditor/imgeditor';
import { ShowimgPage } from '../../pages/imageeditor/showimg';
import { ImageEditorModal } from '../../pages/imageeditor/imageeditormodal';
import { initBaseDB } from '../../providers/initBaseDB';

@Component({
	selector: 'page-issue',
	templateUrl: 'issue.html'
})
export class IssuePage {
	@ViewChild('issuedesc')
	issuedescDiv: ElementRef;
	roomname: string;
	position: string;
	positionid: string;
	checkitem: string;
	checkitemid: string;
	itdesc: string;
	descplus: string;
	uglevel: string;
	vend: string;
	vendid: string;
	resunit: string;
	resunitid: string;
	positions: Array<string>;
	checkitems: Array<any>;
	checkitemids: Array<any>;
	itemdescs: Array<Array<string>>;
	urgencylevel: Array<string>;
	vendors: Array<any>;
	vendids: Array<any>;
	responsibilityunits: Array<any>;
	responsibilityunitids: Array<any>;
	images: Array<string>;
	registertime: string;
	duetime: string;
	issueid: string;
	issue_x: number;
	issue_y: number;
	roomid: string;
	url: string;
	buildingname: string;
	projid: string;
	batchid: string;
	positionids: Array<string>;
	fixedchecked: boolean;
	first: boolean;
	buildingid: string;
	userid: string;
	username: string;
	type: number;
	vendmanagers: Array<string>;
	vendmanagernames: Array<string>;
	vendmanagerphone: Array<string>;
	manager: string;
	managername: string;
	managerphone: string;
	timelimit: number;
	floorid: string;
	constructor(public localStorage: LocalStorage, private camera: Camera, public navCtrl: NavController, public alertCtrl: AlertController, public initBaseDB: initBaseDB,
		public params: NavParams, private nativeService: NativeService, private modalCtrl: ModalController, private elementRef: ElementRef) {
		this.projid = this.params.get('projid');
		this.buildingname = this.params.get('buildingname');
		this.roomid = this.params.get('roomid');
		this.position = this.params.get('section');
		this.issue_x = this.params.get('x');
		this.issue_y = this.params.get('y');
		this.roomname = this.params.get('roomname');
		this.batchid = this.params.get('batchid');
		this.buildingid = this.params.get('buildingid');
		this.type = this.params.get('type');
		this.floorid = this.params.get('floorid');
		let areas: Array<any>; areas = []; areas = this.params.get('areas');
		this.positions = [];
		this.positionids = [];
		areas.forEach(v => {
			this.positions.push(v.name);
			this.positionids.push(v.positionid);
		})
		console.log(this.positions);
		this.checkitems = [];
		this.checkitemids = [];
		this.itemdescs = [];
		this.vendors = [];
		this.vendids = [];
		this.vendmanagers = [];
		this.vendmanagernames = [];
		this.vendmanagerphone = [];
		this.responsibilityunits = [];
		this.responsibilityunitids = [];
		this.urgencylevel = ["一般", "紧急"];
		this.images = [];
		this.checkitem = '';
		this.itdesc = '';
		this.descplus = '';
		this.uglevel = '一般';
		this.vend = '';
		this.resunit = '';
		this.issueid = '';
		this.fixedchecked = false;
		this.first = true;
		this.localStorage.getItem('curuser').then(val => {
			this.userid = val.userid; this.username = val.username;
		})

		if (this.position) {
			this.positionid = this.positionids[this.positions.indexOf(this.position)];
			this.initBaseDB.getcheckitem(this.projid, this.roomid, this.positionid).then(val => {
				val.forEach(v => {
					this.checkitems.push(v.name);
					this.checkitemids.push(v.id);
				})
			})
		}
	}

	Cansubmit(): boolean {
		if (this.positionid == '') {
			this.nativeService.alert('部位不能为空'); return false;
		} else if (this.checkitem == "") {
			this.nativeService.alert('检查项不能为空'); return false;
		} else if (this.itdesc == "") {
			this.nativeService.alert('描述不能为空'); return false;
		} else if (this.vend == "") {
			this.nativeService.alert('承建商不能为空'); return false;
		} else if (this.resunit == "") {
			this.nativeService.alert('责任单位不能为空'); return false;
		} else {
			return true;
		}
	}

	positionchange() {
		this.positionid = this.positionids[this.positions.indexOf(this.position)];
		this.initBaseDB.getcheckitem(this.projid, this.roomid, this.positionid).then(val => {
			console.log(val);
			this.checkitems = []; this.checkitemids = [];
			val.forEach(v => {
				this.checkitems.push(v.name);
				this.checkitemids.push(v.id);
			})
		})
	}

	itemchange() {
		this.checkitemid = this.checkitemids[this.checkitems.indexOf(this.checkitem, 0)];
		this.itdesc = ''; this.itemdescs = [];
		this.initBaseDB.getcheckitemdescvend(this.projid, this.roomid, this.checkitemid, this.buildingid, this.floorid).then(val => {
			console.log(val);
			this.itemdescs = val[0];
			this.responsibilityunits = []; this.responsibilityunitids = []; this.vendids = []; this.vendors = [];
			let i = 0;
			val[1].forEach(v => {
				this.responsibilityunits.push(v.name);
				this.responsibilityunitids.push(v.id);
				this.vendors.push(v.name);
				this.vendids.push(v.id);
				this.vendmanagers.push(v.manager);
				this.vendmanagernames.push(v.managename);
				this.vendmanagerphone.push(v.phone);
				i++;
			})
			if (i == 0) {
				this.initBaseDB.getprojvendor(this.projid).then(v2 => {
					v2.forEach(v => {
						this.responsibilityunits.push(v.name);
						this.responsibilityunitids.push(v.id);
						this.vendors.push(v.name);
						this.vendids.push(v.id);
						this.vendmanagers.push(v.manager);
						this.vendmanagernames.push(v.managename);
						this.vendmanagerphone.push(v.phone);
						i++;
					})
					if (i > 0) {
						this.vend = this.vendors[0];
						this.vendid = this.vendids[0];
						this.resunit = this.responsibilityunits[0];
						this.resunitid = this.responsibilityunitids[0];
						this.manager = this.vendmanagers[0];
						this.managername = this.vendmanagernames[0];
						this.managerphone = this.vendmanagerphone[0];
					}
					console.log(this.issuedescDiv);
					let x: any; x = this.issuedescDiv;
					setTimeout(() => {
						x.open();
					}, 0);
				})
			} else {
				this.vend = this.vendors[0];
				this.vendid = this.vendids[0];
				this.resunit = this.responsibilityunits[0];
				this.resunitid = this.responsibilityunitids[0];
				this.manager = this.vendmanagers[0];
				this.managername = this.vendmanagernames[0];
				this.managerphone = this.vendmanagerphone[0];
				console.log(this.issuedescDiv);
				let x: any; x = this.issuedescDiv;
				setTimeout(() => {
					x.open();
				}, 0);
			}
		})
	}

	issuedescchange(event) {
		this.timelimit = 0;
		this.initBaseDB.getduetime(this.projid, this.checkitemid, event).then(val => {
			console.log(JSON.stringify(val.rows.item(0)));
			this.timelimit = val.rows.item(0).Timelimit;
			console.log(this.timelimit);
		})
	}

	vendorchange() {
		let i = 0; i = this.vendors.indexOf(this.vend, 0);
		this.vendid = this.vendids[i];
		console.log("vendorid:" + this.vendid);
		this.manager = this.vendmanagers[i];
		this.managername = this.vendmanagernames[i];
		this.managerphone = this.vendmanagerphone[i];
	}

	responsibilityunitchange() {
		this.resunitid = this.responsibilityunitids[this.responsibilityunits.indexOf(this.resunit, 0)];
	}

	fixedchange(event) {
		console.log(event);
		console.log(this.fixedchecked);
		console.log(event.checked);
		this.fixedchecked = event.checked;
	}

	cameraclick() {
		const options: CameraOptions = {
			quality: 100,
			destinationType: this.camera.DestinationType.DATA_URL,
			encodingType: this.camera.EncodingType.JPEG,
			mediaType: this.camera.MediaType.PICTURE,
			correctOrientation: true,
			targetHeight:800,
			targetWidth:480
		}

		this.camera.getPicture(options).then((imageData) => {
			var src = 'data:image/jpeg;base64,' + imageData;
			const modal = this.modalCtrl.create(ImageEditorModal, {
				imageSrc: src, username: this.username
			});
			modal.onDidDismiss(result => {
				if (result) {
					this.images.push(result);
				}
			});
			modal.present();
		}, (err) => {
			// Handle error
		});

	}

	//   private getPictureSuccess(imageBase64) {
	//     this.isChange = true;        	
	// 	this.images.push('data:image/jpeg;base64,' + imageBase64);

	//   }

	//   saveAvatar() {
	//     if (this.isChange) {
	//       console.log(this.imageBase64);//这是头像数据.
	//       this.nativeService.showLoading('正在上传....');
	//       this.viewCtrl.dismiss({avatarPath: this.avatarPath});//这里可以把头像传出去.
	//     } else {
	//       this.dismiss();
	//     }
	//   }

	//   dismiss() {
	//     this.viewCtrl.dismiss();
	//   }


	ionViewWillEnter() {

	}

	uploaddata(): Promise<any> {
		return new Promise((resolve) => {
			let promise = new Promise((resolve) => {
				resolve(100);
			});
			resolve(promise.then((v1) => {
				return this.initBaseDB.updateImgData(this.projid, this.batchid, this.buildingid, this.images);
			}).then((v2: any) => {
				let sql = "insert into #tablename# (Id,BatchId,IssueId,RoomId,PositionId,CheckItemId,PlusDesc,IssueDesc,UrgencyId,IssueStatus,VendId,ResponVendId,ProjId,RegisterDate,LimitDate,VersionId,BuildingId,EngineerPhone,EngineerName,X,Y,manager,ManagerName,ManagerPhone #imgfields# #reformdate#) values (#values#)"
				let value = [];
				let now = new Date();
				let refields = "";
				this.issueid = '' + now.valueOf() + Math.random();
				let IssueStatus = '待派单';
				if (this.fixedchecked) {
					IssueStatus = '已整改';
					refields = ',ReFormDate,ReviewDate';
				}
				console.log("x:" + this.issue_x + "y:" + this.issue_y);
				let t = new Date(now.getTime() + this.timelimit * 24 * 3600 * 1000);
				let w = new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate(), 15, 59, 59));
				console.log(w.toLocaleString());
				let duetime: string;
				duetime = w.toLocaleDateString() + " " + w.getHours().toString() + ":59:59";
				let curtime: string = now.toLocaleDateString() + " " + now.getHours().toString() + ":" + now.getMinutes() + ":" + now.getSeconds();
				console.log(duetime);
				console.log(curtime);
				value.push("'" + this.issueid + "'");
				value.push("'" + this.batchid + "'");
				value.push("'新增问题'");
				value.push("'" + this.roomid + "'");
				value.push("'" + this.positionid + "'");
				value.push("'" + this.checkitemid + "'");
				value.push("'" + this.descplus + "'");
				value.push("'" + this.itdesc + "'");
				value.push("'" + this.uglevel + "'");
				value.push("'" + IssueStatus + "'");
				value.push("'" + this.vendid + "'");
				value.push("'" + this.resunitid + "'");
				value.push("'" + this.projid + "'");
				value.push("'" + curtime + "'");   //
				value.push("'" + duetime + "'");
				value.push("0");
				value.push("'" + this.buildingid + "'");
				value.push("'" + this.userid + "'");
				value.push("'" + this.username + "'");
				value.push(this.issue_x);
				value.push(this.issue_y);
				value.push("'" + this.manager + "'");
				value.push("'" + this.managername + "'");
				value.push("'" + this.managerphone + "'");
				let imgfields = '';
				for (var i = 0; i < v2.length; i++) {
					imgfields += ',ImgBefore' + (i + 1).toString();
					value.push("'" + v2[i] + "'");
					console.log(imgfields);
				}
				if (IssueStatus == '已整改') {
					value.push("'" + curtime + "'");
					value.push("'" + curtime + "'");
				}// #imgfields# #reformdate#) values (#values#)"
				sql = sql.replace('#imgfields#', imgfields).replace('#reformdate#', refields).replace('#values#', value.join(',')).replace('#tablename#', this.initBaseDB.getissuetablename(this.type));
				console.log(sql);
				return this.initBaseDB.updateIssue([sql]);
			}).then((v3) => {
				return this.initBaseDB.updateuploadflag(this.projid, this.batchid, this.buildingid, this.type);
			}).catch(err => {
				console.log('问题提交失败:' + err);				
			}))
		})
	}

	uploadclick() {
		if (this.Cansubmit()) {
			this.uploaddata().then(v => {
				this.navCtrl.pop();
			})
		}
	}

	deleteimage(imagesrc) {
		let i = 0;
		this.images.forEach(element => {
			if (element == imagesrc)
				this.images.splice(i, 1);
			i++;
		});
	}
	//点击图片放大
	showBigImage(imagesrc) {
		let i = 0;
		this.images.forEach(element => {
			if (element == imagesrc) {
				this.navCtrl.push(ShowimgPage, { imgdata: this.images, num: i });
			}
			i++;
		});
	};
}
