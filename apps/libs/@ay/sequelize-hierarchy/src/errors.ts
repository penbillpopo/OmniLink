import { Error, Sequelize } from 'sequelize';

export class HierarchyError extends Error {
  public constructor(message) {
    super(message);
    this.name = 'SequelizeHierarchyError';
  }
}

export default function errorsFn(sequelize = Sequelize) {
  const errors = {
    HierarchyError,
    // Alias for backward-compatibility
    SequelizeHierarchyError: HierarchyError,
  };

  // Add errors to Sequelize and sequelize
  Object.assign(sequelize, errors);
  Object.assign(sequelize.prototype, errors);
}
