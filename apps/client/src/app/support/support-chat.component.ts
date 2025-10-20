import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface ChatSession {
  member: string;
  topic: string;
  status: 'active' | 'waiting' | 'closed';
  agent: string;
  startedAt: string;
  lastMessage: string;
}

@Component({
  selector: 'cs-support-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './support-chat.component.html',
  styleUrl: './support-chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportChatComponent {
  readonly sessions: ChatSession[] = [
    {
      member: '林嘉穎',
      topic: '更改旅客資料',
      status: 'active',
      agent: '客服 - 李沛蓉',
      startedAt: '09:18',
      lastMessage: '請協助上傳護照照片，謝謝'
    },
    {
      member: '王立群',
      topic: '旅遊保險理賠',
      status: 'waiting',
      agent: '客服 - 張亞聆',
      startedAt: '09:05',
      lastMessage: '請稍待，我為您轉接專員'
    },
    {
      member: '郭俊豪',
      topic: '付款成功未收到確認',
      status: 'closed',
      agent: '客服 - 何思妤',
      startedAt: '08:40',
      lastMessage: '已補發確認信件'
    }
  ];
}
