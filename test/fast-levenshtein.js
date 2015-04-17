
var lev = require('fast-levenshtein')
;


lev.getAsync('back', 'book', function (err, distance) {
  console.log(err, distance);
});
