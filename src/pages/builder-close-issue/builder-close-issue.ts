import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, ViewController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { NativeService } from "../../providers/nativeservice";
import { ShowimgPage } from '../../pages/imageeditor/showimg';
import { ImageEditorModal } from '../../pages/imageeditor/imageeditormodal';

@Component({
	selector: 'page-builder-close-issue',
	templateUrl: 'builder-close-issue.html',
})
export class BuilderCloseIssue {
	username: string;
	images: Array<any>;
	imagesfixed: Array<any>;
	fixeddesc: string;
	overdays: number;
	reasonovertime: string = '';
	reasonovertimeother: string = '';
	reasonsovertimes = ["上个工序未按时完成", "人手不够", "部分工程师请假", "其他"];
	//{"issueid":this.issueid,"userid":this.userid,"username":this.username,"images":this.images,"imagesfixed":this.imagesfixed}
	constructor(public navCtrl: NavController, public navParams: NavParams, private camera: Camera, private modalCtrl: ModalController,
		public params: NavParams, private nativeService: NativeService, private viewCtrl: ViewController) {
	}

	ionViewDidLoad() {
		this.images = []; this.imagesfixed = [];
		this.images = this.navParams.get('images');
		//this.imagesfixed = this.navParams.get('imagesfixed');
		this.username = this.navParams.get('username');
		this.overdays = this.navParams.get('overdays');
	}

    close() {
        this.viewCtrl.dismiss();
    }

	cancel() {
		this.close();
	}

	cansubmit(): boolean {
		let ret: boolean = true;
		if (this.overdays > 0 && this.reasonovertime == '') {
			ret = false;
			this.nativeService.alert("已超时，需选择超时原因.")
		} else if (this.reasonovertime == "其他" && this.reasonovertimeother == '') {
			ret = false;
			this.nativeService.alert("超时原因选择其他，需填写其他说明.");
		}
		return ret;
	}

	submit() {
		if (this.cansubmit() == true) {			
			let result = this.reasonovertime;
			if (this.reasonovertime == '其他') {
				result = this.reasonovertimeother;
			}
			let results: Array<any>; results = [];
			results.push({ reason: result, img: this.imagesfixed,fixeddesc:this.fixeddesc });
			console.log('confirmed:' + results);
			this.viewCtrl.dismiss(results);
		}
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
					this.imagesfixed.push(result);
				}
			});
			modal.present();
		}, (err) => {
			// Handle error
		});
	}

	deleteimage(imagesrc) {
		let i = 0;
		this.imagesfixed.forEach(element => {
			if (element == imagesrc)
				this.imagesfixed.splice(i, 1);
			i++;
		});
	}
	//点击图片放大
	showBigImage(imagesrc, fixedflag: number = 0) {  //传递一个参数（图片的URl）
		let i = 0;
		if (fixedflag == 0) {
			this.images.forEach(element => {
				if (element == imagesrc) {
					this.navCtrl.push(ShowimgPage, { imgdata: this.images, num: i });
				}
				i++;
			})
		} else {
			this.imagesfixed.forEach(element => {
				if (element == imagesrc) {
					this.navCtrl.push(ShowimgPage, { imgdata: this.imagesfixed, num: i });
				}
				i++;
			})
		}
	};
}
