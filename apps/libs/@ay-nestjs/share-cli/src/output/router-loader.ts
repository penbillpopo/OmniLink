import { CamelCase } from '@ay/util';
import { Config } from '../config';
import { SharedModule } from '../shared-module';
import { Output } from './output.class';

export class RouterLoader extends Output {
  public constructor(public config: Config, public modules: SharedModule[]) {
    super(`${config.module}/router-loader.ts`, config);
  }

  public async generateContent(): Promise<string[]> {
    this.modules = this.modules
      .filter((module) => module.name)
      .sort((a, b) => a.name.localeCompare(b.name));

    let content: string[] = [];

    const imports = [];
    const callFunctions = [];

    this.modules.map((module) => {
      const functionName = `load${CamelCase(module.name.replace('/', '-'))}`;
      imports.push(
        `import { ${functionName} } from "./${module.name}/router";`,
      );
      callFunctions.push(`${functionName}();`);
    });

    content = content.concat(
      ...imports,
      ``,
      `export function loadModules() {`,
      ...callFunctions,
      `}`,
    );

    return content;
  }
}
