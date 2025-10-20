import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface ErrorLog {
  level: 'error' | 'warning' | 'info';
  service: string;
  message: string;
  time: string;
  requestId: string;
}

@Component({
  selector: 'cs-developer-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './developer-logs.component.html',
  styleUrl: './developer-logs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeveloperLogsComponent {
  readonly logs: ErrorLog[] = [
    {
      level: 'error',
      service: 'booking-service',
      message: '供應商 API 回傳 500 · createBooking',
      time: '2024/12/02 09:22:14',
      requestId: 'req-0f8a12'
    },
    {
      level: 'warning',
      service: 'payment-service',
      message: 'Stripe webhook 驗證延遲 2.3s',
      time: '2024/12/02 08:58:02',
      requestId: 'req-12bc90'
    },
    {
      level: 'info',
      service: 'inventory-sync',
      message: '定期同步完成 · 更新 48 筆庫存',
      time: '2024/12/02 08:30:05',
      requestId: 'job-20241202-0830'
    }
  ];
}
