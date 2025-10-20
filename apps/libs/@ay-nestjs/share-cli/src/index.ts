#!/usr/bin/env node

import * as fs from 'fs';
import { Config } from './config';
import { Import } from './import/import';
import { Dto } from './output/dto';
import { Model } from './output/model';
import { Router } from './output/router';
import { RouterLoader } from './output/router-loader';
import { SharedIndex } from './output/shared-index';
import { Type } from './output/type';
import { WSC } from './output/wsc';
import { readDirDeepSync } from './read-dir-deep-sync';
import { SharedModule } from './shared-module';

async function main() {
  console.log('讀取設定檔');
  const write = true;
  const config = new Config();
  const modules = SharedModule.createModules(config);
  config.sharedFiles = readDirDeepSync(config.dist);
  console.info(`讀取 ${modules.length} 個模組: ${modules.join(', ')}`);

  const wsc = new WSC(config);
  if (write) await wsc.write();
  const libs: { [lib: string]: string[] } = {};

  const allowLibs = ['@ay-nestjs/share-client', ...config.allowLibs].map(
    (lib) =>
      new RegExp(
        lib.replace(/[-[\]{}()+?.,\\^$\/|#]/g, '\\$&').replace('*', '.+'),
      ),
  );

  for (const sharedModule of modules) {
    try {
      const model = new Model(config, sharedModule);
      if (write) await model.write();
      addImports(model.filename, model.imports);

      for (const dtoSourceFile of sharedModule.dtos) {
        const dto = new Dto(config, sharedModule, dtoSourceFile);
        if (write) await dto.write();
        addImports(dto.filename, dto.imports);
      }

      for (const typeSourceFile of sharedModule.types) {
        const type = new Type(config, sharedModule, typeSourceFile);
        if (write) await type.write();
        addImports(type.filename, type.imports);
      }

      const router = new Router(config, sharedModule);
      if (write) await router.write();
    } catch (error) {
      console.error(error, sharedModule.name);
    }
  }

  const sharedIndex = new SharedIndex(config, modules);
  if (write) await sharedIndex.write();

  const routerLoader = new RouterLoader(config, modules);
  if (write) await routerLoader.write();

  if (config.sharedFiles.length) {
    console.log('刪除多餘的檔案', config.sharedFiles);
    config.sharedFiles.map((file) => fs.rmSync(file));
  }

  if (Object.keys(libs).length) {
    console.log('未預期使用到的套件: ', JSON.stringify(libs, null, 2));
    console.log('如果這些套件是可以在前端使用的，請將套件加入到 share.json 中');
  }

  function addImports(filename: string, imports: Import[]) {
    imports
      .map(({ path }) => path)
      .filter(
        (path) =>
          !path.startsWith('.') &&
          !path.startsWith('/') &&
          !allowLibs.find((lib) => lib.test(path)),
      )
      .map((path) => {
        if (libs[path] === undefined) libs[path] = [];
        libs[path].push(filename);
      });
  }
}

main().catch(console.error);
