import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Article {
  title: string;
  author: string;
  category: string;
  publishedAt: string;
  status: 'published' | 'draft' | 'scheduled';
  views: number;
}

@Component({
  selector: 'cs-content-articles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content-articles.component.html',
  styleUrl: './content-articles.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentArticlesComponent {
  readonly articles: Article[] = [
    {
      title: '冬季北海道：雪地活動與美食完整攻略',
      author: '內容企劃 - 江映彤',
      category: '旅遊攻略',
      publishedAt: '2024/11/28',
      status: 'published',
      views: 18420
    },
    {
      title: '親子沖繩 5 大飯店評比',
      author: '旅宿顧問 - 陳家綺',
      category: '住宿推薦',
      publishedAt: '2024/12/05 10:00',
      status: 'scheduled',
      views: 0
    },
    {
      title: '歐洲聖誕市集最佳行程懶人包',
      author: '特派編輯 - 郭仁杰',
      category: '主題推薦',
      publishedAt: '2024/11/12',
      status: 'published',
      views: 9420
    },
    {
      title: '2025 年旅遊趨勢預測與產品布局',
      author: '市場分析 - 蔡宜芳',
      category: '市場洞察',
      publishedAt: '草稿',
      status: 'draft',
      views: 0
    }
  ];
}
