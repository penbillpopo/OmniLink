import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly _baseUrl = environment.serverUrl?.[0]?.replace(/\/$/, '') ?? '';

  public constructor(private readonly _http: HttpClient) {}

  public async uploadImage(
    file: File,
  ): Promise<{ url: string; path: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await firstValueFrom(
      this._http.post<{ url: string; path: string; filename: string }>(
        `${this._baseUrl}/api/uploads`,
        formData,
      ),
    );

    return response;
  }

  public resolveUrl(url: string | null | undefined): string | null {
    if (!url) {
      return null;
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    if (!this._baseUrl) {
      return url;
    }

    const normalized = url.startsWith('/') ? url : `/${url}`;
    return `${this._baseUrl}${normalized}`;
  }
}
