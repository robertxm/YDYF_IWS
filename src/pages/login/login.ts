import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { LocalStorage } from '../../providers/local-storage';
import { initBaseDB } from '../../providers/initBaseDB';
import { TabsPage } from '../tabs/tabs';
import { NativeService } from '../../providers/nativeservice';
import { APP_SERVE_URL } from '../../providers/Constants';
import { HttpService } from '../../providers/HttpService';
import { BuilderTabsPage } from '../buildertabs/buildertabs';
import { ChangePWPage } from '../changepw/changepw';
 //import { ShowimgPage } from '../imageeditor/showimg';
//import { AboutPage } from '../about/about';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  imgheight: any;
  userid: string;
  password: string; 
  
   //images:Array<any> = [];
  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public localStorage: LocalStorage, public initBaseDB: initBaseDB,
    public nativeservice: NativeService, private httpService: HttpService) {
    console.log("login start app");  
    
    this.imgheight = window.innerHeight / 1.8;
    this.localStorage.getItem('curuser').then(val => {
      if (val && val.userid) {
        this.userid = val.userid;
        console.log(val.userid);
      }
    })
  
    // this.images.push("assets/img/login.jpg");
    // this.images.push("assets/img/login.jpg");
    // console.log(this.nativeservice.encode64("12345678902$123456csA10fdB1ewA20"));
    // console.log(this.nativeservice.base64decode(this.nativeservice.encode64("12345678902$123456csA10fdB1ewA20")));
    // let userrole = [];
    // let value:string = this.nativeservice.base64decode("MDE5OEJEOEE1QjIzNjhENTY2MTg1M0U1NjFGOTY3NzLmn6XnnIvpl67popg=");
    // console.log(value);
    //       value = value.replace("CB2DEE59DAD310B98B76330AA024E3CA",'');
    //       console.log(value);
          
    //       while(value.length > 0){
    //         userrole.push(value.substr(2,2));
    //         value = value.substr(4,value.length-4);            
    //       } 
    //       console.log(userrole);

    // let d=[];
    // d.push("'ui'");d.push("'ee'");d.push("'2e'");d.push("'12'");
    // console.log('(#x#)'.replace('#x#', d.join(',')));
    //this.userid = '12345678901'; this.password = "123456";
    // let elements = document.querySelectorAll(".tabbar");
    // if (elements != null) {
    //   Object.keys(elements).map((key) => {
    //     elements[key].style.display = 'none';
    //   });
    // }
  }
  
  loginclick() {    
    //this.navCtrl.push(AboutPage);
    //this.navCtrl.push(ShowimgPage,{ imgdata: ["assets/img/b1f2-103.jpg","assets/img/login.jpg"], num:1 });
    // this.images = [];
    // this.images.push(imageName);
    // this.httpService.post(APP_SERVE_URL + '/AppLogin/AddUser',{Token:"AFC5FA4E2E2C4D7F62D8D9EA82DB9A39",ProjId: "6a397ed5-3923-47e4-8f5a-033920062c02", 
    //                      UserId: "13545678905", Name: "TestProjAccount1"}).then(res=>{
    //       alert(res[0].Result);  
    //       console.log(res[0]);
    // }).catch(e=>{
    //    alert(e);
    //    console.log(e);  
    // })   
    // this.test().then(e => {
    //   console.log("e");
    // })
    //this.initBaseDB.testupdate();
    //data:image/jpg;base64,
    //this.initBaseDB.downloadimg('0f2b58a05f491323efd14a43bc095511.jpg');
 
    //this.initBaseDB.testsql();
    // let d = []; var i = 0; i++;
    // console.log('dde'+i.toString());
    // d.push('test1');
    // d.push('test2');
    // d.push('');
    // d.push('test3');
    // d.push('test4');
    // console.log(d.join(','));
    // let x = [];
    // x.push("(#row#)".replace("#row#", d.join(',')));
    // console.log(x);
    // console.log(x.join(','));
    // let s1 = 'test1', s2 = 'test2',s3 = 'test3',s4 = 'test4';
    // d = [];
    // d.push(s1);d.push(s2),d.push(s3),d.push(s4);
    // console.log(d.join(','));
    // x = [];
    // x.push("(#row#)".replace("#row#", d.join(',')));
    // console.log(x);
    // console.log(x.join(','));
    //this.initBaseDB.testhttp();
    //this.navCtrl.push(BuilderTabsPage);
    // let d = new Date();
    // let t = new Date(d.getTime()+3*24*3600*1000);
    // let w = new Date(Date.UTC(t.getFullYear(),t.getMonth(),t.getDate(),15,59,59));
    // console.log(t.toLocaleDateString());
    // console.log(t.toLocaleTimeString());
    // console.log(w.toLocaleString());
    // console.log(t.toLocaleString());
    // console.log(t.toTimeString());
    
    this.nativeservice.isConnecting().then((val: boolean) => {
      if (val == false) {
        throw '无网络登陆失败';
      } else {
        this.nativeservice.showLoading('加载中,请稍后...');
        this.httpService.get(APP_SERVE_URL + '/AppLogin', { userAct: this.userid, password: this.nativeservice.encode64(this.userid + "$" + this.password) }).then(res => {
          console.log(res[0]);
          this.initData(res[0]).then(v => {
            this.nativeservice.hideLoading();
          })
        }).catch(e => {
          this.nativeservice.hideLoading();
          // this.localStorage.setItem('curproj', { projid: 'p0001', projname: '项目1' })
          // this.localStorage.setItem('curuser', { userid: 'admin', duetime: 1498121315683, token: "ejofwijfeoiwfjewi", username: 'adminname' });
          // this.navCtrl.push(TabsPage);
        })
      }
    })
  }
  

  initData(items): Promise<any> {
    return new Promise((resolve) => {
      let item = items[1];      
      let userrole = [];
      let userrolestr:string = items[3][0];
      console.log(userrolestr);
      if (item.VendRole == false){
          let value:string = this.nativeservice.base64decode(userrolestr);
          value = value.replace(item.Token,'');
          let tmpvalue:string;
          while(value.length > 0){
            userrole.push(value.substr(2,2));
            value = value.substr(4,value.length-4);            
          } 
          console.log(userrole);
      }      
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      // userrole = ["A1","A2","A3","A4","A5","A6","B1"];
      resolve(promise.then((v1) => {
        return this.localStorage.setItem('curuser', { userid: this.userid, token: item.Token, duetime: item.AllowEnd, username: item.UserName, vendrole: item.VendRole, id: item.UserId, userrole:userrole });
      }).then((v2) => {
        return this.initBaseDB.initdb(this.userid + ".db", false);
      }).then((v3) => {
        if (item.VendRole == false && userrole.indexOf('A1') == -1){
          return this.nativeservice.alert("没有APP授权，请联系管理员.").then(v=>{
            return "no proj";
          }).catch(e=>{
            return "no proj";
          })          
        } else {
          return this.initBaseDB.initProjVersion(item.Token, item.VendRole);
        }        
      }).then((v4) => {
        console.log(v4);
        // if (v4 == "no proj") {
          this.nativeservice.hideLoading();
          if (item.VendRole == true) {
            if (item.First == true) {
              this.navCtrl.push(ChangePWPage, { "first": item.first });
            } else {
              console.log(item.First);
              this.navCtrl.push(BuilderTabsPage);
            }
          } else {
            if (item.First == true && userrole.indexOf('B1') != -1) {
              this.navCtrl.push(ChangePWPage, { "first": item.first });
            } else {
              this.navCtrl.push(TabsPage);
            }
          }
          return 10;
        // } else {
        //   if (item.VendRole == true) {
        //     return this.initBaseDB.downloadbuilderdata(item.Token, v4).then(v => {
        //       this.nativeservice.hideLoading();
        //       if (item.First == true) {
        //         this.navCtrl.push(ChangePWPage, { "first": item.first });
        //       } else {
        //         console.log(item.First);
        //         this.navCtrl.push(BuilderTabsPage);
        //       }
        //     })
        //   } else {
        //     return this.initBaseDB.initbuildingversion(item.Token, v4).then(v => {
        //       this.nativeservice.hideLoading();
        //       if (item.First == true) {
        //         this.navCtrl.push(ChangePWPage, { "first": item.first });
        //       } else {
        //         this.navCtrl.push(TabsPage);
        //       }
        //     })
        //   }
        // }
      }).catch(err => {
        console.log(err);
        this.nativeservice.hideLoading();
        // return this.localStorage.setItem('curuser', { userid: 'admin', duetime: 1498121315683, token: "ejofwijfeoiwfjewi", username: 'adminname' }).then(v => {
        //   this.navCtrl.push(TabsPage);
        // })
      }))
      // }
      // else {
      //   let promise = new Promise((resolve) => {
      //     resolve(100);
      //   });
      //   resolve(promise.then((v1) => {
      //     return this.localStorage.setItem('curuser', { userid: this.userid, token: item.Token, duetime: item.AllowEnd, username: item.UserName, vendrole: item.vendrole });
      //   }).then((v2) => {
      //     return this.initBaseDB.initdb(this.userid + ".db", false);
      //   }).then((v3) => {
      //     return this.initBaseDB.initProjVersion(item.Token);
      //   }).then((v4) => {
      //     return this.navCtrl.push(BuilderTabsPage);
      //   }).catch(err => {
      //   console.log(err);
      //   return this.localStorage.setItem('curuser', { userid: 'admin', duetime: 1498121315683, token: "ejofwijfeoiwfjewi", username: 'adminname' }).then(v => {
      //     this.navCtrl.push(BuilderTabsPage);
      //   })
      // }))
      // }
    })
  }
  

}
