import fs from 'fs';
import path from 'path';
import { CompilerOptions } from 'typescript';

export class Config {
  public name: string;
  public module: string;
  public tsConfig: CompilerOptions;
  public shareJson: { [projectName: string]: ShareJson };
  public root: string;
  public dist: string;
  public allowLibs: string[];
  public sharedFiles: string[];

  public constructor() {
    const folder = this.findShareJsonFolder();
    
    this.tsConfig = JSON.parse(
      fs.readFileSync(path.resolve(folder, 'tsconfig.json'), 'utf-8'),
    );
    this.shareJson = JSON.parse(
      fs.readFileSync(path.resolve(folder, 'share.json'), 'utf-8'),
    );

    let projectName = process.argv[2];
    if (!projectName) {
      projectName = Object.keys(this.shareJson)[0];
    }

    const config = this.shareJson[projectName];
    this.root = folder;
    this.module = path.resolve(config.module);
    this.dist = path.resolve(config.dist);
    this.name = projectName;
    this.allowLibs = config.allowLibs;
  }

  public findShareJsonFolder() {
    let path = '';
    while (!fs.existsSync(path + 'share.json')) {
      path = '../' + path;
    }
    return path;
  }
}

export interface ShareJson {
  module: string;
  dist: string;
  allowLibs: string[];
}
