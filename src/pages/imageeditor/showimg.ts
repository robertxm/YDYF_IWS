import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Slides } from 'ionic-angular';
import { ViewChild } from '@angular/core';

@Component({
	selector: 'page-showimg',
	templateUrl: 'showimg.html'
})

export class ShowimgPage {
	//url: string;
	//stage: any;
	images:Array<string> = [];
	nums:string = "";
	height: number;
	length: number = 0;	
	num: number = 0;
	@ViewChild(Slides) slides: Slides;
	constructor(public navCtrl: NavController,
		public params: NavParams) {
		//this.url = this.params.get('imgdata');		//"assets/img/b1f2-103.jpg";//
		//console.log(this.url);
		this.height = window.innerHeight;
		this.images = this.params.get('imgdata');
		this.nums = "1 / "+this.images.length.toString();
		this.length = this.images.length;
		this.num = this.params.get('num');
		
	}

	goToSlide() {
		console.log("goToSlide");
		this.slides.slideTo(0, 500);
	}
	slideChanged() {
		let currentIndex = this.slides.getActiveIndex();console.log('Current index is', currentIndex);	
	    this.slides._allowSwipeToNext = (currentIndex+1 < this.length);				
        this.nums = (currentIndex+1).toString()+" / "+this.images.length.toString();			        		
	}
	ionViewDidLoad() {       
	   setTimeout(() => {//最长显示10秒
        this.slides.slideTo(this.num,50);
      }, 50);
	   //
	}

	ngOnInit() {
		for (let i = 0; i<this.images.length; i++){
			console.log(i);
			this.initstage((i+1).toString(),this.images[i]);
		}		
		// console.log("ngOnInit");
		// var stage = document.getElementById('showstage');
		// this.stage = stage;
		// var jQuery = window['jQuery'];
		// let $stage = jQuery(stage);
		// var $ = window['$'];
		// let container: any = document.getElementById('showcontainer');

		// // create a manager for that element
		// var Hammer = window['Hammer'];
		// var manager = new Hammer.Manager(stage);

		// // create recognizers
		// var Pan = new Hammer.Pan();
		// var Pinch = new Hammer.Pinch();
		// // add the recognizers
		// manager.add(Pan);
		// manager.add(Pinch);
		// // subscribe to events
		// var liveScale = 1;
		// var currentRotation = 0;
		// manager.on('rotatemove', function (e) {
		// 	var rotation = currentRotation + Math.round(liveScale * e.rotation);
		// 	$.Velocity.hook($stage, 'rotateZ', rotation + 'deg');
		// });
		// manager.on('rotateend', function (e) {
		// 	currentRotation += Math.round(e.rotation);
		// });

		// var deltaX = 0;
		// var deltaY = 0;
		// manager.on('panmove', function (e) {
		// 	var dX = deltaX + (e.deltaX);
		// 	var dY = deltaY + (e.deltaY);

		// 	if (Math.abs(dX) < $stage.width() - 50)
		// 		$.Velocity.hook($stage, 'translateX', dX + 'px');
		// 	if (Math.abs(dY) < $stage.height() - 50)
		// 		$.Velocity.hook($stage, 'translateY', dY + 'px');
		// });
		// manager.on('panend', function (e) {
		// 	deltaX = deltaX + e.deltaX;
		// 	deltaY = deltaY + e.deltaY;
		// });

		// // subscribe to events
		// var currentScale = 1;
		// function getRelativeScale(scale) {
		// 	return scale * currentScale;
		// }
		// manager.on('pinchmove', function (e) {
		// 	// do something cool
		// 	var scale = getRelativeScale(e.scale);
		// 	$.Velocity.hook($stage, 'scale', scale);
		// });
		// manager.on('pinchend', function (e) {
		// 	// cache the scale
		// 	currentScale = getRelativeScale(e.scale);
		// 	liveScale = currentScale;
		// });
		// console.log(this.height);
		// console.log(this.stage.style.height);
		// if (this.url) {
		// 	this.stage.style.height = (this.height - 50) + "px";
		// 	container.style.height = (this.height - 50) + "px";
		// 	this.stage.style.backgroundImage = 'url(' + this.url + ')';
		// } else {
		// 	this.stage.style.backgroundImage = '';
		// 	this.stage.style.textAlign = "center";
		// 	this.stage.style.lineHeight = this.height;//"400px";
		// 	this.stage.innerText = '没有数据！请返回。';
		// }
		// console.log(this.stage.style.height);
	}

	hideBigImage() {
		this.navCtrl.pop();		
	};

	initstage(num:string,url){
		console.log("ngOnInit");
		let stage = document.getElementById('showstage'+num);		
		let jQuery = window['jQuery'];
		let $stage = jQuery(stage);
		let $ = window['$'];
		let container: any = document.getElementById('showcontainer'+num);

		// create a manager for that element
		let Hammer = window['Hammer'];
		let manager = new Hammer.Manager(stage);

		// create recognizers
		let Pan = new Hammer.Pan();
		let Pinch = new Hammer.Pinch();
		// add the recognizers
		manager.add(Pan);
		manager.add(Pinch);
		// subscribe to events
		let liveScale = 1;
		let currentRotation = 0;
		manager.on('rotatemove', function (e) {
			let rotation = currentRotation + Math.round(liveScale * e.rotation);
			$.Velocity.hook($stage, 'rotateZ', rotation + 'deg');
		});
		manager.on('rotateend', function (e) {
			currentRotation += Math.round(e.rotation);
		});

		let deltaX = 0;
		let deltaY = 0;
		manager.on('panmove', function (e) {
			let dX = deltaX + (e.deltaX);
			let dY = deltaY + (e.deltaY);

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
		let currentScale = 1;
		function getRelativeScale(scale) {
			return scale * currentScale;
		}
		manager.on('pinchmove', function (e) {
			// do something cool
			let scale = getRelativeScale(e.scale);
			$.Velocity.hook($stage, 'scale', scale);
		});
		manager.on('pinchend', function (e) {
			// cache the scale
			currentScale = getRelativeScale(e.scale);
			liveScale = currentScale;
		});
		console.log(this.height);
		console.log(stage.style.height);
		if (url) {
			stage.style.height = (this.height - 50) + "px";
			container.style.height = (this.height - 50) + "px";
			stage.style.backgroundImage = 'url(' + url + ')';
		} else {
			stage.style.backgroundImage = '';
			stage.style.textAlign = "center";
			stage.style.lineHeight = this.height+"px";//"400px";
			stage.innerText = '没有数据！请返回。';
		}
		console.log(stage.style.height);
	}
}
