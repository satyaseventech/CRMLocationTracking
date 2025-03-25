import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PolicyModalPage } from './policy-modal.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule],
  declarations: [PolicyModalPage],
  exports: [PolicyModalPage]
})
export class PolicyModalPageModule {}
