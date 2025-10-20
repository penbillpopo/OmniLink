import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface TemplateItem {
  name: string;
  channel: string;
  usage: string;
  lastEdited: string;
  status: 'published' | 'draft';
}

interface VariableGroup {
  title: string;
  variables: string[];
}

@Component({
  selector: 'cs-settings-templates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-templates.component.html',
  styleUrl: './settings-templates.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsTemplatesComponent {
  readonly templates: TemplateItem[] = [
    {
      name: '訂單成立通知',
      channel: 'Email',
      usage: '訂單成立時發送給會員',
      lastEdited: '2024/11/12 14:20',
      status: 'published'
    },
    {
      name: '付款提醒簡訊',
      channel: 'SMS',
      usage: '待付款 24 小時前提醒',
      lastEdited: '2024/11/30 09:45',
      status: 'published'
    },
    {
      name: '出發前注意事項',
      channel: 'Email',
      usage: '出發前 7 日提醒旅客準備文件',
      lastEdited: '2024/12/01 18:02',
      status: 'draft'
    }
  ];

  readonly variables: VariableGroup[] = [
    {
      title: '訂單資訊',
      variables: ['{{order.number}}', '{{order.amount}}', '{{order.itinerary}}', '{{order.departDate}}']
    },
    {
      title: '會員資訊',
      variables: ['{{member.name}}', '{{member.level}}', '{{member.email}}']
    },
    {
      title: '客服資訊',
      variables: ['{{support.phone}}', '{{support.email}}', '{{support.serviceHours}}']
    }
  ];
}
