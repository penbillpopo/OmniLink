import { CamelCase } from '@ay/util';
import _ from 'lodash';
import path from 'path';
import { Config } from '../config';
import { SharedModule } from '../shared-module';
import { firstClass, firstType } from '../tools';
import { Output } from './output.class';

export class SharedIndex extends Output {
  public constructor(public config: Config, public modules: SharedModule[]) {
    super(`${config.dist}/src/index.ts`, config);
  }

  public async generateContent(): Promise<string[]> {
    let exports = ['wsc'];
    let imports = [`import { wsc } from "./wsc";`];

    this.modules.map((module) => {
      const ModuleName = CamelCase(module.name);
      if (module.dtos.length) {
        module.dtos.map((sourceFile) => {
          const dto = firstClass(sourceFile);

          imports.push(
            `import { ${dto.name.text} } from "./${
              module.name
            }/dto/${path.basename(
              sourceFile.fileName,
              path.extname(sourceFile.fileName),
            )}";`,
          );

          exports.push(dto.name.text);
        });
      }

      if (module.types.length) {
        module.types.map((sourceFile) => {
          const type = firstType(sourceFile);
          imports.push(
            `import { ${type.name.text} } from "./${
              module.name
            }/dto/${path.basename(
              sourceFile.fileName,
              path.extname(sourceFile.fileName),
            )}";`,
          );

          exports.push(type.name.text);
        });
      }

      if (module.controller) {
        imports.push(
          `import { ${ModuleName}Model } from "./${module.name}/model";`,
        );

        exports.push(`${ModuleName}Model`);
      }
    });

    exports = _.union(exports);
    imports = _.union(imports);

    return [...imports, ``, `export { ${exports} };`];
  }
}
