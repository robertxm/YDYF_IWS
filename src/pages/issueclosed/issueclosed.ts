import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
import { AboutPage } from '../about/about'
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ShowimgPage } from '../../pages/imageeditor/showimg';
import { ImageEditorModal } from '../../pages/imageeditor/imageeditormodal';

@Component({
	selector: 'page-issueclosed',
	templateUrl: 'issueclosed.html'
})
export class IssueclosedPage {
	closereason: string;
	otherdesc: string;
	images: Array<string>;
	username: string;
	constructor(public navCtrl: NavController, public params: NavParams, private viewCtrl: ViewController, private camera: Camera, private modalCtrl: ModalController) {
		this.closereason = "与承建商或业主协商后，无需修复";
		this.otherdesc = '';
		this.username = this.params.get('username');
		this.images = [];
	}

	cameraclick() {
		const options: CameraOptions = {
			quality: 90,
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

	deleteimage(imagesrc) {
		let i = 0;
		this.images.forEach(element => {
			if (element == imagesrc)
				this.images.splice(i, 1);
			i++;
		});
	}
	//点击图片放大
	showBigImage(imagesrc) {  //传递一个参数（图片的URl）
		let i = 0;
		this.images.forEach(element => {
			if (element == imagesrc) {
				this.navCtrl.push(ShowimgPage, { imgdata: this.images, num: i });
			}
			i++;
		});
	};

	confirmclick() {
		console.log(this.closereason + this.otherdesc);
		let result = this.closereason;
		if (this.closereason == '其他原因') {
			result = this.otherdesc;
		}
		let results: Array<any>; results = [];
		results.push({ reason: result, img: this.images });
		console.log('confirmed:' + results);
		this.viewCtrl.dismiss(results);
	}

	close() {
        this.viewCtrl.dismiss();
    }

	cancel() {
		this.close();
	}
}
