/**
 *
 * Author: Lukas Reichart on 3/9/15.
 * Purpose: Skipper adapter ( used by the sails.js framework )
 * License: MIT
 * Copyright Lukas Reichart @Antum 2015
 */

import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { ReadStream } from 'fs';
import { Writable } from 'stream';

export interface SkipperAzureOptions {
  key: string;
  secret: string;
  container: string;
}

export interface AzureReceiverOptions extends SkipperAzureOptions {
  path: string;
  headers?: { [key: string]: string };
}

export default function SkipperAzure(globalOptions: SkipperAzureOptions) {
  const sharedKeyCredential = new StorageSharedKeyCredential(
    globalOptions.key,
    globalOptions.secret,
  );

  const blobService = new BlobServiceClient(
    `https://${globalOptions.key}.blob.core.windows.net`,
    sharedKeyCredential,
  );

  const containerClient = blobService.getContainerClient(
    globalOptions.container,
  );

  this.read = function (blobName, cb) {
    const blobClient = containerClient.getBlobClient(blobName);

    blobClient
      .download()
      .then((data) => {
        const buffers: Buffer[] = [];
        data.readableStreamBody.on('data', (data) => buffers.push(data));
        data.readableStreamBody.on('end', () =>
          cb(null, Buffer.concat(buffers)),
        );
        data.readableStreamBody.on('error', (error) => cb(error));
      })
      .catch((error) => cb(error));
  };

  this.rm = function (blobName, cb) {
    const blobClient = containerClient.getBlobClient(blobName);

    blobClient
      .deleteIfExists()
      .then((response) =>
        cb({ filename: blobName, success: true, extra: response }),
      )
      .catch((error) => cb(error));
  };

  this.ls = function (prefix, cb) {
    (async () => {
      try {
        if (!prefix) {
          prefix = undefined;
        }

        const blobs = containerClient.listBlobsFlat({ prefix });

        const response = [];
        for await (const blob of blobs) {
          response.push(blob.name);
        }

        cb(null, response);
      } catch (error) {
        cb(error);
      }
    })();
  };

  this.receive = (option: { saveAs: string }) => {
    const receiver = new Writable({ objectMode: true });

    receiver.once('error', function (error) {
      console.error('ERROR ON RECEIVER :: ', error?.message);
    });

    receiver._write = (
      file: ReadStream,
      encoding: BufferEncoding,
      cb: (error?: Error | null) => void,
    ) => {
      const blockBlobClient = containerClient.getBlockBlobClient(option.saveAs);

      const buffer = [];

      file.on('data', (chunk) => buffer.push(chunk));
      file.on('end', () => {
        blockBlobClient
          .uploadData(Buffer.concat(buffer))
          .then(() => receiver.emit('finish'))
          .catch((error) => receiver.emit('error', error));
      });
      file.on('error', (error) => receiver.emit('error', error));
    };

    return receiver;
  };
}
