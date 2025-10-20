import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface InvoiceRow {
  invoiceNo: string;
  orderNo: string;
  member: string;
  type: '電子發票' | '紙本發票';
  status: 'issued' | 'voided' | 'pending';
  issueDate: string;
  amount: number;
}

@Component({
  selector: 'cs-order-invoices',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-invoices.component.html',
  styleUrl: './order-invoices.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderInvoicesComponent {
  readonly invoices: InvoiceRow[] = [
    {
      invoiceNo: 'AA-12345678',
      orderNo: 'OD20241202001',
      member: '林嘉穎',
      type: '電子發票',
      status: 'issued',
      issueDate: '2024/12/02',
      amount: 46800
    },
    {
      invoiceNo: 'AA-12345590',
      orderNo: 'OD20241130022',
      member: '張庭瑜',
      type: '紙本發票',
      status: 'pending',
      issueDate: '預計 2024/12/05',
      amount: 32900
    },
    {
      invoiceNo: 'AA-12345234',
      orderNo: 'OD20241115016',
      member: '吳佩琳',
      type: '電子發票',
      status: 'voided',
      issueDate: '2024/11/16',
      amount: 12800
    }
  ];
}
