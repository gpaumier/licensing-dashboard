var fs = require('fs');
var mysqlPath = __dirname + '/mysql.json'

var mysqlConfig = JSON.parse(fs.readFileSync(mysqlPath, 'UTF-8'));
exports.mysql = mysqlConfig;
