import fs from 'fs';
import path from 'path';
import { bool } from '../basic';
import { environmentStore } from '../store';

export interface Group {
  name: string;
  pattern?: string;
  patternFlags?: string;
  description?: string;
  environments: Environment[];
}

export interface Environment {
  key: string;
  description?: string;
  defaultValue: string;
  usedServices: string[];
  type: string;
}

export class JsonExporter {
  public constructor(private _filepath: string, private _service: string) {}
  private _groups: Group[] = [];
  private _defaultGroup: Group;

  public export() {
    if (bool('DISABLE_ENV_EXPORTER', false)) return;
    this._readEnvironmentGroups();
    this._ensureDefaultGroup();
    this._reclassificationEnvironment();
    this._removeDuplicateEnvironment();
    this._mergeEnvironment();
    this._groups.map((group) => {
      group.environments.map((environment) => {
        environment.usedServices = environment.usedServices.sort((a, b) =>
          a.localeCompare(b),
        );
      });
    });
    fs.writeFileSync(this._filepath, JSON.stringify(this._groups, null, 2));
  }

  private _removeDuplicateEnvironment() {
    this._groups.map((group) => {
      if (!group.environments) return;
      group.environments = group.environments.filter(
        (environment, index) =>
          group.environments.findIndex(
            (item) => item.key === environment.key,
          ) === index,
      );
    });
  }

  private _matchGroupPattern(group: Group, key: string) {
    return (
      group.pattern &&
      new RegExp(group.pattern, group.patternFlags || 'ig').test(key)
    );
  }

  private _usePastGroup(group: Group, key: string) {
    if (!group.environments) return undefined;
    return group.environments.find((environment) => environment.key === key);
  }

  private _mergeEnvironment() {
    Object.entries(environmentStore.store).map(([key, value]) => {
      const group =
        this._groups.find((group) => this._matchGroupPattern(group, key)) ||
        this._groups.find((group) => this._usePastGroup(group, key)) ||
        this._defaultGroup;

      let environment = group.environments.find(
        (environment) => environment.key === key,
      );

      if (!environment) {
        environment = { ...value, usedServices: [] };
        group.environments.push(environment);
      } else {
        if (
          environment.defaultValue !== undefined &&
          JSON.stringify(environment.defaultValue) !==
            JSON.stringify(value.defaultValue)
        ) {
          console.error(
            '相同的環境變數卻有不同的預設值',
            environment.key,
            JSON.stringify(environment.defaultValue),
            '!=',
            JSON.stringify(value.defaultValue),
          );
        }

        Object.keys(value)
          .filter((key) => value[key] !== undefined)
          .map((key) => (environment[key] = value[key]));
      }

      if (!environment.usedServices.includes(this._service)) {
        environment.usedServices.push(this._service);
      }
    });
  }

  private _reclassificationEnvironment() {
    this._groups.map((fromGroup) => {
      if (!fromGroup.environments) return;
      fromGroup.environments.map((environment, index) => {
        const destGroup =
          this._groups.find(
            (group) =>
              group.pattern && new RegExp(group.pattern).test(environment.key),
          ) || fromGroup;

        if (destGroup !== fromGroup) {
          destGroup.environments.push(environment);
          fromGroup.environments.splice(index, 1);
        }
      });
    });
  }

  private _readEnvironmentGroups() {
    const filePath = path.resolve(this._filepath);
    if (!fs.existsSync(filePath)) {
      this._groups = [];
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      this._groups = JSON.parse(content);
    } catch (error) {
      console.error('讀取環境變數檔案時發生錯誤', error);
    }
  }

  private _ensureDefaultGroup() {
    this._defaultGroup = this._groups.find((group) => group.name === 'DEFAULT');
    if (this._defaultGroup === undefined) {
      this._defaultGroup = {
        name: 'DEFAULT',
        description: '未分類的屬性',
        environments: [],
      };
      this._groups.push(this._defaultGroup);
    }
  }
}
