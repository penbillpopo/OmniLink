import Bluebird from 'bluebird';
import isGenerator from 'is-generator';
import _ from 'lodash';
import { Sequelize } from 'sequelize';

// Exports

// Remove spacing from SQL
export function removeSpacing(sql: string) {
  return sql.replace(/[ \t\r\n]+/g, ' ').trim();
}

// Replace field names in SQL marked with * with the identifier text quoted.
// e.g. SELECT *field FROM `Tasks` with identifiers {field: 'name'}
// -> SELECT `name` FROM `Tasks`
export function replaceFieldNames(
  sql: string,
  identifiers: { [key: string]: any },
  model,
) {
  const queryInterface = model.sequelize.getQueryInterface();
  _.forIn(identifiers, (fieldName, identifier) => {
    // Get table field name for model field
    fieldName = (model.rawAttributes || model.attributes)[fieldName].field;

    // Replace identifiers
    sql = sql.replace(
      new RegExp(`\\*${identifier}(?![a-zA-Z0-9_])`, 'g'),
      queryInterface.queryGenerator.quoteIdentifier(fieldName),
    );
  });
  return sql;
}

// Replace identifier with model's full table name taking schema into account
export function replaceTableNames(
  sql: string,
  identifiers: { [key: string]: any },
  sequelize: Sequelize,
) {
  const queryInterface = sequelize.getQueryInterface();

  _.forIn(identifiers, (model, identifier) => {
    const tableName = model.getTableName();
    sql = sql.replace(
      new RegExp(`\\*${identifier}(?![a-zA-Z0-9_])`, 'g'),
      tableName.schema
        ? tableName.toString()
        : (queryInterface.queryGenerator as any).quoteIdentifier(tableName),
    );
  });
  return sql;
}

// String format conversion from camelCase or underscored format to human-readable format
// e.g. 'fooBar' -> 'Foo Bar', 'foo_bar' -> 'Foo Bar'
export function humanize(str: string) {
  if (str == null || str === '') return '';
  str = `${str}`.replace(/[-_\s]+(.)?/g, (match, c) =>
    c ? c.toUpperCase() : '',
  );
  return str[0].toUpperCase() + str.slice(1).replace(/([A-Z])/g, ' $1');
}

// Add transaction and logging from options to query options
export function addOptions(queryOptions, options) {
  const { transaction, logging } = options;
  if (transaction !== undefined) queryOptions.transaction = transaction;
  if (logging !== undefined) queryOptions.logging = logging;
  return queryOptions;
}

// Check if field is in `fields` option
export function inFields(fieldName, options) {
  const { fields } = options;
  if (!fields) return true;
  return fields.includes(fieldName);
}

// Get field value if is included in `options.fields`
export function valueFilteredByFields(fieldName, item, options) {
  if (!inFields(fieldName, options)) return null;
  return item.dataValues[fieldName];
}

// Add a field to `options.fields`.
// NB Clones `options.fields` before adding to it, to avoid options being mutated externally.
export function addToFields(fieldName, options) {
  if (inFields(fieldName, options)) return;
  options.fields = options.fields.concat([fieldName]);
}

// Return `co` and `coAll` functions, using `Sequelize.Promise` (i.e. Bluebird)
export function makeCo() {
  const co = Bluebird.coroutine;

  function coAll(obj) {
    _.forIn(obj, (value, key) => {
      if (isGenerator.fn(value)) {
        obj[key] = co(value as any);
      }
    });
    return obj;
  }

  return { co, coAll };
}
