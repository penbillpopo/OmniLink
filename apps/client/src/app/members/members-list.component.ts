import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface MemberStat {
  title: string;
  value: string;
  hint: string;
}

interface MemberRecord {
  id: string;
  name: string;
  email: string;
  level: string;
  status: 'active' | 'warning' | 'blocked';
  lastLogin: string;
  lastPurchase: string;
  points: number;
}

@Component({
  selector: 'cs-members-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './members-list.component.html',
  styleUrl: './members-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembersListComponent {
  readonly stats: MemberStat[] = [
    { title: '總會員數', value: '12,480', hint: '本月新增 240 位' },
    { title: '活躍會員', value: '8,316', hint: '活躍率 66.6%' },
    { title: '高價值會員', value: '1,204', hint: '平均客單 NT$5,300' },
    { title: '待跟進會員', value: '842', hint: '30 天未登入' }
  ];

  readonly members: MemberRecord[] = [
    {
      id: 'MB20231001',
      name: '林嘉穎',
      email: 'chia.ying.lin@example.com',
      level: '黑鑽 VIP',
      status: 'active',
      lastLogin: '2024/12/02 09:12',
      lastPurchase: '2024/11/30',
      points: 12450
    },
    {
      id: 'MB20230642',
      name: '張庭瑜',
      email: 'tingyu.chang@example.com',
      level: '黃金',
      status: 'warning',
      lastLogin: '2024/11/10 23:19',
      lastPurchase: '2024/09/28',
      points: 3520
    },
    {
      id: 'MB20221135',
      name: '陳信宏',
      email: 'shin.hung.chen@example.com',
      level: '白金',
      status: 'active',
      lastLogin: '2024/12/02 14:33',
      lastPurchase: '2024/12/01',
      points: 8920
    },
    {
      id: 'MB20191278',
      name: '吳佩琳',
      email: 'peilin.wu@example.com',
      level: '銀卡',
      status: 'blocked',
      lastLogin: '2024/06/12 08:15',
      lastPurchase: '2024/03/19',
      points: 120
    },
    {
      id: 'MB20240112',
      name: '郭俊豪',
      email: 'jun.hao.kuo@example.com',
      level: '白金',
      status: 'active',
      lastLogin: '2024/12/01 19:20',
      lastPurchase: '2024/11/29',
      points: 6780
    }
  ];
}
