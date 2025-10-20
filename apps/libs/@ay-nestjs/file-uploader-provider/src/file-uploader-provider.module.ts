import { json, str } from '@ay/env';
import { IFileUploadAdapter, Uploader } from '@ay/file-upload';
import AzureAdapter from '@ay/skipper-azure';
import { RestfulFSAdapter } from '@ay/skipper-restful-fs';
import { DynamicModule } from '@nestjs/common';

export class FileUploaderProviderModule {
  private static _store = {};

  public static forRoot(
    prefix = '',
    option?: AzureOption | RestfulFsOption,
  ): DynamicModule {
    if (this._store[prefix] === undefined) {
      this._store[prefix] = FileUploaderProviderModule._createInstance(
        prefix,
        option,
      );
    }

    return {
      module: FileUploaderProviderModule,
      providers: [{ provide: Uploader, useValue: this._store[prefix] }],
      exports: [Uploader],
    };
  }

  private static _createInstance(
    prefix: string,
    option?: AzureOption | RestfulFsOption,
  ) {
    let envPrefix = '';
    if (prefix) envPrefix = prefix + '_UPLOADER_';
    else envPrefix = 'UPLOADER_';

    const type = option?.type || str(envPrefix + 'ADAPTER', '').toUpperCase();
    let adapter: IFileUploadAdapter;

    switch (type) {
      case 'AZURE': {
        const azureOption = option as AzureOption;
        adapter = new AzureAdapter({
          key: azureOption?.key || str(envPrefix + 'AZURE_KEY'),
          secret: azureOption?.secret || str(envPrefix + 'AZURE_SECRET'),
          container:
            azureOption?.container || str(envPrefix + 'AZURE_CONTAINER'),
        });
        break;
      }

      case 'RESTFUL_FS': {
        const restfulFsOption = option as RestfulFsOption;
        adapter = new RestfulFSAdapter({
          url: [restfulFsOption?.url || str(envPrefix + 'RESTFUL_FS_SERVICE')],
          headers:
            restfulFsOption?.headers ||
            json(envPrefix + 'RESTFUL_FS_HEADERS', {}),
        });
        break;
      }

      default:
        throw new Error(`錯誤的檔案上傳類型${type}`);
    }

    return new Uploader(adapter, (filename) => {
      const prefix = str(envPrefix + 'FILENAME_PREFIX', '');
      const postfix = str(prefix + 'FILENAME_POSTFIX', '');
      return `${prefix}${filename}${postfix}`;
    });
  }
}

export type AzureOption = {
  type: 'AZURE';
  key: string;
  secret: string;
  container: string;
  prefix: string;
  postfix: string;
};

export type RestfulFsOption = {
  type: 'RESTFUL_FS';
  url: string;
  headers: { [key: string]: any };
  prefix: string;
  postfix: string;
};
