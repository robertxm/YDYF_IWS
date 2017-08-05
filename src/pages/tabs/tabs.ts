import { Component } from '@angular/core';
import { AboutPage } from '../about/about';
import { MyPage } from '../mypage/mypage';
import { FormalinspectionPage } from '../formalinspection/formalinspection';
import { OpeninspectionPage } from '../openinspection/openinspection';
import { PreinspectionPage } from '../preinspection/preinspection';
import { MaintenancePage } from '../maintenance/maintenance';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tab1Root = PreinspectionPage;
  tab2Root = OpeninspectionPage;
  tab3Root = FormalinspectionPage;
  tab4Root = MaintenancePage;
  tab5Root = MyPage;

  constructor() {

  }
}
