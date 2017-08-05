import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class LocalStorage {

  constructor( public storage: Storage) {
    //this.init();
  }

  init(){
    console.log('Hello LocalStorage Provider');
    this.storage.get("initialed").then(
      v => v != null).then(initialed => {
        if (!initialed) {console.log('Hello Local');
          this.storage.clear().then(v=>{        
          this.storage.set('initialed', 'true');
          //楼号列表
          this.storage.set('buildings', [{ buildingid: 1, name: '1号楼' }, { buildingid: 2, name: '2号楼' }, { buildingid: 3, name: '3号楼' }]);
          //各楼层数
          this.storage.set('b1', [{ floorid: 1, name: '架空层' }, { floorid: 2, name: '一楼' }, { floorid: 3, name: '二楼' }, { floorid: 4, name: '三楼' }]);
          this.storage.set('b2', [{ floorid: 1, name: '架空层' }, { floorid: 2, name: '一楼' }, { floorid: 3, name: '二楼' }, { floorid: 4, name: '三楼' }, { floorid: 5, name: '四楼' }]);
          this.storage.set('b3', [{ floorid: 1, name: '架空层' }, { floorid: 2, name: '一楼' }, { floorid: 3, name: '二楼' }]);
          //各楼&各楼层的单元
          this.storage.set('b1f1', [{ roomid: 'b1f1-D1', name: '1#门厅' }, { roomid: 'b1f1-D2', name: '2#门厅' }]);
          this.storage.set('b1f2', [{ roomid: 'b1f2-101', name: '101单元' }, { roomid: 'b1f2-102', name: '102单元' }, { roomid: 'b1f2103', name: '103单元' }, { roomid: 'b1f2-104', name: '104单元' }]);
          this.storage.set('b1f3', [{ roomid: 'b1f3-201', name: '201单元' }, { roomid: 'b1f3-202', name: '202单元' }, { roomid: 'b1f3-203', name: '203单元' }, { roomid: 'b1f3-204', name: '204单元' }]);
          this.storage.set('b1f4', [{ roomid: 'b1f4-301', name: '301单元' }, { roomid: 'b1f4-302', name: '302单元' }, { roomid: 'b1f4-303', name: '303单元' }, { roomid: 'b1f4-304', name: '304单元' }]);
          this.storage.set('b2f1', [{ roomid: 'b2f1-D1', name: '1#门厅' }, { roomid: 'b2f1-D2', name: '2#门厅' }]);
          this.storage.set('b2f2', [{ roomid: 'b2f2-101', name: '101单元' }, { roomid: 'b2f2-102', name: '102单元' }, { roomid: 'b2f2-103', name: '103单元' }, { roomid: 'b2f2-104', name: '104单元' }]);
          this.storage.set('b2f3', [{ roomid: 'b2f3-201', name: '201单元' }, { roomid: 'b2f3-202', name: '202单元' }, { roomid: 'b2f3-203', name: '203单元' }, { roomid: 'b2f3-204', name: '204单元' }]);
          this.storage.set('b2f4', [{ roomid: 'b2f4-301', name: '301单元' }, { roomid: 'b2f4-302', name: '302单元' }, { roomid: 'b2f4-303', name: '303单元' }, { roomid: 'b2f4-304', name: '304单元' }]);
          this.storage.set('b2f5', [{ roomid: 'b2f5-401', name: '401单元' }, { roomid: 'b2f5-402', name: '402单元' }, { roomid: 'b2f5-403', name: '403单元' }, { roomid: 'b2f5-404', name: '404单元' }]);
          this.storage.set('b3f1', [{ roomid: 'b3f1-D1', name: '1#门厅' }, { roomid: 'b3f1-D2', name: '2#门厅' }]);
          this.storage.set('b3f2', [{ roomid: 'b3f2-101', name: '101单元' }, { roomid: 'b3f2-102', name: '102单元' }, { roomid: 'b3f2-103', name: '103单元' }, { roomid: 'b3f2-104', name: '104单元' }]);
          this.storage.set('b3f3', [{ roomid: 'b3f3-201', name: '201单元' }, { roomid: 'b3f3-202', name: '202单元' }, { roomid: 'b3f3-203', name: '203单元' }, { roomid: 'b3f3-204', name: '204单元' }]);
          //各单元详情
          this.storage.set('b1f1-D1', {
            buildingid: 1,
            floorid: 1,
            drawingid: 'dwgb1f1-D1',
            status: '待整改',
            issues: [
              { issueid: '192901920381-2903', status: '待整改' },
              { issueid: '192901920381-2904', status: '已整改' }
            ]
          });
          this.storage.set('b1f1-D2', {
            buildingid: 1,
            floorid: 1,
            drawingid: 'dwg-base64',
            status: '待整改',
            issues: []
          });

          this.storage.set('b1f2-101', {
            buildingid: 1,
            floorid: 2,
            drawingid: 'dwg2101',
            status: '待接待',
            issues: []
          });

          this.storage.set('b1f2-102', {
            buildingid: 1,
            floorid: 2,
            drawingid: 'dwgb1f2-103',
            status: '待接待',
            issues: []
          });

          //图纸列表
          this.storage.set('dwg2101', {
            width: 936, src: 'assets/img/2101.jpg',
            sections: ['厨房', '餐厅', '次卫', '客厅', '过道', '书房', '次卧', '更衣室', '主卫', '主卧'],
            areas: [
              //{ left: 210, top: 0, right: 445, bottom: 235, name: '厨房' },
              {name: '厨房',points: [{ x: 210, y: 0 }, { x: 445, y: 0 }, { x: 445, y: 235 }]}
              // { left: 30, top: 60, right: 210, bottom: 235, name: '餐厅' },
              // { left: 30, top: 235, right: 323, bottom: 390, name: '餐厅' },
              // { left: 323, top: 235, right: 445, bottom: 390, name: '次卫' },
              // { left: 30, top: 391, right: 395, bottom: 680, name: '客厅' },
              // { left: 396, top: 391, right: 600, bottom: 460, name: '过道' },
              // { left: 446, top: 155, right: 615, bottom: 390, name: '书房' },
              // { left: 396, top: 461, right: 600, bottom: 680, name: '次卧' },
              // { left: 615, top: 215, right: 756, bottom: 390, name: '更衣室' },
              // { left: 755, top: 160, right: 890, bottom: 390, name: '主卫' },
              // { left: 600, top: 391, right: 890, bottom: 680, name: '主卧' }
            ]
          });
          this.storage.set('dwgb1f1-D1', {
            width: 543, src: 'assets/img/b1f1-D1.jpg',
            sections: ['楼梯1', '电梯厅', '过道1', '楼梯2', '休息厅', '过道2', '前厅'],
            areas: [
              { left: 50, top: 60, right: 140, bottom: 230, name: '楼梯1' },
              { left: 55, top: 231, right: 260, bottom: 387, name: '电梯厅' },
              { left: 140, top: 388, right: 260, bottom: 493, name: '过道1' },
              { left: 50, top: 430, right: 139, bottom: 610, name: '楼梯2' },
              { left: 141, top: 60, right: 360, bottom: 230, name: '休息厅' },
              { left: 261, top: 231, right: 335, bottom: 330, name: '过道2' },
              { left: 261, top: 331, right: 510, bottom: 500, name: '前厅' }
            ]
          });
          this.storage.set('dwgb1f2-103', {
            width: 500, src: 'assets/img/b1f2-103.jpg',
            sections: ['北阳台', '厨房', '次卧', '餐厅', '卫生间', '主卧', '过道', '客厅', '南陌台'],
            areas: [
              { left: 235, top: 6, right: 335, bottom: 54, name: '北阳台' },
              { left: 235, top: 55, right: 335, bottom: 147, name: '厨房' },
              { left: 130, top: 80, right: 235, bottom: 230, name: '次卧' },
              { left: 235, top: 148, right: 335, bottom: 235, name: '餐厅' },
              { left: 100, top: 81, right: 195, bottom: 300, name: '卫生间' },
              { left: 100, top: 301, right: 234, bottom: 480, name: '主卧' },
              { left: 195, top: 280, right: 234, bottom: 300, name: '主卧' },
              { left: 195, top: 231, right: 234, bottom: 279, name: '过道' },
              { left: 235, top: 231, right: 380, bottom: 420, name: '客厅' },
              { left: 235, top: 421, right: 380, bottom: 480, name: '南陌台' }
            ]
          });
          //this.storage.set('dwg-base64', { width: 93, src: "data:image/jpeg;base64,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" });

          //问题列表
          this.storage.set('issue192901920381-2903', {
            sections: '电梯间', x: 65, y: 250, status: 1,
            checkitems: "多媒体箱", itemdesc: "箱门变形、损坏", uglever: "一般",
            vend: "甲方", responsibility: "甲方", imgssumbit: ["img_s0001","img_s0002"]
          });
          this.storage.set('issue192901920381-2904', {
            sections: '楼梯2', x: 100, y: 600, status: 3, checkitems: "开关", itemdesc: "部件缺失",
            uglever: "一般", vend: "八达建设", responsibility: "八达建设"
            , registertime: "2017-04-27 14:20:39", duetime: "2017-05-04", fixtime: "2017-04-27 17:10:29"
          });

          //状态列表
          this.storage.set('status0', { id: 0, name: '待接待', color: 'white', enable: 'room' })
          this.storage.set('status1', { id: 1, name: '待派单', color: 'darkviolet', enable: 'room,issue' })
          this.storage.set('status2', { id: 2, name: '待整改', color: 'red', enable: 'room,issue' })
          this.storage.set('status3', { id: 3, name: '已整改', color: 'blue', enable: 'room,issue' })
          this.storage.set('status4', { id: 4, name: '已通过', color: 'green', enable: 'room,issue' })
          this.storage.set('status5', { id: 5, name: '已作废', color: 'gray', enable: 'issue' })
          this.storage.set('status9', { id: 9, name: '非正常关闭', color: 'yellow', enable: 'issue' })

          //照片
          this.storage.set('img_s0001', 'assets/img/4.jpeg')
          this.storage.set('img_s0002', 'assets/img/little.jpg')

          //用户信息          
          
          //this.storage.set('curuser',{userid:'admin',duetime: 1498121315683,token:"ejofwijfeoiwfjewi",username:'adminname',vendrole:false})
          //this.storage.set('curproj',{projid:'p0001',projname:'项目1'})
          //this.storage.set('projversion',[{projid:'p0001',projname:'项目1',version:10},{projid:'p0002',projname:'项目2',version:1}])
          this.storage.set('myteamp0001',[{userid:12346578910,username:'testaaa'},{userid:42346578910,username:'testbbb'}])
            })
        }
      }
      )
  }
  getItem(key: string): Promise<any> {
    return this.storage.get(key).then(value => {
      return value;
    }).catch(error => {

    });
  }

  setItem(key: string, val: any): Promise<boolean> {
    return this.storage.set(key, val).then(function () {
      return true;
    }).catch(function () { return false; })
  }

  removeitem(key:string): Promise<any> {
    return this.storage.remove(key).then(value => {
      return value;
    }).catch(error => {

    });
  }

}
