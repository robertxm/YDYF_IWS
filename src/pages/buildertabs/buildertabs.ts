import { Component } from '@angular/core';
import { AboutPage } from '../about/about';
import { MyPage } from '../mypage/mypage';
import { BuilderPage } from '../builder/builder';
import { BuildermaintenancePage } from '../buildermaintenance/buildermaintenance'; 

@Component({
  templateUrl: 'buildertabs.html'
})
export class BuilderTabsPage {
  tab1Root = BuilderPage;
  tab2Root = BuildermaintenancePage;
  tab3Root = MyPage;

  constructor() {

  }
}
