import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';

@Component({
    selector: 'page-signature',
    templateUrl: 'signature.html',
})
export class Signature implements OnInit{

    @ViewChild(SignaturePad) signaturePad: SignaturePad;
    @ViewChild('contentEl') contentEl: ElementRef;

    imageData: String;
    isEmpty = true;

    // tslint:disable-next-line:no-unused-variable
    private signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
        'minWidth': 1,
        'canvasHeight': 200
    };

    constructor(public navCtrl: NavController, public navParams: NavParams) {
        
    }
    ngOnInit() {
        //var d = document.getElementById("signPad");
        //d.style.width = document.body.clientHeight + "px";
        //d.style.height = document.body.clientWidth + "px";
        //d.style.transform = "rotate(90deg)";
        //d.style.webkitTransform = "rotate(90deg)";
        //d.style.left = (document.body.clientWidth - document.body.clientHeight) + "px";
        //d.style.top = (document.body.clientHeight - document.body.clientWidth) + "px";
    }
    ionViewDidLoad() {
        // this.signaturePad is now available
        this.signaturePad.set('canvasWidth', this.contentEl.nativeElement.offsetWidth); // set szimek/signature_pad options at runtime
        this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
    }

    drawStart() {
        // will be notified of szimek/signature_pad's onBegin event
        console.log('begin drawing');
    }

    drawComplete() {
        // will be notified of szimek/signature_pad's onEnd event
        this.isEmpty = true;
    }

    save() {
        this.imageData = this.signaturePad.toDataURL();
    }

    empty() {
        this.signaturePad.clear();
    }

}
