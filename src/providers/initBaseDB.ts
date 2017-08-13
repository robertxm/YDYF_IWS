import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { SQLitePorter } from '@ionic-native/sqlite-porter';
import { APP_SERVE_URL } from '../providers/Constants';
import { FILE_SERVE_URL } from '../providers/Constants';
import { FILE_TOKEN } from '../providers/Constants';
import { HttpService } from '../providers/HttpService';
import { LocalStorage } from '../providers/local-storage';
import { Md5 } from "ts-md5/dist/md5";
import { NativeService } from '../providers/nativeservice';

@Injectable()
export class initBaseDB {
  db: SQLiteObject;
  basedata: Array<any>;
  constructor(public http: Http, private sqlite: SQLite, public storage: Storage, private sqlitePorter: SQLitePorter, private httpService: HttpService,
    public localStorage: LocalStorage, public nativeservice: NativeService) {

  }

  currentdb(): SQLiteObject {
    return this.db;
  }

  initdb(dbname: string, createflag: boolean): Promise<any> {
    return new Promise((resolve) => {
      this.sqlite.create({
        name: dbname,
        location: 'default'
      }).then((val: SQLiteObject) => {
        this.db = val;
        resolve(this.db);
      }).catch(e => console.log(e));
    })
  }

  initData(data, projid): Promise<any> {
    return new Promise((resolve) => {
      this.existstable("ProjPositions").then(val => {
        if (val == 0) {
          let promise = new Promise((resolve) => {
            resolve(100);
          });
          resolve(promise.then((v1) => {
            return this.initBaseTable("ProjPositions", "Projid,Id,Name");
          }).then((v2) => {
            return this.initBaseTable("apartments", "Projid,Id,Image,ImgWidth integer");
          }).then((v3) => {
            return this.initBaseTable("apartmentpostionlink", "Projid,Apartmentid,Positionid,Id");
          }).then((v4) => {
            return this.initBaseTable("apartmentpostiondraws", "Apartmentpostionlinkid,X integer,Y integer,Projid,Sortcode integer");
          }).then((v5) => {
            return this.initBaseTable("projcheckitems", "ProjId,Id,Name");
          }).then((v6) => {
            return this.initBaseTable("projcheckitemdetails", "ProjId,Checkitemid,Name,Timelimit integer,Sortcode integer");
          }).then((v7) => {
            return this.initBaseTable("positioncheckitemlink", "Projid,Positionid,Checkitemid");
          }).then((v8) => {
            return this.initBaseTable("Vend", "Id,NameAlias,Manager,ManagerName,Phone,Projid");
          }).then((v9) => {
            return this.initBaseTable("CustSatisfaction", "Id,Type,Name,Sortcode integer");
          }).then((vv) => {
            return this.initBaseTable("ReasonNoAccepts", "Name");
          }).then((v10) => {
            return this.initBaseTable("imagetable", "projid,fn,src,status integer default 0");   //0 已下载完，1 待上传  2 待删除
          }).catch(err => {
            console.log(err);
          }))
        }
        else {
          let promise = new Promise((resolve) => {
            resolve(100);
          });
          resolve(promise.then((v1) => {
            return this.resetprojdata("projpositions", projid);
          }).then((v2) => {
            return this.resetprojdata("apartments", projid);
          }).then((v3) => {
            console.log("v3");
            return this.resetprojdata("apartmentpostionlink", projid);
          }).then((v4) => {
            console.log("v4");
            return this.resetprojdata("apartmentpostiondraws", projid);
          }).then((v5) => {
            console.log("v5");
            return this.resetprojdata("projcheckitems", projid);
          }).then((v6) => {
            console.log("v6");
            return this.resetprojdata("projcheckitemdetails", projid);
          }).then((v7) => {
            console.log("v7");
            return this.resetprojdata("positioncheckitemlink", projid);
          }).then((v8) => {
            console.log("v8");
            return this.resetprojdata("vend", projid);
          }).then((v9) => {
            return this.resetdata("custsatisfaction");
          }).then((vv) => {
            return this.resetdata("ReasonNoAccepts");
          }).catch(err => {
            console.log(err);
          }))
        }
      })
    })
  }

  initBaseTable(tablename, fields): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      resolve(promise.then((v1) => {
        return this.db.executeSql("DROP TABLE IF EXISTS " + tablename, []);
      }).then((v2: any) => {
        let sql = "CREATE TABLE " + tablename + " (" + fields + ")";
        console.log(sql);
        return this.db.executeSql(sql, []);
      }).then((v1) => {
        console.log("new " + tablename);
        return this.existstable(tablename);
      }).catch(err => {
        console.log(err);
      }))
    })
  }

  deleteTable(tablename): Promise<any> {
    return new Promise((resolve) => {
      resolve(this.db.executeSql("DROP TABLE IF EXISTS " + tablename, []));
    })
  }

  initBaseData(tablename, records): Promise<any> {
    return new Promise((resolve) => {
      var json = {};
      json = { "data": { "inserts": { [tablename]: records } } };
      console.log(tablename); console.log(records);
      this.sqlitePorter.importJsonToDb(this.db, json).then(val => {
        console.log(val);
        this.db.executeSql("SELECT * FROM " + tablename, []).then(vres => {   //SELECT count(*) as counts FROM
          for (var i = 0; i < vres.rows.length; i++) {
            console.log(JSON.stringify(vres.rows.item(i)));
          }
          //alert('Transaction finished, check record count: ' + tablename + "   " + JSON.stringify(vres.rows.item(0)));
          resolve(1);//vres.rows.item(0).counts);
        }).catch(err => {
          this.warn(tablename + ":" + err);
        })
      }).catch(e => {
        console.log(tablename + 'error');
        console.log('Transaction error: ' + e.message);
      })
    })
  }

  recordcounts(tablename): Promise<any> {
    return new Promise((resolve) => {
      this.db.executeSql("SELECT count(*) FROM " + tablename, []).then(vres => {
        console.log('Transaction finished, check record count: ' + tablename + "   " + JSON.stringify(vres.rows.item(0)));
        resolve(vres.rows.item(0));
      }).catch(e => {
        console.log(e);
        this.warn('recordcounts:' + e);
      })
    })
  }

  initProjVersion(token, builderrole: boolean = false): Promise<any> {
    return new Promise((resolve) => {
      this.httpService.get(APP_SERVE_URL + "/ProjectVersion", { Token: token, VendRole: builderrole }).then(res => {
        console.log(res);
        let items: Array<any>;
        items = res[0];
        console.log(items);
        console.log(items[2].length);
        if (!items[2] || items[2].length == 0) {
          console.log("no proj");
          resolve("no proj");
        } else {
          this.existstable("ProjVersion").then(counts => {
            console.log(counts);
            if (counts == 0) {
              let promise = new Promise((resolve) => {
                resolve(100);
              });
              resolve(promise.then((v1) => {
                return this.initBaseTable("ProjVersion", "Projid,VersionId integer,ProjName,Needupd integer,LastDate default ''");
              }).then((v2) => {
                return this.initBaseData("ProjVersion", items[2]);
              }).then((v3) => {
                console.log("update ProjVersion set needupd = 1");
                return this.db.executeSql("update ProjVersion set needupd = 1,VersionId = 0", []);
              }).then((v4) => {
                return this.setcurproj(token, builderrole, true);
              }).then((v1) => {
                return this.initBaseTable("tmpprojversion", "Projid,VersionId integer,ProjName,Needupd integer,LastDate default ''");
              }).catch(err => {
                console.log(err);
              }))
            }
            else {
              let promise = new Promise((resolve) => {
                resolve(100);
              });
              resolve(promise.then((v1) => {
                return this.resetdata("tmpprojversion");
              }).then((v2) => {
                return this.initBaseData("tmpprojversion", items[2]);
              }).then((v3) => {
                return this.db.executeSql("delete from ProjVersion where ProjId not in (select projid from tmpprojversion)", []);
              }).then((v4) => {
                return this.db.executeSql("update ProjVersion set needupd = 1 where exists(select * from tmpprojversion where tmpprojversion.projid = ProjVersion.projid and tmpprojversion.versionid != ProjVersion.versionid)", []);
              }).then((v5) => {
                return this.db.executeSql("insert into ProjVersion (Projid,ProjName,VersionId,needupd) select Projid,ProjName,0,1 from tmpprojversion where tmpprojversion.projid not in (select projid from ProjVersion)", []);
              }).then((v6) => {
                return this.setcurproj(token, builderrole);
              }).catch(err => {
                console.log(err);
              }))
            }
          })
        }
      }).catch(e => {
        console.log(e);
        this.nativeservice.hideLoading();
      })
    })
  }

  resetprojdata(tablename, projid): Promise<any> {
    return this.db.executeSql("delete from " + tablename + " where ProjId = '" + projid + "'", []);

  }

  resetdata(tablename): Promise<any> {
    return this.db.executeSql("delete from " + tablename, []);

  }

  resetbatchbuildingdata(tablename, projid, batchid, buildingid): Promise<any> {
    let sql = "delete from #tablename# where ProjId = '#projid#' and Batchid = '#batchid#' and Buildingid = '#buildingid#'";
    sql = sql.replace('#tablename#', tablename);
    sql = sql.replace('#projid#', projid);
    sql = sql.replace('#batchid#', batchid);
    sql = sql.replace('#buildingid#', buildingid);
    return this.db.executeSql(sql, []);
  }

  resetbuildingdata(tablename, projid, buildingid): Promise<any> {
    let sql = "delete from #tablename# where ProjId = '#projid#' and Buildingid = '#buildingid#'";
    sql = sql.replace('#tablename#', tablename);
    sql = sql.replace('#projid#', projid);
    sql = sql.replace('#buildingid#', buildingid);
    return this.db.executeSql(sql, []);

  }

  setcurproj(token, builderrole: boolean, firstflag: boolean = false): Promise<any> {
    return new Promise((resolve) => {
      var projid: string;
      console.log("setcurproj");
      this.localStorage.getItem('curproj').then(val => {
        console.log(val);
        if (val == null) {
          this.db.executeSql("SELECT Projid,ProjName,VersionId,Needupd FROM ProjVersion order by versionid", []).then(v2 => {
            projid = v2.rows.item(0).Projid;
            console.log(projid);
            if (firstflag == true) {
              this.localStorage.setItem('curproj', { projid: v2.rows.item(0).Projid, projname: v2.rows.item(0).ProjName, versionid: 0, needupd: 1 }).then(v => {

                resolve(projid);
              })
            } else {
              this.localStorage.setItem('curproj', { projid: v2.rows.item(0).Projid, projname: v2.rows.item(0).ProjName, versionid: v2.rows.item(0).VersionId, needupd: v2.rows.item(0).Needupd }).then(v => {
                //if (builderrole == true) {
                resolve(projid);
                // } else {
                //   this.updatecurproj(token).then(v => {
                //     console.log("v");
                //     console.log(v);
                //     console.log(projid);
                //     resolve(projid);
                //   })
                // }
              })
            }

          }).catch(e => {
            console.log("项目加载错误：" + JSON.stringify(e));
          })
        }
        else {
          this.db.executeSql("SELECT Projid,ProjName,VersionId,needupd FROM ProjVersion where ProjVersion.projid = '" + val.projid + "'", []).then(v => {
            if (!v || v.rows.item(0).Projid == '') {
              this.db.executeSql("SELECT Projid,ProjName,VersionId,Needupd FROM ProjVersion order by versionid", []).then(v2 => {
                projid = v2.rows.item(0).Projid;
                if (firstflag == true) {
                  this.localStorage.setItem('curproj', { projid: v2.rows.item(0).Projid, projname: v2.rows.item(0).ProjName, versionid: 0, needupd: 1 }).then(v => {
                    resolve(projid);
                  })
                } else {
                  this.localStorage.setItem('curproj', { projid: v2.rows.item(0).Projid, projname: v2.rows.item(0).ProjName, versionid: v2.rows.item(0).VersionId, needupd: v2.rows.item(0).Needupd }).then(v => {
                    // if (builderrole == true) {
                    resolve(projid);
                    // } else {
                    //   this.updatecurproj(token).then(v => {
                    //     console.log("v");
                    //     console.log(v);
                    //     console.log(projid);
                    //     resolve(projid);
                    //   })
                    // }
                  })
                }
              }).catch(e => {
                console.log("项目加载错误：" + JSON.stringify(e));
              })
            }
            else {
              projid = v.rows.item(0).Projid;
              if (firstflag == true) {
                this.localStorage.setItem('curproj', { projid: v.rows.item(0).Projid, projname: v.rows.item(0).ProjName, versionid: 0, needupd: 1 }).then(v => {
                  resolve(projid);
                })
              } else {
                this.localStorage.setItem('curproj', { projid: v.rows.item(0).Projid, projname: v.rows.item(0).ProjName, versionid: v.rows.item(0).VersionId, needupd: v.rows.item(0).Needupd }).then(v => {
                  //if (builderrole == true) {
                  resolve(projid);
                  // } else {
                  //   this.updatecurproj(token).then(v => {
                  //     console.log("v");
                  //     console.log(v);
                  //     console.log(projid);
                  //     resolve(projid);
                  //   })
                  // }
                })
              }
            }
          }).catch(e => {
            console.log("项目加载错误：" + JSON.stringify(e));
          })
        }
      })
    })
  }

  updatecurproj(token): Promise<any> {
    return new Promise((resolve) => {
      console.log('updatecurproj');
      this.localStorage.getItem('curproj').then(v => {
        console.log(v);
        if (v.needupd == 1) {
          this.httpService.get(APP_SERVE_URL + "/basepack/", { Token: token, Projid: v.projid }).then(res => {
            console.log(res[0]);
            this.initData(res[0], v.projid).then(val => {
              let data: Array<any>;
              data = res[0];
              for (var i = 2; i < data.length; i += 2) {
                let items = data[i];
                console.log("tablename:" + items[0]);
                if (data[i + 1].length > 0) {
                  this.initBaseData(items[0], data[i + 1]);
                }
              }
              console.log(res[0][1][0]);
              this.db.executeSql("update ProjVersion set needupd = 0, versionid = " + res[0][1][0] + " where projid = '" + v.projid + "'", []).then(v2 => {
                resolve(this.localStorage.setItem('curproj', { projid: v.projid, projname: v.projname, versionid: res[0][1][0], needupd: 0 }));
              })
            })
          }).catch(e => {
            console.log(e);
            this.nativeservice.hideLoading();
          })
        }
        else {
          resolve(1);
        }
      })
    })
  }

  checkandupdprojversion(projid, token, versionid: number, vendrole: boolean = false, connected: boolean = false): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(connected);
      });

      resolve(promise.then((v1) => {
        console.log(v1);
        if (v1 == false) {
          return this.nativeservice.isConnecting();
        } else {
          return v1;
        }
      }).then((val) => {
        console.log(val);
        if (val == false) {
          return this.localStorage.getItem('curproj').then(v => {
            let promise2 = new Promise((resolve) => {
              resolve(100);
            });
            resolve(promise2.then((v1) => {
              return this.localStorage.setItem('curproj', { projid: v.projid, projname: v.projname, versionid: v.versionid, needupd: 1 });
            }).catch(err => {
              console.log(err);
            }))
          })
        } else {
          if (vendrole == true) {
            return this.downloadbuilderdata(token, projid);
          } else {
            return this.httpService.get(APP_SERVE_URL + "/ProjectVersion", { Token: token, ProjId: projid, VendRole: vendrole }).then(res => {
              console.log("projversion"); console.log(versionid);
              let items: Array<any>;
              items = res[0];
              console.log(items);
              let item: Array<any>;
              item = items[2];
              console.log(item); console.log(item[0].VersionId);
              if (item[0].VersionId != versionid) {
                console.log("checkandupdprojversion");
                this.nativeservice.showLoading("正在下载基础数据,请稍侯...");
                this.localStorage.getItem('curproj').then(v => {
                  let promise2 = new Promise((resolve) => {
                    resolve(100);
                  });
                  resolve(promise2.then((v1) => {
                    return this.db.executeSql("update ProjVersion set needupd = 1 where projid = '" + projid + "'", []);
                  }).then((v2) => {
                    return this.localStorage.getItem('curproj').then(v => {
                      let promise2 = new Promise((resolve) => {
                        resolve(100);
                      });
                      resolve(promise2.then((vv) => {
                        console.log("log :" + v);
                        return this.localStorage.setItem('curproj', { projid: v.projid, projname: v.projname, versionid: v.versionid, needupd: 1 });
                      }).catch(err => {
                        console.log(err);
                      }))
                    })
                    // this.localStorage.setItem('curproj', { projid: v.projid, projname: v.projname, versionid: v.versionid, needupd: 1 });
                  }).then((v3) => {
                    return this.updatecurproj(token);
                  }).then((v4) => {
                    this.nativeservice.hideLoading();
                    return 1;
                  }).catch(err => {
                    this.nativeservice.hideLoading();
                    console.log(err);
                  }))
                }).catch(e => {
                  console.log(e);
                  this.nativeservice.hideLoading();
                })
              }
              else {
                resolve(1);
              }
            })
          }
        }
      }).catch(err => {
        console.log(err);
      }))
    })
  }

  initbuildingversion(token, projid): Promise<any> {
    return new Promise((resolve) => {
      console.log('initbuilding');
      this.httpService.get(APP_SERVE_URL + "/BuildingVersion", { Token: token, ProjId: projid }).then(res => {
        console.log(res);
        let items: Array<any>;
        this.existstable("buildingversion").then(counts => {
          if (counts == 0) {
            let promise = new Promise((resolve) => {
              resolve(100);
            });
            if (res) {
              items = res[0];
              console.log(items);
              resolve(promise.then((v1) => {
                return this.initBaseTable("buildingversion", "Projid,Buildingid,BuildingName,Batchid,VersionId integer,Type integer,BatchName,downloadversionId integer,needupd integer,needdownload integer,needupload integer");
              }).then((v2) => {
                return this.initBaseData("buildingversion", items[2]);//items[2]);
              }).then((v3) => {
                return this.db.executeSql("update buildingversion set needupd = 1, needdownload = 1, versionid = 0", []);
              }).then((v4) => {
                return this.initBaseTable("uplimagetable", "Projid,Buildingid,Batchid,fn");
              }).catch(err => {
                console.log(err);
              }))
            } else {
              resolve(promise.then((v1) => {
                return this.initBaseTable("buildingversion", "Projid,Buildingid,BuildingName,Batchid,VersionId integer,Type integer,BatchName,downloadversionId integer,needupd integer,needdownload integer,needupload integer");
              }).then((v4) => {
                return this.initBaseTable("uplimagetable", "Projid,Buildingid,Batchid,fn");
              }).catch(err => {
                console.log(err);
              }))
            }
          }
          else {
            let promise = new Promise((resolve) => {
              resolve(100);
            });
            if (res) {
              items = res[0];
              console.log(items);
              resolve(promise.then((v1) => {
                return this.initBaseTable("tmpbuildingversion", "Projid,Buildingid,BuildingName,Batchid,VersionId integer,Type integer,BatchName,downloadversionId integer,needupd integer,needdownload integer,needupload integer");
              }).then((v2) => {
                return this.initBaseData("tmpbuildingversion", items[2]);//items[2]);
              }).then((v3) => {
                let sql = "delete from buildingversion where not exists (select tb.ProjId from tmpbuildingversion tb where tb.projid = buildingversion.projid and tb.batchid = buildingversion.batchid and tb.buildingid = buildingversion.buildingid ) and projid = '" + projid + "'";
                console.log(sql);
                return this.db.executeSql(sql, []);
              }).then((v4) => {
                console.log("v4");
                return this.db.executeSql("update buildingversion set needupd = 1 where exists (select * from tmpbuildingversion where buildingversion.projid = tmpbuildingversion.projid and buildingversion.buildingid = tmpbuildingversion.buildingid and buildingversion.batchid = tmpbuildingversion.batchid and buildingversion.versionid != tmpbuildingversion.versionid)", []);
              }).then((v55) => {
                console.log("v55");
                return this.db.executeSql("select * from tmpbuildingversion", []).then(v => {
                  for (let i = 0; i < v.rows.length; i++) {
                    console.log(v.rows.item(i));
                  }
                })
              }).then((v5) => {
                console.log("v5");
                return this.db.executeSql("update buildingversion set needdownload = 1 where exists (select projid from tmpbuildingversion where buildingversion.projid = tmpbuildingversion.projid and buildingversion.buildingid = tmpbuildingversion.buildingid and buildingversion.batchid = tmpbuildingversion.batchid and buildingversion.downloadversionId != tmpbuildingversion.downloadversionId)", []);
              }).then((v6) => {
                console.log("v6");
                return this.db.executeSql("insert into buildingversion (Projid,Buildingid,BuildingName,Batchid,BatchName,Type,VersionId,needupd,downloadversionId,needdownload) select Projid,Buildingid,BuildingName,Batchid,BatchName,Type,0,1,0,1 from tmpbuildingversion where not exists (select projid from buildingversion where buildingversion.projid=tmpbuildingversion.projid and buildingversion.buildingid = tmpbuildingversion.buildingid and buildingversion.batchid = tmpbuildingversion.batchid and buildingversion.projid = '" + projid + "')", []);
              }).catch(err => {
                console.log(err);
              }))
            } else {
              resolve(this.initBaseTable("tmpbuildingversion", "Projid,Buildingid,BuildingName,Batchid,VersionId integer,Type integer,BatchName,downloadversionId integer,needupd integer,needdownload integer,needupload integer"));
            }
          }
        })
      }).catch(e => {
        console.log(e);
        this.nativeservice.hideLoading();
      })
    })
  }

  initbuildingbaseData(data, projid, batchid, buildingid, type): Promise<any> {
    return new Promise((resolve) => {
      console.log("initbuildingbaseData");
      for (var i = 2; i < data.length; i += 2) {
        let items = data[i];
        console.log(items[0]);
        if (data[i + 1].length > 0) {
          this.initBaseData(items[0], data[i + 1]);
        }
      }
      console.log(data[1][0]);
      let sql = "update buildingversion set needdownload = 0,downloadversionId = #version# where projid = '#projid#' and batchid = '#batchid#' and buildingid = '#buildingid#' and type = #type#";
      sql = sql.replace('#projid#', projid);
      sql = sql.replace('#batchid#', batchid);
      sql = sql.replace('#buildingid#', buildingid);
      sql = sql.replace('#type#', type);
      sql = sql.replace('#version#', data[1][0]);
      console.log('initbudata:' + sql);
      this.db.executeSql(sql, []).then(v => {
        console.log(v)
        resolve(1);
      })
    })
  }

  initbuildingbaseTable(token, projid, batchid, buildingid, type): Promise<any> {
    return new Promise((resolve) => {
      let url = '';
      if (type == 1) {
        url = "/BasePack/GetPreCheck";
      } else if (type == 2) {
        url = "/BasePack/GetOpenCheck";
      } else if (type == 3) {
        url = "/BasePack/GetFormalCheck";
      } else {
        url = "/BasePack/GetServiceCheck";
      }
      this.httpService.get(APP_SERVE_URL + url, { Token: token, ProjId: projid, Batchid: batchid, buildingid: buildingid }).then(res => {
        let items: Array<any>;
        items = res[0];
        console.log(items);
        this.existstable("Rooms").then(counts => {
          if (counts == 0) {
            let promise = new Promise((resolve) => {
              resolve(100);
            });
            resolve(promise.then((v1) => {
              return this.initBaseTable("OpenCheckBatchRooms", "ID,BatchId,RoomId,ProjId,Buildingid"); //////////////核对
            }).then((v1) => {
              return this.initBaseTable("ServiceCheckBatchRooms", "ID,BatchId,RoomId,ProjId,Buildingid"); //////////////核对
            }).then((v1) => {
              return this.initBaseTable("PreCheckBatchRooms", "ID,BatchId,RoomId,ProjId,Buildingid"); //////////////核对
            }).then((v1) => {
              return this.initBaseTable("FormalCheckBatchRooms", "ID,BatchId,RoomId,ProjId,Buildingid"); //////////////核对
            }).then((v2) => {
              return this.initBaseTable("Rooms", "ProjId,Buildingid,FloorId,Id,Name,Unit,ApartmentId,SortCode integer default 0,FloorName");
            }).then((v3) => {
              return this.initBaseTable("Vendprojcheckscopes", "VendId,ProjId,ProjCheckItemId,RoomId,BuildingId,Node integer,FloorId");
            }).then((v5) => {
              return this.initbuildingbaseData(res[0], projid, batchid, buildingid, type);
            }).then((v6) => {
              return this.initApartImage(projid, buildingid);
            }).then((v7) => {
              return this.initBaseTable("PreCheckIssues", "BatchId,IssueId default '',RoomId,PositionId,CheckItemId,PlusDesc default '',IssueDesc default '',UrgencyId default '',ImgBefore1 default '',ImgBefore2 default '',ImgBefore3 default '',ImgAfter1 default '',ImgAfter2 default '',ImgAfter3 default '',Id primary key,IssueStatus,VendId default '',ResponVendId default '',ProjId default '',Manager default '',ResponsibleId default '',IssueType default '',RegisterDate datetime,AppointDate datetime,LimitDate datetime,ReFormDate datetime,CloseDate datetime,CloseReason default '',CancelDate datetime,CancelReason defalut '',VersionId integer,ImgClose1 default '',ImgClose2 default '',ImgClose3 default '',ReturnDate datetime,ReturnReason default '',ReturnNum integer default 0 ,BuildingId default '',EngineerId default '',ReviewDate datetime,x integer default 0,y integer default 0,ResponsibleName default '',ResponsiblePhone default '',EngineerName default '',EngineerPhone default '',ManagerName default '',ManagerPhone default '',ReassignDate datetime,ReassignDesc,ReasonbyOver,fixedDesc ");
            }).then((v8) => {
              return this.initBaseTable("tmpPreCheckIssues", "BatchId,IssueId default '',RoomId,PositionId,CheckItemId,PlusDesc default '',IssueDesc default '',UrgencyId default '',ImgBefore1 default '',ImgBefore2 default '',ImgBefore3 default '',ImgAfter1 default '',ImgAfter2 default '',ImgAfter3 default '',Id primary key,IssueStatus,VendId default '',ResponVendId default '',ProjId default '',Manager default '',ResponsibleId default '',IssueType default '',RegisterDate datetime,AppointDate datetime,LimitDate datetime,ReFormDate datetime,CloseDate datetime,CloseReason default '',CancelDate datetime,CancelReason defalut '',VersionId integer,ImgClose1 default '',ImgClose2 default '',ImgClose3 default '',ReturnDate datetime,ReturnReason default '',ReturnNum integer default 0,BuildingId default '',EngineerId default '',ReviewDate datetime,x integer default 0,y integer default 0,ResponsibleName default '',ResponsiblePhone default '',EngineerName default '',EngineerPhone default '',ManagerName default '',ManagerPhone default '',ReassignDate datetime,ReassignDesc,ReasonbyOver,fixedDesc");
            }).then((v8) => {
              return this.initBaseTable("uplPreCheckIssues", "BatchId,IssueId,RoomId,PositionId,CheckItemId,PlusDesc,IssueDesc,UrgencyId,ImgBefore1,ImgBefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,Id primary key,IssueStatus,VendId,ResponVendId,ProjId,Manager,ResponsibleId,IssueType,RegisterDate datetime,AppointDate datetime,LimitDate datetime,ReFormDate datetime,CloseDate datetime,CloseReason,CancelDate datetime,CancelReason,VersionId integer,ImgClose1,ImgClose2,ImgClose3,ReturnDate datetime,ReturnReason,ReturnNum integer,BuildingId,EngineerId,ReviewDate datetime,x integer,y integer,ResponsibleName,ResponsiblePhone,EngineerName,EngineerPhone,ManagerName,ManagerPhone,ReassignDate,ReassignDesc,ReasonbyOver,fixedDesc");
            }).then((v7) => {
              return this.initBaseTable("OpenCheckIssues", "BatchId,IssueId default '',RoomId,PositionId,CheckItemId,PlusDesc default '',IssueDesc default '',UrgencyId default '',ImgBefore1 default '',ImgBefore2 default '',ImgBefore3 default '',ImgAfter1 default '',ImgAfter2 default '',ImgAfter3 default '',Id primary key,IssueStatus,VendId default '',ResponVendId default '',ProjId default '',Manager default '',ResponsibleId default '',IssueType default '',RegisterDate datetime,AppointDate datetime,LimitDate datetime,ReFormDate datetime,CloseDate datetime,CloseReason default '',CancelDate datetime,CancelReason defalut '',VersionId integer,ImgClose1 default '',ImgClose2 default '',ImgClose3 default '',ReturnDate datetime,ReturnReason default '',ReturnNum integer default 0 ,BuildingId default '',EngineerId default '',ReviewDate datetime,x integer default 0,y integer default 0,ResponsibleName default '',ResponsiblePhone default '',EngineerName default '',EngineerPhone default '',ManagerName default '',ManagerPhone default '',ReassignDate datetime,ReassignDesc,ReasonbyOver,fixedDesc ");
            }).then((v8) => {
              return this.initBaseTable("tmpOpenCheckIssues", "BatchId,IssueId default '',RoomId,PositionId,CheckItemId,PlusDesc default '',IssueDesc default '',UrgencyId default '',ImgBefore1 default '',ImgBefore2 default '',ImgBefore3 default '',ImgAfter1 default '',ImgAfter2 default '',ImgAfter3 default '',Id primary key,IssueStatus,VendId default '',ResponVendId default '',ProjId default '',Manager default '',ResponsibleId default '',IssueType default '',RegisterDate datetime,AppointDate datetime,LimitDate datetime,ReFormDate datetime,CloseDate datetime,CloseReason default '',CancelDate datetime,CancelReason defalut '',VersionId integer,ImgClose1 default '',ImgClose2 default '',ImgClose3 default '',ReturnDate datetime,ReturnReason default '',ReturnNum integer default 0,BuildingId default '',EngineerId default '',ReviewDate datetime,x integer default 0,y integer default 0,ResponsibleName default '',ResponsiblePhone default '',EngineerName default '',EngineerPhone default '',ManagerName default '',ManagerPhone default '',ReassignDate datetime,ReassignDesc,ReasonbyOver,fixedDesc");
            }).then((v8) => {
              return this.initBaseTable("uplOpenCheckIssues", "BatchId,IssueId,RoomId,PositionId,CheckItemId,PlusDesc,IssueDesc,UrgencyId,ImgBefore1,ImgBefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,Id primary key,IssueStatus,VendId,ResponVendId,ProjId,Manager,ResponsibleId,IssueType,RegisterDate datetime,AppointDate datetime,LimitDate datetime,ReFormDate datetime,CloseDate datetime,CloseReason,CancelDate datetime,CancelReason,VersionId integer,ImgClose1,ImgClose2,ImgClose3,ReturnDate datetime,ReturnReason,ReturnNum integer,BuildingId,EngineerId,ReviewDate datetime,x integer,y integer,ResponsibleName,ResponsiblePhone,EngineerName,EngineerPhone,ManagerName,ManagerPhone,ReassignDate,ReassignDesc,ReasonbyOver,fixedDesc");
            }).then((v7) => {
              return this.initBaseTable("FormalCheckIssues", "BatchId,IssueId default '',RoomId,PositionId,CheckItemId,PlusDesc default '',IssueDesc default '',UrgencyId default '',ImgBefore1 default '',ImgBefore2 default '',ImgBefore3 default '',ImgAfter1 default '',ImgAfter2 default '',ImgAfter3 default '',Id primary key,IssueStatus,VendId default '',ResponVendId default '',ProjId default '',Manager default '',ResponsibleId default '',IssueType default '',RegisterDate datetime,AppointDate datetime,LimitDate datetime,ReFormDate datetime,CloseDate datetime,CloseReason default '',CancelDate datetime,CancelReason defalut '',VersionId integer,ImgClose1 default '',ImgClose2 default '',ImgClose3 default '',ReturnDate datetime,ReturnReason default '',ReturnNum integer default 0 ,BuildingId default '',EngineerId default '',ReviewDate datetime,x integer default 0,y integer default 0,ResponsibleName default '',ResponsiblePhone default '',EngineerName default '',EngineerPhone default '',ManagerName default '',ManagerPhone default '',ReassignDate datetime,ReassignDesc,ReasonbyOver,fixedDesc ");
            }).then((v8) => {
              return this.initBaseTable("tmpFormalCheckIssues", "BatchId,IssueId default '',RoomId,PositionId,CheckItemId,PlusDesc default '',IssueDesc default '',UrgencyId default '',ImgBefore1 default '',ImgBefore2 default '',ImgBefore3 default '',ImgAfter1 default '',ImgAfter2 default '',ImgAfter3 default '',Id primary key,IssueStatus,VendId default '',ResponVendId default '',ProjId default '',Manager default '',ResponsibleId default '',IssueType default '',RegisterDate datetime,AppointDate datetime,LimitDate datetime,ReFormDate datetime,CloseDate datetime,CloseReason default '',CancelDate datetime,CancelReason defalut '',VersionId integer,ImgClose1 default '',ImgClose2 default '',ImgClose3 default '',ReturnDate datetime,ReturnReason default '',ReturnNum integer default 0,BuildingId default '',EngineerId default '',ReviewDate datetime,x integer default 0,y integer default 0,ResponsibleName default '',ResponsiblePhone default '',EngineerName default '',EngineerPhone default '',ManagerName default '',ManagerPhone default '',ReassignDate datetime,ReassignDesc,ReasonbyOver,fixedDesc");
            }).then((v8) => {
              return this.initBaseTable("uplFormalCheckIssues", "BatchId,IssueId,RoomId,PositionId,CheckItemId,PlusDesc,IssueDesc,UrgencyId,ImgBefore1,ImgBefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,Id primary key,IssueStatus,VendId,ResponVendId,ProjId,Manager,ResponsibleId,IssueType,RegisterDate datetime,AppointDate datetime,LimitDate datetime,ReFormDate datetime,CloseDate datetime,CloseReason,CancelDate datetime,CancelReason,VersionId integer,ImgClose1,ImgClose2,ImgClose3,ReturnDate datetime,ReturnReason,ReturnNum integer,BuildingId,EngineerId,ReviewDate datetime,x integer,y integer,ResponsibleName,ResponsiblePhone,EngineerName,EngineerPhone,ManagerName,ManagerPhone,ReassignDate,ReassignDesc,ReasonbyOver,fixedDesc");
            }).then((v7) => {
              return this.initBaseTable("ServiceCheckIssues", "BatchId,IssueId default '',RoomId,PositionId,CheckItemId,PlusDesc default '',IssueDesc default '',UrgencyId default '',ImgBefore1 default '',ImgBefore2 default '',ImgBefore3 default '',ImgAfter1 default '',ImgAfter2 default '',ImgAfter3 default '',Id primary key,IssueStatus,VendId default '',ResponVendId default '',ProjId default '',Manager default '',ResponsibleId default '',IssueType default '',RegisterDate datetime,AppointDate datetime,LimitDate datetime,ReFormDate datetime,CloseDate datetime,CloseReason default '',CancelDate datetime,CancelReason defalut '',VersionId integer,ImgClose1 default '',ImgClose2 default '',ImgClose3 default '',ReturnDate datetime,ReturnReason default '',ReturnNum integer default 0 ,BuildingId default '',EngineerId default '',ReviewDate datetime,x integer default 0,y integer default 0,ResponsibleName default '',ResponsiblePhone default '',EngineerName default '',EngineerPhone default '',ManagerName default '',ManagerPhone default '',ReassignDate datetime,ReassignDesc,ReasonbyOver,fixedDesc ");
            }).then((v8) => {
              return this.initBaseTable("tmpServiceCheckIssues", "BatchId,IssueId default '',RoomId,PositionId,CheckItemId,PlusDesc default '',IssueDesc default '',UrgencyId default '',ImgBefore1 default '',ImgBefore2 default '',ImgBefore3 default '',ImgAfter1 default '',ImgAfter2 default '',ImgAfter3 default '',Id primary key,IssueStatus,VendId default '',ResponVendId default '',ProjId default '',Manager default '',ResponsibleId default '',IssueType default '',RegisterDate datetime,AppointDate datetime,LimitDate datetime,ReFormDate datetime,CloseDate datetime,CloseReason default '',CancelDate datetime,CancelReason defalut '',VersionId integer,ImgClose1 default '',ImgClose2 default '',ImgClose3 default '',ReturnDate datetime,ReturnReason default '',ReturnNum integer default 0,BuildingId default '',EngineerId default '',ReviewDate datetime,x integer default 0,y integer default 0,ResponsibleName default '',ResponsiblePhone default '',EngineerName default '',EngineerPhone default '',ManagerName default '',ManagerPhone default '',ReassignDate datetime,ReassignDesc,ReasonbyOver,fixedDesc");
            }).then((v8) => {
              return this.initBaseTable("uplServiceCheckIssues", "BatchId,IssueId,RoomId,PositionId,CheckItemId,PlusDesc,IssueDesc,UrgencyId,ImgBefore1,ImgBefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,Id primary key,IssueStatus,VendId,ResponVendId,ProjId,Manager,ResponsibleId,IssueType,RegisterDate datetime,AppointDate datetime,LimitDate datetime,ReFormDate datetime,CloseDate datetime,CloseReason,CancelDate datetime,CancelReason,VersionId integer,ImgClose1,ImgClose2,ImgClose3,ReturnDate datetime,ReturnReason,ReturnNum integer,BuildingId,EngineerId,ReviewDate datetime,x integer,y integer,ResponsibleName,ResponsiblePhone,EngineerName,EngineerPhone,ManagerName,ManagerPhone,ReassignDate,ReassignDesc,ReasonbyOver,fixedDesc");
            }).then((v9) => {
              return this.initBaseTable("CustRoomSatisfactions", "RoomId,SatisfiedDim,Type integer,Score integer default 5,ProjId,VersionId integer,Id,BatchId,Buildingid");
            }).then((v10) => {
              return this.initBaseTable("tmpCustRoomSatisfactions", "RoomId,SatisfiedDim,Type integer,Score integer default 5,ProjId,VersionId integer,Id,BatchId,Buildingid");
            }).then((v11) => {
              return this.initBaseTable("RoomNoAcceptLogs", "ProjId,RoomId,PlusDesc,VersionId,ID,ReasonNoAcceptId,BatchId,Buildingid,UserName,TransDate");
            }).then((v12) => {
              return this.initBaseTable("tmpRoomNoAcceptLogs", "ProjId,RoomId,PlusDesc,VersionId,ID,ReasonNoAcceptId,BatchId,Buildingid,UserName,TransDate");
            }).then((v13) => {
              return this.initBaseTable("PreRoomDetails", "RoomId,TransDate DateTime,RoomStatus,Remark,EngineerId,EngineerPhone,ProjId,VersionId integer,ID,BatchId,BuildingId,EngineerName");
            }).then((v14) => {
              return this.initBaseTable("tmpPreRoomDetails", "RoomId,TransDate DateTime,RoomStatus,Remark,EngineerId,EngineerPhone,ProjId,VersionId integer,ID,BatchId,BuildingId,EngineerName");
            }).then((v15) => {
              return this.initBaseTable("OpenRoomDetails", "RoomId,TransDate DateTime,RoomStatus,CustId,CustPhone,Remark,EngineerId,EngineerPhone,ImgSign,ProjId,VersionId integer,ID,BatchId,BuildingId,EngineerName");
            }).then((v16) => {
              return this.initBaseTable("tmpOpenRoomDetails", "RoomId,TransDate DateTime,RoomStatus,CustId,CustPhone,Remark,EngineerId,EngineerPhone,ImgSign,ProjId,VersionId integer,ID,BatchId,BuildingId,EngineerName");
            }).then((v17) => {
              return this.initBaseTable("FormalRoomDetails", "RoomId,TransDate DateTime,RoomStatus,CustId,CustPhone,Remark,EngineerId,EngineerPhone,ImgSign,ProjId,VersionId integer,ID,AmmeterNumber,AmmeterReading real,WaterMeterNumber,WaterMeterReading real,GasMeterNumber,GasMeterReading real,KeyRetentionStatus integer,BatchId,BuildingId,EngineerName");
            }).then((v18) => {
              return this.initBaseTable("tmpFormalRoomDetails", "RoomId,TransDate DateTime,RoomStatus,CustId,CustPhone,Remark,EngineerId,EngineerPhone,ImgSign,ProjId,VersionId integer,ID,AmmeterNumber,AmmeterReading real,WaterMeterNumber,WaterMeterReading real,GasMeterNumber,GasMeterReading real ,KeyRetentionStatus integer,BatchId,BuildingId,EngineerName");
            }).catch(err => {
              console.log(err);
            }))
          }
          else {
            let promise = new Promise((resolve) => {
              resolve(100);
            });
            resolve(promise.then((v1) => {
              if (type == 1) {
                return this.resetbatchbuildingdata("PreCheckBatchRooms", projid, batchid, buildingid);
              } else if (type == 2) {
                return this.resetbatchbuildingdata("OpenCheckBatchRooms", projid, batchid, buildingid);
              } else if (type == 3) {
                return this.resetbatchbuildingdata("FormalCheckBatchRooms", projid, batchid, buildingid);
              } else {
                return this.resetbatchbuildingdata("ServiceCheckBatchRooms", projid, batchid, buildingid);
              }
            }).then((v2) => {
              console.log("v2");
              return this.resetbuildingdata("Rooms", projid, buildingid);
            }).then((v3) => {
              console.log("v3");
              return this.resetbuildingdata("Vendprojcheckscopes", projid, buildingid);
            }).then((v5) => {
              return this.initbuildingbaseData(res[0], projid, batchid, buildingid, type);
            }).then((v6) => {
              return this.initApartImage(projid, buildingid);
            }).catch(err => {
              console.log(err);
            }))
          }
        })
      }).catch(e => {
        console.log(e);
        this.nativeservice.hideLoading();
      })
    })
  }

  initApartImage(projid, buildingid): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      console.log('image');
      resolve(promise.then((v1) => {
        let sql = "select image from apartments where Projid = '#projid#' and exists(select rooms.ApartmentId from rooms where projid = '#projid#' and buildingid = '#buildingid#' and rooms.ApartmentId = apartments.id) and image not in (select fn from imagetable where projid = '#projid#')";
        sql = sql.replace('#projid#', projid); sql = sql.replace('#projid#', projid); sql = sql.replace('#projid#', projid);
        sql = sql.replace('#buildingid#', buildingid);
        return this.db.executeSql(sql, []);
      }).then((v2: any) => {
        let tmppromise = Promise.resolve([]);
        for (var i = 0; i < v2.rows.length; i++) {
          console.log(JSON.stringify(v2.rows.item(i)));
          let fn = v2.rows.item(i).Image;
          tmppromise = tmppromise.then(() => {
            return this.downloadimg(fn);
          }).then(val => {
            let sql = "insert into imagetable (projid,fn,src) values('" + projid + "','" + fn + "','" + val + "')";
            //console.log(sql);
            return this.db.executeSql(sql, []);
          })
        }
        return tmppromise;
      }).catch(err => {
        console.log(err);
      }))
    })
  }

  downloadbuildinginfo(token, projid, batchid, buildingid, type): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });

      resolve(promise.then((v1) => {
        return this.initbuildingbaseTable(token, projid, batchid, buildingid, type);
      }).then((v2) => {
        console.log('downloadbuildinginfo:v2 :' + v2);
        return this.updatebuildinginfo(token, projid, batchid, buildingid, type);
      }).catch(err => {
        console.log("楼栋下载失败:" + err);
      }))
    })
  }

  uploaddata(projid, batchid, buildingid, tablenames: Array<string>): Promise<any> {
    return new Promise((resolve) => {
      console.log('uploaddata');
      let jsonarr: Array<any>; jsonarr = [];
      let tmppromise = Promise.resolve([]);
      console.log(tablenames);
      for (var i = 0; i < tablenames.length; i++) {
        let tablename = tablenames[i];
        console.log(tablename);
        tmppromise = tmppromise.then(() => {
          let sql: string;
          console.log(tablename + ";" + i);
          if (tablename == "FormalCheckIssues" || tablename == "PreCheckIssues" || tablename == "OpenCheckIssues" || tablename == "ServiceCheckIssues") {
            sql = "select * from #tablename# where projid = '#projid#' and batchid = '#batchid#' and buildingid = '#buildingid#' and versionid = 0 Union all select * from upl#tablename# where projid = '#projid#' and batchid = '#batchid#' and buildingid = '#buildingid#'";
            sql = sql.replace('#tablename#', tablename).replace('#tablename#', tablename);
            sql = sql.replace('#projid#', projid).replace('#projid#', projid);
            sql = sql.replace('#batchid#', batchid).replace('#batchid#', batchid);
            sql = sql.replace('#buildingid#', buildingid).replace('#buildingid#', buildingid);
          } else {
            sql = "select * from #tablename# where projid = '#projid#' and batchid = '#batchid#' and buildingid = '#buildingid#' and versionid = 0 ";
            sql = sql.replace('#tablename#', tablename);
            sql = sql.replace('#projid#', projid);
            sql = sql.replace('#batchid#', batchid);
            sql = sql.replace('#buildingid#', buildingid);
          }
          console.log(sql);
          return this.db.executeSql(sql, []);
        }).then((v: any) => {
          let data: Array<any>; data = [];
          for (let j = 0; j < v.rows.length; j++) {
            console.log(JSON.stringify(v.rows.item(j)));
            data.push(v.rows.item(j));
          }
          if (v.rows.length > 0) {
            console.log(data);
            jsonarr.push({ TableName: tablename, data: data });
          }
          console.log("jsonarr:" + jsonarr.length);
          return jsonarr;
        })
      }
      resolve(tmppromise);
    })
  }

  resetuploaddata(projid, batchid, buildingid, tablenames: Array<string>): Promise<any> {
    return new Promise((resolve) => {
      var jsonarr: Array<any>; jsonarr = [];
      let tmppromise = Promise.resolve([]);
      for (var i = 0; i < tablenames.length; i++) {
        let tablename = tablenames[i];
        console.log('reset up' + tablename);
        tmppromise = tmppromise.then(() => {
          let sql = "delete from #tablename# where projid = '#projid#' and batchid = '#batchid#' and buildingid = '#buildingid#' and versionid = 0";
          sql = sql.replace('#tablename#', tablename)
          sql = sql.replace('#projid#', projid);
          sql = sql.replace('#batchid#', batchid);
          sql = sql.replace('#buildingid#', buildingid);
          return this.db.executeSql(sql, []);
        }).then((v) => {
          if (tablename == "FormalCheckIssues" || tablename == "PreCheckIssues" || tablename == "OpenCheckIssues" || tablename == "ServiceCheckIssues") {
            let sql = "delete from upl#tablename# where projid = '#projid#' and batchid = '#batchid#' and buildingid = '#buildingid#'";
            sql = sql.replace('#tablename#', tablename)
            sql = sql.replace('#projid#', projid);
            sql = sql.replace('#batchid#', batchid);
            sql = sql.replace('#buildingid#', buildingid);
            return this.db.executeSql(sql, []);
          } else {
            return 1;
          }
        })
      }
      resolve(tmppromise);
    })
  }



  uploadbuildinginfo(token, projid, batchid, buildingid, type): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      console.log("uploadbuildinginfo");
      resolve(promise.then((v) => {
        let sql = "select upl.fn,it.src from uplimagetable upl inner join imagetable it on it.fn = upl.fn and it.projid = upl.projid  where upl.projid = '#projid#' and upl.batchid = '#batchid#' and upl.buildingid = '#buildingid#'";
        sql = sql.replace('#projid#', projid).replace('#batchid#', batchid).replace('#buildingid#', buildingid);
        console.log(sql);
        return this.db.executeSql(sql, []);
      }).then((val: any) => {
        let tmppromise = Promise.resolve(10);
        for (var i = 0; i < val.rows.length; i++) {
          console.log(JSON.stringify(val.rows.item(i)))
          let filename = val.rows.item(i).fn;
          let src = val.rows.item(i).src;
          tmppromise = tmppromise.then(() => {
            return this.uploadimg(src, filename);
          }).then((v) => {
            return 1;
          })
        }
        return tmppromise;
      }).then((v1) => {
        if (type == 1) {
          return this.uploaddata(projid, batchid, buildingid, ["PreCheckIssues", "PreRoomDetails"]);
        } else if (type == 2) {
          return this.uploaddata(projid, batchid, buildingid, ["OpenCheckIssues", "RoomNoAcceptLogs", "OpenRoomDetails", "CustRoomSatisfactions"]);
        } else if (type == 3) {
          return this.uploaddata(projid, batchid, buildingid, ["FormalCheckIssues", "RoomNoAcceptLogs", "FormalRoomDetails", "CustRoomSatisfactions"]);
        } else {
          return this.uploaddata(projid, batchid, buildingid, ["ServiceCheckIssues"]);
        }
      }).then((v2) => {
        console.log("v2:" + JSON.stringify(v2));
        return this.httpService.post(APP_SERVE_URL + "/DynamicsPack", { Token: token, ProjId: projid, BatchId: batchid, BuildingId: buildingid, JsonStr: JSON.stringify(v2) });
      }).then((v3) => {
        console.log("v3");
        if (type == 1) {
          return this.resetuploaddata(projid, batchid, buildingid, ["PreCheckIssues", "PreRoomDetails"]);
        } else if (type == 2) {
          return this.resetuploaddata(projid, batchid, buildingid, ["OpenCheckIssues", "RoomNoAcceptLogs", "OpenRoomDetails", "CustRoomSatisfactions"]);
        } else if (type == 3) {
          return this.resetuploaddata(projid, batchid, buildingid, ["FormalCheckIssues", "RoomNoAcceptLogs", "FormalRoomDetails", "CustRoomSatisfactions"]);
        } else {
          return this.resetuploaddata(projid, batchid, buildingid, ["ServiceCheckIssues"]);
        }
      }).then((v4) => {
        console.log('v4');
        let sql = "delete from uplimagetable where projid = '#projid#' and batchid = '#batchid#' and buildingid = '#buildingid#'";
        sql = sql.replace('#projid#', projid).replace('#batchid#', batchid).replace('#buildingid#', buildingid);
        console.log(sql);
        return this.db.executeSql(sql, []);
      }).then((v5) => {
        let sql = "update buildingversion set needupload = 0,needupd = 1 where projid = '#projid#' and batchid = '#batchid#' and buildingid = '#buildingid#' and type = #type#";
        sql = sql.replace('#projid#', projid);
        sql = sql.replace('#batchid#', batchid);
        sql = sql.replace('#buildingid#', buildingid);
        sql = sql.replace('#type#', type);
        console.log('updbvdata:' + sql);
        return this.db.executeSql(sql, []);
      }).then((v6) => {
        console.log('v6')
        return this.updatebuildinginfo(token, projid, batchid, buildingid, type);
      }).catch(err => {
        console.log("楼栋上传失败:" + err);
        this.nativeservice.hideLoading();
      }))
    })
  }

  updatebuildinginfo(token, projid, batchid, buildingid, type): Promise<any> {
    return new Promise((resolve) => {
      console.log('update bu info:' + projid);
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      resolve(promise.then((v1) => {
        let sql = "select VersionId from buildingversion where projid = '#projid#' and batchid = '#batchid#' and buildingid = '#buildingid#' and type = #type#";
        sql = sql.replace('#projid#', projid);
        sql = sql.replace('#batchid#', batchid);
        sql = sql.replace('#buildingid#', buildingid);
        sql = sql.replace('#type#', type);
        console.log(sql);
        return this.db.executeSql(sql, []);
      }).then((v2: any) => {
        console.log(v2);
        console.log(JSON.stringify(v2.rows.item(0)));
        console.log(v2.rows.item(0).VersionId);
        let versionid: number;
        versionid = v2.rows.item(0).VersionId;
        return this.httpService.get(APP_SERVE_URL + "/DynamicsPack", { Token: token, projId: projid, Batchid: batchid, buildingid: buildingid, batchVersion: versionid, type: type });
      }).then((v3) => {
        console.log("v3");
        return this.updateDynamicsPack(v3[0], projid, batchid, buildingid, type);
      }).catch(err => {
        this.nativeservice.hideLoading();
        return console.log("楼栋更新失败:" + err);
      }))
    })
  }

  updateDynamicsPack(data, projid, batchid, buildingid, type): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      let tablename: Array<string>;
      tablename = [];
      resolve(promise.then((v1) => {
        let tmppromise = Promise.resolve([]);
        for (var i = 2; i < data.length; i += 2) {
          let items = data[i];
          console.log(items[0]);
          if (data[i + 1].length > 0) {
            let tmptbname = 'tmp' + items[0];
            tablename.push(items[0]);
            let tmpdata: Array<any>; tmpdata = [];
            tmpdata = data[i + 1];
            tmppromise = tmppromise.then(() => {
              return this.resetdata(tmptbname);
            }).then(v => {
              return this.initBaseData(tmptbname, tmpdata);
            })
          }
        }
        return tmppromise;
      }).then((v2: any) => {
        let tablefield: Array<any>; tablefield = [];
        if (type == 1) {
          tablefield.push("PreCheckIssues"); tablefield.push("BatchId,IssueId,RoomId,PositionId,CheckItemId,PlusDesc,IssueDesc,UrgencyId,ImgBefore1,ImgBefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,Id,IssueStatus,VendId,ResponVendId,ProjId,Manager,ResponsibleId,IssueType,RegisterDate ,AppointDate,LimitDate,ReFormDate,CloseDate,CloseReason,CancelDate,CancelReason,VersionId,ImgClose1,ImgClose2,ImgClose3,ReturnDate,ReturnReason,ReturnNum,BuildingId,EngineerId,ReviewDate ,x ,y ,ResponsibleName,ResponsiblePhone,EngineerName,EngineerPhone,ReassignDate,ReassignDesc,ReasonbyOver,fixedDesc");
          tablefield.push("PreRoomDetails"); tablefield.push("RoomId,TransDate,RoomStatus,Remark,EngineerId,EngineerPhone,ProjId,VersionId,ID,BatchId,BuildingId,EngineerName");
        } else if (type == 2) {
          tablefield.push("OpenCheckIssues"); tablefield.push("BatchId,IssueId,RoomId,PositionId,CheckItemId,PlusDesc,IssueDesc,UrgencyId,ImgBefore1,ImgBefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,Id,IssueStatus,VendId,ResponVendId,ProjId,Manager,ResponsibleId,IssueType,RegisterDate ,AppointDate,LimitDate,ReFormDate,CloseDate,CloseReason,CancelDate,CancelReason,VersionId,ImgClose1,ImgClose2,ImgClose3,ReturnDate,ReturnReason,ReturnNum,BuildingId,EngineerId,ReviewDate ,x ,y ,ResponsibleName,ResponsiblePhone,EngineerName,EngineerPhone,ReassignDate,ReassignDesc,ReasonbyOver,fixedDesc");
          tablefield.push("CustRoomSatisfactions"); tablefield.push("RoomId,SatisfiedDim,Type,Score,ProjId,VersionId,Id,BatchId,Buildingid");
          tablefield.push("RoomNoAcceptLogs"); tablefield.push("ProjId,RoomId,PlusDesc,VersionId,ID,ReasonNoAcceptId,BatchId,Buildingid,UserName,TransDate");
          tablefield.push("OpenRoomDetails"); tablefield.push("RoomId,TransDate,RoomStatus,CustId,CustPhone,Remark,EngineerId,EngineerPhone,ImgSign,ProjId,VersionId,ID,BatchId,BuildingId,EngineerName");
        } else if (type == 3) {
          tablefield.push("FormalCheckIssues"); tablefield.push("BatchId,IssueId,RoomId,PositionId,CheckItemId,PlusDesc,IssueDesc,UrgencyId,ImgBefore1,ImgBefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,Id,IssueStatus,VendId,ResponVendId,ProjId,Manager,ResponsibleId,IssueType,RegisterDate ,AppointDate,LimitDate,ReFormDate,CloseDate,CloseReason,CancelDate,CancelReason,VersionId,ImgClose1,ImgClose2,ImgClose3,ReturnDate,ReturnReason,ReturnNum,BuildingId,EngineerId,ReviewDate ,x ,y ,ResponsibleName,ResponsiblePhone,EngineerName,EngineerPhone,ReassignDate,ReassignDesc,ReasonbyOver,fixedDesc");
          tablefield.push("CustRoomSatisfactions"); tablefield.push("RoomId,SatisfiedDim,Type,Score,ProjId,VersionId,Id,BatchId,Buildingid");
          tablefield.push("RoomNoAcceptLogs"); tablefield.push("ProjId,RoomId,PlusDesc,VersionId,ID,ReasonNoAcceptId,BatchId,Buildingid,UserName,TransDate");
          tablefield.push("FormalRoomDetails"); tablefield.push("RoomId,TransDate,RoomStatus,CustId,CustPhone,Remark,EngineerId,EngineerPhone,ImgSign,ProjId,VersionId,ID,AmmeterNumber,AmmeterReading,WaterMeterNumber,WaterMeterReading,GasMeterNumber,GasMeterReading,KeyRetentionStatus,BatchId,BuildingId,EngineerName");
        } else {
          tablefield.push("ServiceCheckIssues"); tablefield.push("BatchId,IssueId,RoomId,PositionId,CheckItemId,PlusDesc,IssueDesc,UrgencyId,ImgBefore1,ImgBefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,Id,IssueStatus,VendId,ResponVendId,ProjId,Manager,ResponsibleId,IssueType,RegisterDate ,AppointDate,LimitDate,ReFormDate,CloseDate,CloseReason,CancelDate,CancelReason,VersionId,ImgClose1,ImgClose2,ImgClose3,ReturnDate,ReturnReason,ReturnNum,BuildingId,EngineerId,ReviewDate ,x ,y ,ResponsibleName,ResponsiblePhone,EngineerName,EngineerPhone,ReassignDate,ReassignDesc,ReasonbyOver,fixedDesc");
        }
        let tmppromise = Promise.resolve([]);
        for (var i = 0; i < tablename.length; i++) {
          console.log(tablename[i]);
          let tn = tablename[i];
          tmppromise = tmppromise.then(() => {
            let sql = "delete from #tablename# where exists (select ID from #tmptablename# where #tmptablename#.Id = #tablename#.Id)";
            sql = sql.replace('#tablename#', tn);
            sql = sql.replace('#tablename#', tn);
            sql = sql.replace('#tmptablename#', 'tmp' + tn);
            sql = sql.replace('#tmptablename#', 'tmp' + tn);
            console.log(sql);
            return this.db.executeSql(sql, []);
          }).then(v => {
            let sql = "insert into #tablename#( #fields# ) select #fields# from #tmptablename#";
            sql = sql.replace('#tablename#', tn);
            sql = sql.replace('#tmptablename#', 'tmp' + tn);
            let fieldstr = tablefield[tablefield.indexOf(tn, 0) + 1];
            sql = sql.replace('#fields#', fieldstr);
            sql = sql.replace('#fields#', fieldstr);
            console.log(sql);
            return this.db.executeSql(sql, []);
          })
          /////图片处理  "CustRoomSatisfactions", "RoomId,SatisfiedDim,Type,Score integer,ProjId,VersionId integer,Id,BatchId"          
        }
        return tmppromise;
      }).then(v3 => {
        //ImgBefore1,Imgbefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,ImgClose1,ImgClose2,ImgClose3
        let tmptn = '';
        if (type == 1) {
          tmptn = 'tmpPreCheckIssues';
        } else if (type == 2) {
          tmptn = 'tmpOpenCheckIssues';
        } else if (type == 3) {
          tmptn = 'tmpFormalCheckIssues';
        } else {
          tmptn = 'tmpServiceCheckIssues';
        }
        let sql = "select imgbefore1 as fn from #tmptablename# where imgbefore1 != '' and imgbefore1 != 'NUll' and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.imgbefore1) ".replace('#tmptablename#', tmptn).replace('#tmptablename#', tmptn).replace('#projid#', projid);
        sql += " union select imgbefore2 as fn from #tmptablename# where imgbefore2 != '' and imgbefore2 != 'NUll' and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.imgbefore2) ".replace('#tmptablename#', tmptn).replace('#tmptablename#', tmptn).replace('#projid#', projid);
        sql += " union select imgbefore3 as fn from #tmptablename# where imgbefore3 != '' and imgbefore3 != 'NUll' and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.imgbefore3) ".replace('#tmptablename#', tmptn).replace('#tmptablename#', tmptn).replace('#projid#', projid);
        sql += " union select ImgAfter1 as fn from #tmptablename# where ImgAfter1 != '' and ImgAfter1 != 'NUll' and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.ImgAfter1) ".replace('#tmptablename#', tmptn).replace('#tmptablename#', tmptn).replace('#projid#', projid);
        sql += " union select ImgAfter2 as fn from #tmptablename# where ImgAfter2 != '' and ImgAfter2 != 'NUll' and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.ImgAfter2) ".replace('#tmptablename#', tmptn).replace('#tmptablename#', tmptn).replace('#projid#', projid);
        sql += " union select ImgAfter3 as fn from #tmptablename# where ImgAfter3 != '' and ImgAfter3 != 'NUll' and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.ImgAfter3) ".replace('#tmptablename#', tmptn).replace('#tmptablename#', tmptn).replace('#projid#', projid);
        sql += " union select ImgClose1 as fn from #tmptablename# where ImgClose1 != '' and ImgClose1 != 'NUll' and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.ImgClose1) ".replace('#tmptablename#', tmptn).replace('#tmptablename#', tmptn).replace('#projid#', projid);
        sql += " union select ImgClose2 as fn from #tmptablename# where ImgClose2 != '' and ImgClose2 != 'NUll' and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.ImgClose2) ".replace('#tmptablename#', tmptn).replace('#tmptablename#', tmptn).replace('#projid#', projid);
        sql += " union select ImgClose3 as fn from #tmptablename# where ImgClose3 != '' and ImgClose3 != 'NUll' and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.ImgClose3) ".replace('#tmptablename#', tmptn).replace('#tmptablename#', tmptn).replace('#projid#', projid);
        if (type == 2) {
          sql += " union select ImgSign as fn from #tmptablename2# where ImgSign != '' and ImgSign != 'NUll' and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename2#.ImgSign) ".replace('#tmptablename2#', 'tmpOpenRoomDetails').replace('#tmptablename2#', 'tmpOpenRoomDetails').replace('#projid#', projid);
        } else if (type == 3) {
          sql += " union select ImgSign as fn from #tmptablename2# where ImgSign != '' and ImgSign != 'NUll' and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename2#.ImgSign) ".replace('#tmptablename2#', 'tmpFormalRoomDetails').replace('#tmptablename2#', 'tmpFormalRoomDetails').replace('#projid#', projid);
        }
        console.log(sql);
        return this.db.executeSql(sql, []);
      }).then((v4: any) => {
        console.log("v4:" + v4);
        let tmppromise = Promise.resolve([]);
        for (var j = 0; j < v4.rows.length; j++) {
          console.log(JSON.stringify(v4.rows.item(j)));
          let fn = v4.rows.item(j).fn;
          tmppromise = tmppromise.then(() => {
            return this.downloadimg(fn);
          }).then(val => {
            return this.db.executeSql("insert into imagetable (projid,fn,src) values ('" + projid + "','" + fn + "','" + val + "')", []);
          })
        }
        return tmppromise;
      }).then(v5 => {
        let sql = "update buildingversion set needupd = 0,versionId = #version# where projid = '#projid#' and batchid = '#batchid#' and buildingid = '#buildingid#' and type = #type#";
        sql = sql.replace('#projid#', projid);
        sql = sql.replace('#batchid#', batchid);
        sql = sql.replace('#buildingid#', buildingid);
        sql = sql.replace('#type#', type);
        sql = sql.replace('#version#', data[1][0]);
        console.log('updbvdata:' + sql);
        return this.db.executeSql(sql, []);
      }).catch(err => {
        console.log(err);
      }))
    })
  }

  updateuploadflag(projid, batchid, buildingid, type): Promise<number> {
    return new Promise((resolve) => {
      let sql = "update buildingversion set needupload = 1 where projid = '#projid#' and batchid = '#batchid#' and buildingid = '#buildingid#' and type = #type# and needupload = 0";
      sql = sql.replace('#projid#', projid);
      sql = sql.replace('#batchid#', batchid);
      sql = sql.replace('#buildingid#', buildingid);
      sql = sql.replace('#type#', type);
      console.log(sql);
      resolve(this.db.executeSql(sql, []));
    })
  }

  existstable(tablename): Promise<number> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      resolve(promise.then((v1) => {
        let sql = "select count(*) as counts from sqlite_master where name=" + "'" + tablename + "'";
        return this.db.executeSql(sql, []);
      }).then((val: any) => {
        console.log('Transaction finished, check record count: ' + tablename + "   " + JSON.stringify(val.rows.item(0)));
        return val.rows.item(0).counts;
      }).catch(err => {
        console.log(err);
        this.warn(tablename + '加载错误:' + err);
      }))
    })
  }

  getProjVersion(): Promise<Array<any>> {
    return new Promise((resolve) => {
      let projlist: Array<any>;
      projlist = [];
      this.db.executeSql("SELECT Projid,ProjName,VersionId,needupd FROM ProjVersion", []).then(vres => {
        for (var i = 0; i < vres.rows.length; i++) {
          console.log(JSON.stringify(vres.rows.item(i)));
          projlist.push({ projid: vres.rows.item(i).Projid, projname: vres.rows.item(i).ProjName, version: vres.rows.item(i).VersionId, needupd: vres.rows.item(i).Needupd });
        }
        console.log(projlist);
        resolve(projlist);
      }).catch(err => {
        this.warn('项目加载错误:' + err);
      })
    })
  }

  refreshbatch(projid, type, token, versionid): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      resolve(promise.then((v1) => {
        return this.nativeservice.isConnecting();
      }).then((vv: boolean) => {
        if (vv == false) {
          return vv;
        } else {
          return this.checkandupdprojversion(projid, token, versionid, false, true);
        }
      }).then((val: boolean) => {
        console.log("val:" + val);
        if (val == false) {
          return 10;
        } else {
          this.nativeservice.showLoading("刷新中,请稍侯...");
          return this.initbuildingversion(token, projid);
        }
      }).then((v1) => {
        let sql: string;
        sql = "SELECT batchname,batchid FROM buildingversion where projid = '#projid#' and type = #type# group by batchname,batchid";// 
        sql = sql.replace("#projid#", projid);
        sql = sql.replace("#type#", type);
        console.log(sql);
        return this.db.executeSql(sql, []);
      }).then((batchlist: any) => {
        console.log(JSON.stringify(batchlist.rows.item(0)));
        let batchbuildings: Array<any>; batchbuildings = [];
        let tmppromise = Promise.resolve([]);
        for (var i = 0; i < batchlist.rows.length; i++) {
          console.log(batchlist.rows.item(i).BatchName);
          let batchid = batchlist.rows.item(i).Batchid;
          let batchname = batchlist.rows.item(i).BatchName;
          tmppromise = tmppromise.then(() => {
            return this.getBuilding(projid, batchid, type);
          }).then(val => {
            console.log('val' + val);
            console.log(batchid);
            batchbuildings.push({ batchid: batchid, batchname: batchname, buildings: val });
            return batchbuildings;
          })
        }
        return tmppromise;
      }).then((buildinglist: Array<any>) => {
        console.log(buildinglist);
        return buildinglist;
      }).catch(err => {
        this.warn('批次加载错误:' + err);
      }))
    })
  }

  getbatch(projid, type, token, versionid): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      resolve(promise.then((v1) => {
        return this.existstable("buildingversion").then(counts => {
          if (counts == 0) {
            return null;
          } else {
            let sql: string;
            sql = "SELECT batchname,batchid FROM buildingversion where projid = '#projid#' and type = #type# group by batchname,batchid";// 
            sql = sql.replace("#projid#", projid);
            sql = sql.replace("#type#", type);
            console.log(sql);
            return this.db.executeSql(sql, []);
          }
        })
      }).then((batchlist: any) => {
        console.log(batchlist);
        if (!batchlist || batchlist.rows.length == 0) {
          return [];
        }
        console.log(JSON.stringify(batchlist.rows.item(0)));
        let batchbuildings: Array<any>; batchbuildings = [];
        let tmppromise = Promise.resolve([]);
        for (var i = 0; i < batchlist.rows.length; i++) {
          console.log(batchlist.rows.item(i).BatchName);
          let batchid = batchlist.rows.item(i).Batchid;
          let batchname = batchlist.rows.item(i).BatchName;
          tmppromise = tmppromise.then(() => {
            return this.getBuilding(projid, batchid, type);
          }).then(val => {
            console.log('val' + val);
            console.log(batchid);
            batchbuildings.push({ batchid: batchid, batchname: batchname, buildings: val });
            return batchbuildings;
          })
        }
        return tmppromise;
      }).then((buildinglist: Array<any>) => {
        console.log(buildinglist);
        return buildinglist;
      }).catch(err => {
        this.warn('批次加载错误:' + err);
      }))
    })
  }

  getBuilding(projid, batchid, type): Promise<Array<any>> {
    return new Promise((resolve) => {
      let sql: string;
      sql = "SELECT buildingid,buildingname,needupd,needdownload,needupload FROM buildingversion where projid = '#projid#' and type = #type# and batchid = '#batchid#' order by buildingid";
      sql = sql.replace("#projid#", projid);
      sql = sql.replace("#type#", type);
      sql = sql.replace("#batchid#", batchid);
      //var buildinglist: Array<any>;
      //buildinglist = [];     
      console.log(sql);
      this.db.executeSql(sql, []).then(list => {
        console.log(JSON.stringify(list.rows.item(0)));
        //for (var i = 0; i < vres.rows.length; i++) {
        //buildinglist.push({ projid: vres.rows.item(i).Projid, projname: vres.rows.item(i).ProjName, version: vres.rows.item(i).VersionId, needupd: vres.rows.item(i).needupd });
        //}
        //resolve(buildinglist);
        let buildings: Array<any>;
        buildings = [];
        let needtype: number;
        for (let i = 0; i < list.rows.length; i++) {  //Buildingid,BuildingName,needupd,needdownload 
          console.log('for');
          if (list.rows.item(i).needdownload == 1)
            needtype = 1;
          else if (list.rows.item(i).needupload == 1)                    /////////////////上传标记判断
            needtype = 2;
          else if (list.rows.item(i).needupd == 1)
            needtype = 3;
          else
            needtype = 0;
          console.log("needtype:" + needtype);
          buildings.push({ buildingid: list.rows.item(i).Buildingid, buildingname: list.rows.item(i).BuildingName, needtype: needtype });
        }
        console.log(buildings);
        resolve(buildings);

      }).catch(err => {
        this.warn('楼栋加载错误:' + err);
      })
    })
  }

  getfloors(projid, batchid, buildingid, type): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });  //FormalRoomDetails", "RoomId,TransDate DateTime,RoomStatus,C
      resolve(promise.then((v1) => {
        let tn = ''; tn = this.getissuetablename(type);
        let batchtn = ''; batchtn = this.getissuetype(type) + "checkbatchrooms";
        // let sql = "select floorid,sortcode from rooms inner join formalcheckbatchrooms fcr on fcr.roomid = rooms.id and fcr.projid = '#projid#' and fcr.batchid = '#batchid#' and fcr.buildingid = '#buildingid#' group by sortcode,floorid order by sortcode";
        let sql = "select * from rooms ";
        if (type == 1) {
          sql = sql + "left outer join (select roomid, RoomStatus from PreRoomDetails frd where frd.projid = '#projid#' and frd.batchid = '#batchid#' and frd.buildingid = '#buildingid#') frdts on frdts.roomid = rooms.id "
        } else if (type == 2) {
          sql = sql + "left outer join (select roomid, RoomStatus from OpenRoomDetails frd where frd.projid = '#projid#' and frd.batchid = '#batchid#' and frd.buildingid = '#buildingid#') frdts on frdts.roomid = rooms.id "
        } else if (type == 3) {
          sql = sql + "left outer join (select roomid, RoomStatus from FormalRoomDetails frd where frd.projid = '#projid#' and frd.batchid = '#batchid#' and frd.buildingid = '#buildingid#') frdts on frdts.roomid = rooms.id "
        }
        sql = sql + "left outer join (select roomid, count(*) as dzg from #issuename# fci2 where fci2.issuestatus = '待整改' or fci2.issuestatus = '待派单' group by roomid) fdzg on fdzg.roomid = rooms.id "
          + "left outer join (select roomid, count(*) as yzg from #issuename# fci3 where fci3.issuestatus = '已整改' group by roomid) fyzg on fyzg.roomid = rooms.id "
          + "left outer join (select roomid, count(*) as ytg from #issuename# fci4 where fci4.issuestatus = '已通过' group by roomid) fytg on fytg.roomid = rooms.id "
          + "where exists (select roomid from #checkbatchname# fcr where fcr.roomid = rooms.id and fcr.projid = '#projid#' and fcr.batchid = '#batchid#' and fcr.buildingid = '#buildingid#')"
          + "order by rooms.sortcode, rooms.unit";
        sql = sql.replace('#projid#', projid).replace('#projid#', projid).replace("#issuename#", tn).replace("#issuename#", tn).replace("#issuename#", tn);
        sql = sql.replace('#batchid#', batchid).replace('#batchid#', batchid);
        sql = sql.replace('#buildingid#', buildingid).replace('#buildingid#', buildingid).replace('#checkbatchname#', batchtn);
        console.log(sql);
        return this.db.executeSql(sql, []);
      }).then((floorlist: any) => {
        console.log(floorlist);
        let tmppromise = Promise.resolve([]);
        let floorready: any;
        let floorforfix: any;
        let floorfixed: any;
        let floorpass: any;
        let floorall: any;
        floorall = [];
        floorready = [];
        floorforfix = [];
        floorfixed = [];
        floorpass = [];
        let oldfloorid: string; oldfloorid = '';
        let ready: any; let readycounts: number; readycounts = 0;
        let forfix: any; let forfixcounts: number; forfixcounts = 0;
        let fixed: any; let fixedcounts: number; fixedcounts = 0;
        let pass: any; let passcounts: number; passcounts = 0;
        let all: any; let allcounts: number; allcounts = 0;

        for (var i = 0; i < floorlist.rows.length; i++) {
          console.log(JSON.stringify(floorlist.rows.item(i)));
          let items = floorlist.rows.item(i);
          let floorid = items.FloorName;
          console.log(floorid);
          if (oldfloorid != floorid) {
            if (oldfloorid != '') {
              floorall.push(all);
              floorready.push(ready);
              floorforfix.push(forfix);
              floorfixed.push(fixed);
              floorpass.push(pass);
            }
            oldfloorid = floorid;
            ready = { id: floorid, value: [] };
            forfix = { id: floorid, value: [] };
            fixed = { id: floorid, value: [] };
            pass = { id: floorid, value: [] };
            all = { id: floorid, value: [] };
          }
          let color: string;
          if ((type == 1 && items.RoomStatus == '已通过') || (type == 2 && items.RoomStatus == '已接待') || (type == 3 && items.RoomStatus == '已交付')) {
            pass.value.push({ roomid: items.Id, name: items.Name });
            color = "secondary";
            passcounts++;
          } else if (items.dzg > 0) {
            forfix.value.push({ roomid: items.Id, name: items.Name });
            color = "danger";
            forfixcounts++;
          }
          else if (items.yzg > 0) {
            fixed.value.push({ roomid: items.Id, name: items.Name });
            color = "primary";
            fixedcounts++;
          }
          else if (items.ytg > 0) {
            pass.value.push({ roomid: items.Id, name: items.Name });
            color = "secondary";
            passcounts++;
          }
          else {
            ready.value.push({ roomid: items.Id, name: items.Name });
            color = "light";
            readycounts++;
          }
          allcounts++;
          all.value.push({ roomid: items.Id, name: items.Name, color: color });
        }
        if (oldfloorid != '') {
          floorall.push(all);
          floorready.push(ready);
          floorforfix.push(forfix);
          floorfixed.push(fixed);
          floorpass.push(pass);
        }
        let res: Array<any>;
        res = [{ counts: allcounts, items: floorall }, { counts: readycounts, items: floorready }, { counts: forfixcounts, items: floorforfix }, { counts: fixedcounts, items: floorfixed }, { counts: passcounts, items: floorpass }];
        return res;
      }).catch(err => {
        console.log("房间加载失败:" + err);
      }))
    })
  }

  getissuelist(projid, batchid, roomid, type): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      console.log("issuelist");
      resolve(promise.then((v1) => {
        let tablename: string;
        tablename = this.getissuetablename(type);
        let sql = "select iss.Id,iss.IssueId,iss.IssueStatus,iss.x,iss.y,iss.IssueDesc,iss.PlusDesc,iss.UrgencyId,iss.EngineerName,iss.ResponsibleName,iss.ReturnNum,iss.LimitDate,pp.name as position,pci.name as checkitem from #tablename# as iss inner join projpositions pp on pp.Id = iss.positionid and pp.projid = iss.projid inner join projcheckitems AS pci on pci.id = iss.CheckItemId and pci.projid = iss.projid where iss.projid = '#projid#' and iss.batchid = '#batchid#' and iss.roomid = '#roomid#'";
        sql = sql.replace('#tablename#', tablename);
        sql = sql.replace('#projid#', projid);
        sql = sql.replace('#batchid#', batchid);
        sql = sql.replace('#roomid#', roomid);
        console.log(sql);
        return this.db.executeSql(sql, []);
      }).then((v2: any) => {
        console.log(v2);
        let issuelist: Array<any>; issuelist = [];
        let dpd = 0, dzg = 0, yzg = 0, ytg = 0;
        let status: string;
        for (var i = 0; i < v2.rows.length; i++) {
          console.log(JSON.stringify(v2.rows.item(i)));
          let now = new Date();
          let dt = new Date(v2.rows.item(i).LimitDate);
          let days = 0;
          if (now > dt) {
            days = Math.round((now.getTime() - dt.getTime()) / 1000 / 3600 / 24);
          }
          status = v2.rows.item(i).IssueStatus;
          console.log(status)
          if (status == "待派单") {
            console.log("1" + status);
            dpd++;
          } else if (status == "待整改") {
            console.log("2" + status);
            dzg++;
          } else if (status == "已整改") {
            console.log("3" + status);
            yzg++;
          } else if (status == "已通过") {
            console.log("4" + status);
            ytg++;
          }
          console.log(v2.rows.item(i).ReturnNum);
          console.log(dt.toLocaleDateString());
          console.log(dt.toLocaleString());
          console.log(dpd + ";" + dzg + ";" + yzg + ";" + ytg);
          issuelist.push({ id: v2.rows.item(i).Id, status: status, position: v2.rows.item(i).position, checkitem: v2.rows.item(i).checkitem, x: v2.rows.item(i).x, y: v2.rows.item(i).y, issueid: v2.rows.item(i).IssueId, IssueDesc: v2.rows.item(i).IssueDesc, PlusDesc: v2.rows.item(i).PlusDesc, UrgencyId: v2.rows.item(i).UrgencyId, EngineerName: v2.rows.item(i).EngineerName, ResponsibleName: v2.rows.item(i).ResponsibleName, duedate: dt.toLocaleDateString(), overdays: days, returntimes: v2.rows.item(i).ReturnNum });
        }
        console.log(issuelist); console.log(dpd + ";" + dzg + ";" + yzg + ";" + ytg);
        return [issuelist, dpd, dzg, yzg, ytg];
      }).catch(err => {
        this.warn('问题加载失败:' + err);
      }))
    })
  }

  getdrawinfo(projid, roomid): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(10);
      });
      let areas: Array<any>; areas = [];
      resolve(promise.then((v1: any) => {
        console.log(v1);
        let sql = "select apl.positionid,pp.name,apd.x,apd.y from apartmentpostiondraws apd inner join apartmentpostionlink apl on apl.id = apd.Apartmentpostionlinkid inner join projpositions pp on pp.Id = apl.positionid inner join rooms on rooms.apartmentid = apl.apartmentid and rooms.id = '#roomid#' order by apl.positionid,apd.Sortcode";
        sql = sql.replace('#roomid#', roomid);
        console.log(sql);
        return this.db.executeSql(sql, []);
      }).then((v2: any) => {
        console.log(v2);
        let points: Array<any>; points = [];
        let posiold: string; let posi: string; posiold = '';
        let name;
        for (var i = 0; i < v2.rows.length; i++) {
          console.log(JSON.stringify(v2.rows.item(i)));
          posi = v2.rows.item(i).Positionid;
          console.log("posiold:" + posiold);
          console.log("posi:" + posi);
          if (posiold != posi) {
            console.log("posiold != posi:" + posiold);
            if (posiold != '') {
              areas.push({ positionid: posiold, name: name, points: points });
            }
            points = []; posiold = v2.rows.item(i).Positionid;
          }
          points.push({ x: v2.rows.item(i).X, y: v2.rows.item(i).Y });
          name = v2.rows.item(i).Name;
        }
        if (posiold != '') {
          areas.push({ positionid: posiold, name: name, points: points });
        }
        let sql = "select it.src,apt.imgwidth from imagetable it inner join apartments apt on apt.image = it.fn inner join rooms on rooms.apartmentid = apt.Id and rooms.id = '#roomid#'  ";
        sql = sql.replace('#roomid#', roomid);
        console.log(sql);
        return this.db.executeSql(sql, []);
      }).then((v3: any) => {
        console.log(areas);
        let drawlist: Array<any>; drawlist = [];
        if (v3 && v3.rows.length > 0) {
          console.log(JSON.stringify(v3.rows.item(0)));
          drawlist.push({ src: v3.rows.item(0).src, width: v3.rows.item(0).ImgWidth, areas: areas });
          console.log(drawlist);
        }
        return drawlist;
      }).catch(err => {
        this.warn('问题坐标加载失败:' + err);
      }))
    })
  }
  //("projcheckitems", "ProjId,Id,Name")
  //("vend", "Id,NameAlias,Manager,Phone")
  //("projpositions", "Projid,Id,Name")

  getissueinfo(issueid, type): Promise<any> {
    // return new Promise((resolve) => {
    let sql = "select iss.ResponsibleId,iss.versionid,iss.ImgBefore1,iss.ImgBefore2,iss.ImgBefore3,iss.ImgAfter1,iss.ImgAfter2,iss.ImgAfter3,iss.IssueStatus,iss.ReFormDate,iss.LimitDate,iss.RegisterDate,iss.UrgencyId,iss.PlusDesc,iss.IssueDesc,posi.name as Position,ve.NameAlias as Vendor,reve.NameAlias as Resunit,pci.name as Checkitem from #tablename# as iss inner join projpositions AS posi on posi.Id = iss.PositionId inner join vend AS ve on ve.id = iss.vendid inner join vend AS reve on reve.id = iss.ResponVendId inner join projcheckitems AS pci on pci.id = iss.CheckItemId where iss.Id = '#issueid#'";
    let tablename = ''; tablename = this.getissuetablename(type);
    sql = sql.replace('#tablename#', tablename);
    sql = sql.replace('#issueid#', issueid);
    console.log(sql);
    return this.db.executeSql(sql, []).then(v => {
      return v;
    }).catch(err => {
      console.log(err);
      return err;
    })
    //return this.db.executeSql(sql, []);
    // })
  }

  getroomissueinfo(roomid, type): Promise<any> {
    return new Promise((resolve) => {
      let sql = "select iss.IssueStatus,iss.PlusDesc,iss.IssueDesc,posi.name as Position,pci.name as Checkitem from #tablename# as iss inner join projpositions AS posi on posi.Id = iss.PositionId inner join projcheckitems AS pci on pci.id = iss.CheckItemId where iss.roomId = '#roomid#'";
      let tablename = ''; tablename = this.getissuetablename(type);
      sql = sql.replace('#tablename#', tablename);
      sql = sql.replace('#roomid#', roomid);
      console.log(sql);
      resolve(this.db.executeSql(sql, []));
    })
  }

  //("positioncheckitemlink", "Projid,Positionid,Checkitemid")
  //("projcheckitems", "ProjId,Id,Name")
  //("projcheckitemdetails", "ProjId,Checkitemid,Name,Timelimit integer,Sortcode integer")

  getcheckitem(projid, roomid, positionid): Promise<any> {
    return new Promise((resolve) => {
      let sql = "select pji.name,pji.Id from projcheckitems AS pji inner join positioncheckitemlink AS pcil on pji.id = pcil.checkitemid and pji.projid = pcil.projid and pji.projid = '#projid#' and pcil.positionid = '#positionid#'";
      sql = sql.replace('#projid#', projid);
      sql = sql.replace('#positionid#', positionid);
      console.log(sql);
      resolve(this.db.executeSql(sql, []).then((val: any) => {
        console.log('chek:' + val);
        let checkitem: Array<any>; checkitem = [];
        for (let i = 0; i < val.rows.length; i++) {
          console.log(JSON.stringify(val.rows.item(i)));
          checkitem.push({ id: val.rows.item(i).Id, name: val.rows.item(i).Name });
        }
        return checkitem;
      }).catch(err => {
        this.warn('检查项加载失败:' + err);
        throw '检查项加载失败';
      }))

    })
  }

  getcheckitemdescvend(projid, roomid, checkitemid, buildingid, floorid): Promise<any> {
    return new Promise((resolve) => {
      let itemdesc: Array<string>; itemdesc = [];
      let vendlist: Array<any>; vendlist = [];
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      resolve(promise.then((v1) => {
        let sql = "select name from projcheckitemdetails where projid ='" + projid + "' and checkitemid = '#checkitemid#'";
        sql = sql.replace('#checkitemid#', checkitemid);
        console.log(sql);
        return this.db.executeSql(sql, []);
      }).then((v2: any) => {
        console.log('chekitem:' + v2);
        for (let k = 0; k < v2.rows.length; k++) {
          console.log(JSON.stringify(v2.rows.item(k)));
          itemdesc.push(v2.rows.item(k).Name);
        }
        let sql = "select Id,NameAlias,Manager,ManagerName,Phone from vend where projid = '#projid#' and exists (select vpc.vendid from vendprojcheckscopes vpc where vpc.vendid = vend.id and vpc.projid = '#projid#' and vpc.ProjCheckItemId = '#checkitemid#' and ((vpc.Node = 3 and vpc.roomid = '#roomid#') or (vpc.node = 1 and vpc.BuildingId = '#buildingid#') or (vpc.node = 2 and vpc.FloorId = '#floorid#'))) order by NameAlias";
        sql = sql.replace('#roomid#', roomid).replace('#buildingid#', buildingid).replace('#floorid#', floorid).replace('#projid#', projid).replace('#projid#', projid);
        sql = sql.replace('#checkitemid#', checkitemid);
        return sql;
      }).then((vsql: string) => {
        console.log(vsql);
        return this.db.executeSql(vsql, []).then((v3: any) => {
          console.log("v3:" + v3); console.log(JSON.stringify(v3.rows.item(0)));
          for (var l = 0; l < v3.rows.length; l++) {
            console.log(JSON.stringify(v3.rows.item(l)));
            vendlist.push({ id: v3.rows.item(l).Id, name: v3.rows.item(l).NameAlias, manager: v3.rows.item(l).Manager, phone: v3.rows.item(l).Phone, managename: v3.rows.item(l).ManageName });
          }
        })
      }).then((v3: any) => {

        let tmpvend: Array<any>; tmpvend = [];
        console.log(itemdesc);
        console.log(vendlist);
        return [itemdesc, vendlist];
      }).catch(err => {
        this.warn('问题描述加载失败:' + err);
        throw '问题描述加载失败';
      }))
    })
  }

  getprojvendor(projid): Promise<any> {
    return new Promise((resolve) => {
      resolve(this.db.executeSql("select Id,NameAlias,Manager,Phone,ManagerName from vend where projid = '" + projid + "'", []).then(val => {
        let vendlist: Array<any>; vendlist = [];
        for (let l = 0; l < val.rows.length; l++) {
          console.log(JSON.stringify(val.rows.item(l)));
          vendlist.push({ id: val.rows.item(l).Id, name: val.rows.item(l).NameAlias, manager: val.rows.item(l).Manager, phone: val.rows.item(l).Phone, managename: val.rows.item(l).ManagerName });
        }
        return vendlist;
      }).catch(err => {
        this.warn('项目供应商加载失败:' + err);
        throw '项目供应商加载失败';
      }))
    })
  }

  //"projcheckitemdetails", "ProjId,Checkitemid,Name,Timelimit integer,Sortcode integer")
  getduetime(projid, checitemid, issuedesc: Array<string>): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      let sql = "select max(Timelimit) as Timelimit from projcheckitemdetails where projid = '#projid#' and Checkitemid = '#Checkitemid#' and (#issuedesc#)";
      sql = sql.replace('#projid#', projid).replace("#Checkitemid#", checitemid);
      let descrange: string;
      for (var i = 0; i < issuedesc.length; i++) {
        if (i == 0) {
          descrange = "Name = '" + issuedesc[i] + "'";
        } else {
          descrange += " or Name = '" + issuedesc[i] + "'";
        }
      }
      sql = sql.replace('#issuedesc#', descrange);
      console.log(sql);
      resolve(promise.then((v1) => {
        return this.db.executeSql(sql, []);
      }).catch(err => {
        this.warn('问题整改时限获取失败:' + err);
        throw '问题整改时限获取失败';
      }))
    })

  }

  getroomdetails(roomid, batchid, type): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      let sql = "";
      if (type == 1) {
        sql = "select * from PreRoomDetails where roomid = '#roomid#' and batchid = '#batchid#'";
      } else if (type == 2) {
        sql = "select * from OpenRoomDetails where roomid = '#roomid#' and batchid = '#batchid#'";
      } else if (type == 3) {
        sql = "select * from FormalRoomDetails where roomid = '#roomid#' and batchid = '#batchid#'";
      }
      sql = sql.replace('#roomid#', roomid).replace("#batchid#", batchid);
      resolve(promise.then((v1) => {
        return this.db.executeSql(sql, []);
      }).catch(err => {
        this.warn('房间加载失败:' + err);
      }))
    })

  }

  getCustSatisfactions(roomid, type): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      resolve(promise.then((v1) => {
        let sql = "select crs.SatisfiedDim as Dim, crs.Score from CustRoomSatisfactions crs inner join custsatisfaction csf on crs.SatisfiedDim = csf.name where crs.roomid = '#roomid#' and crs.type = #type# order by csf.sortcode";
        sql = sql.replace('#roomid#', roomid).replace('#type#', type.toString());
        console.log(sql);
        return this.db.executeSql(sql, []);
      }).then((v2: any) => {
        console.log('v2:' + v2);
        if (v2 && v2.rows.length > 0) {
          return v2;
        } else {
          let sql = "select name as Dim, 0 as Score from custsatisfaction where type = #type# order by sortcode";
          sql = sql.replace('#type#', type.toString());
          console.log(sql);
          return this.db.executeSql(sql, []);
        }
      }).catch(err => {
        this.warn('客户满意度加载失败:' + err);
      }))
    })
  }
  //("vendprojcheckscopes", "Vendid,Projid,Checkitemid,Roomid,buildingid")
  //("vend", "Id,NameAlias,Manager,Phone")

  // getvendors(roomid, checkitems: Array<any>): Promise<any> {
  //   return new Promise((resolve) => {
  //     let promise = new Promise((resolve) => {
  //       resolve(100);
  //     });
  //     let sql = "select Id,NameAlias,Manager,Phone,checkitemid from vend inner join vendprojcheckscopes vpc on vpc.vendid = vend.id and vpc.roomid = '#roomid#' order by Id";
  //     sql = sql.replace('#roomid#', roomid);      
  //     resolve(promise.then((v1) => {
  //       return this.db.executeSql(sql, []);
  //     }).catch(err => {
  //       this.warn('图片下载失败:' + err);
  //     }))
  //   })

  // }

  getissuetablename(type): string {
    if (type == 1) {
      return 'PreCheckIssues';
    } else if (type == 2) {
      return 'OpenCheckIssues';
    } else if (type == 3) {
      return 'FormalCheckIssues';
    } else {
      return 'ServiceCheckIssues';
    }
  }

  getissuetype(type): string {
    if (type == 1) {
      return 'Pre';
    } else if (type == 2) {
      return 'Open';
    } else if (type == 3) {
      return 'Formal';
    } else {
      return 'Service';
    }
  }

  getuplissuetablename(type): string {
    if (type == 1) {
      return 'uplPreCheckIssues';
    } else if (type == 2) {
      return 'uplOpenCheckIssues';
    } else if (type == 3) {
      return 'uplFormalCheckIssues';
    } else if (type == 4) {
      return 'uplServiceCheckIssues';
    }
  }

  getfloorid(roomid): Promise<any> {
    return new Promise((resolve) => {
      let sql = "select FloorId from rooms where id = '" + roomid + "'";
      resolve(this.db.executeSql(sql, []));
    })
  }

  getstatuscolor(status): string {
    let promise = new Promise((resolve) => {
      resolve(100);
    });
    let sc = ['待派单', 'darkviolet', '待整改', 'red', '已整改', 'blue', '已通过', 'green', '已作废', 'gray', '非正常关闭', 'orange'];
    return sc[sc.indexOf(status, 0) + 1];
  }

  warn(info): void {
    console.log('%cNativeService/' + info, 'color:#e8c406');
  }

  updateIssue(sqls: Array<string>): Promise<any> {
    return new Promise((resolve) => {
      resolve(this.db.sqlBatch(sqls));
    })
  }

  initbuilderData(data, projid): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      console.log("initbuilderData");
      let tablename: Array<string>;
      tablename = [];
      resolve(promise.then((v1) => {
        let tmppromise = Promise.resolve([]);
        for (var i = 2; i < data.length; i += 2) {
          let items = data[i];
          console.log(items[0]);
          if (data[i + 1].length > 0) {
            let tmptbname = 'tmp' + items[0];
            tablename.push(items[0]);
            let tmpdata: Array<any>; tmpdata = [];
            tmpdata = data[i + 1];
            tmppromise = tmppromise.then(() => {
              return this.resetdata(tmptbname);
            }).then(v => {
              return this.initBaseData(tmptbname, tmpdata);
            })
          }
        }
        return tmppromise;
      }).then((v2: any) => {
        let tablefield: Array<any>; tablefield = [];
        tablefield.push("PreCheckIssues"); tablefield.push("VersionId,BatchId,IssueId,RoomId,PositionName,CheckItemName,PlusDesc,IssueDesc,UrgencyId,ImgBefore1,ImgBefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,Id,IssueStatus,VendId,ResponVendId,ProjId,Manager,ResponsibleId,IssueType,RegisterDate,AppointDate,LimitDate,ReFormDate,ReturnDate,ReturnReason,ReturnNum,BuildingId,EngineerId,ReviewDate,x,y,ResponsibleName,ResponsiblePhone,EngineerName,EngineerPhone,APImg,FloorName,BuildingName,RoomName,ManagerName,ManagerPhone,BatchName,ReassignDate,ReassignDesc,ReasonbyOver,fixedDesc,ImgWidth");
        tablefield.push("PreCheckLogs"); tablefield.push("BatchId,IssueId,IssueStatus,LogDate,UserId,UserName,Origin,DueDate,ReasonbyOver,IsReturn,ReturnReason,ProjId,VersionId,ID");
        tablefield.push("OpenCheckIssues"); tablefield.push("VersionId,BatchId,IssueId,RoomId,PositionName,CheckItemName,PlusDesc,IssueDesc,UrgencyId,ImgBefore1,ImgBefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,Id,IssueStatus,VendId,ResponVendId,ProjId,Manager,ResponsibleId,IssueType,RegisterDate,AppointDate,LimitDate,ReFormDate,ReturnDate,ReturnReason,ReturnNum,BuildingId,EngineerId,ReviewDate,x,y,ResponsibleName,ResponsiblePhone,EngineerName,EngineerPhone,APImg,FloorName,BuildingName,RoomName,ManagerName,ManagerPhone,BatchName,ReassignDate,ReassignDesc,ReasonbyOver,fixedDesc,ImgWidth");

        tablefield.push("OpenCheckLogs"); tablefield.push("BatchId,IssueId,IssueStatus,LogDate,UserId,UserName,Origin,DueDate,ReasonbyOver,IsReturn,ReturnReason,ProjId,VersionId,ID");
        tablefield.push("ServiceCheckIssues"); tablefield.push("VersionId,BatchId,IssueId,RoomId,PositionName,CheckItemName,PlusDesc,IssueDesc,UrgencyId,ImgBefore1,ImgBefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,Id,IssueStatus,VendId,ResponVendId,ProjId,Manager,ResponsibleId,IssueType,RegisterDate,AppointDate,LimitDate,ReFormDate,ReturnDate,ReturnReason,ReturnNum,BuildingId,EngineerId,ReviewDate,x,y,ResponsibleName,ResponsiblePhone,EngineerName,EngineerPhone,APImg,FloorName,BuildingName,RoomName,ManagerName,ManagerPhone,BatchName,ReassignDate,ReassignDesc,ReasonbyOver,fixedDesc,ImgWidth");

        tablefield.push("ServiceCheckLogs"); tablefield.push("BatchId,IssueId,IssueStatus,LogDate,UserId,UserName,Origin,DueDate,ReasonbyOver,IsReturn,ReturnReason,ProjId,VersionId,ID");

        tablefield.push("FormalCheckIssues"); tablefield.push("VersionId,BatchId,IssueId,RoomId,PositionName,CheckItemName,PlusDesc,IssueDesc,UrgencyId,ImgBefore1,ImgBefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,Id,IssueStatus,VendId,ResponVendId,ProjId,Manager,ResponsibleId,IssueType,RegisterDate,AppointDate,LimitDate,ReFormDate,ReturnDate,ReturnReason,ReturnNum,BuildingId,EngineerId,ReviewDate,x,y,ResponsibleName,ResponsiblePhone,EngineerName,EngineerPhone,APImg,FloorName,BuildingName,RoomName,ManagerName,ManagerPhone,BatchName,ReassignDate,ReassignDesc,ReasonbyOver,fixedDesc,ImgWidth");
        tablefield.push("ProjTeam"); tablefield.push("VendId,Name,Phone,ID,UserId,ProjId");
        tablefield.push("FormalCheckLogs"); tablefield.push("BatchId,IssueId,IssueStatus,LogDate,UserId,UserName,Origin,DueDate,ReasonbyOver,IsReturn,ReturnReason,ProjId,VersionId,ID");
        let tmppromise = Promise.resolve([]);
        for (let k = 0; k < tablename.length; k++) {
          console.log(tablename[k]);
          let tn = tablename[k];
          tmppromise = tmppromise.then(() => {
            let sql: string;
            if (tn == "ProjTeam") {
              sql = "delete from ProjTeam where id like 'builder%' and projid = '" + projid + "'";
            } else {
              sql = "delete from #tablename# where exists (select ID from #tmptablename# where #tmptablename#.Id = #tablename#.Id)";
              sql = sql.replace('#tablename#', tn);
              sql = sql.replace('#tablename#', tn);
              sql = sql.replace('#tmptablename#', 'tmp' + tn);
              sql = sql.replace('#tmptablename#', 'tmp' + tn);
            }
            console.log(sql);
            return this.db.executeSql(sql, []);
          }).then(v => {
            let sql: string;
            if (tn == "FormalCheckIssues" || tn == "OpenCheckIssues" || tn == "PreCheckIssues" || tn == "ServiceCheckIssues") {
              sql = "insert into #tablename#( #fields# ) select #fields# from #tmptablename# where IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改'";
            } else {
              sql = "insert into #tablename#( #fields# ) select #fields# from #tmptablename#";
            }
            sql = sql.replace('#tablename#', tn);
            sql = sql.replace('#tmptablename#', 'tmp' + tn);
            let fieldstr = tablefield[tablefield.indexOf(tn, 0) + 1];
            sql = sql.replace('#fields#', fieldstr);
            sql = sql.replace('#fields#', fieldstr);
            console.log(sql);
            return this.db.executeSql(sql, []);
          })
          /////图片处理  "CustRoomSatisfactions", "RoomId,SatisfiedDim,Type,Score integer,ProjId,VersionId integer,Id,BatchId"          
        }
        return tmppromise;
      }).then(v3 => {
        //ImgBefore1,Imgbefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,ImgClose1,ImgClose2,ImgClose3
        let sql = "select imgbefore1 as fn from #tmptablename# where imgbefore1 != '' and imgbefore1 != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.imgbefore1) ".replace('#tmptablename#', 'tmpPreCheckIssues').replace('#tmptablename#', 'tmpPreCheckIssues').replace('#projid#', projid);
        sql += " union select imgbefore2 as fn from #tmptablename# where imgbefore2 != '' and imgbefore2 != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.imgbefore2) ".replace('#tmptablename#', 'tmpPreCheckIssues').replace('#tmptablename#', 'tmpPreCheckIssues').replace('#projid#', projid);
        sql += " union select imgbefore3 as fn from #tmptablename# where imgbefore3 != '' and imgbefore3 != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.imgbefore3) ".replace('#tmptablename#', 'tmpPreCheckIssues').replace('#tmptablename#', 'tmpPreCheckIssues').replace('#projid#', projid);
        sql += " union select ImgAfter1 as fn from #tmptablename# where ImgAfter1 != '' and ImgAfter1 != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.ImgAfter1) ".replace('#tmptablename#', 'tmpPreCheckIssues').replace('#tmptablename#', 'tmpPreCheckIssues').replace('#projid#', projid);
        sql += " union select ImgAfter2 as fn from #tmptablename# where ImgAfter2 != '' and ImgAfter2 != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.ImgAfter2) ".replace('#tmptablename#', 'tmpPreCheckIssues').replace('#tmptablename#', 'tmpPreCheckIssues').replace('#projid#', projid);
        sql += " union select ImgAfter3 as fn from #tmptablename# where ImgAfter3 != '' and ImgAfter3 != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.ImgAfter3) ".replace('#tmptablename#', 'tmpPreCheckIssues').replace('#tmptablename#', 'tmpPreCheckIssues').replace('#projid#', projid);
        sql += " union select APImg as fn from #tmptablename# where APImg != '' and APImg != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.APImg) group by APImg ".replace('#tmptablename#', 'tmpPreCheckIssues').replace('#tmptablename#', 'tmpPreCheckIssues').replace('#projid#', projid);

        sql += " union select imgbefore1 as fn from #tmptablename# where imgbefore1 != '' and imgbefore1 != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.imgbefore1) ".replace('#tmptablename#', 'tmpOpenCheckIssues').replace('#tmptablename#', 'tmpOpenCheckIssues').replace('#projid#', projid);
        sql += " union select imgbefore2 as fn from #tmptablename# where imgbefore2 != '' and imgbefore2 != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.imgbefore2) ".replace('#tmptablename#', 'tmpOpenCheckIssues').replace('#tmptablename#', 'tmpOpenCheckIssues').replace('#projid#', projid);
        sql += " union select imgbefore3 as fn from #tmptablename# where imgbefore3 != '' and imgbefore3 != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.imgbefore3) ".replace('#tmptablename#', 'tmpOpenCheckIssues').replace('#tmptablename#', 'tmpOpenCheckIssues').replace('#projid#', projid);
        sql += " union select ImgAfter1 as fn from #tmptablename# where ImgAfter1 != '' and ImgAfter1 != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.ImgAfter1) ".replace('#tmptablename#', 'tmpOpenCheckIssues').replace('#tmptablename#', 'tmpOpenCheckIssues').replace('#projid#', projid);
        sql += " union select ImgAfter2 as fn from #tmptablename# where ImgAfter2 != '' and ImgAfter2 != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.ImgAfter2) ".replace('#tmptablename#', 'tmpOpenCheckIssues').replace('#tmptablename#', 'tmpOpenCheckIssues').replace('#projid#', projid);
        sql += " union select ImgAfter3 as fn from #tmptablename# where ImgAfter3 != '' and ImgAfter3 != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.ImgAfter3) ".replace('#tmptablename#', 'tmpOpenCheckIssues').replace('#tmptablename#', 'tmpOpenCheckIssues').replace('#projid#', projid);
        sql += " union select APImg as fn from #tmptablename# where APImg != '' and APImg != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.APImg) group by APImg ".replace('#tmptablename#', 'tmpOpenCheckIssues').replace('#tmptablename#', 'tmpOpenCheckIssues').replace('#projid#', projid);

        sql += " union select imgbefore1 as fn from #tmptablename# where imgbefore1 != '' and imgbefore1 != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.imgbefore1) ".replace('#tmptablename#', 'tmpFormalCheckIssues').replace('#tmptablename#', 'tmpFormalCheckIssues').replace('#projid#', projid);
        sql += " union select imgbefore2 as fn from #tmptablename# where imgbefore2 != '' and imgbefore2 != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.imgbefore2) ".replace('#tmptablename#', 'tmpFormalCheckIssues').replace('#tmptablename#', 'tmpFormalCheckIssues').replace('#projid#', projid);
        sql += " union select imgbefore3 as fn from #tmptablename# where imgbefore3 != '' and imgbefore3 != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.imgbefore3) ".replace('#tmptablename#', 'tmpFormalCheckIssues').replace('#tmptablename#', 'tmpFormalCheckIssues').replace('#projid#', projid);
        sql += " union select ImgAfter1 as fn from #tmptablename# where ImgAfter1 != '' and ImgAfter1 != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.ImgAfter1) ".replace('#tmptablename#', 'tmpFormalCheckIssues').replace('#tmptablename#', 'tmpFormalCheckIssues').replace('#projid#', projid);
        sql += " union select ImgAfter2 as fn from #tmptablename# where ImgAfter2 != '' and ImgAfter2 != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.ImgAfter2) ".replace('#tmptablename#', 'tmpFormalCheckIssues').replace('#tmptablename#', 'tmpFormalCheckIssues').replace('#projid#', projid);
        sql += " union select ImgAfter3 as fn from #tmptablename# where ImgAfter3 != '' and ImgAfter3 != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.ImgAfter3) ".replace('#tmptablename#', 'tmpFormalCheckIssues').replace('#tmptablename#', 'tmpFormalCheckIssues').replace('#projid#', projid);
        sql += " union select APImg as fn from #tmptablename# where APImg != '' and APImg != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.APImg) group by APImg ".replace('#tmptablename#', 'tmpFormalCheckIssues').replace('#tmptablename#', 'tmpFormalCheckIssues').replace('#projid#', projid);

        sql += " union select imgbefore1 as fn from #tmptablename# where imgbefore1 != '' and imgbefore1 != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.imgbefore1) ".replace('#tmptablename#', 'tmpServiceCheckIssues').replace('#tmptablename#', 'tmpServiceCheckIssues').replace('#projid#', projid);
        sql += " union select imgbefore2 as fn from #tmptablename# where imgbefore2 != '' and imgbefore2 != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.imgbefore2) ".replace('#tmptablename#', 'tmpServiceCheckIssues').replace('#tmptablename#', 'tmpServiceCheckIssues').replace('#projid#', projid);
        sql += " union select imgbefore3 as fn from #tmptablename# where imgbefore3 != '' and imgbefore3 != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.imgbefore3) ".replace('#tmptablename#', 'tmpServiceCheckIssues').replace('#tmptablename#', 'tmpServiceCheckIssues').replace('#projid#', projid);
        sql += " union select ImgAfter1 as fn from #tmptablename# where ImgAfter1 != '' and ImgAfter1 != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.ImgAfter1) ".replace('#tmptablename#', 'tmpServiceCheckIssues').replace('#tmptablename#', 'tmpServiceCheckIssues').replace('#projid#', projid);
        sql += " union select ImgAfter2 as fn from #tmptablename# where ImgAfter2 != '' and ImgAfter2 != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.ImgAfter2) ".replace('#tmptablename#', 'tmpServiceCheckIssues').replace('#tmptablename#', 'tmpServiceCheckIssues').replace('#projid#', projid);
        sql += " union select ImgAfter3 as fn from #tmptablename# where ImgAfter3 != '' and ImgAfter3 != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.ImgAfter3) ".replace('#tmptablename#', 'tmpServiceCheckIssues').replace('#tmptablename#', 'tmpServiceCheckIssues').replace('#projid#', projid);
        sql += " union select APImg as fn from #tmptablename# where APImg != '' and APImg != 'NUll' and (IssueStatus = '待派单' or IssueStatus = '待整改' or IssueStatus = '已整改') and not exists (select projid from imagetable where imagetable.projid = '#projid#' and imagetable.fn = #tmptablename#.APImg) group by APImg ".replace('#tmptablename#', 'tmpServiceCheckIssues').replace('#tmptablename#', 'tmpServiceCheckIssues').replace('#projid#', projid);

        console.log(sql);
        return this.db.executeSql(sql, []);
      }).then((v4: any) => {
        console.log("v4:" + v4);
        let tmppromise = Promise.resolve([]);
        for (var j = 0; j < v4.rows.length; j++) {
          console.log(JSON.stringify(v4.rows.item(j)));
          let fn = v4.rows.item(j).fn;
          tmppromise = tmppromise.then(() => {
            return this.downloadimg(fn);
          }).then(val => {
            return this.db.executeSql("insert into imagetable (projid,fn,src) values ('" + projid + "','" + fn + "','" + val + "')", []);
          })
        }
        return tmppromise;
      }).then(v5 => {
        console.log(data[1][0]);
        let sql = "update projversion set lastdate = '#lastdate#',needupd = 0 where projid = '#projid#'";
        sql = sql.replace('#projid#', projid);
        sql = sql.replace('#lastdate#', data[1][0]);
        console.log('updbdata:' + sql);
        return this.db.executeSql(sql, []);
      }).then(v5 => {
        console.log("v5");
        let tmppromise = Promise.resolve([]);
        console.log("v5"); console.log(tablename.length);
        for (var x = 0; x < tablename.length; x++) {
          console.log(tablename[x]);
          let tn = tablename[x];
          tmppromise = tmppromise.then(() => {
            return this.resetprojdata("tmp" + tn, projid);
          }).then(v => {
            return [1];
          })
        }
        return tmppromise;
      }).catch(err => {
        console.log(err);
      }))
    })
  }

  downloadbuilderdata(token, projid): Promise<any> {
    return new Promise((resolve) => {
      this.existstable("ProjTeam").then(counts => {
        if (counts == 0) {
          let promise = new Promise((resolve) => {
            resolve(100);
          });
          resolve(promise.then((v1) => {
            return this.initBaseTable("ProjTeam", "VendId,Name,Phone,ID,UserId,ProjId");
          }).then((v2) => {
            return this.initBaseTable("PreCheckIssues", "VersionId integer,BatchId,IssueId,RoomId,PositionName,CheckItemName,PlusDesc,IssueDesc,UrgencyId,ImgBefore1,ImgBefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,Id primary key,IssueStatus,VendId,ResponVendId,ProjId,Manager,ResponsibleId,IssueType,RegisterDate datetime,AppointDate datetime,LimitDate datetime,ReFormDate datetime,ReturnDate datetime,ReturnReason,ReturnNum integer default 0 ,BuildingId,EngineerId,ReviewDate datetime,x integer,y integer,ResponsibleName,ResponsiblePhone,EngineerName,EngineerPhone,APImg,FloorName,BuildingName,RoomName,ManagerName,ManagerPhone,BatchName,ReassignDate datetime,ReassignDesc,ReasonbyOver,fixedDesc,ImgWidth integer");
          }).then((v3) => {
            return this.initBaseTable("PreCheckLogs", "BatchId,IssueId,IssueStatus,LogDate datetime,UserId,UserName,Origin default 'APP',DueDate datetime,ReasonbyOver,IsReturn, ReturnReason,ProjId,VersionId,ID");
          }).then((v4) => {
            return this.initBaseTable("tmpPreCheckIssues", "VersionId integer,BatchId,IssueId,RoomId,PositionName,CheckItemName,PlusDesc,IssueDesc,UrgencyId,ImgBefore1,ImgBefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,Id primary key,IssueStatus,VendId,ResponVendId,ProjId,Manager,ResponsibleId,IssueType,RegisterDate datetime,AppointDate datetime,LimitDate datetime,ReFormDate datetime,ReturnDate datetime,ReturnReason,ReturnNum integer default 0 ,BuildingId,EngineerId,ReviewDate datetime,x integer,y integer,ResponsibleName,ResponsiblePhone,EngineerName,EngineerPhone,APImg,FloorName,BuildingName,RoomName,ManagerName,ManagerPhone,BatchName,ReassignDate datetime,ReassignDesc,ReasonbyOver,fixedDesc,ImgWidth integer");
          }).then((v5) => {
            return this.initBaseTable("tmpPreCheckLogs", "BatchId,IssueId,IssueStatus,LogDate datetime,UserId,UserName,Origin default 'APP',DueDate datetime,ReasonbyOver,IsReturn, ReturnReason,ProjId,VersionId,ID");
          }).then((v6) => {
            return this.initBaseTable("uplPreCheckIssues", "BatchId,IssueId,RoomId,PositionId,CheckItemId,PlusDesc,IssueDesc,UrgencyId,ImgBefore1,ImgBefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,Id primary key,IssueStatus,VendId,ResponVendId,ProjId,Manager,ResponsibleId,IssueType,RegisterDate datetime,AppointDate datetime,LimitDate datetime,ReFormDate datetime,CloseDate datetime,CloseReason,CancelDate datetime,CancelReason,VersionId integer,ImgClose1,ImgClose2,ImgClose3,ReturnDate datetime,ReturnReason,ReturnNum integer,BuildingId,EngineerId,ReviewDate datetime,x integer,y integer,ResponsibleName,ResponsiblePhone,EngineerName,EngineerPhone,ManagerName,ManagerPhone,ReassignDate datetime,ReassignDesc,ReasonbyOver,fixedDesc");
          }).then((v2) => {
            return this.initBaseTable("OpenCheckIssues", "VersionId integer,BatchId,IssueId,RoomId,PositionName,CheckItemName,PlusDesc,IssueDesc,UrgencyId,ImgBefore1,ImgBefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,Id primary key,IssueStatus,VendId,ResponVendId,ProjId,Manager,ResponsibleId,IssueType,RegisterDate datetime,AppointDate datetime,LimitDate datetime,ReFormDate datetime,ReturnDate datetime,ReturnReason,ReturnNum integer default 0 ,BuildingId,EngineerId,ReviewDate datetime,x integer,y integer,ResponsibleName,ResponsiblePhone,EngineerName,EngineerPhone,APImg,FloorName,BuildingName,RoomName,ManagerName,ManagerPhone,BatchName,ReassignDate datetime,ReassignDesc,ReasonbyOver,fixedDesc,ImgWidth integer");
          }).then((v3) => {
            return this.initBaseTable("OpenCheckLogs", "BatchId,IssueId,IssueStatus,LogDate datetime,UserId,UserName,Origin default 'APP',DueDate datetime,ReasonbyOver,IsReturn, ReturnReason,ProjId,VersionId,ID");
          }).then((v4) => {
            return this.initBaseTable("tmpOpenCheckIssues", "VersionId integer,BatchId,IssueId,RoomId,PositionName,CheckItemName,PlusDesc,IssueDesc,UrgencyId,ImgBefore1,ImgBefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,Id primary key,IssueStatus,VendId,ResponVendId,ProjId,Manager,ResponsibleId,IssueType,RegisterDate datetime,AppointDate datetime,LimitDate datetime,ReFormDate datetime,ReturnDate datetime,ReturnReason,ReturnNum integer default 0 ,BuildingId,EngineerId,ReviewDate datetime,x integer,y integer,ResponsibleName,ResponsiblePhone,EngineerName,EngineerPhone,APImg,FloorName,BuildingName,RoomName,ManagerName,ManagerPhone,BatchName,ReassignDate datetime,ReassignDesc,ReasonbyOver,fixedDesc,ImgWidth integer");
          }).then((v5) => {
            return this.initBaseTable("tmpOpenCheckLogs", "BatchId,IssueId,IssueStatus,LogDate datetime,UserId,UserName,Origin default 'APP',DueDate datetime,ReasonbyOver,IsReturn, ReturnReason,ProjId,VersionId,ID");
          }).then((v6) => {
            return this.initBaseTable("uplOpenCheckIssues", "BatchId,IssueId,RoomId,PositionId,CheckItemId,PlusDesc,IssueDesc,UrgencyId,ImgBefore1,ImgBefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,Id primary key,IssueStatus,VendId,ResponVendId,ProjId,Manager,ResponsibleId,IssueType,RegisterDate datetime,AppointDate datetime,LimitDate datetime,ReFormDate datetime,CloseDate datetime,CloseReason,CancelDate datetime,CancelReason,VersionId integer,ImgClose1,ImgClose2,ImgClose3,ReturnDate datetime,ReturnReason,ReturnNum integer,BuildingId,EngineerId,ReviewDate datetime,x integer,y integer,ResponsibleName,ResponsiblePhone,EngineerName,EngineerPhone,ManagerName,ManagerPhone,ReassignDate datetime,ReassignDesc,ReasonbyOver,fixedDesc");
          }).then((v2) => {
            return this.initBaseTable("FormalCheckIssues", "VersionId integer,BatchId,IssueId,RoomId,PositionName,CheckItemName,PlusDesc,IssueDesc,UrgencyId,ImgBefore1,ImgBefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,Id primary key,IssueStatus,VendId,ResponVendId,ProjId,Manager,ResponsibleId,IssueType,RegisterDate datetime,AppointDate datetime,LimitDate datetime,ReFormDate datetime,ReturnDate datetime,ReturnReason,ReturnNum integer default 0 ,BuildingId,EngineerId,ReviewDate datetime,x integer,y integer,ResponsibleName,ResponsiblePhone,EngineerName,EngineerPhone,APImg,FloorName,BuildingName,RoomName,ManagerName,ManagerPhone,BatchName,ReassignDate datetime,ReassignDesc,ReasonbyOver,fixedDesc,ImgWidth integer");
          }).then((v3) => {
            return this.initBaseTable("FormalCheckLogs", "BatchId,IssueId,IssueStatus,LogDate datetime,UserId,UserName,Origin default 'APP',DueDate datetime,ReasonbyOver,IsReturn, ReturnReason,ProjId,VersionId,ID");
          }).then((v4) => {
            return this.initBaseTable("tmpFormalCheckIssues", "VersionId integer,BatchId,IssueId,RoomId,PositionName,CheckItemName,PlusDesc,IssueDesc,UrgencyId,ImgBefore1,ImgBefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,Id primary key,IssueStatus,VendId,ResponVendId,ProjId,Manager,ResponsibleId,IssueType,RegisterDate datetime,AppointDate datetime,LimitDate datetime,ReFormDate datetime,ReturnDate datetime,ReturnReason,ReturnNum integer default 0 ,BuildingId,EngineerId,ReviewDate datetime,x integer,y integer,ResponsibleName,ResponsiblePhone,EngineerName,EngineerPhone,APImg,FloorName,BuildingName,RoomName,ManagerName,ManagerPhone,BatchName,ReassignDate datetime,ReassignDesc,ReasonbyOver,fixedDesc,ImgWidth integer");
          }).then((v5) => {
            return this.initBaseTable("tmpFormalCheckLogs", "BatchId,IssueId,IssueStatus,LogDate datetime,UserId,UserName,Origin default 'APP',DueDate datetime,ReasonbyOver,IsReturn, ReturnReason,ProjId,VersionId,ID");
          }).then((v6) => {
            return this.initBaseTable("uplFormalCheckIssues", "BatchId,IssueId,RoomId,PositionId,CheckItemId,PlusDesc,IssueDesc,UrgencyId,ImgBefore1,ImgBefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,Id primary key,IssueStatus,VendId,ResponVendId,ProjId,Manager,ResponsibleId,IssueType,RegisterDate datetime,AppointDate datetime,LimitDate datetime,ReFormDate datetime,CloseDate datetime,CloseReason,CancelDate datetime,CancelReason,VersionId integer,ImgClose1,ImgClose2,ImgClose3,ReturnDate datetime,ReturnReason,ReturnNum integer,BuildingId,EngineerId,ReviewDate datetime,x integer,y integer,ResponsibleName,ResponsiblePhone,EngineerName,EngineerPhone,ManagerName,ManagerPhone,ReassignDate datetime,ReassignDesc,ReasonbyOver,fixedDesc");
          }).then((v2) => {
            return this.initBaseTable("ServiceCheckIssues", "VersionId integer,BatchId,IssueId,RoomId,PositionName,CheckItemName,PlusDesc,IssueDesc,UrgencyId,ImgBefore1,ImgBefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,Id primary key,IssueStatus,VendId,ResponVendId,ProjId,Manager,ResponsibleId,IssueType,RegisterDate datetime,AppointDate datetime,LimitDate datetime,ReFormDate datetime,ReturnDate datetime,ReturnReason,ReturnNum integer default 0 ,BuildingId,EngineerId,ReviewDate datetime,x integer,y integer,ResponsibleName,ResponsiblePhone,EngineerName,EngineerPhone,APImg,FloorName,BuildingName,RoomName,ManagerName,ManagerPhone,BatchName,ReassignDate datetime,ReassignDesc,ReasonbyOver,fixedDesc,ImgWidth integer");
          }).then((v3) => {
            return this.initBaseTable("ServiceCheckLogs", "BatchId,IssueId,IssueStatus,LogDate datetime,UserId,UserName,Origin default 'APP',DueDate datetime,ReasonbyOver,IsReturn, ReturnReason,ProjId,VersionId,ID");
          }).then((v4) => {
            return this.initBaseTable("tmpServiceCheckIssues", "VersionId integer,BatchId,IssueId,RoomId,PositionName,CheckItemName,PlusDesc,IssueDesc,UrgencyId,ImgBefore1,ImgBefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,Id primary key,IssueStatus,VendId,ResponVendId,ProjId,Manager,ResponsibleId,IssueType,RegisterDate datetime,AppointDate datetime,LimitDate datetime,ReFormDate datetime,ReturnDate datetime,ReturnReason,ReturnNum integer default 0 ,BuildingId,EngineerId,ReviewDate datetime,x integer,y integer,ResponsibleName,ResponsiblePhone,EngineerName,EngineerPhone,APImg,FloorName,BuildingName,RoomName,ManagerName,ManagerPhone,BatchName,ReassignDate datetime,ReassignDesc,ReasonbyOver,fixedDesc,ImgWidth integer");
          }).then((v5) => {
            return this.initBaseTable("tmpServiceCheckLogs", "BatchId,IssueId,IssueStatus,LogDate datetime,UserId,UserName,Origin default 'APP',DueDate datetime,ReasonbyOver,IsReturn, ReturnReason,ProjId,VersionId,ID");
          }).then((v6) => {
            return this.initBaseTable("uplServiceCheckIssues", "BatchId,IssueId,RoomId,PositionId,CheckItemId,PlusDesc,IssueDesc,UrgencyId,ImgBefore1,ImgBefore2,ImgBefore3,ImgAfter1,ImgAfter2,ImgAfter3,Id primary key,IssueStatus,VendId,ResponVendId,ProjId,Manager,ResponsibleId,IssueType,RegisterDate datetime,AppointDate datetime,LimitDate datetime,ReFormDate datetime,CloseDate datetime,CloseReason,CancelDate datetime,CancelReason,VersionId integer,ImgClose1,ImgClose2,ImgClose3,ReturnDate datetime,ReturnReason,ReturnNum integer,BuildingId,EngineerId,ReviewDate datetime,x integer,y integer,ResponsibleName,ResponsiblePhone,EngineerName,EngineerPhone,ManagerName,ManagerPhone,ReassignDate datetime,ReassignDesc,ReasonbyOver,fixedDesc");
          }).then((v7) => {
            return this.initBaseTable("tmpProjTeam", "VendId,Name,Phone,ID,UserId,ProjId");
          }).then((v7) => {
            return this.initBaseTable("uplimagetable", "Projid,fn");
          }).then((v7) => {
            return this.initBaseTable("imagetable", "projid,fn,src,status integer default 0");
          }).then((v2) => {
            return this.initBaseTable("tmpIssues", "LimitDate datetime,ReturnNum integer default 0 ,ResponsibleName,FloorName,BuildingName");
          }).then((v8) => {
            console.log("downloadbuilderdata");
            return this.httpService.get(APP_SERVE_URL + "/VendPack", { Token: token, projId: projid, appDateStr: null });
          }).then((v9) => {
            return this.initbuilderData(v9[0], projid);
          }).then(vv => {
            console.log("vv");
            return this.localStorage.getItem('curproj').then(v => {
              console.log(v);
              return this.localStorage.setItem('curproj', { projid: v.projid, projname: v.projname, versionid: v.versionid, needupd: 0 })
            })
          }).then(vv => {
            console.log("vv");
            return this.localStorage.getItem('curproj').then(v => {
              console.log(v);
              //return this.localStorage.setItem('curproj', { projid: v.projid, projname: v.projname, versionid: v.versionid, needupd: 0 })
            })
          }).catch(err => {
            console.log(err);
            this.nativeservice.hideLoading();
            throw '下载失败';
          }))
        }
        else {
          let promise = new Promise((resolve) => {
            resolve(100);
          });
          resolve(promise.then((v1) => {
            return this.resetprojdata("tmpPreCheckIssues", projid);
          }).then((v2) => {
            return this.resetprojdata("tmpPreCheckLogs", projid);
          }).then((v1) => {
            return this.resetprojdata("tmpOpenCheckIssues", projid);
          }).then((v2) => {
            return this.resetprojdata("tmpOpenCheckLogs", projid);
          }).then((v1) => {
            return this.resetprojdata("tmpFormalCheckIssues", projid);
          }).then((v2) => {
            return this.resetprojdata("tmpFormalCheckLogs", projid);
          }).then((v1) => {
            return this.resetprojdata("tmpServiceCheckIssues", projid);
          }).then((v2) => {
            return this.resetprojdata("tmpServiceCheckLogs", projid);
          }).then((v3) => {
            return this.resetprojdata("tmpProjTeam", projid);
          }).then((v4) => {
            return this.db.executeSql("select LastDate from projversion where projid = '" + projid + "'", []);
          }).then((v5: any) => {
            let lastdate: string; lastdate = "";
            lastdate = v5.rows.item(0).LastDate; console.log(lastdate);
            return this.httpService.get(APP_SERVE_URL + "/VendPack", { Token: token, projId: projid, appDateStr: lastdate });
          }).then((v6) => {
            return this.initbuilderData(v6[0], projid);
          }).catch(err => {
            console.log(err);
            this.nativeservice.hideLoading();
            throw '下载失败';
          }))
        }
      })
    })
  }

  uploadbuilderdata(projid, tablenames: Array<string>): Promise<any> {
    return new Promise((resolve) => {
      console.log('uploaddata');
      let jsonarr: Array<any>; jsonarr = [];
      let tmppromise = Promise.resolve([]);
      console.log(tablenames);
      for (var i = 0; i < tablenames.length; i++) {
        let tablename = tablenames[i];
        console.log(tablename);
        tmppromise = tmppromise.then(() => {
          let sql: string;
          console.log(tablename + ";" + i);
          if (tablename == "FormalCheckIssues" || tablename == "PreCheckIssues" || tablename == "OpenCheckIssues" || tablename == "ServiceCheckIssues") {
            sql = "select * from upl#tablename# where projid = '#projid#'";
            sql = sql.replace('#tablename#', tablename);
            sql = sql.replace('#projid#', projid);
          } else {
            sql = "select * from #tablename# where projid = '#projid#' and versionid = 0 ";
            sql = sql.replace('#tablename#', tablename);
            sql = sql.replace('#projid#', projid);
          }
          console.log(sql);
          return this.db.executeSql(sql, []);
        }).then((v: any) => {
          let data: Array<any>; data = [];
          for (let j = 0; j < v.rows.length; j++) {
            console.log(JSON.stringify(v.rows.item(j)));
            data.push(v.rows.item(j));
          }
          if (v.rows.length > 0) {
            console.log(data);
            jsonarr.push({ TableName: tablename, data: data });
          }
          console.log("jsonarr:" + jsonarr.length);
          return jsonarr;
        })
      }
      resolve(tmppromise);
    })
  }

  uploadbuilderinfo(token, projid): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      console.log("uploadbuildinginfo");
      resolve(promise.then((v) => {
        let sql = "select upl.fn,it.src from uplimagetable upl inner join imagetable it on it.fn = upl.fn and it.projid = upl.projid  where upl.projid = '#projid#'";
        sql = sql.replace('#projid#', projid);
        console.log(sql);
        return this.db.executeSql(sql, []);
      }).then((val: any) => {
        let tmppromise = Promise.resolve(10);
        for (var i = 0; i < val.rows.length; i++) {
          console.log(JSON.stringify(val.rows.item(i)))
          let filename = val.rows.item(i).fn;
          let src = val.rows.item(i).src;
          tmppromise = tmppromise.then(() => {
            return this.uploadimg(src, filename);
          }).then((v) => {
            return 1;
          })
        }
        return tmppromise;
      }).then((v1) => {
        return this.uploadbuilderdata(projid, ["PreCheckIssues", "PreCheckLogs", "OpenCheckIssues", "OpenCheckLogs", "FormalCheckIssues", "FormalCheckLogs", "ServiceCheckIssues", "ServiceCheckLogs"]);
      }).then((v2) => {
        console.log("v2:" + v2);
        console.log("v2:" + JSON.stringify(v2));
        return this.httpService.post(APP_SERVE_URL + "/DynamicsPack", { Token: token, ProjId: projid, BatchId: null, BuildingId: null, JsonStr: JSON.stringify(v2) });
      }).then((v3) => {
        console.log("v3");
        return this.resetuploadbuilderdata(projid, ["PreCheckIssues", "PreCheckLogs", "OpenCheckIssues", "OpenCheckLogs", "FormalCheckIssues", "FormalCheckLogs", "ServiceCheckIssues", "ServiceCheckLogs"]);
      }).then((v4) => {
        console.log('v4');
        let sqls = [];
        let sql = "delete from uplimagetable where projid = '#projid#'";
        sql = sql.replace('#projid#', projid);
        sqls.push(sql);
        sql = "delete from Precheckissues where projid = '#projid#' and VendId = ''";
        sql = sql.replace('#projid#', projid);
        sqls.push(sql);
        sql = "delete from opencheckissues where projid = '#projid#' and VendId = ''";
        sql = sql.replace('#projid#', projid);
        sqls.push(sql);
        sql = "delete from formalcheckissues where projid = '#projid#' and VendId = ''";
        sql = sql.replace('#projid#', projid);
        sqls.push(sql);
        sql = "delete from Servicecheckissues where projid = '#projid#' and VendId = ''";
        sql = sql.replace('#projid#', projid);
        sqls.push(sql);
        console.log(sqls);
        return this.db.sqlBatch(sqls);
      }).then((v) => {
        console.log('v')
        return this.localStorage.setItem('needupload' + projid, false);
      }).then((v5) => {
        console.log('v5')
        return this.downloadbuilderdata(token, projid);
      }).catch(err => {
        this.nativeservice.hideLoading();
        console.log("楼栋上传失败:" + err);
        throw '';
      }))
    })
  }

  resetuploadbuilderdata(projid, tablenames: Array<string>): Promise<any> {
    return new Promise((resolve) => {
      var jsonarr: Array<any>; jsonarr = [];
      let tmppromise = Promise.resolve([]);
      for (var i = 0; i < tablenames.length; i++) {
        let tablename = tablenames[i];
        console.log('reset up' + tablename);
        tmppromise = tmppromise.then(() => {
          let sql = "delete from #tablename# where projid = '#projid#' and versionid = 0";
          sql = sql.replace('#tablename#', tablename)
          sql = sql.replace('#projid#', projid);
          return this.db.executeSql(sql, []);
        }).then((v) => {
          if (tablename == "FormalCheckIssues" || tablename == "PreCheckIssues" || tablename == "OpenCheckIssues" || tablename == "ServiceCheckIssues") {
            let sql = "delete from upl#tablename# where projid = '#projid#'";
            sql = sql.replace('#tablename#', tablename)
            sql = sql.replace('#projid#', projid);
            return this.db.executeSql(sql, []);
          } else {
            return 1;
          }
        })
      }
      resolve(tmppromise);
    })
  }

  getissuesumsql(projid, type, assign, build, floor, duedate, returntimes, groupbystr): Array<string> {
    let sql = "";
    let filterstr = "";
    let sqls = [];
    if ((assign == "全部" || assign == "负责人") && (build == "全部" || build == "楼栋") && (floor == "全部" || floor == "楼层") && (duedate == "全部" || duedate == "整改时限") && (returntimes == "全部" || returntimes == "退回次数")) {
      filterstr = "";
    } else {
      if (assign != "全部" && assign != "负责人" && groupbystr != "ResponsibleName") {
        filterstr += " and ResponsibleName = '" + assign + "' ";
      }
      if (build != "全部" && build != "楼栋" && groupbystr != "BuildingName") {
        filterstr += " and BuildingName = '" + build + "' ";
      }
      if (floor != "全部" && floor != "楼层" && groupbystr != "FloorName") {
        filterstr += " and FloorName = '" + floor + "' ";
      }
      if (duedate != "全部" && duedate != "整改时限" && groupbystr != "LimitDate") {
        filterstr += " and LimitDate = '" + duedate + "' ";
      }
      if (returntimes != "全部" && returntimes != "退回次数" && groupbystr != "ReturnNum") {
        filterstr += " and ReturnNum = " + returntimes + " ";
      }
    }

    sql = "insert into tmpissues (#groupbystr#) select #groupbystr# from #tablename# where projid = '#projid#' #filterstr# ";
    sql = sql.replace("#groupbystr#", groupbystr).replace("#groupbystr#", groupbystr).replace('#projid#', projid).replace('#filterstr#', filterstr);
    if (type == 1) {
      sqls.push(sql.replace("#tablename#", "PreCheckIssues"));
      sqls.push(sql.replace("#tablename#", "OpenCheckIssues"));
      sqls.push(sql.replace("#tablename#", "FormalCheckIssues"));
    } else {
      sqls.push(sql.replace("#tablename#", "ServiceCheckIssues"));      
    }
    console.log(sqls);
    
    return sqls;
  }

  getissuesuminfo(projid, type, assign, build, floor, duedate, returntimes, groupbystr): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(10);
      });
      let ret = [];
      resolve(promise.then((v) => {
        return this.resetdata("tmpissues");
      }).then((v1: any) => {
        let sqls = [];
        sqls = this.getissuesumsql(projid, type, assign, build, floor, duedate, returntimes, groupbystr);
        return this.db.sqlBatch(sqls);
      }).then((v2: any) => {
        let sql = "select #groupbystr# as fieldstr, count(*) as counts from tmpissues group by #groupbystr# ";//
        sql = sql.replace("#groupbystr#", groupbystr).replace("#groupbystr#", groupbystr);
        console.log(sql);
        return this.db.executeSql(sql, []);
      }).then((v3: any) => {
        let tmppromise = Promise.resolve(0);
        let sum:number = 0;
        let data:any; data = []; data = v3;        
        for (let i = 0; i < data.rows.length; i++) {         
          console.log('suminfo:' + JSON.stringify(data.rows.item(i)));
          let item:any; item = [];
          item = data.rows.item(i);
          console.log("item:"+item);
          tmppromise = tmppromise.then(() => {
            console.log(item.fieldstr);
            ret.push({fieldstr:item.fieldstr,counts:item.counts});
            return item.counts;
          }).then((v:number) => {
            sum += v;
            return sum;
          })
        }
        return tmppromise;
      }).then((v4: number) => {
        ret.push({fieldstr:"全部",counts:v4});
        return ret;
      }).catch(err => {
        this.warn('问题加载失败:' + err);
        throw '问题加载失败';
      }))
    })
  }

  getissuelistsql(projid, type, assign, build, floor, duedate, returntimes, sorting): string {
    let sql = "";
    let filterstr = "";
    if ((assign == "全部" || assign == "负责人") && (build == "全部" || build == "楼栋") && (floor == "全部" || floor == "楼层") && (duedate == "全部" || duedate == "整改时限") && (returntimes == "全部" || returntimes == "退回次数")) {
      filterstr = "";
    } else {
      if (assign != "全部" && assign != "负责人") {
        filterstr += " and ResponsibleName = '" + assign + "' ";
      }
      if (build != "全部" && build != "楼栋") {
        filterstr += " and BuildingName = '" + build + "' ";
      }
      if (floor != "全部" && floor != "楼层") {
        filterstr += " and FloorName = '" + floor + "' ";
      }
      if (duedate != "全部" && duedate != "整改时限") {
        filterstr += " and LimitDate = '" + duedate + "' ";
      }
      if (returntimes != "全部" && returntimes != "退回次数") {
        filterstr += " and ReturnNum = " + returntimes + " ";
      }
    }
    if (type == 1) {
      sql = "select Id,1 as type,IssueId,batchname,BuildingName,FloorName,RoomName,IssueStatus,PositionName,CheckItemName,IssueDesc,ResponsibleName,ReturnNum,LimitDate,ReFormDate,ReturnDate,UrgencyId from PreCheckIssues where projid = '#projid#' #filterstr# ";
      sql += " union select Id,2 as type,IssueId,batchname,BuildingName,FloorName,RoomName,IssueStatus,PositionName,CheckItemName,IssueDesc,ResponsibleName,ReturnNum,LimitDate,ReFormDate,ReturnDate,UrgencyId from OpenCheckIssues where projid = '#projid#' #filterstr# ";
      sql += " union select Id,3 as type,IssueId,batchname,BuildingName,FloorName,RoomName,IssueStatus,PositionName,CheckItemName,IssueDesc,ResponsibleName,ReturnNum,LimitDate,ReFormDate,ReturnDate,UrgencyId from FormalCheckIssues where projid = '#projid#' #filterstr# order by #orderstr# issueid desc";
      sql = sql.replace('#projid#', projid).replace('#projid#', projid).replace('#projid#', projid).replace('#filterstr#', filterstr).replace('#filterstr#', filterstr).replace('#filterstr#', filterstr);

    } else {
      sql = "select Id,4 as type,IssueId,batchname,BuildingName,FloorName,RoomName,IssueStatus,PositionName,CheckItemName,IssueDesc,ResponsibleName,ReturnNum,LimitDate,ReFormDate,ReturnDate,UrgencyId from ServiceCheckIssues where projid = '#projid#' #filterstr# order by #orderstr# issueid desc";
      sql = sql.replace('#projid#', projid).replace('#filterstr#', filterstr);
    }

    if (sorting == 'default') {
      sql = sql.replace('#orderstr#', '');
    } else {
      sql = sql.replace('#orderstr#', sorting + ',');
    }
    console.log(sql);
    return sql;
  }

  getbuilderissuelist(projid, type, assign, build, floor, duedate, returntimes, sorting): Promise<Array<any>> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      let needupd: boolean; needupd = false;
      console.log("builderissuelist");
      resolve(promise.then(v => {
        let sql = "select needupd from projversion where projid = '#projid#'".replace('#projid#', projid);
        return this.db.executeSql(sql, []);
      }).then((v1: any) => {
        if (v1 && v1.rows.length > 0) {
          needupd = v1.rows.item(0).Needupd;
        }
        let sql = "";
        sql = this.getissuelistsql(projid, type, assign, build, floor, duedate, returntimes, sorting);
        // if (type == 1) {
        //   sql = "select Id,1 as type,IssueId,batchname,BuildingName,FloorName,RoomName,IssueStatus,PositionName,CheckItemName,IssueDesc,ResponsibleName,ReturnNum,LimitDate,ReFormDate,ReturnDate from PreCheckIssues where projid = '#projid#'";
        //   sql += " union select Id,2 as type,IssueId,batchname,BuildingName,FloorName,RoomName,IssueStatus,PositionName,CheckItemName,IssueDesc,ResponsibleName,ReturnNum,LimitDate,ReFormDate,ReturnDate from OpenCheckIssues where projid = '#projid#'";
        //   sql += " union select Id,3 as type,IssueId,batchname,BuildingName,FloorName,RoomName,IssueStatus,PositionName,CheckItemName,IssueDesc,ResponsibleName,ReturnNum,LimitDate,ReFormDate,ReturnDate from FormalCheckIssues where projid = '#projid#' order by issueid desc";
        //   sql = sql.replace('#projid#', projid).replace('#projid#', projid).replace('#projid#', projid);

        // } else {
        //   sql = " select Id,4 as type,IssueId,batchname,BuildingName,FloorName,RoomName,IssueStatus,PositionName,CheckItemName,IssueDesc,ResponsibleName,ReturnNum,LimitDate,ReFormDate,ReturnDate from ServiceCheckIssues where projid = '#projid#' order by issueid desc";
        //   sql = sql.replace('#projid#', projid);

        // }
        // console.log(sql);
        return this.db.executeSql(sql, []);
      }).then((v2: any) => {
        console.log(v2);
        if (v2 && v2.rows && v2.rows.length > 0) {
          let forass: Array<any>; forass = [];
          let forfix: Array<any>; forfix = [];
          let fixed: Array<any>; fixed = [];
          let returned: Array<any>; returned = [];
          let dpd = 0, dzg = 0, yzg = 0, bth = 0;
          let status: string;
          for (var i = 0; i < v2.rows.length; i++) {
            console.log(JSON.stringify(v2.rows.item(i)));
            let now = new Date();
            let dt = new Date(v2.rows.item(i).LimitDate);
            let days = 0;
            if (now > dt) {
              days = Math.round((now.getTime() - dt.getTime()) / 1000 / 3600 / 24);
            }
            status = v2.rows.item(i).IssueStatus;
            console.log(status)
            if (status == "待派单") {
              console.log("1" + status);
              dpd++;
              forass.push({ selected: false, type: v2.rows.item(i).type, id: v2.rows.item(i).Id, batchname: v2.rows.item(i).BatchName, floorname: v2.rows.item(i).FloorName, roomname: v2.rows.item(i).RoomName, buildingname: v2.rows.item(i).BuildingName, status: status, position: v2.rows.item(i).PositionName, checkitem: v2.rows.item(i).CheckItemName, issueid: v2.rows.item(i).IssueId, IssueDesc: v2.rows.item(i).IssueDesc, ResponsibleName: v2.rows.item(i).ResponsibleName, datestr: "整改时限", date: dt.toLocaleString(), overdays: days, returntimes: v2.rows.item(i).ReturnNum });
            } else if (status == "待整改") {
              console.log("2" + status);
              dzg++;
              forfix.push({ selected: false, type: v2.rows.item(i).type, id: v2.rows.item(i).Id, batchname: v2.rows.item(i).BatchName, floorname: v2.rows.item(i).FloorName, roomname: v2.rows.item(i).RoomName, buildingname: v2.rows.item(i).BuildingName, status: status, position: v2.rows.item(i).PositionName, checkitem: v2.rows.item(i).CheckItemName, issueid: v2.rows.item(i).IssueId, IssueDesc: v2.rows.item(i).IssueDesc, ResponsibleName: v2.rows.item(i).ResponsibleName, datestr: "整改时限", date: dt.toLocaleString(), overdays: days, returntimes: v2.rows.item(i).ReturnNum });
            } else if (status == "已整改") {
              console.log("3" + status);
              yzg++;
              dt = new Date(v2.rows.item(i).ReFormDate);
              fixed.push({ selected: false, type: v2.rows.item(i).type, id: v2.rows.item(i).Id, batchname: v2.rows.item(i).BatchName, floorname: v2.rows.item(i).FloorName, roomname: v2.rows.item(i).RoomName, buildingname: v2.rows.item(i).BuildingName, status: status, position: v2.rows.item(i).PositionName, checkitem: v2.rows.item(i).CheckItemName, issueid: v2.rows.item(i).IssueId, IssueDesc: v2.rows.item(i).IssueDesc, ResponsibleName: v2.rows.item(i).ResponsibleName, datestr: "已整改", date: dt.toLocaleString(), overdays: days, returntimes: v2.rows.item(i).ReturnNum });
            }
            if (status != "已整改" && v2.rows.item(i).ReturnDate) {
              console.log("4" + status);
              bth++;
              dt = new Date(v2.rows.item(i).ReturnDate);
              returned.push({ selected: false, type: v2.rows.item(i).type, id: v2.rows.item(i).Id, batchname: v2.rows.item(i).BatchName, floorname: v2.rows.item(i).FloorName, roomname: v2.rows.item(i).RoomName, buildingname: v2.rows.item(i).BuildingName, status: status, position: v2.rows.item(i).PositionName, checkitem: v2.rows.item(i).CheckItemName, issueid: v2.rows.item(i).IssueId, IssueDesc: v2.rows.item(i).IssueDesc, ResponsibleName: v2.rows.item(i).ResponsibleName, datestr: "已退回", date: dt.toLocaleString(), overdays: days, returntimes: v2.rows.item(i).ReturnNum });
            }

            console.log(dpd + ";" + dzg + ";" + yzg + ";" + bth);
          }
          console.log(forass); console.log(dpd + ";" + dzg + ";" + yzg + ";" + bth);
          return [forass, forfix, fixed, returned, dpd, dzg, yzg, bth, needupd];
        } else {
          return [[], [], [], [], 0, 0, 0, 0, needupd];
        }
      }).catch(err => {
        this.warn('问题加载失败:' + err);
        throw '问题加载失败';
      }))
    })
  }

  getbuilderissueinfo(issueid, type): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      let ret = [];
      resolve(promise.then((v1) => {
        let sql = "select iss.fixedDesc,iss.ReFormDate,iss.ImgBefore1,iss.ImgBefore2,iss.ImgBefore3,iss.ImgAfter1,iss.ImgAfter2,iss.ImgAfter3,iss.IssueStatus,iss.AppointDate,iss.LimitDate,iss.RegisterDate from #tablename# iss where iss.Id = '#issueid#'";

        sql = sql.replace('#tablename#', this.getissuetablename(type));

        sql = sql.replace('#issueid#', issueid);
        console.log(sql);
        return this.db.executeSql(sql, []);
      }).then((v2: any) => {
        ret.push(v2);
        let sql = "select LogDate,UserName,ReturnReason, isreturn from #tablename# where IssueId = '#issueid#' ";

        sql = sql.replace('#tablename#', this.getissuetype(type) + 'CheckLogs');

        sql = sql.replace('#issueid#', issueid);
        console.log(sql);
        return this.db.executeSql(sql, []);
      }).then((v3: any) => {
        ret.push(v3);
        console.log(ret);
        return ret;
      }).catch(err => {
        this.warn('问题加载失败:' + err);
        throw '问题加载失败';
      }))
    })
  }

  getissuePositionImg(issueid, type): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      let ret = [];
      resolve(promise.then((v1) => {
        let sql = "select imagetable.src,iss.IssueStatus,iss.ImgWidth,iss.X,iss.Y from #tablename# iss inner join imagetable on imagetable.fn = iss.APImg where Id = '#issueid#'";

        sql = sql.replace('#tablename#', this.getissuetablename(type));

        sql = sql.replace('#issueid#', issueid);
        console.log(sql);
        return this.db.executeSql(sql, []);
      }).catch(err => {
        this.warn('问题坐标加载失败:' + err);
        throw '问题坐标加载失败';
      }))
    })
  }

  //"VendId,Name,Phone,ID,UserId,ProjId"
  getProjTeam(projid): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      console.log("builderissuelist");
      resolve(promise.then((v1) => {
        let sql = "select UserId,Name,Phone from projteam where projid = '" + projid + "'";
        console.log(sql);
        return this.db.executeSql(sql, []);
      }).then((v2: any) => {
        let teammembers = [];
        for (var i = 0; i < v2.rows.length; i++) {
          teammembers.push({ userid: v2.rows.item(i).UserId, name: v2.rows.item(i).Name, phone: v2.rows.item(i).Phone });
        }
        return teammembers;
      }).catch(err => {
        this.warn('项目团队加载失败:' + err);
        throw '项目团队加载失败';
      }))
    })
  }
  //BatchId,IssueId,IssueStatus,LogDate,UserId,UserName,Origin,DueDate,ReasonbyOver,IsReturn,ReturnReason,ProjId,VersionId,ID
  updateResponsible(projid, idranges, staff, username, userid): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      console.log("updateResponsibleName");
      resolve(promise.then((v1) => {
        let sqls = [];
        let now = new Date();
        let curtime: string = now.toLocaleDateString() + " " + now.getHours().toString() + ":" + now.getMinutes() + ":" + now.getSeconds();

        let sql = "update #tablename# set AppointDate = '" + curtime + "',issuestatus = '待整改',ResponsibleId ='#userid#', ResponsibleName = '#name#',ResponsiblePhone = '#phone#' where projid = '#projid#' and id in (#idranges#)";
        let usql = sql.replace('#tablename#', 'PreCheckIssues').replace('#name#', staff.name).replace('#phone#', staff.phone).replace('#projid#', projid).replace('#idranges#', idranges).replace('#userid#', staff.userid);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'OpenCheckIssues').replace('#name#', staff.name).replace('#phone#', staff.phone).replace('#projid#', projid).replace('#idranges#', idranges).replace('#userid#', staff.userid);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'FormalCheckIssues').replace('#name#', staff.name).replace('#phone#', staff.phone).replace('#projid#', projid).replace('#idranges#', idranges).replace('#userid#', staff.userid);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'ServiceCheckIssues').replace('#name#', staff.name).replace('#phone#', staff.phone).replace('#projid#', projid).replace('#idranges#', idranges).replace('#userid#', staff.userid);
        sqls.push(usql);

        sql = "delete from upl#tablename# where projid = '#projid#' and id in (#idranges#)";
        usql = sql.replace('#tablename#', 'PreCheckIssues').replace('#projid#', projid).replace('#idranges#', idranges);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'OpenCheckIssues').replace('#projid#', projid).replace('#idranges#', idranges);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'FormalCheckIssues').replace('#projid#', projid).replace('#idranges#', idranges);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'ServiceCheckIssues').replace('#projid#', projid).replace('#idranges#', idranges);
        sqls.push(usql);

        sql = "insert into #upltablename# (Id,BatchId,RoomId,ProjId,VersionId,BuildingId,IssueStatus,ResponsibleName,ResponsiblePhone,AppointDate) select Id,BatchId,RoomId,ProjId,VersionId,BuildingId,IssueStatus,ResponsibleName,ResponsiblePhone,AppointDate from #tablename# where projid = '#projid#' and id in (#idranges#)";
        usql = sql.replace('#upltablename#', 'uplPreCheckIssues').replace('#tablename#', 'PreCheckIssues').replace('#projid#', projid).replace('#idranges#', idranges);
        sqls.push(usql);
        usql = sql.replace('#upltablename#', 'uplOpenCheckIssues').replace('#tablename#', 'OpenCheckIssues').replace('#projid#', projid).replace('#idranges#', idranges);
        sqls.push(usql);
        usql = sql.replace('#upltablename#', 'uplFormalCheckIssues').replace('#tablename#', 'FormalCheckIssues').replace('#projid#', projid).replace('#idranges#', idranges);
        sqls.push(usql);
        usql = sql.replace('#upltablename#', 'uplServiceCheckIssues').replace('#tablename#', 'ServiceCheckIssues').replace('#projid#', projid).replace('#idranges#', idranges);
        sqls.push(usql);

        sql = "update projversion set needupd = 1 where projid = '#projid#'";
        usql = sql.replace('#projid#', projid);
        sqls.push(usql);
        // sql = "insert into #tablename# (BatchId,IssueId,IssueStatus,LogDate,UserId,UserName,ProjId,VersionId) select BatchId,ID,IssueStatus,AppointDate,'#userid#','#username#',projid,0 from #issuetable# where projid = '#projid#' and id in (#idranges#)";
        // usql = sql.replace('#tablename#', 'FormalCheckLogs').replace('#issuetable#', 'FormalCheckIssues').replace('#projid#', projid).replace('#idranges#', idranges).replace('#userid#', userid).replace('#username#', username);
        // sqls.push(usql);
        console.log(sqls);
        return this.db.sqlBatch(sqls);
      }).then((v2) => {
        return this.localStorage.setItem('needupload' + projid, true);
      }).catch(err => {
        this.warn('指派失败:' + err);
        throw '指派失败';
      }))
    })
  }

  updateFixedCompleteSingle(projid, issueid, images, fixeddesc, overreason, username, userid): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      let imgfn = [];
      console.log("updateFixedComplete");
      resolve(promise.then(v => {
        let sqls = [];
        images.forEach((val: string) => {
          if (val) {
            let tmpstr = 'data:image/jpeg;base64,';
            val = val.replace(tmpstr, '');
            let filename = Md5.hashStr(val).toString() + '.jpeg';//+ ext;//'11.jpg';//			
            let sql = " insert into imagetable (projid,fn,src) values('" + projid + "','" + filename + "','" + val + "'); ";
            sqls.push(sql);
            sql = " insert into uplimagetable (projid,fn) values ('" + projid + "','" + filename + "'); ";
            sqls.push(sql);
            imgfn.push(filename);
          }
        })
        console.log(sqls);
        return this.db.sqlBatch(sqls);
      }).then((v1) => {
        let setimg = '';
        if (imgfn) {
          for (var i = 0; i < imgfn.length; i++) {
            setimg += ",ImgAfter" + (i + 1).toString() + "='" + imgfn[i] + "'";
            console.log(setimg);
          }
        }
        let sqls = [];
        let now = new Date();
        let curtime: string = now.toLocaleDateString() + " " + now.getHours().toString() + ":" + now.getMinutes() + ":" + now.getSeconds();
        let sql = "update #tablename# set fixeddesc = '#fixeddesc#',ReasonbyOver = '#overreason#', ReFormDate = '" + curtime + "',issuestatus = '已整改' #img# where projid = '#projid#' and id = '#issueid#'";
        let usql = sql.replace('#tablename#', 'PreCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid).replace('#img#', setimg).replace('#fixeddesc#', fixeddesc).replace('#ReasonbyOver#', overreason);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'OpenCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid).replace('#img#', setimg).replace('#fixeddesc#', fixeddesc).replace('#ReasonbyOver#', overreason);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'FormalCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid).replace('#img#', setimg).replace('#fixeddesc#', fixeddesc).replace('#ReasonbyOver#', overreason);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'ServiceCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid).replace('#img#', setimg).replace('#fixeddesc#', fixeddesc).replace('#ReasonbyOver#', overreason);
        sqls.push(usql);

        sql = "delete from upl#tablename# where projid = '#projid#' and id = '#issueid#'";
        usql = sql.replace('#tablename#', 'PreCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'OpenCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'FormalCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'ServiceCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid);
        sqls.push(usql);

        sql = "insert into #upltablename# (Id,BatchId,RoomId,ProjId,VersionId,BuildingId,IssueStatus,ResponsibleName,ResponsiblePhone,AppointDate,ReFormDate,ImgAfter1,ImgAfter2,ImgAfter3,fixeddesc,ReasonbyOver) select Id,BatchId,RoomId,ProjId,VersionId,BuildingId,IssueStatus,ResponsibleName,ResponsiblePhone,AppointDate,ReFormDate,ImgAfter1,ImgAfter2,ImgAfter3,fixeddesc,ReasonbyOver from #tablename# where projid = '#projid#' and id = '#issueid#'";
        usql = sql.replace('#upltablename#', 'uplPreCheckIssues').replace('#tablename#', 'PreCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid);
        sqls.push(usql);
        usql = sql.replace('#upltablename#', 'uplOpenCheckIssues').replace('#tablename#', 'OpenCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid);
        sqls.push(usql);
        usql = sql.replace('#upltablename#', 'uplFormalCheckIssues').replace('#tablename#', 'FormalCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid);
        sqls.push(usql);
        usql = sql.replace('#upltablename#', 'uplServiceCheckIssues').replace('#tablename#', 'ServiceCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid);
        sqls.push(usql);

        sql = "update projversion set needupd = 1 where projid = '#projid#'";
        usql = sql.replace('#projid#', projid);
        sqls.push(usql);
        // sql = "insert into #tablename# (BatchId,IssueId,IssueStatus,LogDate,UserId,UserName,ProjId,VersionId) select BatchId,ID,IssueStatus,ReFormDate,'#userid#','#username#',projid,0 from #issuetable# where projid = '#projid#' and id in (#idranges#)";
        // usql = sql.replace('#tablename#', 'FormalCheckLogs').replace('#issuetable#', 'FormalCheckIssues').replace('#projid#', projid).replace('#idranges#', idranges).replace('#userid#', userid).replace('#username#', username);
        // sqls.push(usql);
        console.log(sqls);
        return this.db.sqlBatch(sqls);
      }).then((v2) => {
        return this.localStorage.setItem('needupload' + projid, true);
      }).catch(err => {
        this.warn('提交整改完成失败:' + err);
        throw '提交整改完成失败';
      }))
    })
  }

  updateFixedCompleteMutil(projid, idranges, username, userid): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      console.log("updateFixedComplete");
      resolve(promise.then((v1) => {
        let sqls = [];
        let now = new Date();
        let curtime: string = now.toLocaleDateString() + " " + now.getHours().toString() + ":" + now.getMinutes() + ":" + now.getSeconds();
        let sql = "update #tablename# set ReFormDate = '" + curtime + "',issuestatus = '已整改' where projid = '#projid#' and id in (#idranges#)";
        let usql = sql.replace('#tablename#', 'PreCheckIssues').replace('#projid#', projid).replace('#idranges#', idranges);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'OpenCheckIssues').replace('#projid#', projid).replace('#idranges#', idranges);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'FormalCheckIssues').replace('#projid#', projid).replace('#idranges#', idranges);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'ServiceCheckIssues').replace('#projid#', projid).replace('#idranges#', idranges);
        sqls.push(usql);

        sql = "delete from upl#tablename# where projid = '#projid#' and id in (#idranges#)";
        usql = sql.replace('#tablename#', 'PreCheckIssues').replace('#projid#', projid).replace('#idranges#', idranges);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'OpenCheckIssues').replace('#projid#', projid).replace('#idranges#', idranges);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'FormalCheckIssues').replace('#projid#', projid).replace('#idranges#', idranges);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'ServiceCheckIssues').replace('#projid#', projid).replace('#idranges#', idranges);
        sqls.push(usql);

        sql = "insert into #upltablename# (Id,BatchId,RoomId,ProjId,VersionId,BuildingId,IssueStatus,ResponsibleName,ResponsiblePhone,AppointDate,ReFormDate) select Id,BatchId,RoomId,ProjId,VersionId,BuildingId,IssueStatus,ResponsibleName,ResponsiblePhone,AppointDate,ReFormDate from #tablename# where projid = '#projid#' and id in (#idranges#)";
        usql = sql.replace('#upltablename#', 'uplPreCheckIssues').replace('#tablename#', 'PreCheckIssues').replace('#projid#', projid).replace('#idranges#', idranges);
        sqls.push(usql);
        usql = sql.replace('#upltablename#', 'uplOpenCheckIssues').replace('#tablename#', 'OpenCheckIssues').replace('#projid#', projid).replace('#idranges#', idranges);
        sqls.push(usql);
        usql = sql.replace('#upltablename#', 'uplFormalCheckIssues').replace('#tablename#', 'FormalCheckIssues').replace('#projid#', projid).replace('#idranges#', idranges);
        sqls.push(usql);
        usql = sql.replace('#upltablename#', 'uplServiceCheckIssues').replace('#tablename#', 'ServiceCheckIssues').replace('#projid#', projid).replace('#idranges#', idranges);
        sqls.push(usql);

        sql = "update projversion set needupd = 1 where projid = '#projid#'";
        usql = sql.replace('#projid#', projid);
        sqls.push(usql);
        // sql = "insert into #tablename# (BatchId,IssueId,IssueStatus,LogDate,UserId,UserName,ProjId,VersionId) select BatchId,ID,IssueStatus,ReFormDate,'#userid#','#username#',projid,0 from #issuetable# where projid = '#projid#' and id in (#idranges#)";
        // usql = sql.replace('#tablename#', 'FormalCheckLogs').replace('#issuetable#', 'FormalCheckIssues').replace('#projid#', projid).replace('#idranges#', idranges).replace('#userid#', userid).replace('#username#', username);
        // sqls.push(usql);
        console.log(sqls);
        return this.db.sqlBatch(sqls);
      }).then((v2) => {
        return this.localStorage.setItem('needupload' + projid, true);
      }).catch(err => {
        this.warn('提交整改完成失败:' + err);
        throw '提交整改完成失败';
      }))
    })
  }

  returnassign(projid, issueid, username, userid, result, type): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      console.log("returnassign");
      resolve(promise.then((v1) => {
        let sqls = [];
        let now = new Date();
        let curtime: string = now.toLocaleDateString() + " " + now.getHours().toString() + ":" + now.getMinutes() + ":" + now.getSeconds();
        let sql = "update #tablename# set ReassignDate = '" + curtime + "',ReassignDesc = '#reason#',AppointDate = '',issuestatus = '待派单',ResponsibleId = '',ResponsibleName = '',ResponsiblePhone = '' where projid = '#projid#' and id = '#issueid#'";
        let usql = sql.replace('#tablename#', 'PreCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid).replace('#reason#', result);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'OpenCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid).replace('#reason#', result);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'FormalCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid).replace('#reason#', result);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'ServiceCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid).replace('#reason#', result);
        sqls.push(usql);

        sql = "delete from upl#tablename# where projid = '#projid#' and id = '#issueid#'";
        usql = sql.replace('#tablename#', 'PreCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'OpenCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'FormalCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'ServiceCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid);
        sqls.push(usql);

        sql = "insert into #upltablename# (Id,BatchId,RoomId,ProjId,VersionId,BuildingId,IssueStatus,ResponsibleName,ResponsiblePhone,AppointDate,ReassignDate,ReassignDesc) select Id,BatchId,RoomId,ProjId,VersionId,BuildingId,IssueStatus,ResponsibleName,ResponsiblePhone,AppointDate,ReassignDate,ReassignDesc from #tablename# where projid = '#projid#' and id = '#issueid#'";
        usql = sql.replace('#upltablename#', 'uplPreCheckIssues').replace('#tablename#', 'PreCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid);
        sqls.push(usql);
        usql = sql.replace('#upltablename#', 'uplOpenCheckIssues').replace('#tablename#', 'OpenCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid);
        sqls.push(usql);
        usql = sql.replace('#upltablename#', 'uplFormalCheckIssues').replace('#tablename#', 'FormalCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid);
        sqls.push(usql);
        usql = sql.replace('#upltablename#', 'uplServiceCheckIssues').replace('#tablename#', 'ServiceCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid);
        sqls.push(usql);

        sql = "update projversion set needupd = 1 where projid = '#projid#'";
        usql = sql.replace('#projid#', projid);
        sqls.push(usql);
        // sql = "insert into #tablename# (BatchId,IssueId,IssueStatus,LogDate,UserId,UserName,ProjId,VersionId) select BatchId,ID,IssueStatus,AppointDate,'#userid#','#username#',projid,0 from #issuetable# where projid = '#projid#' and id = '#issueid#'";
        // usql = sql.replace('#tablename#', 'FormalCheckLogs').replace('#issuetable#', 'FormalCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid).replace('#userid#', userid).replace('#username#', username);
        // sqls.push(usql);
        console.log(sqls);
        return this.db.sqlBatch(sqls);
      }).then((v2) => {
        return this.localStorage.setItem('needupload' + projid, true);
      }).catch(err => {
        this.warn('退回指派失败:' + err);
        throw '退回指派失败';
      }))
    })
  }

  returnbuilderassign(projid, issueid, username, userid, result, type): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      console.log("returnvend");   //ManagerName default '',ManagerPhone default '',
      resolve(promise.then((v1) => {
        let sqls = [];
        let now = new Date();
        let curtime: string = now.toLocaleDateString() + " " + now.getHours().toString() + ":" + now.getMinutes() + ":" + now.getSeconds();
        let sql = "update #tablename# set ReassignDate = '" + curtime + "',ReassignDesc = '#reason#',AppointDate = '',issuestatus = '待派单',ResponVendId = '',ResponsibleName = '',ResponsiblePhone = '',VendId = '',Manager = '',ManagerName = '',ManagerPhone = '' where projid = '#projid#' and id = '#issueid#'";
        let usql = sql.replace('#tablename#', 'PreCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid).replace('#reason#', result);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'OpenCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid).replace('#reason#', result);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'FormalCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid).replace('#reason#', result);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'ServiceCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid).replace('#reason#', result);
        sqls.push(usql);

        sql = "delete from upl#tablename# where projid = '#projid#' and id = '#issueid#'";
        usql = sql.replace('#tablename#', 'PreCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'OpenCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'FormalCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid);
        sqls.push(usql);
        usql = sql.replace('#tablename#', 'ServiceCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid);
        sqls.push(usql);

        sql = "insert into #upltablename# (Id,BatchId,RoomId,ProjId,VersionId,BuildingId,IssueStatus,ResponsibleName,ResponsiblePhone,AppointDate,ReassignDate,ReassignDesc,ResponVendId,VendId,Manager,ManagerName,ManagerPhone) select Id,BatchId,RoomId,ProjId,VersionId,BuildingId,IssueStatus,ResponsibleName,ResponsiblePhone,AppointDate,ReassignDate,ReassignDesc,ResponVendId,VendId,Manager,ManagerName,ManagerPhone from #tablename# where projid = '#projid#' and id = '#issueid#'";
        usql = sql.replace('#upltablename#', 'uplPreCheckIssues').replace('#tablename#', 'PreCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid);
        sqls.push(usql);
        usql = sql.replace('#upltablename#', 'uplOpenCheckIssues').replace('#tablename#', 'OpenCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid);
        sqls.push(usql);
        usql = sql.replace('#upltablename#', 'uplFormalCheckIssues').replace('#tablename#', 'FormalCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid);
        sqls.push(usql);
        usql = sql.replace('#upltablename#', 'uplServiceCheckIssues').replace('#tablename#', 'ServiceCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid);
        sqls.push(usql);

        sql = "update projversion set needupd = 1 where projid = '#projid#'";
        usql = sql.replace('#projid#', projid);
        sqls.push(usql);
        // sql = "insert into #tablename# (BatchId,IssueId,IssueStatus,LogDate,UserId,UserName,ProjId,VersionId) select BatchId,ID,IssueStatus,AppointDate,'#userid#','#username#',projid,0 from #issuetable# where projid = '#projid#' and id = '#issueid#'";
        // usql = sql.replace('#tablename#', 'FormalCheckLogs').replace('#issuetable#', 'FormalCheckIssues').replace('#projid#', projid).replace('#issueid#', issueid).replace('#userid#', userid).replace('#username#', username);
        // sqls.push(usql);
        console.log(sqls);
        return this.db.sqlBatch(sqls);
      }).then((v2) => {
        return this.localStorage.setItem('needupload' + projid, true);
      }).catch(err => {
        this.warn('退回指派失败:' + err);
        throw '退回指派失败';
      }))
    })
  }

  exportIssue(token, JsonStr): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      console.log("exportIssue");
      resolve(promise.then((v1) => {
        return this.httpService.get(APP_SERVE_URL + "/IssueExportExcel", { Token: token, jsonStr: JsonStr });
      }).then((v2: any) => {
        console.log(v2);
        return APP_SERVE_URL.replace('/api', '') + v2[0][2][0];
      }).catch(err => {
        this.nativeservice.hideLoading();
        this.warn('问题导出失败:' + err);
        throw '问题导出失败';
      }))
    })
  }

  addProjTeamMembers(projid, phone, values): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      console.log("addProjTeamMembers");
      resolve(promise.then((v1) => {
        let sql = "select Phone from projteam where projid = '" + projid + "' and phone = " + phone.toString();
        console.log(sql);
        return this.db.executeSql(sql, []);
      }).then((v2: any) => {
        if (v2 && v2.rows.length > 0) {
          return 10;
        } else {
          let sql = "insert into ProjTeam(Id,projid,userid,phone,name) values (#values#)";
          sql = sql.replace("#values#", values);
          console.log(sql);
          return this.db.executeSql(sql, []);
        }
      }).catch(err => {
        this.warn('提交团队成员失败:' + err);
        throw '提交团队成员失败';
      }))
    })
  }

  checkuploadflag(projid, vendrole: boolean): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      console.log("checkuploadflag");
      if (vendrole == true) {
        resolve(promise.then((v1) => {
          return this.localStorage.getItem('needupload' + projid);
        }).then((v2: any) => {
          console.log("vend:" + v2);
          if (v2 && v2 == true) {
            return true;
          } else {
            return false;
          }
        }).catch(err => {
          this.warn('上传数据检查失败:' + err);
          //throw '上传数据检查失败';
        }))
      } else {
        resolve(promise.then((v1) => {
          let sql = "select Buildingid from buildingversion where needupload = 1 and projid = '" + projid + "' limit 1";
          console.log(sql);
          return this.db.executeSql(sql, []);
        }).then((v2: any) => {
          if (v2 && v2.rows.length > 0) {
            return true;
          } else {
            return false;
          }
        }).catch(err => {
          this.warn('上传数据检查失败:' + err);
        }))
      }
    })
  }

  uploadall(projid, token, vendrole: boolean): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      if (vendrole == true) {
        resolve(promise.then((v1) => {
          return this.nativeservice.isConnecting();
        }).then((val: boolean) => {
          if (val == false) {
            return "not connecting";
          } else {
            this.nativeservice.showLoading("上传中...");
            return this.uploadbuilderinfo(token, projid);
          }
        }).then((v) => {
          console.log(v);
          this.nativeservice.hideLoading();
          if (v != "not connecting") {
            this.nativeservice.showToast('上传完成.');
            return true;
          } else {
            //return false;
            return this.nativeservice.alert('当前没有网络无法上传。').then(v => {
              throw '当前没有网络无法上传。'
            })
          }
        }).catch(err => {
          this.nativeservice.hideLoading();
          console.log('楼栋上传错误:' + err);
        }))
      } else {
        resolve(promise.then((v1) => {
          return this.nativeservice.isConnecting();
        }).then((val: boolean) => {
          if (val == false) {
            return "not connecting";
          } else {
            this.nativeservice.showLoading("上传中...");
            let sql = "select * from buildingversion where needupload = 1 and projid = '" + projid + "'";
            console.log(sql);
            return this.db.executeSql(sql, []);
          }
        }).then((v1: any) => {
          console.log(v1);
          if (v1 == "not connecting") {
            return this.nativeservice.alert('当前没有网络无法上传。').then(v => {
              throw '当前没有网络无法上传。'
            })
          } else {
            if (v1) {
              let tmppromise = Promise.resolve(false);
              for (var i = 0; i < v1.rows.length; i++) {
                console.log(JSON.stringify(v1.rows.item(i)));
                tmppromise = tmppromise.then(() => {
                  return this.uploadbuildinginfo(token, projid, v1.rows.item(i).Batchid, v1.rows.item(i).Buildingid, v1.rows.item(i).Type);
                }).then((v) => {
                  return true;
                })
              }
              return tmppromise;
            } else {
              return true;
            }
          }
        }).then((v) => {
          this.nativeservice.hideLoading();
          this.nativeservice.showToast('上传完成.');
          return v;
        }).catch(err => {
          this.nativeservice.hideLoading();
          console.log('楼栋上传错误:' + err);
        }))
      }
    })
  }

  updateImgData(projid, batchid, buildingid, images, ext = 'jpeg'): Promise<any> {
    return new Promise((resolve) => {
      let imgfn = [];
      let sqls = [];
      images.forEach((val: string) => {
        if (val) {
          let tmpstr = 'data:image/' + ext + ';base64,';
          val = val.replace(tmpstr, '');
          let filename = Md5.hashStr(val).toString() + '.' + ext;//'11.jpg';//			
          let sql = " insert into imagetable (projid,fn,src) values('" + projid + "','" + filename + "','" + val + "'); ";
          sqls.push(sql);
          sql = " insert into uplimagetable (projid,batchid,buildingid,fn) values ('" + projid + "','" + batchid + "','" + buildingid + "','" + filename + "'); ";
          sqls.push(sql);
          imgfn.push(filename);
        }
      })
      console.log(sqls);
      this.db.sqlBatch(sqls).then(v => {
        resolve(imgfn);
      }).catch(err => {
        this.warn('图片提交失败:' + err);
        throw '图片提交失败';
      })
    })
  }

  getimagedata(projid, filename): Promise<any> {
    return new Promise((resolve) => {
      let sql = "select src from imagetable where projid = '#projid#' and fn = '#filename#'";
      sql = sql.replace('#filename#', filename);
      sql = sql.replace('#projid#', projid);
      console.log("imagetable:" + sql);
      resolve(this.db.executeSql(sql, []));
    })
  }

  downloadimg(filename): Promise<any> {
    return new Promise((resolve) => {
      console.log('downloading' + filename);
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      resolve(promise.then((v1) => {
        return this.httpService.getimg(FILE_SERVE_URL + "/ydyf_DownLoadFileString", { token: FILE_TOKEN, MD5: filename });
      }).catch(err => {
        this.warn('图片下载失败:' + err);
      }))
    })
  }

  uploadimg(src, filename): Promise<any> {
    return new Promise((resolve) => {
      //let filename = Md5.hashStr(src).toString() + ext;//'11.jpg';//
      console.log(filename);
      //ydyf_DownLoadFile
      this.httpService.postimg(FILE_SERVE_URL + "/ydyf_UpLoadFileString", { token: FILE_TOKEN, FileName: src, MD5: filename }).then(v => {
        resolve(1);
      }).catch(err => {
        this.warn('图片上传失败:' + err);
        resolve(0);
      })
    })
  }

  cleardynamicData(projid, vendrole: boolean): Promise<any> {
    return new Promise((resolve) => {
      //let filename = Md5.hashStr(src).toString() + ext;//'11.jpg';//
      console.log("clearData");
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      if (vendrole == true) {
        console.log(vendrole);
        resolve(promise.then((v1) => {
          return this.resetdata("tmpprojversion");
        }).then((v2) => {
          return this.resetdata("uplimagetable");
        }).then((v3) => {
          return this.resetdata("PreCheckIssues");
        }).then((v5) => {
          return this.resetdata("tmpPreCheckIssues");
        }).then((v1) => {
          return this.resetdata("PreCheckLogs");
        }).then((v2) => {
          return this.resetdata("tmpPreCheckLogs");
        }).then((v3) => {
          return this.resetdata("OpenCheckIssues");
        }).then((v5) => {
          return this.resetdata("tmpOpenCheckIssues");
        }).then((v1) => {
          return this.resetdata("OpenCheckLogs");
        }).then((v2) => {
          return this.resetdata("tmpOpenCheckLogs");
        }).then((v3) => {
          return this.resetdata("FormalCheckIssues");
        }).then((v5) => {
          return this.resetdata("tmpFormalCheckIssues");
        }).then((v1) => {
          return this.resetdata("FormalCheckLogs");
        }).then((v2) => {
          return this.resetdata("tmpFormalCheckLogs");
        }).then((v3) => {
          return this.resetdata("ServiceCheckIssues");
        }).then((v5) => {
          return this.resetdata("tmpServiceCheckIssues");
        }).then((v1) => {
          return this.resetdata("ServiceCheckLogs");
        }).then((v2) => {
          return this.resetdata("tmpServiceCheckLogs");
        }).then((v3) => {
          return this.resetdata("ProjTeam");
        }).then((v5) => {
          return this.resetdata("tmpProjTeam");
        }).then((v6) => {
          let sql = "update projversion set lastdate = null,needupd = 1,versionid = 0";
          return this.db.executeSql(sql, []);
        }).then((v7) => {
          return this.db.executeSql("delete from imagetable", []);
        }).then((v8) => {
          return this.localStorage.setItem('needupload' + projid, false);
        }).catch(err => {
          console.log(err);
        }))
      } else {
        resolve(promise.then((v1) => {
          return this.deleteTable("projpositions");
        }).then((v2) => {
          console.log("reset apartments apartments");
          return this.deleteTable("apartments");
        }).then((v3) => {
          console.log("v3");
          return this.deleteTable("apartmentpostionlink");
        }).then((v4) => {
          console.log("v4");
          return this.deleteTable("apartmentpostiondraws");
        }).then((v5) => {
          console.log("v5");
          return this.deleteTable("projcheckitems");
        }).then((v6) => {
          console.log("v6");
          return this.deleteTable("projcheckitemdetails");
        }).then((v7) => {
          console.log("v7");
          return this.deleteTable("positioncheckitemlink");
        }).then((v8) => {
          console.log("v8");
          return this.deleteTable("vend");
        }).then((v9) => {
          return this.deleteTable("custsatisfaction");
        }).then((vv) => {
          return this.deleteTable("ReasonNoAccepts");
        }).then((v1) => {
          return this.resetdata("tmpprojversion");
        }).then((v2) => {
          return this.deleteTable("uplimagetable");
        }).then((v3) => {
          return this.deleteTable("tmpbuildingversion");
        }).then((v5) => {
          return this.deleteTable("FormalCheckBatchRooms");
        }).then((v6) => {
          return this.deleteTable("Rooms");
        }).then((v1) => {
          return this.deleteTable("PreCheckIssues");
        }).then((v2) => {
          return this.deleteTable("tmpPreCheckIssues");
        }).then((v3) => {
          return this.deleteTable("uplPreCheckIssues");
        }).then((v1) => {
          return this.deleteTable("OpenCheckIssues");
        }).then((v2) => {
          return this.deleteTable("tmpOpenCheckIssues");
        }).then((v3) => {
          return this.deleteTable("uplOpenCheckIssues");
        }).then((v1) => {
          return this.deleteTable("FormalCheckIssues");
        }).then((v2) => {
          return this.deleteTable("tmpFormalCheckIssues");
        }).then((v3) => {
          return this.deleteTable("uplFormalCheckIssues");
        }).then((v1) => {
          return this.deleteTable("ServiceCheckIssues");
        }).then((v2) => {
          return this.deleteTable("tmpServiceCheckIssues");
        }).then((v3) => {
          return this.deleteTable("uplServiceCheckIssues");
        }).then((v5) => {
          return this.deleteTable("CustRoomSatisfactions");
        }).then((v6) => {
          return this.deleteTable("tmpCustRoomSatisfactions");
        }).then((v1) => {
          return this.deleteTable("RoomNoAcceptLogs");
        }).then((v2) => {
          return this.deleteTable("tmpRoomNoAcceptLogs");
        }).then((v3) => {
          return this.deleteTable("PreRoomDetails");
        }).then((v5) => {
          return this.deleteTable("tmpPreRoomDetails");
        }).then((v3) => {
          return this.deleteTable("OpenRoomDetails");
        }).then((v5) => {
          return this.deleteTable("tmpOpenRoomDetails");
        }).then((v3) => {
          return this.deleteTable("FormalRoomDetails");
        }).then((v5) => {
          return this.deleteTable("tmpFormalRoomDetails");
        }).then((v6) => {
          console.log('vt6');
          return this.deleteTable("buildingversion");
          //return this.db.executeSql("update buildingversion set needupd = 1, needdownload = 1, versionid = 0", []);
        }).then((v6) => {
          console.log("delete imagetable");
          return this.resetdata("imagetable");
          //return this.db.executeSql("delete from imagetable where fn not in (select image from apartments)", []);
        }).then((v6) => {
          let sql = "update projversion set needupd = 1,versionid = 0";
          return this.db.executeSql(sql, []);
        }).then((v7) => {
          return this.localStorage.getItem('curproj');
        }).then((v9: any) => {
          console.log(v9);
          return this.localStorage.setItem('curproj', { projid: v9.projid, projname: v9.projname, versionid: 0, needupd: 1 });
        }).catch(err => {
          console.log(err);
        }))
      }
    })
  }

  testupdate() {      //[["CustRoomStatisfactions"],[{ProjId:'projid1',VersionId:'VersionId1',RoomId:'RoomId1',SatisfiedDim:'SatisfiedDim1',Score:5},{ProjId:'projid2',VersionId:'VersionId2',RoomId:'RoomId2',SatisfiedDim:'SatisfiedDim2',Score:4}]]
    this.db.executeSql("SELECT * FROM FormalCheckIssues", []).then(vres => {   //SELECT count(*) as counts FROM
      var data: Array<any>; data = [];
      console.log(vres);
      console.log(JSON.stringify(vres.rows.item(0)));
      console.log(vres.rows.item(0).RegisterDate);
      let dt = new Date(vres.rows.item(0).RegisterDate);
      console.log(dt);
      console.log(dt.toLocaleDateString());
    })
  }

  testsql(roomid): Promise<any> {
    return new Promise((resolve) => {
      let promise = new Promise((resolve) => {
        resolve(100);
      });
      resolve(promise.then((v3: any) => {
        // console.log(areas);
        // let drawlist: Array<any>; drawlist = [];
        // if (v3 && v3.rows.length > 0) {
        //    drawlist.push({ src: v3.rows.item(0).src, width: v3.rows.item(0).ImgWidth, areas: areas });
        // }    
        let sql = "select fn,projid from imagetable";
        console.log(sql);
        return this.db.executeSql(sql, []).then(val => {
          for (var i = 0; i < val.rows.length; i++) {
            console.log(JSON.stringify(val.rows.item(i)));
          }
          return v3;
        })
      }).then((v3: any) => {
        let sql = "select * from apartments";
        console.log(sql);
        return this.db.executeSql(sql, []).then(val => {
          for (var i = 0; i < val.rows.length; i++) {
            console.log(JSON.stringify(val.rows.item(i)));
          }
          return v3;
        })
      }).then((v3: any) => {
        let sql = "select * from rooms where id = '" + roomid + "'";
        console.log(sql);
        return this.db.executeSql(sql, []).then(val => {
          for (var i = 0; i < val.rows.length; i++) {
            console.log(JSON.stringify(val.rows.item(i)));
          }
          return v3;
        })
      }).catch(err => {
        return console.log("楼栋更新失败:" + err);
      }))
    })
  }

  testhttp() {
    //let v2 = '[{"tablename":"FormalCheckIssues","data":[{"BatchId":"52476447-f177-4633-96d3-045ae45a636c","IssueId":"","RoomId":"282ee31a-83d3-4b02-b4d6-5e2e4b4611e7","PositionId":"2c20fd18-c7f0-402b-9a88-2741e6eef621","CheckItemId":"24fe50a5-bf10-43bc-b662-913ec356494f","PlusDesc":"","IssueDesc":"安装错误","UrgencyId":"一般","ImgBefore1":"7cea66e7b6525e1cc411cac25e805f7f.jpeg","Imgbefore2":null,"ImgBefore3":null,"ImgAfter1":null,"ImgAfter2":null,"ImgAfter3":null,"Id":"14997621218190.1625675274990499","IssueStatus":"待派单","VendId":"6e7ea66c-04fa-4504-b34f-eed42597f6d3","ResponVendId":"6e7ea66c-04fa-4504-b34f-eed42597f6d3","ProjId":"6a397ed5-3923-47e4-8f5a-033920062c02","Manager":null,"ResponsibleId":null,"IssueType":null,"RegisterDate":"2017-07-11 16:35:21","AppointDate":null,"LimitDate":null,"ReFormDate":null,"CloseDate":null,"CloseReason":null,"CancelDate":null,"CancelReason":null,"VersionId":0,"ImgClose1":null,"ImgClose2":null,"ImgClose3":null,"ReturnDate":null,"ReturnReason":null,"ReturnNum":null,"BuildingId":"de9657d4-9c38-46e6-9828-e5cdb86bd4e9","EngineerId":null,"ReviewDate":null,"x":319.0184049079755,"y":326.6871165644172,"ResponsibleName":null,"ResponsiblePhone":null,"EngineerName":"TestAccount","EngineerPhone":"12345678901"}]}]';
    //console.log(JSON.parse(v2));
    //let v = JSON.parse(v2);
    let v2 = '[{"TableName":"FormalCheckIssues","data":[{"BatchId":"52476447-f177-4633-96d3-045ae45a636c","IssueId":"","RoomId":"1c6e9020-bb76-45e3-a01e-b2c4c92a9286","PositionId":"2c20fd18-c7f0-402b-9a88-2741e6eef621","CheckItemId":"f93dbc03-cd72-414a-a6e7-4a9f5871f6f2","PlusDesc":"","IssueDesc":"灯不亮","UrgencyId":"一般","ImgBefore1":"b657931f7ef39593d0ccf052a6ef4238.jpeg","ImgBefore2":"","ImgBefore3":"","ImgAfter1":"","ImgAfter2":"","ImgAfter3":"","Id":"14998411565190.27814669301733375","IssueStatus":"待派单","VendId":"6e7ea66c-04fa-4504-b34f-eed42597f6d3","ResponVendId":"6e7ea66c-04fa-4504-b34f-eed42597f6d3","ProjId":"6a397ed5-3923-47e4-8f5a-033920062c02","Manager":"","ResponsibleId":"","IssueType":"","RegisterDate":"2017-07-12 14:32:36","AppointDate":"1753-01-01 12:00:00","LimitDate":"1753-01-01 12:00:00","ReFormDate":"1753-01-01 12:00:00","CloseDate":"1753-01-01 12:00:00","CloseReason":"","CancelDate":"1753-01-01 12:00:00","CancelReason":null,"VersionId":0,"ImgClose1":"","ImgClose2":"","ImgClose3":"","ReturnDate":"1753-01-01 12:00:00","ReturnReason":"","ReturnNum":0,"BuildingId":"de9657d4-9c38-46e6-9828-e5cdb86bd4e9","EngineerId":"","ReviewDate":"1753-01-01 12:00:00","x":340,"y":376,"ResponsibleName":"","ResponsiblePhone":"","EngineerName":"TestAccount","EngineerPhone":"12345678901"}]}]';
    this.httpService.post(APP_SERVE_URL + "/DynamicsPack", { Token: "051656197F8479E599FD28ADD8126A89", ProjId: "6a397ed5-3923-47e4-8f5a-033920062c02", BatchId: "52476447-f177-4633-96d3-045ae45a636c", BuildingId: "de9657d4-9c38-46e6-9828-e5cdb86bd4e9", JsonStr: v2 });
  }
}
