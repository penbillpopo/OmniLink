import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface AttributeGroup {
  name: string;
  type: string;
  required: boolean;
  values: string[];
  usedBy: number;
  description: string;
}

@Component({
  selector: 'cs-catalog-attributes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog-attributes.component.html',
  styleUrl: './catalog-attributes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogAttributesComponent {
  readonly groups: AttributeGroup[] = [
    {
      name: '旅客人數',
      type: '數值區間',
      required: true,
      values: ['1-2 人', '3-4 人', '5 人以上'],
      usedBy: 128,
      description: '顯示方案可支援的人數區間，影響報價'
    },
    {
      name: '住宿房型',
      type: '選擇題',
      required: true,
      values: ['雙人房', '三人房', '家庭房', '套房'],
      usedBy: 85,
      description: '提供旅客自訂房型，搭配加價方案'
    },
    {
      name: '餐食選擇',
      type: '多選題',
      required: false,
      values: ['全餐', '部分餐', '素食', '自理'],
      usedBy: 64,
      description: '依旅客需求提供餐食偏好選項'
    },
    {
      name: '保險升級',
      type: '加價選項',
      required: false,
      values: ['旅平險 5 百萬', '旅平險 1 千萬', '取消險加購'],
      usedBy: 42,
      description: '可勾選附加價值服務，由結帳頁加價'
    }
  ];
}
