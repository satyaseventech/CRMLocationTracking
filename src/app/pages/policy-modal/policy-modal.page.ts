import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-policy-modal',
  templateUrl: './policy-modal.page.html',
  styleUrls: ['./policy-modal.page.scss'],
})
export class PolicyModalPage {
  @Input() title: string = '';  
  @Input() content: string = '';  

  constructor(private modalCtrl: ModalController) {}

  closeModal() {
    this.modalCtrl.dismiss();
  }
}
