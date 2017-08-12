import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

@Component({
    selector: 'imageeditormodal',
    templateUrl: 'imageeditormodal.html',
})
export class ImageEditorModal {

    @ViewChild('footerBar')
    footerBar: ElementRef;
    @ViewChild('canvasDisplay')
    canvasDisplay: ElementRef;
    //@ViewChild('myCanvas')
    //canvas: ElementRef;
    canvas:any;
    imageSrc: string;
    mousestouch: Array<Array<{x: number, y:number}>>;
    context: any;
    mouses: Array<{x: number, y:number}>;
    mouse: {x: number, y: number};
    imageWidth: number;
    imageHeight: number;
    image: any;
    drawcolor: string;
    username: string;
    constructor(
        private navCtrl: NavController,
        private navParams: NavParams,
        private viewCtrl: ViewController
    ) {
        this.username = navParams.get('username');
        this.imageSrc = navParams.get('imageSrc');
        this.drawcolor = '#ff0000';
        let val: any;
		// let elements = document.querySelectorAll(".tabbar");
		// if (elements != null) {
		// 	Object.keys(elements).map((key) => {
		// 		elements[key].style.display = 'none';
		// 	});
		// }		
    }

    ionViewDidEnter() {        
        this.image = new Image();
        this.canvas = document.getElementById("myCanvasEditor");
        const bodyWidth = this.canvasDisplay.nativeElement.offsetWidth;
        const bodyHeight = this.canvasDisplay.nativeElement.offsetHeight;
        const bodyRate = bodyWidth / bodyHeight;
        this.image.onload = val => {            
            this.imageWidth = this.image.width;
            this.imageHeight = this.image.height;         
            let canvasWidth = 0
            let canvasHeight = 0;
            if(this.image.width / this.image.height > bodyRate) {
                canvasWidth = this.image.width > bodyWidth? bodyWidth: this.image.width;
                canvasHeight = canvasWidth / this.image.width * this.image.height;                
            } else {
                canvasHeight = this.image.height > bodyHeight? bodyHeight: this.image.height;
                canvasWidth = canvasHeight / this.image.height * this.image.width;                
            }

            this.canvas.width = canvasWidth;//nativeElement
            this.canvas.height = canvasHeight;//nativeElement
            this.context = this.canvas.getContext("2d");//nativeElement
            this.context.lineWidth = 3;
            this.context.lineJoin = 'round';
            this.context.lineCap = 'round';
            this.context.strokeStyle = this.drawcolor;
            this.mousestouch = [];
            this.context.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, canvasWidth, canvasHeight);
            this.context.save();
        }
        this.image.crossOrigin = "*";
        this.image.src = this.imageSrc;
    }

    close() {
        this.viewCtrl.dismiss();
    }

    touchStart(event) {
        this.context.strokeStyle = this.drawcolor;
        this.context.beginPath();	        
        this.mouse = { x: event.changedTouches[0].clientX - this.canvas.getBoundingClientRect().left, y: event.changedTouches[0].clientY - this.canvas.getBoundingClientRect().top };				
        //this.mouse = { x: event.touches[0].pageX, y: event.touches[0].pageY - this.footerBar.nativeElement.offsetHeight };
        this.context.moveTo(this.mouse.x, this.mouse.y);
        //console.log(mouses);
        this.mouses = [{ x: this.mouse.x, y:this. mouse.y }];

    }

    touchMove(event) {
        //this.mouse.x = event.touches[0].pageX;
        //this.mouse.y = event.touches[0].pageY - this.footerBar.nativeElement.offsetHeight;
        this.mouse.x = event.changedTouches[0].clientX - this.canvas.getBoundingClientRect().left;
	    this.mouse.y = event.changedTouches[0].clientY - this.canvas.getBoundingClientRect().top;
				
        this.mouses.push({ x: this.mouse.x, y: this.mouse.y });
        this.context.lineTo(this.mouse.x, this.mouse.y);
        this.context.stroke();
    }

    touchEnd(event) {
        this.mousestouch.push(this.context.strokeStyle);
        this.mousestouch.push(this.mouses);
    }

    confirm() {
        this.context.font = 12 + "px Arial";
        this.context.textBaseline = 'middle';//更改字号后，必须重置对齐方式，否则居中麻烦。设置文本的垂直对齐方式
        this.context.textAlign = 'right-side';
        //var tw = cxt.measureText(text).width;
        var ftop = this.canvas.height - 15;//nativeElement
        var fleft = this.canvas.width / 10;//nativeElement
        var now = new Date();
        var text = this.username+ '拍摄于 ' + now.toLocaleDateString() + "  " + now.toLocaleTimeString();
        this.context.fillStyle = "#ffffff";
        this.context.fillText(text, fleft, ftop);//文本元素在画布居中方式
        this.context.save();
        let newsrc = this.canvas.toDataURL('image/jpeg',9.2);   //nativeElement   
        this.viewCtrl.dismiss(newsrc);//'data:image/jpeg;base64,' + imageData);
    }

    undo() {
        this.context.clearRect(0, 0, this.context.width, this.context.height);
		this.context.drawImage(this.image, 0, 0, this.imageWidth, this.imageHeight, 0, 0, this.canvas.width, this.canvas.height);//nativeElement		
		this.mousestouch.pop();	
        this.mousestouch.pop();
        let mouses:Array<any>;
        let mouse:any;
        mouses = [];
		for (var i = 0; i < this.mousestouch.length; i+=2)
		{
			mouses = this.mousestouch[i+1];
			mouse = mouses[0];
			this.context.strokeStyle = this.mousestouch[i];	    
			this.context.moveTo(mouse.x, mouse.y);
			this.context.beginPath();
			for (var j =1; j < mouses.length; j++)
			{
				mouse = mouses[j];
				this.context.lineTo(mouse.x, mouse.y);
			    this.context.stroke();
			}			
		}
		this.context.save();
    }

    blueclick(){
		this.drawcolor = '#0000ff';	
        console.log(this.drawcolor);
	}

	redclick(){
		this.drawcolor = '#ff0000';		
	}

    ionViewWillLeave() {
		// let elements = document.querySelectorAll(".tabbar");
		// if (elements != null) {
		// 	Object.keys(elements).map((key) => {
		// 		elements[key].style.display = 'flex';
		// 	});
		// }
	}
}