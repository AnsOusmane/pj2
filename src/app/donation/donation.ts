import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-donation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './donation.html',
})
export class DonationComponent {
  @Output() close = new EventEmitter<void>();

  oneTimeAmounts = [1000, 2000, 5000, 10000, 25000, 50000, 100000];
  monthlyAmounts = [1000, 5000, 25000];
  selectedOneTime: number | null = null;
  selectedMonthly: number | null = null;
  customOneTime: number | null = null;
  customMonthly: number | null = null;

  donor = {
    type: 'particulier',
    name: '',
    organization: '',
    email: '',
    phone: '',
  };

  paymentMethod = '';

  selectOneTime(amount: number) {
    this.selectedOneTime = amount;
  }

  selectMonthly(amount: number) {
    this.selectedMonthly = amount;
  }

  submitDonation() {
    console.log('Détails du don:', {
      oneTime: this.selectedOneTime || this.customOneTime,
      monthly: this.selectedMonthly || this.customMonthly,
      donor: this.donor,
      payment: this.paymentMethod,
    });
  }
}
