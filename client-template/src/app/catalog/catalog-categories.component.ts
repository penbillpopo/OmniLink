import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface CategoryNode {
  name: string;
  products: number;
  visibility: 'public' | 'hidden';
  children?: CategoryNode[];
}

@Component({
  selector: 'cs-catalog-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog-categories.component.html',
  styleUrl: './catalog-categories.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogCategoriesComponent {
  readonly categories: CategoryNode[] = [
    {
      name: '海外旅遊',
      products: 146,
      visibility: 'public',
      children: [
        { name: '日本', products: 58, visibility: 'public' },
        { name: '韓國', products: 24, visibility: 'public' },
        { name: '歐洲深度', products: 32, visibility: 'public' },
        { name: '美洲長途', products: 18, visibility: 'hidden' }
      ]
    },
    {
      name: '國內旅遊',
      products: 92,
      visibility: 'public',
      children: [
        { name: '北部', products: 24, visibility: 'public' },
        { name: '中部', products: 16, visibility: 'public' },
        { name: '東部', products: 21, visibility: 'public' },
        { name: '離島', products: 12, visibility: 'public' }
      ]
    },
    {
      name: '主題旅遊',
      products: 54,
      visibility: 'public',
      children: [
        { name: '親子友善', products: 15, visibility: 'public' },
        { name: '蜜月浪漫', products: 8, visibility: 'public' },
        { name: '極限冒險', products: 11, visibility: 'hidden' },
        { name: '長者慢旅', products: 7, visibility: 'public' }
      ]
    }
  ];
}
