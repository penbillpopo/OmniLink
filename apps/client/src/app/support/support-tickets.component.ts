import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Ticket {
  no: string;
  member: string;
  subject: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'pending' | 'closed';
  assignedTo: string;
  updatedAt: string;
}

@Component({
  selector: 'cs-support-tickets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './support-tickets.component.html',
  styleUrl: './support-tickets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportTicketsComponent {
  readonly tickets: Ticket[] = [
    {
      no: 'TK-20241202-001',
      member: '林嘉穎',
      subject: '補件：北海道行程護照上傳',
      priority: 'high',
      status: 'open',
      assignedTo: '客服 - 李沛蓉',
      updatedAt: '2024/12/02 09:20'
    },
    {
      no: 'TK-20241201-012',
      member: '張庭瑜',
      subject: '退款進度詢問',
      priority: 'medium',
      status: 'pending',
      assignedTo: '客服主管 - 郭佳靜',
      updatedAt: '2024/12/01 20:11'
    },
    {
      no: 'TK-20241130-004',
      member: '陳信宏',
      subject: '更改旅客同行資訊',
      priority: 'low',
      status: 'closed',
      assignedTo: '客服 - 何思妤',
      updatedAt: '2024/11/30 18:30'
    }
  ];
}
