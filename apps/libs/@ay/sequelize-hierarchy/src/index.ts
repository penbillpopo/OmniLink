import _ from 'lodash';
import errorsFn from './errors';
import hooksUniversalFn from './hooks-universal';
import modelExtendsFn from './model-extends';
import { patchesFn } from './patches';

export default function SequelizeHierarchy(Sequelize) {
  // Add custom errors to Sequelize
  errorsFn(Sequelize);

  // Extend Model
  const patches = patchesFn(Sequelize);
  const modelExtends = modelExtendsFn(Sequelize, patches);
  Object.assign(patches.modelConstructor, modelExtends);

  // Add hook on Sequelize() to create universal hooks
  const hooksUniversal = hooksUniversalFn(Sequelize, patches);
  Sequelize.addHook('afterInit', (sequelize) => {
    // Apply hooks
    _.forIn(hooksUniversal, (hookFn, hookName) => {
      sequelize.addHook(hookName, hookFn);
    });
  });

  // Return Sequelize
  return Sequelize;
}
