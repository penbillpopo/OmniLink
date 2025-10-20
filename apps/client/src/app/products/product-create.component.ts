import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Step {
  title: string;
  description: string;
  completed: boolean;
}

@Component({
  selector: 'cs-product-create',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCreateComponent {
  readonly steps: Step[] = [
    {
      title: '基本資料',
      description: '商品名稱、行程標題、銷售語言與分類',
      completed: true
    },
    {
      title: '售價與庫存',
      description: '定價、促銷方案、賣場顯示與庫存數量',
      completed: false
    },
    {
      title: '行程內容',
      description: '每日行程、餐食、住宿、景點介紹與圖庫',
      completed: false
    },
    {
      title: '上架設定',
      description: '可銷售期間、上下架排程與 SEO 設定',
      completed: false
    }
  ];
}
