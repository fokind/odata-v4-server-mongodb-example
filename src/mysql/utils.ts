export function promisifyWithDdName(client) {
  return new Proxy(client, {
    get(target, name) {
      if (name !== 'query')
        return target[name];

      return function (...args) {
        return new Promise((resolve, reject) => {
          target.query(`USE northwind_mysql_test_db`, (error, res) => {
            if (error) return reject(error);
            target.query(...args, (err, result) => {
              if (err) return reject(err);
              resolve(result);
            })
          })
        });
      }
    }
  });
}

export function getDeltaObjectInSQL(delta: any): string {
  const deltaKeys = Object.keys(delta);
  if (deltaKeys.length == 1) return `${deltaKeys[0]}=${delta[deltaKeys[0]]}`;
  return deltaKeys.reduce((prev, current) => `${prev}=${delta[prev]}, ${current}=${delta[current]}`);
}

export function mapDiscontinued(results: any[]): any[] {
  return results.map(result => {
    if (!result.hasOwnProperty('Discontinued'))
      return result;
    result.Discontinued = (result.Discontinued == 1) ? true : false;
    return result;
  });
}

function filterRow(item) {
  const newItem = {};
  Object.keys(item)
    .filter(key => item[key] !== null)
    .forEach(key => newItem[key] = item[key]);
  return newItem;
}

export function filterNullValues(rows: any[]): any[] {
  return rows.map(row => filterRow(row));
}

// DEPRICATED?
/*function getQuestionMarks(dataKeys: any[]): string {
  return dataKeys.map(key => '?').join();
}

function getUpdateString(dataKeys: any[]): string {
  return dataKeys.map(key => key + '=?').join();
}

function getObjectValues(data: any, dataKeys: any[]): any[] {
  return dataKeys.map(key => data[key]);
}

export function getUpsertQueryString(key: number, data: any): string {
  const dataKeys = Object.keys(data);
  return `INSERT INTO Products (Id,${dataKeys.join()}) VALUES (?,${getQuestionMarks(dataKeys)}) ON DUPLICATE KEY UPDATE ${getUpdateString(dataKeys)}`;
}

export function getUpsertQueryParameters(key: number, data: any): any[] {
  const dataKeys = Object.keys(data);
  const dataValues = getObjectValues(data, dataKeys);
  return [key, ...dataValues, ...dataValues];
}*/

function getUpdateParameters(deltaKeys: string[]): string {
  return deltaKeys.map(key => key + '=?').join();
}

function getObjectValues(delta: any, deltaKeys: any[]): any[] {
  return deltaKeys.map(key => delta[key]);
}

export function getPatchQueryString(delta: any): string {
  const deltaKeys = Object.keys(delta);
  return `UPDATE Products SET ${getUpdateParameters(deltaKeys)} WHERE Id = ?`;
}

export function getPatchQueryParameters(key: number, delta: any): any[] {
  const dataKeys = Object.keys(delta);
  const dataValues = getObjectValues(delta, dataKeys);
  return [...dataValues, key];
}