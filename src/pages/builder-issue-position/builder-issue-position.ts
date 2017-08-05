import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { initBaseDB } from '../../providers/initBaseDB';

@Component({
	selector: 'page-builder-issue-position',
	templateUrl: 'builder-issue-position.html',
})
export class BuilderIssuePosition {
	dwgFactor: number;
	stage: any;
	issueid:string;
	type:number;
	constructor(public navCtrl: NavController, public navParams: NavParams, public initBaseDB: initBaseDB) {
		this.issueid = navParams.get("issueid");
		this.type = navParams.get("type");
	}

	ionViewDidLoad() {
		this.loadRommInfo();
	}

	loadRommInfo() {
		console.log("position start")
		this.initBaseDB.getissuePositionImg(this.issueid,this.type).then((val:any)=>{ console.log(val.rows.item(0));
			if (val) {				
               this.dwgFactor = val.rows.item(0).ImgWidth / this.stage.offsetWidth;
			   let src = 'data:image/jpeg;base64,' + val.rows.item(0).src;
			   this.stage.style.backgroundImage = 'url(' + src + ')';
			   let issue = {status:val.rows.item(0).IssueStatus,x:val.rows.item(0).x,y:val.rows.item(0).y};			   
			   this.drawIssue(issue);
			} else {
				this.stage.style.backgroundImage = '';
				this.stage.style.textAlign = "center";
				this.stage.style.lineHeight = "400px";
				this.stage.innerText = '没有数据！请返回。';
			}			
		})		
	}

	drawIssue(issue: any) {
		let div = document.createElement('div');
		div.style.backgroundColor = this.initBaseDB.getstatuscolor(issue.status);
		div.style.width = '16px';
		div.style.height = '16px';
		div.style.borderRadius = '8px';
		div.style.position = 'absolute';
		div.style.left = (issue.x / this.dwgFactor - 8) + 'px';
		div.style.top = (issue.y / this.dwgFactor - 8) + 'px';
		document.getElementById('stage').appendChild(div);
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
	}

}
