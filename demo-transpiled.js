(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _src = require("../src");

var _parser = require("edtf/src/parser");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.BibLatexParser = _src.BibLatexParser;
window.BibLatexExporter = _src.BibLatexExporter;
window.CSLExporter = _src.CSLExporter;
window.edtfParse = _parser.parse;

var printObject = function printObject(object) {
    var html = '';
    switch (typeof object === "undefined" ? "undefined" : (0, _typeof3.default)(object)) {
        case 'object':
            if (object instanceof Array) {
                html += '[';
                object.forEach(function (item, index) {
                    html += printObject(item);
                    if (index + 1 < object.length) {
                        html += ', ';
                    }
                });
                html += ']';
            } else {
                html += '<table>';
                (0, _keys2.default)(object).forEach(function (key) {
                    var valueHtml = printObject(object[key]);
                    html += "<tr><td>" + key + ": </td><td>" + valueHtml + "</td></tr>";
                });
                html += '</table>';
            }
            break;
        case 'boolean':
        case 'number':
            html += String(object);
            break;
        case 'string':
            html += object.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            break;
    }
    return html;
};

var readBibPaste = function readBibPaste(event) {
    document.getElementById('bib-db').innerHTML = '<div class="spinner"></div>';
    document.getElementById('csl-db').innerHTML = '<div class="spinner"></div>';
    document.getElementById('biblatex').innerHTML = '<div class="spinner"></div>';
    var clipBoardText = event.clipboardData.getData('text');
    setTimeout(function () {
        importBiblatex(clipBoardText);
    }, 500);
};

var readBibFile = function readBibFile() {
    document.getElementById('bib-db').innerHTML = '<div class="spinner"></div>';
    document.getElementById('csl-db').innerHTML = '<div class="spinner"></div>';
    document.getElementById('biblatex').innerHTML = '<div class="spinner"></div>';
    // Add timeout so that spinners are shown before processing of file starts.
    setTimeout(function () {
        var fileUpload = document.getElementById('file-upload');
        if (fileUpload.files.length) {
            var fr = new FileReader();
            fr.onload = function (event) {
                importBiblatex(event.target.result);
            };
            fr.readAsText(fileUpload.files[0]);
        }
    }, 500);
};

var importBiblatex = function importBiblatex(bibString) {
    var t0 = performance.now();
    var parser = new _src.BibLatexParser(bibString, {
        processUnexpected: true,
        processUnknown: {
            collaborator: 'l_name'
        }
    });
    var bibDB = parser.output;
    if (parser.errors.length) {
        console.log(parser.errors);
    }
    document.getElementById('bib-db').innerHTML = printObject(bibDB);
    window.bibDB = bibDB;
    exportCSL(bibDB);
    exportBibLatex(bibDB);
    var t1 = performance.now();
    console.log("Total: " + (t1 - t0) + " milliseconds");
};

var exportCSL = function exportCSL(bibDB) {
    var exporter = new _src.CSLExporter(bibDB);
    var cslDB = exporter.output;
    document.getElementById('csl-db').innerHTML = printObject(cslDB);
};

var exportBibLatex = function exportBibLatex(bibDB) {
    var exporter = new _src.BibLatexExporter(bibDB);
    var biblatex = exporter.output.split('\n').join('<br>');
    document.getElementById('biblatex').innerHTML = biblatex;
};

document.getElementById('file-upload').addEventListener('change', readBibFile);
document.getElementById('paste-input').addEventListener('paste', readBibPaste, false);

},{"../src":134,"babel-runtime/core-js/object/keys":11,"babel-runtime/helpers/typeof":20,"edtf/src/parser":122}],2:[function(require,module,exports){
'use strict';

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var DAY = /^days?$/i;
var MONTH = /^months?$/i;
var YEAR = /^years?$/i;
var SYMBOL = /^[xX]$/;
var SYMBOLS = /[xX]/g;
var PATTERN = /^[0-9xXdDmMyY]{8}$/;
var YYYYMMDD = 'YYYYMMDD'.split('');
var MAXDAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

var pow = Math.pow,
    max = Math.max,
    min = Math.min;

/**
 * Bitmasks are used to set Unspecified, Uncertain and
 * Approximate flags for a Date. The bitmask for one
 * feature corresponds to a numeric value based on the
 * following pattern:
 *
 *           YYYYMMDD
 *           --------
 *   Day     00000011
 *   Month   00001100
 *   Year    11110000
 *
 */

var Bitmask = function () {
  (0, _createClass3.default)(Bitmask, null, [{
    key: 'test',
    value: function test(a, b) {
      return this.convert(a) & this.convert(b);
    }
  }, {
    key: 'convert',
    value: function convert() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      // eslint-disable-line complexity
      value = value || 0;

      if (value instanceof Bitmask) return value.value;

      switch (typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value)) {
        case 'number':
          return value;

        case 'boolean':
          return value ? Bitmask.YMD : 0;

        case 'string':
          if (DAY.test(value)) return Bitmask.DAY;
          if (MONTH.test(value)) return Bitmask.MONTH;
          if (YEAR.test(value)) return Bitmask.YEAR;
          if (PATTERN.test(value)) return Bitmask.compute(value);
        // fall through!

        default:
          throw new Error('invalid value: ' + value);
      }
    }
  }, {
    key: 'compute',
    value: function compute(value) {
      return value.split('').reduce(function (memo, c, idx) {
        return memo | (SYMBOL.test(c) ? pow(2, idx) : 0);
      }, 0);
    }
  }, {
    key: 'values',
    value: function values(mask) {
      var digit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      var num = Bitmask.numbers(mask, digit).split('');
      var values = [Number(num.slice(0, 4).join(''))];

      if (num.length > 4) values.push(Number(num.slice(4, 6).join('')));
      if (num.length > 6) values.push(Number(num.slice(6, 8).join('')));

      return Bitmask.normalize(values);
    }
  }, {
    key: 'numbers',
    value: function numbers(mask) {
      var digit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      return mask.replace(SYMBOLS, digit);
    }
  }, {
    key: 'normalize',
    value: function normalize(values) {
      if (values.length > 1) values[1] = min(11, max(0, values[1] - 1));

      if (values.length > 2) values[2] = min(MAXDAYS[values[1]] || NaN, max(1, values[2]));

      return values;
    }
  }]);

  function Bitmask() {
    var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    (0, _classCallCheck3.default)(this, Bitmask);

    this.value = Bitmask.convert(value);
  }

  (0, _createClass3.default)(Bitmask, [{
    key: 'test',
    value: function test() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      return this.value & Bitmask.convert(value);
    }
  }, {
    key: 'bit',
    value: function bit(k) {
      return this.value & pow(2, k);
    }
  }, {
    key: 'add',
    value: function add(value) {
      return this.value = this.value | Bitmask.convert(value), this;
    }
  }, {
    key: 'set',
    value: function set() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      return this.value = Bitmask.convert(value), this;
    }
  }, {
    key: 'mask',
    value: function mask() {
      var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : YYYYMMDD;

      var _this = this;

      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var symbol = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'X';

      return input.map(function (c, idx) {
        return _this.bit(offset + idx) ? symbol : c;
      });
    }
  }, {
    key: 'masks',
    value: function masks(values) {
      var _this2 = this;

      var symbol = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'X';

      var offset = 0;

      return values.map(function (value) {
        var mask = _this2.mask(value.split(''), offset, symbol);
        offset = offset + mask.length;

        return mask.join('');
      });
    }
  }, {
    key: 'max',
    value: function max(_ref) {
      var _ref2 = (0, _slicedToArray3.default)(_ref, 3),
          year = _ref2[0],
          month = _ref2[1],
          day = _ref2[2];

      // eslint-disable-line complexity
      if (!year) return [];

      year = Number(this.test(Bitmask.YEAR) ? this.masks([year], '9')[0] : year);

      if (!month) return [year];

      month = Number(month) - 1;

      switch (this.test(Bitmask.MONTH)) {
        case Bitmask.MONTH:
          month = 11;
          break;
        case Bitmask.MX:
          month = month < 9 ? 8 : 11;
          break;
        case Bitmask.XM:
          month = (month + 1) % 10;
          month = month < 3 ? month + 9 : month - 1;
          break;
      }

      if (!day) return [year, month];

      day = Number(day);

      switch (this.test(Bitmask.DAY)) {
        case Bitmask.DAY:
          day = MAXDAYS[month];
          break;
        case Bitmask.DX:
          day = min(MAXDAYS[month], day + (9 - day % 10));
          break;
        case Bitmask.XD:
          day = day % 10;

          if (month === 1) {
            day = day === 9 && !leap(year) ? day + 10 : day + 20;
          } else {
            day = day < 2 ? day + 30 : day + 20;
            if (day > MAXDAYS[month]) day = day - 10;
          }

          break;
      }

      if (month === 1 && day > 28 && !leap(year)) {
        day = 28;
      }

      return [year, month, day];
    }
  }, {
    key: 'marks',
    value: function marks(values) {
      var _this3 = this;

      var symbol = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '?';

      return values.map(function (value, idx) {
        return [_this3.qualified(idx * 2) ? symbol : '', value, _this3.qualified(idx * 2 + 1) ? symbol : ''].join('');
      });
    }
  }, {
    key: 'qualified',
    value: function qualified(idx) {
      // eslint-disable-line complexity
      switch (idx) {
        case 1:
          return this.value === Bitmask.YEAR || this.value & Bitmask.YEAR && !(this.value & Bitmask.MONTH);
        case 2:
          return this.value === Bitmask.MONTH || this.value & Bitmask.MONTH && !(this.value & Bitmask.YEAR);
        case 3:
          return this.value === Bitmask.YM;
        case 4:
          return this.value === Bitmask.DAY || this.value & Bitmask.DAY && this.value !== Bitmask.YMD;
        case 5:
          return this.value === Bitmask.YMD;
        default:
          return false;
      }
    }
  }, {
    key: 'qualify',
    value: function qualify(idx) {
      return this.value = this.value | Bitmask.UA[idx], this;
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return this.value;
    }
  }, {
    key: 'toString',
    value: function toString() {
      var symbol = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'X';

      return this.masks(['YYYY', 'MM', 'DD'], symbol).join('-');
    }
  }, {
    key: 'day',
    get: function get() {
      return this.test(Bitmask.DAY);
    }
  }, {
    key: 'month',
    get: function get() {
      return this.test(Bitmask.MONTH);
    }
  }, {
    key: 'year',
    get: function get() {
      return this.test(Bitmask.YEAR);
    }
  }]);
  return Bitmask;
}();

Bitmask.prototype.is = Bitmask.prototype.test;

function leap(year) {
  if (year % 4 > 0) return false;
  if (year % 100 > 0) return true;
  if (year % 400 > 0) return false;
  return true;
}

Bitmask.DAY = Bitmask.D = Bitmask.compute('yyyymmxx');
Bitmask.MONTH = Bitmask.M = Bitmask.compute('yyyyxxdd');
Bitmask.YEAR = Bitmask.Y = Bitmask.compute('xxxxmmdd');

Bitmask.MD = Bitmask.M | Bitmask.D;
Bitmask.YMD = Bitmask.Y | Bitmask.MD;
Bitmask.YM = Bitmask.Y | Bitmask.M;

Bitmask.YYXX = Bitmask.compute('yyxxmmdd');
Bitmask.YYYX = Bitmask.compute('yyyxmmdd');
Bitmask.XXXX = Bitmask.compute('xxxxmmdd');

Bitmask.DX = Bitmask.compute('yyyymmdx');
Bitmask.XD = Bitmask.compute('yyyymmxd');
Bitmask.MX = Bitmask.compute('yyyymxdd');
Bitmask.XM = Bitmask.compute('yyyyxmdd');

/*
 * Map each UA symbol position to a mask.
 *
 *   ~YYYY~-~MM~-~DD~
 *   0    1 2  3 4  5
 */
Bitmask.UA = [Bitmask.YEAR, Bitmask.YEAR, // YEAR !DAY
Bitmask.MONTH, Bitmask.YM, Bitmask.DAY, // YEARDAY
Bitmask.YMD];

module.exports = Bitmask;

},{"babel-runtime/helpers/classCallCheck":15,"babel-runtime/helpers/createClass":16,"babel-runtime/helpers/slicedToArray":18,"babel-runtime/helpers/typeof":20}],3:[function(require,module,exports){
'use strict';

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
  function id(x) {
    return x[0];
  }

  var _require = require('./util'),
      num = _require.num,
      zero = _require.zero,
      nothing = _require.nothing,
      pick = _require.pick,
      pluck = _require.pluck,
      join = _require.join,
      concat = _require.concat,
      merge = _require.merge,
      century = _require.century,
      interval = _require.interval,
      list = _require.list,
      masked = _require.masked,
      date = _require.date,
      datetime = _require.datetime,
      season = _require.season,
      qualify = _require.qualify,
      year = _require.year,
      decade = _require.decade;

  var _require2 = require('./bitmask'),
      DAY = _require2.DAY,
      MONTH = _require2.MONTH,
      YEAR = _require2.YEAR,
      YMD = _require2.YMD,
      YM = _require2.YM,
      MD = _require2.MD,
      YYXX = _require2.YYXX,
      YYYX = _require2.YYYX,
      XXXX = _require2.XXXX;

  var grammar = {
    ParserRules: [{ "name": "edtf", "symbols": ["L0"], "postprocess": id }, { "name": "edtf", "symbols": ["L1"], "postprocess": id }, { "name": "edtf", "symbols": ["L2"], "postprocess": id }, { "name": "L0", "symbols": ["date_time"], "postprocess": id }, { "name": "L0", "symbols": ["century"], "postprocess": id }, { "name": "L0", "symbols": ["L0i"], "postprocess": id }, { "name": "L0i", "symbols": ["date_time", { "literal": "/" }, "date_time"], "postprocess": interval(0) }, { "name": "century", "symbols": ["positive_century"], "postprocess": function postprocess(data) {
        return century(data[0]);
      } }, { "name": "century$string$1", "symbols": [{ "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "century", "symbols": ["century$string$1"], "postprocess": function postprocess(data) {
        return century(0);
      } }, { "name": "century", "symbols": [{ "literal": "-" }, "positive_century"], "postprocess": function postprocess(data) {
        return century(-data[1]);
      } }, { "name": "positive_century", "symbols": ["positive_digit", "digit"], "postprocess": num }, { "name": "positive_century", "symbols": [{ "literal": "0" }, "positive_digit"], "postprocess": num }, { "name": "date_time", "symbols": ["date"], "postprocess": id }, { "name": "date_time", "symbols": ["datetime"], "postprocess": id }, { "name": "date", "symbols": ["year"], "postprocess": function postprocess(data) {
        return date(data);
      } }, { "name": "date", "symbols": ["year_month"], "postprocess": function postprocess(data) {
        return date(data[0]);
      } }, { "name": "date", "symbols": ["year_month_day"], "postprocess": function postprocess(data) {
        return date(data[0]);
      } }, { "name": "year", "symbols": ["positive_year"], "postprocess": id }, { "name": "year", "symbols": ["negative_year"], "postprocess": id }, { "name": "year$string$1", "symbols": [{ "literal": "0" }, { "literal": "0" }, { "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "year", "symbols": ["year$string$1"], "postprocess": join }, { "name": "positive_year", "symbols": ["positive_digit", "digit", "digit", "digit"], "postprocess": join }, { "name": "positive_year", "symbols": [{ "literal": "0" }, "positive_digit", "digit", "digit"], "postprocess": join }, { "name": "positive_year$string$1", "symbols": [{ "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "positive_year", "symbols": ["positive_year$string$1", "positive_digit", "digit"], "postprocess": join }, { "name": "positive_year$string$2", "symbols": [{ "literal": "0" }, { "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "positive_year", "symbols": ["positive_year$string$2", "positive_digit"], "postprocess": join }, { "name": "negative_year", "symbols": [{ "literal": "-" }, "positive_year"], "postprocess": join }, { "name": "year_month", "symbols": ["year", { "literal": "-" }, "month"], "postprocess": pick(0, 2) }, { "name": "year_month_day", "symbols": ["year", { "literal": "-" }, "month_day"], "postprocess": pick(0, 2) }, { "name": "month", "symbols": ["d01_12"], "postprocess": id }, { "name": "month_day", "symbols": ["m31", { "literal": "-" }, "day"], "postprocess": pick(0, 2) }, { "name": "month_day", "symbols": ["m30", { "literal": "-" }, "d01_30"], "postprocess": pick(0, 2) }, { "name": "month_day$string$1", "symbols": [{ "literal": "0" }, { "literal": "2" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "month_day", "symbols": ["month_day$string$1", { "literal": "-" }, "d01_29"], "postprocess": pick(0, 2) }, { "name": "day", "symbols": ["d01_31"], "postprocess": id }, { "name": "datetime$ebnf$1$subexpression$1", "symbols": ["timezone"], "postprocess": id }, { "name": "datetime$ebnf$1", "symbols": ["datetime$ebnf$1$subexpression$1"], "postprocess": id }, { "name": "datetime$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "datetime", "symbols": ["year_month_day", { "literal": "T" }, "time", "datetime$ebnf$1"], "postprocess": datetime }, { "name": "time", "symbols": ["hours", { "literal": ":" }, "minutes", { "literal": ":" }, "seconds", "milliseconds"], "postprocess": pick(0, 2, 4, 5) }, { "name": "time$string$1", "symbols": [{ "literal": "2" }, { "literal": "4" }, { "literal": ":" }, { "literal": "0" }, { "literal": "0" }, { "literal": ":" }, { "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "time", "symbols": ["time$string$1"], "postprocess": function postprocess() {
        return [24, 0, 0];
      } }, { "name": "hours", "symbols": ["d00_23"], "postprocess": num }, { "name": "minutes", "symbols": ["d00_59"], "postprocess": num }, { "name": "seconds", "symbols": ["d00_59"], "postprocess": num }, { "name": "milliseconds", "symbols": [] }, { "name": "milliseconds", "symbols": [{ "literal": "." }, "d3"], "postprocess": function postprocess(data) {
        return num(data.slice(1));
      } }, { "name": "timezone", "symbols": [{ "literal": "Z" }], "postprocess": zero }, { "name": "timezone", "symbols": [{ "literal": "-" }, "offset"], "postprocess": function postprocess(data) {
        return -data[1];
      } }, { "name": "timezone", "symbols": [{ "literal": "+" }, "positive_offset"], "postprocess": pick(1) }, { "name": "positive_offset", "symbols": ["offset"], "postprocess": id }, { "name": "positive_offset$string$1", "symbols": [{ "literal": "0" }, { "literal": "0" }, { "literal": ":" }, { "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "positive_offset", "symbols": ["positive_offset$string$1"], "postprocess": zero }, { "name": "positive_offset$subexpression$1$string$1", "symbols": [{ "literal": "1" }, { "literal": "2" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "positive_offset$subexpression$1", "symbols": ["positive_offset$subexpression$1$string$1"] }, { "name": "positive_offset$subexpression$1$string$2", "symbols": [{ "literal": "1" }, { "literal": "3" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "positive_offset$subexpression$1", "symbols": ["positive_offset$subexpression$1$string$2"] }, { "name": "positive_offset", "symbols": ["positive_offset$subexpression$1", { "literal": ":" }, "minutes"], "postprocess": function postprocess(data) {
        return num(data[0]) * 60 + data[2];
      } }, { "name": "positive_offset$string$2", "symbols": [{ "literal": "1" }, { "literal": "4" }, { "literal": ":" }, { "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "positive_offset", "symbols": ["positive_offset$string$2"], "postprocess": function postprocess() {
        return 840;
      } }, { "name": "positive_offset", "symbols": ["d00_14"], "postprocess": function postprocess(data) {
        return num(data[0]) * 60;
      } }, { "name": "offset", "symbols": ["d01_11", { "literal": ":" }, "minutes"], "postprocess": function postprocess(data) {
        return num(data[0]) * 60 + data[2];
      } }, { "name": "offset$string$1", "symbols": [{ "literal": "0" }, { "literal": "0" }, { "literal": ":" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "offset", "symbols": ["offset$string$1", "d01_59"], "postprocess": function postprocess(data) {
        return num(data[1]);
      } }, { "name": "offset$string$2", "symbols": [{ "literal": "1" }, { "literal": "2" }, { "literal": ":" }, { "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "offset", "symbols": ["offset$string$2"], "postprocess": function postprocess() {
        return 720;
      } }, { "name": "offset", "symbols": ["d01_12"], "postprocess": function postprocess(data) {
        return num(data[0]) * 60;
      } }, { "name": "L1", "symbols": ["L1d"], "postprocess": id }, { "name": "L1", "symbols": ["L1Y"], "postprocess": id }, { "name": "L1", "symbols": ["L1S"], "postprocess": id }, { "name": "L1", "symbols": ["L1i"], "postprocess": id }, { "name": "L1d", "symbols": ["date_ua"], "postprocess": id }, { "name": "L1d", "symbols": ["L1X"], "postprocess": merge(0, { type: 'Date', level: 1 }) }, { "name": "date_ua", "symbols": ["date", "UA"], "postprocess": merge(0, 1, { level: 1 }) }, { "name": "L1i", "symbols": ["L1i_date", { "literal": "/" }, "L1i_date"], "postprocess": interval(1) }, { "name": "L1i", "symbols": ["date_time", { "literal": "/" }, "L1i_date"], "postprocess": interval(1) }, { "name": "L1i", "symbols": ["L1i_date", { "literal": "/" }, "date_time"], "postprocess": interval(1) }, { "name": "L1i_date", "symbols": [], "postprocess": nothing }, { "name": "L1i_date", "symbols": ["date_ua"], "postprocess": id }, { "name": "L1i_date", "symbols": ["INFINITY"], "postprocess": id }, { "name": "INFINITY", "symbols": [{ "literal": "*" }], "postprocess": function postprocess() {
        return Infinity;
      } }, { "name": "L1X$string$1", "symbols": [{ "literal": "-" }, { "literal": "X" }, { "literal": "X" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "L1X", "symbols": ["d4", { "literal": "-" }, "md", "L1X$string$1"], "postprocess": masked() }, { "name": "L1X$string$2", "symbols": [{ "literal": "-" }, { "literal": "X" }, { "literal": "X" }, { "literal": "-" }, { "literal": "X" }, { "literal": "X" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "L1X", "symbols": ["d4", "L1X$string$2"], "postprocess": masked() }, { "name": "L1X$string$3", "symbols": [{ "literal": "X" }, { "literal": "X" }, { "literal": "X" }, { "literal": "X" }, { "literal": "-" }, { "literal": "X" }, { "literal": "X" }, { "literal": "-" }, { "literal": "X" }, { "literal": "X" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "L1X", "symbols": ["L1X$string$3"], "postprocess": masked() }, { "name": "L1X$string$4", "symbols": [{ "literal": "-" }, { "literal": "X" }, { "literal": "X" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "L1X", "symbols": ["d4", "L1X$string$4"], "postprocess": masked() }, { "name": "L1X$string$5", "symbols": [{ "literal": "X" }, { "literal": "X" }, { "literal": "X" }, { "literal": "X" }, { "literal": "-" }, { "literal": "X" }, { "literal": "X" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "L1X", "symbols": ["L1X$string$5"], "postprocess": masked() }, { "name": "L1X$string$6", "symbols": [{ "literal": "X" }, { "literal": "X" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "L1X", "symbols": ["d2", "L1X$string$6"], "postprocess": masked() }, { "name": "L1X", "symbols": ["d3", { "literal": "X" }], "postprocess": masked() }, { "name": "L1X$string$7", "symbols": [{ "literal": "X" }, { "literal": "X" }, { "literal": "X" }, { "literal": "X" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "L1X", "symbols": ["L1X$string$7"], "postprocess": masked() }, { "name": "L1Y", "symbols": [{ "literal": "Y" }, "d5+"], "postprocess": function postprocess(data) {
        return year([num(data[1])], 1);
      } }, { "name": "L1Y$string$1", "symbols": [{ "literal": "Y" }, { "literal": "-" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "L1Y", "symbols": ["L1Y$string$1", "d5+"], "postprocess": function postprocess(data) {
        return year([-num(data[1])], 1);
      } }, { "name": "UA", "symbols": [{ "literal": "?" }], "postprocess": function postprocess() {
        return { uncertain: true };
      } }, { "name": "UA", "symbols": [{ "literal": "~" }], "postprocess": function postprocess() {
        return { approximate: true };
      } }, { "name": "UA", "symbols": [{ "literal": "%" }], "postprocess": function postprocess() {
        return { approximate: true, uncertain: true };
      } }, { "name": "L1S", "symbols": ["year", { "literal": "-" }, "d21_24"], "postprocess": function postprocess(data) {
        return season(data, 1);
      } }, { "name": "L2", "symbols": ["L2d"], "postprocess": id }, { "name": "L2", "symbols": ["L2Y"], "postprocess": id }, { "name": "L2", "symbols": ["L2S"], "postprocess": id }, { "name": "L2", "symbols": ["L2D"], "postprocess": id }, { "name": "L2", "symbols": ["L2i"], "postprocess": id }, { "name": "L2", "symbols": ["set"], "postprocess": id }, { "name": "L2", "symbols": ["list"], "postprocess": id }, { "name": "L2d", "symbols": ["ua_date"], "postprocess": id }, { "name": "L2d", "symbols": ["L2X"], "postprocess": merge(0, { type: 'Date', level: 2 }) }, { "name": "L2D", "symbols": ["decade"], "postprocess": id }, { "name": "L2D", "symbols": ["decade", "UA"], "postprocess": merge(0, 1) }, { "name": "ua_date", "symbols": ["ua_year"], "postprocess": qualify }, { "name": "ua_date", "symbols": ["ua_year_month"], "postprocess": qualify }, { "name": "ua_date", "symbols": ["ua_year_month_day"], "postprocess": qualify }, { "name": "ua_year", "symbols": ["UA", "year"], "postprocess": function postprocess(data) {
        return [data];
      } }, { "name": "ua_year_month$macrocall$2", "symbols": ["year"] }, { "name": "ua_year_month$macrocall$1$ebnf$1", "symbols": ["UA"], "postprocess": id }, { "name": "ua_year_month$macrocall$1$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_year_month$macrocall$1$ebnf$2", "symbols": ["UA"], "postprocess": id }, { "name": "ua_year_month$macrocall$1$ebnf$2", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_year_month$macrocall$1", "symbols": ["ua_year_month$macrocall$1$ebnf$1", "ua_year_month$macrocall$2", "ua_year_month$macrocall$1$ebnf$2"] }, { "name": "ua_year_month$macrocall$4", "symbols": ["month"] }, { "name": "ua_year_month$macrocall$3$ebnf$1", "symbols": ["UA"], "postprocess": id }, { "name": "ua_year_month$macrocall$3$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_year_month$macrocall$3$ebnf$2", "symbols": ["UA"], "postprocess": id }, { "name": "ua_year_month$macrocall$3$ebnf$2", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_year_month$macrocall$3", "symbols": ["ua_year_month$macrocall$3$ebnf$1", "ua_year_month$macrocall$4", "ua_year_month$macrocall$3$ebnf$2"] }, { "name": "ua_year_month", "symbols": ["ua_year_month$macrocall$1", { "literal": "-" }, "ua_year_month$macrocall$3"], "postprocess": pluck(0, 2) }, { "name": "ua_year_month_day$macrocall$2", "symbols": ["year"] }, { "name": "ua_year_month_day$macrocall$1$ebnf$1", "symbols": ["UA"], "postprocess": id }, { "name": "ua_year_month_day$macrocall$1$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_year_month_day$macrocall$1$ebnf$2", "symbols": ["UA"], "postprocess": id }, { "name": "ua_year_month_day$macrocall$1$ebnf$2", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_year_month_day$macrocall$1", "symbols": ["ua_year_month_day$macrocall$1$ebnf$1", "ua_year_month_day$macrocall$2", "ua_year_month_day$macrocall$1$ebnf$2"] }, { "name": "ua_year_month_day", "symbols": ["ua_year_month_day$macrocall$1", { "literal": "-" }, "ua_month_day"], "postprocess": function postprocess(data) {
        return [data[0]].concat((0, _toConsumableArray3.default)(data[2]));
      } }, { "name": "ua_month_day$macrocall$2", "symbols": ["m31"] }, { "name": "ua_month_day$macrocall$1$ebnf$1", "symbols": ["UA"], "postprocess": id }, { "name": "ua_month_day$macrocall$1$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_month_day$macrocall$1$ebnf$2", "symbols": ["UA"], "postprocess": id }, { "name": "ua_month_day$macrocall$1$ebnf$2", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_month_day$macrocall$1", "symbols": ["ua_month_day$macrocall$1$ebnf$1", "ua_month_day$macrocall$2", "ua_month_day$macrocall$1$ebnf$2"] }, { "name": "ua_month_day$macrocall$4", "symbols": ["day"] }, { "name": "ua_month_day$macrocall$3$ebnf$1", "symbols": ["UA"], "postprocess": id }, { "name": "ua_month_day$macrocall$3$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_month_day$macrocall$3$ebnf$2", "symbols": ["UA"], "postprocess": id }, { "name": "ua_month_day$macrocall$3$ebnf$2", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_month_day$macrocall$3", "symbols": ["ua_month_day$macrocall$3$ebnf$1", "ua_month_day$macrocall$4", "ua_month_day$macrocall$3$ebnf$2"] }, { "name": "ua_month_day", "symbols": ["ua_month_day$macrocall$1", { "literal": "-" }, "ua_month_day$macrocall$3"], "postprocess": pluck(0, 2) }, { "name": "ua_month_day$macrocall$6", "symbols": ["m30"] }, { "name": "ua_month_day$macrocall$5$ebnf$1", "symbols": ["UA"], "postprocess": id }, { "name": "ua_month_day$macrocall$5$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_month_day$macrocall$5$ebnf$2", "symbols": ["UA"], "postprocess": id }, { "name": "ua_month_day$macrocall$5$ebnf$2", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_month_day$macrocall$5", "symbols": ["ua_month_day$macrocall$5$ebnf$1", "ua_month_day$macrocall$6", "ua_month_day$macrocall$5$ebnf$2"] }, { "name": "ua_month_day$macrocall$8", "symbols": ["d01_30"] }, { "name": "ua_month_day$macrocall$7$ebnf$1", "symbols": ["UA"], "postprocess": id }, { "name": "ua_month_day$macrocall$7$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_month_day$macrocall$7$ebnf$2", "symbols": ["UA"], "postprocess": id }, { "name": "ua_month_day$macrocall$7$ebnf$2", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_month_day$macrocall$7", "symbols": ["ua_month_day$macrocall$7$ebnf$1", "ua_month_day$macrocall$8", "ua_month_day$macrocall$7$ebnf$2"] }, { "name": "ua_month_day", "symbols": ["ua_month_day$macrocall$5", { "literal": "-" }, "ua_month_day$macrocall$7"], "postprocess": pluck(0, 2) }, { "name": "ua_month_day$macrocall$10$string$1", "symbols": [{ "literal": "0" }, { "literal": "2" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "ua_month_day$macrocall$10", "symbols": ["ua_month_day$macrocall$10$string$1"] }, { "name": "ua_month_day$macrocall$9$ebnf$1", "symbols": ["UA"], "postprocess": id }, { "name": "ua_month_day$macrocall$9$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_month_day$macrocall$9$ebnf$2", "symbols": ["UA"], "postprocess": id }, { "name": "ua_month_day$macrocall$9$ebnf$2", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_month_day$macrocall$9", "symbols": ["ua_month_day$macrocall$9$ebnf$1", "ua_month_day$macrocall$10", "ua_month_day$macrocall$9$ebnf$2"] }, { "name": "ua_month_day$macrocall$12", "symbols": ["d01_29"] }, { "name": "ua_month_day$macrocall$11$ebnf$1", "symbols": ["UA"], "postprocess": id }, { "name": "ua_month_day$macrocall$11$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_month_day$macrocall$11$ebnf$2", "symbols": ["UA"], "postprocess": id }, { "name": "ua_month_day$macrocall$11$ebnf$2", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ua_month_day$macrocall$11", "symbols": ["ua_month_day$macrocall$11$ebnf$1", "ua_month_day$macrocall$12", "ua_month_day$macrocall$11$ebnf$2"] }, { "name": "ua_month_day", "symbols": ["ua_month_day$macrocall$9", { "literal": "-" }, "ua_month_day$macrocall$11"], "postprocess": pluck(0, 2) }, { "name": "L2X", "symbols": ["dx4"], "postprocess": masked() }, { "name": "L2X", "symbols": ["dx4", { "literal": "-" }, "mx"], "postprocess": masked() }, { "name": "L2X", "symbols": ["dx4", { "literal": "-" }, "mdx"], "postprocess": masked() }, { "name": "mdx", "symbols": ["m31x", { "literal": "-" }, "d31x"], "postprocess": join }, { "name": "mdx", "symbols": ["m30x", { "literal": "-" }, "d30x"], "postprocess": join }, { "name": "mdx$string$1", "symbols": [{ "literal": "0" }, { "literal": "2" }, { "literal": "-" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "mdx", "symbols": ["mdx$string$1", "d29x"], "postprocess": join }, { "name": "L2i", "symbols": ["L2i_date", { "literal": "/" }, "L2i_date"], "postprocess": interval(2) }, { "name": "L2i", "symbols": ["date_time", { "literal": "/" }, "L2i_date"], "postprocess": interval(2) }, { "name": "L2i", "symbols": ["L2i_date", { "literal": "/" }, "date_time"], "postprocess": interval(2) }, { "name": "L2i_date", "symbols": [], "postprocess": nothing }, { "name": "L2i_date", "symbols": ["ua_date"], "postprocess": id }, { "name": "L2i_date", "symbols": ["L2X"], "postprocess": id }, { "name": "L2i_date", "symbols": ["INFINITY"], "postprocess": id }, { "name": "L2Y", "symbols": ["exp_year"], "postprocess": id }, { "name": "L2Y", "symbols": ["exp_year", "significant_digits"], "postprocess": merge(0, 1) }, { "name": "L2Y", "symbols": ["L1Y", "significant_digits"], "postprocess": merge(0, 1, { level: 2 }) }, { "name": "L2Y", "symbols": ["year", "significant_digits"], "postprocess": function postprocess(data) {
        return year([data[0]], 2, data[1]);
      } }, { "name": "significant_digits", "symbols": [{ "literal": "S" }, "positive_digit"], "postprocess": function postprocess(data) {
        return { significant: num(data[1]) };
      } }, { "name": "exp_year", "symbols": [{ "literal": "Y" }, "exp"], "postprocess": function postprocess(data) {
        return year([data[1]], 2);
      } }, { "name": "exp_year$string$1", "symbols": [{ "literal": "Y" }, { "literal": "-" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "exp_year", "symbols": ["exp_year$string$1", "exp"], "postprocess": function postprocess(data) {
        return year([-data[1]], 2);
      } }, { "name": "exp", "symbols": ["digits", { "literal": "E" }, "digits"], "postprocess": function postprocess(data) {
        return num(data[0]) * Math.pow(10, num(data[2]));
      } }, { "name": "L2S", "symbols": ["year", { "literal": "-" }, "d25_41"], "postprocess": function postprocess(data) {
        return season(data, 2);
      } }, { "name": "decade", "symbols": ["positive_decade"], "postprocess": function postprocess(data) {
        return decade(data[0]);
      } }, { "name": "decade$string$1", "symbols": [{ "literal": "0" }, { "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "decade", "symbols": ["decade$string$1"], "postprocess": function postprocess() {
        return decade(0);
      } }, { "name": "decade", "symbols": [{ "literal": "-" }, "positive_decade"], "postprocess": function postprocess(data) {
        return decade(-data[1]);
      } }, { "name": "positive_decade", "symbols": ["positive_digit", "digit", "digit"], "postprocess": num }, { "name": "positive_decade", "symbols": [{ "literal": "0" }, "positive_digit", "digit"], "postprocess": num }, { "name": "positive_decade$string$1", "symbols": [{ "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "positive_decade", "symbols": ["positive_decade$string$1", "positive_digit"], "postprocess": num }, { "name": "set", "symbols": ["LSB", "OL", "RSB"], "postprocess": list }, { "name": "list", "symbols": ["LLB", "OL", "RLB"], "postprocess": list }, { "name": "LSB", "symbols": [{ "literal": "[" }], "postprocess": function postprocess() {
        return { type: 'Set' };
      } }, { "name": "LSB$string$1", "symbols": [{ "literal": "[" }, { "literal": "." }, { "literal": "." }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "LSB", "symbols": ["LSB$string$1"], "postprocess": function postprocess() {
        return { type: 'Set', earlier: true };
      } }, { "name": "LLB", "symbols": [{ "literal": "{" }], "postprocess": function postprocess() {
        return { type: 'List' };
      } }, { "name": "RSB", "symbols": [{ "literal": "]" }], "postprocess": nothing }, { "name": "RSB$string$1", "symbols": [{ "literal": "." }, { "literal": "." }, { "literal": "]" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "RSB", "symbols": ["RSB$string$1"], "postprocess": function postprocess() {
        return { later: true };
      } }, { "name": "RLB", "symbols": [{ "literal": "}" }], "postprocess": nothing }, { "name": "OL", "symbols": ["LI"], "postprocess": function postprocess(data) {
        return [data[0]];
      } }, { "name": "OL", "symbols": ["OL", "_", { "literal": "," }, "_", "LI"], "postprocess": function postprocess(data) {
        return [].concat((0, _toConsumableArray3.default)(data[0]), [data[4]]);
      } }, { "name": "LI", "symbols": ["date"], "postprocess": id }, { "name": "LI", "symbols": ["ua_date"], "postprocess": id }, { "name": "LI", "symbols": ["L2X"], "postprocess": id }, { "name": "LI", "symbols": ["consecutives"], "postprocess": id }, { "name": "consecutives$string$1", "symbols": [{ "literal": "." }, { "literal": "." }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "consecutives", "symbols": ["year_month_day", "consecutives$string$1", "year_month_day"], "postprocess": function postprocess(d) {
        return [date(d[0]), date(d[2])];
      } }, { "name": "consecutives$string$2", "symbols": [{ "literal": "." }, { "literal": "." }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "consecutives", "symbols": ["year_month", "consecutives$string$2", "year_month"], "postprocess": function postprocess(d) {
        return [date(d[0]), date(d[2])];
      } }, { "name": "consecutives$string$3", "symbols": [{ "literal": "." }, { "literal": "." }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "consecutives", "symbols": ["year", "consecutives$string$3", "year"], "postprocess": function postprocess(d) {
        return [date([d[0]]), date([d[2]])];
      } }, { "name": "digit", "symbols": ["positive_digit"], "postprocess": id }, { "name": "digit", "symbols": [{ "literal": "0" }], "postprocess": id }, { "name": "digits", "symbols": ["digit"], "postprocess": id }, { "name": "digits", "symbols": ["digits", "digit"], "postprocess": join }, { "name": "d4", "symbols": ["d2", "d2"], "postprocess": join }, { "name": "d3", "symbols": ["d2", "digit"], "postprocess": join }, { "name": "d2", "symbols": ["digit", "digit"], "postprocess": join }, { "name": "d5+", "symbols": ["positive_digit", "d3", "digits"], "postprocess": num }, { "name": "d1x", "symbols": [/[1-9X]/], "postprocess": id }, { "name": "dx", "symbols": ["d1x"], "postprocess": id }, { "name": "dx", "symbols": [{ "literal": "0" }], "postprocess": id }, { "name": "dx2", "symbols": ["dx", "dx"], "postprocess": join }, { "name": "dx4", "symbols": ["dx2", "dx2"], "postprocess": join }, { "name": "md", "symbols": ["m31"], "postprocess": id }, { "name": "md", "symbols": ["m30"], "postprocess": id }, { "name": "md$string$1", "symbols": [{ "literal": "0" }, { "literal": "2" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "md", "symbols": ["md$string$1"], "postprocess": id }, { "name": "mx", "symbols": [{ "literal": "0" }, "d1x"], "postprocess": join }, { "name": "mx", "symbols": [/[1X]/, /[012X]/], "postprocess": join }, { "name": "m31x", "symbols": [/[0X]/, /[13578X]/], "postprocess": join }, { "name": "m31x", "symbols": [/[1X]/, /[02]/], "postprocess": join }, { "name": "m31x$string$1", "symbols": [{ "literal": "1" }, { "literal": "X" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m31x", "symbols": ["m31x$string$1"], "postprocess": id }, { "name": "m30x", "symbols": [/[0X]/, /[469]/], "postprocess": join }, { "name": "m30x$string$1", "symbols": [{ "literal": "1" }, { "literal": "1" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m30x", "symbols": ["m30x$string$1"], "postprocess": join }, { "name": "d29x", "symbols": [{ "literal": "0" }, "d1x"], "postprocess": join }, { "name": "d29x", "symbols": [/[1-2X]/, "dx"], "postprocess": join }, { "name": "d30x", "symbols": ["d29x"], "postprocess": join }, { "name": "d30x$string$1", "symbols": [{ "literal": "3" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "d30x", "symbols": ["d30x$string$1"], "postprocess": id }, { "name": "d31x", "symbols": ["d30x"], "postprocess": id }, { "name": "d31x", "symbols": [{ "literal": "3" }, /[1X]/], "postprocess": join }, { "name": "positive_digit", "symbols": [/[1-9]/], "postprocess": id }, { "name": "m31$subexpression$1$string$1", "symbols": [{ "literal": "0" }, { "literal": "1" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m31$subexpression$1", "symbols": ["m31$subexpression$1$string$1"] }, { "name": "m31$subexpression$1$string$2", "symbols": [{ "literal": "0" }, { "literal": "3" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m31$subexpression$1", "symbols": ["m31$subexpression$1$string$2"] }, { "name": "m31$subexpression$1$string$3", "symbols": [{ "literal": "0" }, { "literal": "5" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m31$subexpression$1", "symbols": ["m31$subexpression$1$string$3"] }, { "name": "m31$subexpression$1$string$4", "symbols": [{ "literal": "0" }, { "literal": "7" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m31$subexpression$1", "symbols": ["m31$subexpression$1$string$4"] }, { "name": "m31$subexpression$1$string$5", "symbols": [{ "literal": "0" }, { "literal": "8" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m31$subexpression$1", "symbols": ["m31$subexpression$1$string$5"] }, { "name": "m31$subexpression$1$string$6", "symbols": [{ "literal": "1" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m31$subexpression$1", "symbols": ["m31$subexpression$1$string$6"] }, { "name": "m31$subexpression$1$string$7", "symbols": [{ "literal": "1" }, { "literal": "2" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m31$subexpression$1", "symbols": ["m31$subexpression$1$string$7"] }, { "name": "m31", "symbols": ["m31$subexpression$1"], "postprocess": id }, { "name": "m30$subexpression$1$string$1", "symbols": [{ "literal": "0" }, { "literal": "4" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m30$subexpression$1", "symbols": ["m30$subexpression$1$string$1"] }, { "name": "m30$subexpression$1$string$2", "symbols": [{ "literal": "0" }, { "literal": "6" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m30$subexpression$1", "symbols": ["m30$subexpression$1$string$2"] }, { "name": "m30$subexpression$1$string$3", "symbols": [{ "literal": "0" }, { "literal": "9" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m30$subexpression$1", "symbols": ["m30$subexpression$1$string$3"] }, { "name": "m30$subexpression$1$string$4", "symbols": [{ "literal": "1" }, { "literal": "1" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "m30$subexpression$1", "symbols": ["m30$subexpression$1$string$4"] }, { "name": "m30", "symbols": ["m30$subexpression$1"], "postprocess": id }, { "name": "d01_11", "symbols": [{ "literal": "0" }, "positive_digit"], "postprocess": join }, { "name": "d01_11", "symbols": [{ "literal": "1" }, /[0-1]/], "postprocess": join }, { "name": "d01_12", "symbols": ["d01_11"], "postprocess": id }, { "name": "d01_12$string$1", "symbols": [{ "literal": "1" }, { "literal": "2" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "d01_12", "symbols": ["d01_12$string$1"], "postprocess": id }, { "name": "d01_13", "symbols": ["d01_12"], "postprocess": id }, { "name": "d01_13$string$1", "symbols": [{ "literal": "1" }, { "literal": "3" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "d01_13", "symbols": ["d01_13$string$1"], "postprocess": id }, { "name": "d00_14$string$1", "symbols": [{ "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "d00_14", "symbols": ["d00_14$string$1"], "postprocess": id }, { "name": "d00_14", "symbols": ["d01_13"], "postprocess": id }, { "name": "d00_14$string$2", "symbols": [{ "literal": "1" }, { "literal": "4" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "d00_14", "symbols": ["d00_14$string$2"], "postprocess": id }, { "name": "d00_23$string$1", "symbols": [{ "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "d00_23", "symbols": ["d00_23$string$1"], "postprocess": id }, { "name": "d00_23", "symbols": ["d01_23"], "postprocess": id }, { "name": "d01_23", "symbols": [{ "literal": "0" }, "positive_digit"], "postprocess": join }, { "name": "d01_23", "symbols": [{ "literal": "1" }, "digit"], "postprocess": join }, { "name": "d01_23", "symbols": [{ "literal": "2" }, /[0-3]/], "postprocess": join }, { "name": "d01_29", "symbols": [{ "literal": "0" }, "positive_digit"], "postprocess": join }, { "name": "d01_29", "symbols": [/[1-2]/, "digit"], "postprocess": join }, { "name": "d01_30", "symbols": ["d01_29"], "postprocess": id }, { "name": "d01_30$string$1", "symbols": [{ "literal": "3" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "d01_30", "symbols": ["d01_30$string$1"], "postprocess": id }, { "name": "d01_31", "symbols": ["d01_30"], "postprocess": id }, { "name": "d01_31$string$1", "symbols": [{ "literal": "3" }, { "literal": "1" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "d01_31", "symbols": ["d01_31$string$1"], "postprocess": id }, { "name": "d00_59$string$1", "symbols": [{ "literal": "0" }, { "literal": "0" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "d00_59", "symbols": ["d00_59$string$1"], "postprocess": id }, { "name": "d00_59", "symbols": ["d01_59"], "postprocess": id }, { "name": "d01_59", "symbols": ["d01_29"], "postprocess": id }, { "name": "d01_59", "symbols": [/[345]/, "digit"], "postprocess": join }, { "name": "d21_24", "symbols": [{ "literal": "2" }, /[1-4]/], "postprocess": join }, { "name": "d25_41", "symbols": [{ "literal": "2" }, /[5-9]/], "postprocess": join }, { "name": "d25_41", "symbols": [{ "literal": "3" }, "digit"], "postprocess": join }, { "name": "d25_41", "symbols": [{ "literal": "4" }, /[01]/], "postprocess": join }, { "name": "_$ebnf$1", "symbols": [] }, { "name": "_$ebnf$1", "symbols": [{ "literal": " " }, "_$ebnf$1"], "postprocess": function arrconcat(d) {
        return [d[0]].concat(d[1]);
      } }, { "name": "_", "symbols": ["_$ebnf$1"] }],
    ParserStart: "edtf"
  };
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = grammar;
  } else {
    window.grammar = grammar;
  }
})();

},{"./bitmask":2,"./util":5,"babel-runtime/helpers/toConsumableArray":19}],4:[function(require,module,exports){
'use strict';

var nearley = require('nearley');
var grammar = require('./grammar');

function byLevel(a, b) {
  return a.level < b.level ? -1 : a.level > b.level ? 1 : 0;
}

function limit(results, _ref) {
  var level = _ref.level,
      types = _ref.types;

  if (!results.length) return results;
  if (typeof level !== 'number') level = 2;

  return results.filter(function (res) {
    return level >= res.level && (!types || types.includes(res.type));
  });
}

function best(results) {
  if (results.length < 2) return results[0];

  // If there are multiple results, pick the first
  // one on the lowest level!
  return results.sort(byLevel)[0];
}

module.exports = {
  parse: function parse(input) {
    var constraints = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    try {
      var nep = module.exports.parser();
      var res = best(limit(nep.feed(input).results, constraints));

      if (!res) throw new Error('edtf: No possible parsings (@EOS)');

      return res;
    } catch (error) {
      error.message += ' for "' + input + '"';
      throw error;
    }
  },
  parser: function parser() {
    return new nearley.Parser(grammar.ParserRules, grammar.ParserStart);
  }
};

},{"./grammar":3,"nearley":124}],5:[function(require,module,exports){
'use strict';

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var Bitmask = require('./bitmask');
var assign = _assign2.default;

var util = {
  num: function num(data) {
    return Number(Array.isArray(data) ? data.join('') : data);
  },
  join: function join(data) {
    return data.join('');
  },
  zero: function zero() {
    return 0;
  },
  nothing: function nothing() {
    return null;
  },
  pick: function pick() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return args.length === 1 ? function (data) {
      return data[args[0]];
    } : function (data) {
      return util.concat(data, args);
    };
  },
  pluck: function pluck() {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return function (data) {
      return args.map(function (i) {
        return data[i];
      });
    };
  },
  concat: function concat(data) {
    var idx = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : data.keys();

    return (0, _from2.default)(idx).reduce(function (memo, i) {
      return data[i] !== null ? memo.concat(data[i]) : memo;
    }, []);
  },
  merge: function merge() {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    if ((0, _typeof3.default)(args[args.length - 1]) === 'object') var extra = args.pop();

    return function (data) {
      return assign(args.reduce(function (a, i) {
        return assign(a, data[i]);
      }, {}), extra);
    };
  },
  interval: function interval(level) {
    return function (data) {
      return {
        values: [data[0], data[2]],
        type: 'Interval',
        level: level
      };
    };
  },
  masked: function masked() {
    var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'unspecified';
    var symbol = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'X';

    return function (data, _, reject) {
      var mask = data.join('').replace(/-/g, '');

      return mask.indexOf(symbol) === -1 ? reject : (0, _defineProperty3.default)({
        values: Bitmask.values(mask)
      }, type, Bitmask.compute(mask));
    };
  },
  date: function date(values) {
    var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var extra = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    return assign({
      type: 'Date',
      level: level,
      values: Bitmask.normalize(values.map(Number))
    }, extra);
  },
  year: function year(values) {
    var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var extra = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    return assign({
      type: 'Year',
      level: level,
      values: values.map(Number)
    }, extra);
  },
  century: function century(_century) {
    var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    return {
      type: 'Century',
      level: level,
      values: [_century]
    };
  },
  decade: function decade(_decade) {
    var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;

    return {
      type: 'Decade',
      level: level,
      values: [_decade]
    };
  },
  datetime: function datetime(data) {
    return {
      values: Bitmask.normalize(data[0].map(Number)).concat(data[2]),
      offset: data[3],
      type: 'Date',
      level: 0
    };
  },
  season: function season(data) {
    var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    return {
      type: 'Season',
      level: level,
      values: [Number(data[0]), Number(data[2])]
    };
  },
  list: function list(data) {
    return assign({ values: data[1], level: 2 }, data[0], data[2]);
  },
  qualify: function qualify(_ref2, _, reject) {
    var _ref3 = (0, _slicedToArray3.default)(_ref2, 1),
        parts = _ref3[0];

    var q = {
      uncertain: new Bitmask(), approximate: new Bitmask()
    };

    var values = parts.map(function (_ref4, idx) {
      var _ref5 = (0, _slicedToArray3.default)(_ref4, 3),
          lhs = _ref5[0],
          part = _ref5[1],
          rhs = _ref5[2];

      for (var ua in lhs) {
        q[ua].qualify(idx * 2);
      }for (var _ua in rhs) {
        q[_ua].qualify(1 + idx * 2);
      }return part;
    });

    return !q.uncertain.value && !q.approximate.value ? reject : assign(util.date(values, 2), {
      uncertain: q.uncertain.value,
      approximate: q.approximate.value
    });
  }
};

module.exports = util;

},{"./bitmask":2,"babel-runtime/core-js/array/from":6,"babel-runtime/core-js/object/assign":9,"babel-runtime/helpers/defineProperty":17,"babel-runtime/helpers/slicedToArray":18,"babel-runtime/helpers/typeof":20}],6:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/array/from"), __esModule: true };
},{"core-js/library/fn/array/from":21}],7:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/get-iterator"), __esModule: true };
},{"core-js/library/fn/get-iterator":22}],8:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/is-iterable"), __esModule: true };
},{"core-js/library/fn/is-iterable":23}],9:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/assign"), __esModule: true };
},{"core-js/library/fn/object/assign":24}],10:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":25}],11:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/keys"), __esModule: true };
},{"core-js/library/fn/object/keys":26}],12:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/set"), __esModule: true };
},{"core-js/library/fn/set":27}],13:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol"), __esModule: true };
},{"core-js/library/fn/symbol":28}],14:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol/iterator"), __esModule: true };
},{"core-js/library/fn/symbol/iterator":29}],15:[function(require,module,exports){
"use strict";

exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
},{}],16:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _defineProperty = require("../core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
},{"../core-js/object/define-property":10}],17:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _defineProperty = require("../core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (obj, key, value) {
  if (key in obj) {
    (0, _defineProperty2.default)(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};
},{"../core-js/object/define-property":10}],18:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _isIterable2 = require("../core-js/is-iterable");

var _isIterable3 = _interopRequireDefault(_isIterable2);

var _getIterator2 = require("../core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = (0, _getIterator3.default)(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if ((0, _isIterable3.default)(Object(arr))) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();
},{"../core-js/get-iterator":7,"../core-js/is-iterable":8}],19:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _from = require("../core-js/array/from");

var _from2 = _interopRequireDefault(_from);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  } else {
    return (0, _from2.default)(arr);
  }
};
},{"../core-js/array/from":6}],20:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _iterator = require("../core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require("../core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};
},{"../core-js/symbol":13,"../core-js/symbol/iterator":14}],21:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/es6.array.from');
module.exports = require('../../modules/_core').Array.from;
},{"../../modules/_core":44,"../../modules/es6.array.from":107,"../../modules/es6.string.iterator":114}],22:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.get-iterator');
},{"../modules/core.get-iterator":105,"../modules/es6.string.iterator":114,"../modules/web.dom.iterable":119}],23:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.is-iterable');
},{"../modules/core.is-iterable":106,"../modules/es6.string.iterator":114,"../modules/web.dom.iterable":119}],24:[function(require,module,exports){
require('../../modules/es6.object.assign');
module.exports = require('../../modules/_core').Object.assign;
},{"../../modules/_core":44,"../../modules/es6.object.assign":109}],25:[function(require,module,exports){
require('../../modules/es6.object.define-property');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc){
  return $Object.defineProperty(it, key, desc);
};
},{"../../modules/_core":44,"../../modules/es6.object.define-property":110}],26:[function(require,module,exports){
require('../../modules/es6.object.keys');
module.exports = require('../../modules/_core').Object.keys;
},{"../../modules/_core":44,"../../modules/es6.object.keys":111}],27:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.set');
require('../modules/es7.set.to-json');
module.exports = require('../modules/_core').Set;
},{"../modules/_core":44,"../modules/es6.object.to-string":112,"../modules/es6.set":113,"../modules/es6.string.iterator":114,"../modules/es7.set.to-json":116,"../modules/web.dom.iterable":119}],28:[function(require,module,exports){
require('../../modules/es6.symbol');
require('../../modules/es6.object.to-string');
require('../../modules/es7.symbol.async-iterator');
require('../../modules/es7.symbol.observable');
module.exports = require('../../modules/_core').Symbol;
},{"../../modules/_core":44,"../../modules/es6.object.to-string":112,"../../modules/es6.symbol":115,"../../modules/es7.symbol.async-iterator":117,"../../modules/es7.symbol.observable":118}],29:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/web.dom.iterable');
module.exports = require('../../modules/_wks-ext').f('iterator');
},{"../../modules/_wks-ext":102,"../../modules/es6.string.iterator":114,"../../modules/web.dom.iterable":119}],30:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],31:[function(require,module,exports){
module.exports = function(){ /* empty */ };
},{}],32:[function(require,module,exports){
module.exports = function(it, Constructor, name, forbiddenField){
  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};
},{}],33:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./_is-object":63}],34:[function(require,module,exports){
var forOf = require('./_for-of');

module.exports = function(iter, ITERATOR){
  var result = [];
  forOf(iter, false, result.push, result, ITERATOR);
  return result;
};

},{"./_for-of":54}],35:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject')
  , toLength  = require('./_to-length')
  , toIndex   = require('./_to-index');
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = toIObject($this)
      , length = toLength(O.length)
      , index  = toIndex(fromIndex, length)
      , value;
    // Array#includes uses SameValueZero equality algorithm
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    // Array#toIndex ignores holes, Array#includes - not
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};
},{"./_to-index":94,"./_to-iobject":96,"./_to-length":97}],36:[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx      = require('./_ctx')
  , IObject  = require('./_iobject')
  , toObject = require('./_to-object')
  , toLength = require('./_to-length')
  , asc      = require('./_array-species-create');
module.exports = function(TYPE, $create){
  var IS_MAP        = TYPE == 1
    , IS_FILTER     = TYPE == 2
    , IS_SOME       = TYPE == 3
    , IS_EVERY      = TYPE == 4
    , IS_FIND_INDEX = TYPE == 6
    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX
    , create        = $create || asc;
  return function($this, callbackfn, that){
    var O      = toObject($this)
      , self   = IObject(O)
      , f      = ctx(callbackfn, that, 3)
      , length = toLength(self.length)
      , index  = 0
      , result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined
      , val, res;
    for(;length > index; index++)if(NO_HOLES || index in self){
      val = self[index];
      res = f(val, index, O);
      if(TYPE){
        if(IS_MAP)result[index] = res;            // map
        else if(res)switch(TYPE){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(IS_EVERY)return false;          // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};
},{"./_array-species-create":38,"./_ctx":46,"./_iobject":60,"./_to-length":97,"./_to-object":98}],37:[function(require,module,exports){
var isObject = require('./_is-object')
  , isArray  = require('./_is-array')
  , SPECIES  = require('./_wks')('species');

module.exports = function(original){
  var C;
  if(isArray(original)){
    C = original.constructor;
    // cross-realm fallback
    if(typeof C == 'function' && (C === Array || isArray(C.prototype)))C = undefined;
    if(isObject(C)){
      C = C[SPECIES];
      if(C === null)C = undefined;
    }
  } return C === undefined ? Array : C;
};
},{"./_is-array":62,"./_is-object":63,"./_wks":103}],38:[function(require,module,exports){
// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = require('./_array-species-constructor');

module.exports = function(original, length){
  return new (speciesConstructor(original))(length);
};
},{"./_array-species-constructor":37}],39:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof')
  , TAG = require('./_wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function(it, key){
  try {
    return it[key];
  } catch(e){ /* empty */ }
};

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./_cof":40,"./_wks":103}],40:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],41:[function(require,module,exports){
'use strict';
var dP          = require('./_object-dp').f
  , create      = require('./_object-create')
  , redefineAll = require('./_redefine-all')
  , ctx         = require('./_ctx')
  , anInstance  = require('./_an-instance')
  , defined     = require('./_defined')
  , forOf       = require('./_for-of')
  , $iterDefine = require('./_iter-define')
  , step        = require('./_iter-step')
  , setSpecies  = require('./_set-species')
  , DESCRIPTORS = require('./_descriptors')
  , fastKey     = require('./_meta').fastKey
  , SIZE        = DESCRIPTORS ? '_s' : 'size';

var getEntry = function(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index !== 'F')return that._i[index];
  // frozen object case
  for(entry = that._f; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
};

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      anInstance(that, C, NAME, '_i');
      that._i = create(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear(){
        for(var that = this, data = that._i, entry = that._f; entry; entry = entry.n){
          entry.r = true;
          if(entry.p)entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var that  = this
          , entry = getEntry(that, key);
        if(entry){
          var next = entry.n
            , prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if(prev)prev.n = next;
          if(next)next.p = prev;
          if(that._f == entry)that._f = next;
          if(that._l == entry)that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /*, that = undefined */){
        anInstance(this, C, 'forEach');
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3)
          , entry;
        while(entry = entry ? entry.n : this._f){
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while(entry && entry.r)entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key){
        return !!getEntry(this, key);
      }
    });
    if(DESCRIPTORS)dP(C.prototype, 'size', {
      get: function(){
        return defined(this[SIZE]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry){
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that._f)that._f = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index !== 'F')that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function(C, NAME, IS_MAP){
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function(iterated, kind){
      this._t = iterated;  // target
      this._k = kind;      // kind
      this._l = undefined; // previous
    }, function(){
      var that  = this
        , kind  = that._k
        , entry = that._l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!that._t || !(that._l = entry = entry ? entry.n : that._t._f)){
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if(kind == 'keys'  )return step(0, entry.k);
      if(kind == 'values')return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};
},{"./_an-instance":32,"./_ctx":46,"./_defined":47,"./_descriptors":48,"./_for-of":54,"./_iter-define":66,"./_iter-step":68,"./_meta":72,"./_object-create":74,"./_object-dp":75,"./_redefine-all":87,"./_set-species":89}],42:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var classof = require('./_classof')
  , from    = require('./_array-from-iterable');
module.exports = function(NAME){
  return function toJSON(){
    if(classof(this) != NAME)throw TypeError(NAME + "#toJSON isn't generic");
    return from(this);
  };
};
},{"./_array-from-iterable":34,"./_classof":39}],43:[function(require,module,exports){
'use strict';
var global         = require('./_global')
  , $export        = require('./_export')
  , meta           = require('./_meta')
  , fails          = require('./_fails')
  , hide           = require('./_hide')
  , redefineAll    = require('./_redefine-all')
  , forOf          = require('./_for-of')
  , anInstance     = require('./_an-instance')
  , isObject       = require('./_is-object')
  , setToStringTag = require('./_set-to-string-tag')
  , dP             = require('./_object-dp').f
  , each           = require('./_array-methods')(0)
  , DESCRIPTORS    = require('./_descriptors');

module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
  var Base  = global[NAME]
    , C     = Base
    , ADDER = IS_MAP ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  if(!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function(){
    new C().entries().next();
  }))){
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
    meta.NEED = true;
  } else {
    C = wrapper(function(target, iterable){
      anInstance(target, C, NAME, '_c');
      target._c = new Base;
      if(iterable != undefined)forOf(iterable, IS_MAP, target[ADDER], target);
    });
    each('add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON'.split(','),function(KEY){
      var IS_ADDER = KEY == 'add' || KEY == 'set';
      if(KEY in proto && !(IS_WEAK && KEY == 'clear'))hide(C.prototype, KEY, function(a, b){
        anInstance(this, C, KEY);
        if(!IS_ADDER && IS_WEAK && !isObject(a))return KEY == 'get' ? undefined : false;
        var result = this._c[KEY](a === 0 ? 0 : a, b);
        return IS_ADDER ? this : result;
      });
    });
    if('size' in proto)dP(C.prototype, 'size', {
      get: function(){
        return this._c.size;
      }
    });
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F, O);

  if(!IS_WEAK)common.setStrong(C, NAME, IS_MAP);

  return C;
};
},{"./_an-instance":32,"./_array-methods":36,"./_descriptors":48,"./_export":52,"./_fails":53,"./_for-of":54,"./_global":55,"./_hide":57,"./_is-object":63,"./_meta":72,"./_object-dp":75,"./_redefine-all":87,"./_set-to-string-tag":90}],44:[function(require,module,exports){
var core = module.exports = {version: '2.4.0'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],45:[function(require,module,exports){
'use strict';
var $defineProperty = require('./_object-dp')
  , createDesc      = require('./_property-desc');

module.exports = function(object, index, value){
  if(index in object)$defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};
},{"./_object-dp":75,"./_property-desc":86}],46:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"./_a-function":30}],47:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],48:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_fails":53}],49:[function(require,module,exports){
var isObject = require('./_is-object')
  , document = require('./_global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./_global":55,"./_is-object":63}],50:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');
},{}],51:[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys')
  , gOPS    = require('./_object-gops')
  , pIE     = require('./_object-pie');
module.exports = function(it){
  var result     = getKeys(it)
    , getSymbols = gOPS.f;
  if(getSymbols){
    var symbols = getSymbols(it)
      , isEnum  = pIE.f
      , i       = 0
      , key;
    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
  } return result;
};
},{"./_object-gops":80,"./_object-keys":83,"./_object-pie":84}],52:[function(require,module,exports){
var global    = require('./_global')
  , core      = require('./_core')
  , ctx       = require('./_ctx')
  , hide      = require('./_hide')
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , IS_WRAP   = type & $export.W
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE]
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
    , key, own, out;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function(C){
      var F = function(a, b, c){
        if(this instanceof C){
          switch(arguments.length){
            case 0: return new C;
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if(IS_PROTO){
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library` 
module.exports = $export;
},{"./_core":44,"./_ctx":46,"./_global":55,"./_hide":57}],53:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],54:[function(require,module,exports){
var ctx         = require('./_ctx')
  , call        = require('./_iter-call')
  , isArrayIter = require('./_is-array-iter')
  , anObject    = require('./_an-object')
  , toLength    = require('./_to-length')
  , getIterFn   = require('./core.get-iterator-method')
  , BREAK       = {}
  , RETURN      = {};
var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator, result;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if(result === BREAK || result === RETURN)return result;
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    result = call(iterator, f, step.value, entries);
    if(result === BREAK || result === RETURN)return result;
  }
};
exports.BREAK  = BREAK;
exports.RETURN = RETURN;
},{"./_an-object":33,"./_ctx":46,"./_is-array-iter":61,"./_iter-call":64,"./_to-length":97,"./core.get-iterator-method":104}],55:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],56:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],57:[function(require,module,exports){
var dP         = require('./_object-dp')
  , createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./_descriptors":48,"./_object-dp":75,"./_property-desc":86}],58:[function(require,module,exports){
module.exports = require('./_global').document && document.documentElement;
},{"./_global":55}],59:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function(){
  return Object.defineProperty(require('./_dom-create')('div'), 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_descriptors":48,"./_dom-create":49,"./_fails":53}],60:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./_cof":40}],61:[function(require,module,exports){
// check on default Array iterator
var Iterators  = require('./_iterators')
  , ITERATOR   = require('./_wks')('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"./_iterators":69,"./_wks":103}],62:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg){
  return cof(arg) == 'Array';
};
},{"./_cof":40}],63:[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],64:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};
},{"./_an-object":33}],65:[function(require,module,exports){
'use strict';
var create         = require('./_object-create')
  , descriptor     = require('./_property-desc')
  , setToStringTag = require('./_set-to-string-tag')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};
},{"./_hide":57,"./_object-create":74,"./_property-desc":86,"./_set-to-string-tag":90,"./_wks":103}],66:[function(require,module,exports){
'use strict';
var LIBRARY        = require('./_library')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , hide           = require('./_hide')
  , has            = require('./_has')
  , Iterators      = require('./_iterators')
  , $iterCreate    = require('./_iter-create')
  , setToStringTag = require('./_set-to-string-tag')
  , getPrototypeOf = require('./_object-gpo')
  , ITERATOR       = require('./_wks')('iterator')
  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
  , FF_ITERATOR    = '@@iterator'
  , KEYS           = 'keys'
  , VALUES         = 'values';

var returnThis = function(){ return this; };

module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
  $iterCreate(Constructor, NAME, next);
  var getMethod = function(kind){
    if(!BUGGY && kind in proto)return proto[kind];
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG        = NAME + ' Iterator'
    , DEF_VALUES = DEFAULT == VALUES
    , VALUES_BUG = false
    , proto      = Base.prototype
    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , $default   = $native || getMethod(DEFAULT)
    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
    , methods, key, IteratorPrototype;
  // Fix native
  if($anyNative){
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
    if(IteratorPrototype !== Object.prototype){
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if(DEF_VALUES && $native && $native.name !== VALUES){
    VALUES_BUG = true;
    $default = function values(){ return $native.call(this); };
  }
  // Define iterator
  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      values:  DEF_VALUES ? $default : getMethod(VALUES),
      keys:    IS_SET     ? $default : getMethod(KEYS),
      entries: $entries
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};
},{"./_export":52,"./_has":56,"./_hide":57,"./_iter-create":65,"./_iterators":69,"./_library":71,"./_object-gpo":81,"./_redefine":88,"./_set-to-string-tag":90,"./_wks":103}],67:[function(require,module,exports){
var ITERATOR     = require('./_wks')('iterator')
  , SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }

module.exports = function(exec, skipClosing){
  if(!skipClosing && !SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[ITERATOR]();
    iter.next = function(){ return {done: safe = true}; };
    arr[ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./_wks":103}],68:[function(require,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],69:[function(require,module,exports){
module.exports = {};
},{}],70:[function(require,module,exports){
var getKeys   = require('./_object-keys')
  , toIObject = require('./_to-iobject');
module.exports = function(object, el){
  var O      = toIObject(object)
    , keys   = getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"./_object-keys":83,"./_to-iobject":96}],71:[function(require,module,exports){
module.exports = true;
},{}],72:[function(require,module,exports){
var META     = require('./_uid')('meta')
  , isObject = require('./_is-object')
  , has      = require('./_has')
  , setDesc  = require('./_object-dp').f
  , id       = 0;
var isExtensible = Object.isExtensible || function(){
  return true;
};
var FREEZE = !require('./_fails')(function(){
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function(it){
  setDesc(it, META, {value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  }});
};
var fastKey = function(it, create){
  // return primitive with prefix
  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return 'F';
    // not necessary to add metadata
    if(!create)return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function(it, create){
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return true;
    // not necessary to add metadata
    if(!create)return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function(it){
  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY:      META,
  NEED:     false,
  fastKey:  fastKey,
  getWeak:  getWeak,
  onFreeze: onFreeze
};
},{"./_fails":53,"./_has":56,"./_is-object":63,"./_object-dp":75,"./_uid":100}],73:[function(require,module,exports){
'use strict';
// 19.1.2.1 Object.assign(target, source, ...)
var getKeys  = require('./_object-keys')
  , gOPS     = require('./_object-gops')
  , pIE      = require('./_object-pie')
  , toObject = require('./_to-object')
  , IObject  = require('./_iobject')
  , $assign  = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || require('./_fails')(function(){
  var A = {}
    , B = {}
    , S = Symbol()
    , K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function(k){ B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
  var T     = toObject(target)
    , aLen  = arguments.length
    , index = 1
    , getSymbols = gOPS.f
    , isEnum     = pIE.f;
  while(aLen > index){
    var S      = IObject(arguments[index++])
      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
  } return T;
} : $assign;
},{"./_fails":53,"./_iobject":60,"./_object-gops":80,"./_object-keys":83,"./_object-pie":84,"./_to-object":98}],74:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject    = require('./_an-object')
  , dPs         = require('./_object-dps')
  , enumBugKeys = require('./_enum-bug-keys')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , Empty       = function(){ /* empty */ }
  , PROTOTYPE   = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe')
    , i      = enumBugKeys.length
    , lt     = '<'
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties){
  var result;
  if(O !== null){
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty;
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":33,"./_dom-create":49,"./_enum-bug-keys":50,"./_html":58,"./_object-dps":76,"./_shared-key":91}],75:[function(require,module,exports){
var anObject       = require('./_an-object')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , toPrimitive    = require('./_to-primitive')
  , dP             = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes){
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if(IE8_DOM_DEFINE)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};
},{"./_an-object":33,"./_descriptors":48,"./_ie8-dom-define":59,"./_to-primitive":99}],76:[function(require,module,exports){
var dP       = require('./_object-dp')
  , anObject = require('./_an-object')
  , getKeys  = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties){
  anObject(O);
  var keys   = getKeys(Properties)
    , length = keys.length
    , i = 0
    , P;
  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
  return O;
};
},{"./_an-object":33,"./_descriptors":48,"./_object-dp":75,"./_object-keys":83}],77:[function(require,module,exports){
var pIE            = require('./_object-pie')
  , createDesc     = require('./_property-desc')
  , toIObject      = require('./_to-iobject')
  , toPrimitive    = require('./_to-primitive')
  , has            = require('./_has')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , gOPD           = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P){
  O = toIObject(O);
  P = toPrimitive(P, true);
  if(IE8_DOM_DEFINE)try {
    return gOPD(O, P);
  } catch(e){ /* empty */ }
  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
};
},{"./_descriptors":48,"./_has":56,"./_ie8-dom-define":59,"./_object-pie":84,"./_property-desc":86,"./_to-iobject":96,"./_to-primitive":99}],78:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject')
  , gOPN      = require('./_object-gopn').f
  , toString  = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function(it){
  try {
    return gOPN(it);
  } catch(e){
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it){
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":79,"./_to-iobject":96}],79:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys      = require('./_object-keys-internal')
  , hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
  return $keys(O, hiddenKeys);
};
},{"./_enum-bug-keys":50,"./_object-keys-internal":82}],80:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;
},{}],81:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has         = require('./_has')
  , toObject    = require('./_to-object')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function(O){
  O = toObject(O);
  if(has(O, IE_PROTO))return O[IE_PROTO];
  if(typeof O.constructor == 'function' && O instanceof O.constructor){
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};
},{"./_has":56,"./_shared-key":91,"./_to-object":98}],82:[function(require,module,exports){
var has          = require('./_has')
  , toIObject    = require('./_to-iobject')
  , arrayIndexOf = require('./_array-includes')(false)
  , IE_PROTO     = require('./_shared-key')('IE_PROTO');

module.exports = function(object, names){
  var O      = toIObject(object)
    , i      = 0
    , result = []
    , key;
  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while(names.length > i)if(has(O, key = names[i++])){
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};
},{"./_array-includes":35,"./_has":56,"./_shared-key":91,"./_to-iobject":96}],83:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys       = require('./_object-keys-internal')
  , enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O){
  return $keys(O, enumBugKeys);
};
},{"./_enum-bug-keys":50,"./_object-keys-internal":82}],84:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;
},{}],85:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export')
  , core    = require('./_core')
  , fails   = require('./_fails');
module.exports = function(KEY, exec){
  var fn  = (core.Object || {})[KEY] || Object[KEY]
    , exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
};
},{"./_core":44,"./_export":52,"./_fails":53}],86:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],87:[function(require,module,exports){
var hide = require('./_hide');
module.exports = function(target, src, safe){
  for(var key in src){
    if(safe && target[key])target[key] = src[key];
    else hide(target, key, src[key]);
  } return target;
};
},{"./_hide":57}],88:[function(require,module,exports){
module.exports = require('./_hide');
},{"./_hide":57}],89:[function(require,module,exports){
'use strict';
var global      = require('./_global')
  , core        = require('./_core')
  , dP          = require('./_object-dp')
  , DESCRIPTORS = require('./_descriptors')
  , SPECIES     = require('./_wks')('species');

module.exports = function(KEY){
  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};
},{"./_core":44,"./_descriptors":48,"./_global":55,"./_object-dp":75,"./_wks":103}],90:[function(require,module,exports){
var def = require('./_object-dp').f
  , has = require('./_has')
  , TAG = require('./_wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"./_has":56,"./_object-dp":75,"./_wks":103}],91:[function(require,module,exports){
var shared = require('./_shared')('keys')
  , uid    = require('./_uid');
module.exports = function(key){
  return shared[key] || (shared[key] = uid(key));
};
},{"./_shared":92,"./_uid":100}],92:[function(require,module,exports){
var global = require('./_global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./_global":55}],93:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , defined   = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./_defined":47,"./_to-integer":95}],94:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , max       = Math.max
  , min       = Math.min;
module.exports = function(index, length){
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};
},{"./_to-integer":95}],95:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],96:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject')
  , defined = require('./_defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./_defined":47,"./_iobject":60}],97:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./_to-integer":95}],98:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./_defined":47}],99:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function(it, S){
  if(!isObject(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};
},{"./_is-object":63}],100:[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],101:[function(require,module,exports){
var global         = require('./_global')
  , core           = require('./_core')
  , LIBRARY        = require('./_library')
  , wksExt         = require('./_wks-ext')
  , defineProperty = require('./_object-dp').f;
module.exports = function(name){
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if(name.charAt(0) != '_' && !(name in $Symbol))defineProperty($Symbol, name, {value: wksExt.f(name)});
};
},{"./_core":44,"./_global":55,"./_library":71,"./_object-dp":75,"./_wks-ext":102}],102:[function(require,module,exports){
exports.f = require('./_wks');
},{"./_wks":103}],103:[function(require,module,exports){
var store      = require('./_shared')('wks')
  , uid        = require('./_uid')
  , Symbol     = require('./_global').Symbol
  , USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;
},{"./_global":55,"./_shared":92,"./_uid":100}],104:[function(require,module,exports){
var classof   = require('./_classof')
  , ITERATOR  = require('./_wks')('iterator')
  , Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"./_classof":39,"./_core":44,"./_iterators":69,"./_wks":103}],105:[function(require,module,exports){
var anObject = require('./_an-object')
  , get      = require('./core.get-iterator-method');
module.exports = require('./_core').getIterator = function(it){
  var iterFn = get(it);
  if(typeof iterFn != 'function')throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};
},{"./_an-object":33,"./_core":44,"./core.get-iterator-method":104}],106:[function(require,module,exports){
var classof   = require('./_classof')
  , ITERATOR  = require('./_wks')('iterator')
  , Iterators = require('./_iterators');
module.exports = require('./_core').isIterable = function(it){
  var O = Object(it);
  return O[ITERATOR] !== undefined
    || '@@iterator' in O
    || Iterators.hasOwnProperty(classof(O));
};
},{"./_classof":39,"./_core":44,"./_iterators":69,"./_wks":103}],107:[function(require,module,exports){
'use strict';
var ctx            = require('./_ctx')
  , $export        = require('./_export')
  , toObject       = require('./_to-object')
  , call           = require('./_iter-call')
  , isArrayIter    = require('./_is-array-iter')
  , toLength       = require('./_to-length')
  , createProperty = require('./_create-property')
  , getIterFn      = require('./core.get-iterator-method');

$export($export.S + $export.F * !require('./_iter-detect')(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = toObject(arrayLike)
      , C       = typeof this == 'function' ? this : Array
      , aLen    = arguments.length
      , mapfn   = aLen > 1 ? arguments[1] : undefined
      , mapping = mapfn !== undefined
      , index   = 0
      , iterFn  = getIterFn(O)
      , length, result, step, iterator;
    if(mapping)mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for(result = new C(length); length > index; index++){
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

},{"./_create-property":45,"./_ctx":46,"./_export":52,"./_is-array-iter":61,"./_iter-call":64,"./_iter-detect":67,"./_to-length":97,"./_to-object":98,"./core.get-iterator-method":104}],108:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables')
  , step             = require('./_iter-step')
  , Iterators        = require('./_iterators')
  , toIObject        = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function(iterated, kind){
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');
},{"./_add-to-unscopables":31,"./_iter-define":66,"./_iter-step":68,"./_iterators":69,"./_to-iobject":96}],109:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $export = require('./_export');

$export($export.S + $export.F, 'Object', {assign: require('./_object-assign')});
},{"./_export":52,"./_object-assign":73}],110:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', {defineProperty: require('./_object-dp').f});
},{"./_descriptors":48,"./_export":52,"./_object-dp":75}],111:[function(require,module,exports){
// 19.1.2.14 Object.keys(O)
var toObject = require('./_to-object')
  , $keys    = require('./_object-keys');

require('./_object-sap')('keys', function(){
  return function keys(it){
    return $keys(toObject(it));
  };
});
},{"./_object-keys":83,"./_object-sap":85,"./_to-object":98}],112:[function(require,module,exports){

},{}],113:[function(require,module,exports){
'use strict';
var strong = require('./_collection-strong');

// 23.2 Set Objects
module.exports = require('./_collection')('Set', function(get){
  return function Set(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value){
    return strong.def(this, value = value === 0 ? 0 : value, value);
  }
}, strong);
},{"./_collection":43,"./_collection-strong":41}],114:[function(require,module,exports){
'use strict';
var $at  = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});
},{"./_iter-define":66,"./_string-at":93}],115:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global         = require('./_global')
  , has            = require('./_has')
  , DESCRIPTORS    = require('./_descriptors')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , META           = require('./_meta').KEY
  , $fails         = require('./_fails')
  , shared         = require('./_shared')
  , setToStringTag = require('./_set-to-string-tag')
  , uid            = require('./_uid')
  , wks            = require('./_wks')
  , wksExt         = require('./_wks-ext')
  , wksDefine      = require('./_wks-define')
  , keyOf          = require('./_keyof')
  , enumKeys       = require('./_enum-keys')
  , isArray        = require('./_is-array')
  , anObject       = require('./_an-object')
  , toIObject      = require('./_to-iobject')
  , toPrimitive    = require('./_to-primitive')
  , createDesc     = require('./_property-desc')
  , _create        = require('./_object-create')
  , gOPNExt        = require('./_object-gopn-ext')
  , $GOPD          = require('./_object-gopd')
  , $DP            = require('./_object-dp')
  , $keys          = require('./_object-keys')
  , gOPD           = $GOPD.f
  , dP             = $DP.f
  , gOPN           = gOPNExt.f
  , $Symbol        = global.Symbol
  , $JSON          = global.JSON
  , _stringify     = $JSON && $JSON.stringify
  , PROTOTYPE      = 'prototype'
  , HIDDEN         = wks('_hidden')
  , TO_PRIMITIVE   = wks('toPrimitive')
  , isEnum         = {}.propertyIsEnumerable
  , SymbolRegistry = shared('symbol-registry')
  , AllSymbols     = shared('symbols')
  , OPSymbols      = shared('op-symbols')
  , ObjectProto    = Object[PROTOTYPE]
  , USE_NATIVE     = typeof $Symbol == 'function'
  , QObject        = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function(){
  return _create(dP({}, 'a', {
    get: function(){ return dP(this, 'a', {value: 7}).a; }
  })).a != 7;
}) ? function(it, key, D){
  var protoDesc = gOPD(ObjectProto, key);
  if(protoDesc)delete ObjectProto[key];
  dP(it, key, D);
  if(protoDesc && it !== ObjectProto)dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function(tag){
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it){
  return typeof it == 'symbol';
} : function(it){
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D){
  if(it === ObjectProto)$defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if(has(AllSymbols, key)){
    if(!D.enumerable){
      if(!has(it, HIDDEN))dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
      D = _create(D, {enumerable: createDesc(0, false)});
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P){
  anObject(it);
  var keys = enumKeys(P = toIObject(P))
    , i    = 0
    , l = keys.length
    , key;
  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P){
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key){
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if(this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
  it  = toIObject(it);
  key = toPrimitive(key, true);
  if(it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return;
  var D = gOPD(it, key);
  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it){
  var names  = gOPN(toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i){
    if(!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
  var IS_OP  = it === ObjectProto
    , names  = gOPN(IS_OP ? OPSymbols : toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i){
    if(has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true))result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if(!USE_NATIVE){
  $Symbol = function Symbol(){
    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function(value){
      if(this === ObjectProto)$set.call(OPSymbols, value);
      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if(DESCRIPTORS && setter)setSymbolDesc(ObjectProto, tag, {configurable: true, set: $set});
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString(){
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f   = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f  = $propertyIsEnumerable;
  require('./_object-gops').f = $getOwnPropertySymbols;

  if(DESCRIPTORS && !require('./_library')){
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function(name){
    return wrap(wks(name));
  }
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Symbol: $Symbol});

for(var symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), i = 0; symbols.length > i; )wks(symbols[i++]);

for(var symbols = $keys(wks.store), i = 0; symbols.length > i; )wksDefine(symbols[i++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key){
    if(isSymbol(key))return keyOf(SymbolRegistry, key);
    throw TypeError(key + ' is not a symbol!');
  },
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function(){
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it){
    if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
    var args = [it]
      , i    = 1
      , replacer, $replacer;
    while(arguments.length > i)args.push(arguments[i++]);
    replacer = args[1];
    if(typeof replacer == 'function')$replacer = replacer;
    if($replacer || !isArray(replacer))replacer = function(key, value){
      if($replacer)value = $replacer.call(this, key, value);
      if(!isSymbol(value))return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);
},{"./_an-object":33,"./_descriptors":48,"./_enum-keys":51,"./_export":52,"./_fails":53,"./_global":55,"./_has":56,"./_hide":57,"./_is-array":62,"./_keyof":70,"./_library":71,"./_meta":72,"./_object-create":74,"./_object-dp":75,"./_object-gopd":77,"./_object-gopn":79,"./_object-gopn-ext":78,"./_object-gops":80,"./_object-keys":83,"./_object-pie":84,"./_property-desc":86,"./_redefine":88,"./_set-to-string-tag":90,"./_shared":92,"./_to-iobject":96,"./_to-primitive":99,"./_uid":100,"./_wks":103,"./_wks-define":101,"./_wks-ext":102}],116:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export  = require('./_export');

$export($export.P + $export.R, 'Set', {toJSON: require('./_collection-to-json')('Set')});
},{"./_collection-to-json":42,"./_export":52}],117:[function(require,module,exports){
require('./_wks-define')('asyncIterator');
},{"./_wks-define":101}],118:[function(require,module,exports){
require('./_wks-define')('observable');
},{"./_wks-define":101}],119:[function(require,module,exports){
require('./es6.array.iterator');
var global        = require('./_global')
  , hide          = require('./_hide')
  , Iterators     = require('./_iterators')
  , TO_STRING_TAG = require('./_wks')('toStringTag');

for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
  var NAME       = collections[i]
    , Collection = global[NAME]
    , proto      = Collection && Collection.prototype;
  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}
},{"./_global":55,"./_hide":57,"./_iterators":69,"./_wks":103,"./es6.array.iterator":108}],120:[function(require,module,exports){
'use strict'

const DAY = /^days?$/i
const MONTH = /^months?$/i
const YEAR = /^years?$/i
const SYMBOL = /^[xX]$/
const SYMBOLS = /[xX]/g
const PATTERN = /^[0-9xXdDmMyY]{8}$/
const YYYYMMDD = 'YYYYMMDD'.split('')
const MAXDAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

const { pow, max, min } = Math


/**
 * Bitmasks are used to set Unspecified, Uncertain and
 * Approximate flags for a Date. The bitmask for one
 * feature corresponds to a numeric value based on the
 * following pattern:
 *
 *           YYYYMMDD
 *           --------
 *   Day     00000011
 *   Month   00001100
 *   Year    11110000
 *
 */
class Bitmask {

  static test(a, b) {
    return this.convert(a) & this.convert(b)
  }

  static convert(value = 0) { // eslint-disable-line complexity
    value = value || 0

    if (value instanceof Bitmask) return value.value

    switch (typeof value) {
    case 'number': return value

    case 'boolean': return value ? Bitmask.YMD : 0

    case 'string':
      if (DAY.test(value)) return Bitmask.DAY
      if (MONTH.test(value)) return Bitmask.MONTH
      if (YEAR.test(value)) return Bitmask.YEAR
      if (PATTERN.test(value)) return Bitmask.compute(value)
      // fall through!

    default:
      throw new Error(`invalid value: ${value}`)
    }
  }

  static compute(value) {
    return value.split('').reduce((memo, c, idx) =>
        (memo | (SYMBOL.test(c) ? pow(2, idx) : 0)), 0)
  }

  static values(mask, digit = 0) {
    let num = Bitmask.numbers(mask, digit).split('')
    let values = [Number(num.slice(0, 4).join(''))]

    if (num.length > 4) values.push(Number(num.slice(4, 6).join('')))
    if (num.length > 6) values.push(Number(num.slice(6, 8).join('')))

    return Bitmask.normalize(values)
  }

  static numbers(mask, digit = 0) {
    return mask.replace(SYMBOLS, digit)
  }

  static normalize(values) {
    if (values.length > 1)
      values[1] = min(11, max(0, values[1] - 1))

    if (values.length > 2)
      values[2] = min(MAXDAYS[values[1]] || NaN, max(1, values[2]))

    return values
  }


  constructor(value = 0) {
    this.value = Bitmask.convert(value)
  }

  test(value = 0) {
    return this.value & Bitmask.convert(value)
  }

  bit(k) {
    return this.value & pow(2, k)
  }

  get day() { return this.test(Bitmask.DAY) }

  get month() { return this.test(Bitmask.MONTH) }

  get year() { return this.test(Bitmask.YEAR) }


  add(value) {
    return (this.value = this.value | Bitmask.convert(value)), this
  }

  set(value = 0) {
    return (this.value = Bitmask.convert(value)), this
  }

  mask(input = YYYYMMDD, offset = 0, symbol = 'X') {
    return input.map((c, idx) => this.bit(offset + idx) ? symbol : c)
  }

  masks(values, symbol = 'X') {
    let offset = 0

    return values.map(value => {
      let mask = this.mask(value.split(''), offset, symbol)
      offset = offset + mask.length

      return mask.join('')
    })
  }

  max([year, month, day]) { // eslint-disable-line complexity
    if (!year) return []

    year = Number(
      (this.test(Bitmask.YEAR)) ? this.masks([year], '9')[0] : year
    )

    if (!month) return [year]

    month = Number(month) - 1

    switch (this.test(Bitmask.MONTH)) {
    case Bitmask.MONTH:
      month = 11
      break
    case Bitmask.MX:
      month = (month < 9) ? 8 : 11
      break
    case Bitmask.XM:
      month = (month + 1) % 10
      month = (month < 3) ? month + 9 : month - 1
      break
    }

    if (!day) return [year, month]

    day = Number(day)

    switch (this.test(Bitmask.DAY)) {
    case Bitmask.DAY:
      day = MAXDAYS[month]
      break
    case Bitmask.DX:
      day = min(MAXDAYS[month], day + (9 - (day % 10)))
      break
    case Bitmask.XD:
      day = day % 10

      if (month === 1) {
        day = (day === 9 && !leap(year)) ? day + 10 : day + 20

      } else {
        day = (day < 2) ? day + 30 : day + 20
        if (day > MAXDAYS[month]) day = day - 10
      }

      break
    }

    if (month === 1 && day > 28 && !leap(year)) {
      day = 28
    }

    return [year, month, day]
  }

  marks(values, symbol = '?') {
    return values
      .map((value, idx) => [
        this.qualified(idx * 2) ? symbol : '',
        value,
        this.qualified(idx * 2 + 1) ? symbol : ''
      ].join(''))
  }

  qualified(idx) { // eslint-disable-line complexity
    switch (idx) {
    case 1:
      return this.value === Bitmask.YEAR ||
        (this.value & Bitmask.YEAR) && !(this.value & Bitmask.MONTH)
    case 2:
      return this.value === Bitmask.MONTH ||
        (this.value & Bitmask.MONTH) && !(this.value & Bitmask.YEAR)
    case 3:
      return this.value === Bitmask.YM
    case 4:
      return this.value === Bitmask.DAY ||
        (this.value & Bitmask.DAY) && (this.value !== Bitmask.YMD)
    case 5:
      return this.value === Bitmask.YMD
    default:
      return false
    }
  }

  qualify(idx) {
    return (this.value = this.value | Bitmask.UA[idx]), this
  }

  toJSON() {
    return this.value
  }

  toString(symbol = 'X') {
    return this.masks(['YYYY', 'MM', 'DD'], symbol).join('-')
  }
}

Bitmask.prototype.is = Bitmask.prototype.test

function leap(year) {
  if (year % 4 > 0) return false
  if (year % 100 > 0) return true
  if (year % 400 > 0) return false
  return true
}

Bitmask.DAY   = Bitmask.D = Bitmask.compute('yyyymmxx')
Bitmask.MONTH = Bitmask.M = Bitmask.compute('yyyyxxdd')
Bitmask.YEAR  = Bitmask.Y = Bitmask.compute('xxxxmmdd')

Bitmask.MD  = Bitmask.M | Bitmask.D
Bitmask.YMD = Bitmask.Y | Bitmask.MD
Bitmask.YM  = Bitmask.Y | Bitmask.M

Bitmask.YYXX = Bitmask.compute('yyxxmmdd')
Bitmask.YYYX = Bitmask.compute('yyyxmmdd')
Bitmask.XXXX = Bitmask.compute('xxxxmmdd')

Bitmask.DX = Bitmask.compute('yyyymmdx')
Bitmask.XD = Bitmask.compute('yyyymmxd')
Bitmask.MX = Bitmask.compute('yyyymxdd')
Bitmask.XM = Bitmask.compute('yyyyxmdd')

/*
 * Map each UA symbol position to a mask.
 *
 *   ~YYYY~-~MM~-~DD~
 *   0    1 2  3 4  5
 */
Bitmask.UA = [
  Bitmask.YEAR,
  Bitmask.YEAR,   // YEAR !DAY
  Bitmask.MONTH,
  Bitmask.YM,
  Bitmask.DAY,    // YEARDAY
  Bitmask.YMD
]

module.exports = Bitmask

},{}],121:[function(require,module,exports){
// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
function id(x) {return x[0]; }

  const {
    num, zero, nothing, pick, pluck, join, concat, merge, century,
    interval, list, masked, date, datetime, season, qualify, year, decade
  } = require('./util')

  const {
    DAY, MONTH, YEAR, YMD, YM, MD, YYXX, YYYX, XXXX
  } = require('./bitmask')
var grammar = {
    ParserRules: [
    {"name": "edtf", "symbols": ["L0"], "postprocess": id},
    {"name": "edtf", "symbols": ["L1"], "postprocess": id},
    {"name": "edtf", "symbols": ["L2"], "postprocess": id},
    {"name": "L0", "symbols": ["date_time"], "postprocess": id},
    {"name": "L0", "symbols": ["century"], "postprocess": id},
    {"name": "L0", "symbols": ["L0i"], "postprocess": id},
    {"name": "L0i", "symbols": ["date_time", {"literal":"/"}, "date_time"], "postprocess": interval(0)},
    {"name": "century", "symbols": ["positive_century"], "postprocess": data => century(data[0])},
    {"name": "century$string$1", "symbols": [{"literal":"0"}, {"literal":"0"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "century", "symbols": ["century$string$1"], "postprocess": data => century(0)},
    {"name": "century", "symbols": [{"literal":"-"}, "positive_century"], "postprocess": data => century(-data[1])},
    {"name": "positive_century", "symbols": ["positive_digit", "digit"], "postprocess": num},
    {"name": "positive_century", "symbols": [{"literal":"0"}, "positive_digit"], "postprocess": num},
    {"name": "date_time", "symbols": ["date"], "postprocess": id},
    {"name": "date_time", "symbols": ["datetime"], "postprocess": id},
    {"name": "date", "symbols": ["year"], "postprocess": data => date(data)},
    {"name": "date", "symbols": ["year_month"], "postprocess": data => date(data[0])},
    {"name": "date", "symbols": ["year_month_day"], "postprocess": data => date(data[0])},
    {"name": "year", "symbols": ["positive_year"], "postprocess": id},
    {"name": "year", "symbols": ["negative_year"], "postprocess": id},
    {"name": "year$string$1", "symbols": [{"literal":"0"}, {"literal":"0"}, {"literal":"0"}, {"literal":"0"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "year", "symbols": ["year$string$1"], "postprocess": join},
    {"name": "positive_year", "symbols": ["positive_digit", "digit", "digit", "digit"], "postprocess": join},
    {"name": "positive_year", "symbols": [{"literal":"0"}, "positive_digit", "digit", "digit"], "postprocess": join},
    {"name": "positive_year$string$1", "symbols": [{"literal":"0"}, {"literal":"0"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "positive_year", "symbols": ["positive_year$string$1", "positive_digit", "digit"], "postprocess": join},
    {"name": "positive_year$string$2", "symbols": [{"literal":"0"}, {"literal":"0"}, {"literal":"0"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "positive_year", "symbols": ["positive_year$string$2", "positive_digit"], "postprocess": join},
    {"name": "negative_year", "symbols": [{"literal":"-"}, "positive_year"], "postprocess": join},
    {"name": "year_month", "symbols": ["year", {"literal":"-"}, "month"], "postprocess": pick(0, 2)},
    {"name": "year_month_day", "symbols": ["year", {"literal":"-"}, "month_day"], "postprocess": pick(0, 2)},
    {"name": "month", "symbols": ["d01_12"], "postprocess": id},
    {"name": "month_day", "symbols": ["m31", {"literal":"-"}, "day"], "postprocess": pick(0, 2)},
    {"name": "month_day", "symbols": ["m30", {"literal":"-"}, "d01_30"], "postprocess": pick(0, 2)},
    {"name": "month_day$string$1", "symbols": [{"literal":"0"}, {"literal":"2"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "month_day", "symbols": ["month_day$string$1", {"literal":"-"}, "d01_29"], "postprocess": pick(0, 2)},
    {"name": "day", "symbols": ["d01_31"], "postprocess": id},
    {"name": "datetime$ebnf$1$subexpression$1", "symbols": ["timezone"], "postprocess": id},
    {"name": "datetime$ebnf$1", "symbols": ["datetime$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "datetime$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "datetime", "symbols": ["year_month_day", {"literal":"T"}, "time", "datetime$ebnf$1"], "postprocess": datetime},
    {"name": "time", "symbols": ["hours", {"literal":":"}, "minutes", {"literal":":"}, "seconds", "milliseconds"], "postprocess": pick(0, 2, 4, 5)},
    {"name": "time$string$1", "symbols": [{"literal":"2"}, {"literal":"4"}, {"literal":":"}, {"literal":"0"}, {"literal":"0"}, {"literal":":"}, {"literal":"0"}, {"literal":"0"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "time", "symbols": ["time$string$1"], "postprocess": () => [24, 0, 0]},
    {"name": "hours", "symbols": ["d00_23"], "postprocess": num},
    {"name": "minutes", "symbols": ["d00_59"], "postprocess": num},
    {"name": "seconds", "symbols": ["d00_59"], "postprocess": num},
    {"name": "milliseconds", "symbols": []},
    {"name": "milliseconds", "symbols": [{"literal":"."}, "d3"], "postprocess": data => num(data.slice(1))},
    {"name": "timezone", "symbols": [{"literal":"Z"}], "postprocess": zero},
    {"name": "timezone", "symbols": [{"literal":"-"}, "offset"], "postprocess": data => -data[1]},
    {"name": "timezone", "symbols": [{"literal":"+"}, "positive_offset"], "postprocess": pick(1)},
    {"name": "positive_offset", "symbols": ["offset"], "postprocess": id},
    {"name": "positive_offset$string$1", "symbols": [{"literal":"0"}, {"literal":"0"}, {"literal":":"}, {"literal":"0"}, {"literal":"0"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "positive_offset", "symbols": ["positive_offset$string$1"], "postprocess": zero},
    {"name": "positive_offset$subexpression$1$string$1", "symbols": [{"literal":"1"}, {"literal":"2"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "positive_offset$subexpression$1", "symbols": ["positive_offset$subexpression$1$string$1"]},
    {"name": "positive_offset$subexpression$1$string$2", "symbols": [{"literal":"1"}, {"literal":"3"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "positive_offset$subexpression$1", "symbols": ["positive_offset$subexpression$1$string$2"]},
    {"name": "positive_offset", "symbols": ["positive_offset$subexpression$1", {"literal":":"}, "minutes"], "postprocess": data => num(data[0]) * 60 + data[2]},
    {"name": "positive_offset$string$2", "symbols": [{"literal":"1"}, {"literal":"4"}, {"literal":":"}, {"literal":"0"}, {"literal":"0"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "positive_offset", "symbols": ["positive_offset$string$2"], "postprocess": () => 840},
    {"name": "positive_offset", "symbols": ["d00_14"], "postprocess": data => num(data[0]) * 60},
    {"name": "offset", "symbols": ["d01_11", {"literal":":"}, "minutes"], "postprocess": data => num(data[0]) * 60 + data[2]},
    {"name": "offset$string$1", "symbols": [{"literal":"0"}, {"literal":"0"}, {"literal":":"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "offset", "symbols": ["offset$string$1", "d01_59"], "postprocess": data => num(data[1])},
    {"name": "offset$string$2", "symbols": [{"literal":"1"}, {"literal":"2"}, {"literal":":"}, {"literal":"0"}, {"literal":"0"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "offset", "symbols": ["offset$string$2"], "postprocess": () => 720},
    {"name": "offset", "symbols": ["d01_12"], "postprocess": data => num(data[0]) * 60},
    {"name": "L1", "symbols": ["L1d"], "postprocess": id},
    {"name": "L1", "symbols": ["L1Y"], "postprocess": id},
    {"name": "L1", "symbols": ["L1S"], "postprocess": id},
    {"name": "L1", "symbols": ["L1i"], "postprocess": id},
    {"name": "L1d", "symbols": ["date_ua"], "postprocess": id},
    {"name": "L1d", "symbols": ["L1X"], "postprocess": merge(0, { type: 'Date', level: 1 })},
    {"name": "date_ua", "symbols": ["date", "UA"], "postprocess": merge(0, 1, { level: 1 })},
    {"name": "L1i", "symbols": ["L1i_date", {"literal":"/"}, "L1i_date"], "postprocess": interval(1)},
    {"name": "L1i", "symbols": ["date_time", {"literal":"/"}, "L1i_date"], "postprocess": interval(1)},
    {"name": "L1i", "symbols": ["L1i_date", {"literal":"/"}, "date_time"], "postprocess": interval(1)},
    {"name": "L1i_date", "symbols": [], "postprocess": nothing},
    {"name": "L1i_date", "symbols": ["date_ua"], "postprocess": id},
    {"name": "L1i_date", "symbols": ["INFINITY"], "postprocess": id},
    {"name": "INFINITY", "symbols": [{"literal":"*"}], "postprocess": () => Infinity},
    {"name": "L1X$string$1", "symbols": [{"literal":"-"}, {"literal":"X"}, {"literal":"X"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "L1X", "symbols": ["d4", {"literal":"-"}, "md", "L1X$string$1"], "postprocess": masked()},
    {"name": "L1X$string$2", "symbols": [{"literal":"-"}, {"literal":"X"}, {"literal":"X"}, {"literal":"-"}, {"literal":"X"}, {"literal":"X"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "L1X", "symbols": ["d4", "L1X$string$2"], "postprocess": masked()},
    {"name": "L1X$string$3", "symbols": [{"literal":"X"}, {"literal":"X"}, {"literal":"X"}, {"literal":"X"}, {"literal":"-"}, {"literal":"X"}, {"literal":"X"}, {"literal":"-"}, {"literal":"X"}, {"literal":"X"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "L1X", "symbols": ["L1X$string$3"], "postprocess": masked()},
    {"name": "L1X$string$4", "symbols": [{"literal":"-"}, {"literal":"X"}, {"literal":"X"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "L1X", "symbols": ["d4", "L1X$string$4"], "postprocess": masked()},
    {"name": "L1X$string$5", "symbols": [{"literal":"X"}, {"literal":"X"}, {"literal":"X"}, {"literal":"X"}, {"literal":"-"}, {"literal":"X"}, {"literal":"X"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "L1X", "symbols": ["L1X$string$5"], "postprocess": masked()},
    {"name": "L1X$string$6", "symbols": [{"literal":"X"}, {"literal":"X"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "L1X", "symbols": ["d2", "L1X$string$6"], "postprocess": masked()},
    {"name": "L1X", "symbols": ["d3", {"literal":"X"}], "postprocess": masked()},
    {"name": "L1X$string$7", "symbols": [{"literal":"X"}, {"literal":"X"}, {"literal":"X"}, {"literal":"X"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "L1X", "symbols": ["L1X$string$7"], "postprocess": masked()},
    {"name": "L1Y", "symbols": [{"literal":"Y"}, "d5+"], "postprocess": data => year([num(data[1])], 1)},
    {"name": "L1Y$string$1", "symbols": [{"literal":"Y"}, {"literal":"-"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "L1Y", "symbols": ["L1Y$string$1", "d5+"], "postprocess": data => year([-num(data[1])], 1)},
    {"name": "UA", "symbols": [{"literal":"?"}], "postprocess": () => ({ uncertain: true })},
    {"name": "UA", "symbols": [{"literal":"~"}], "postprocess": () => ({ approximate: true })},
    {"name": "UA", "symbols": [{"literal":"%"}], "postprocess": () => ({ approximate: true, uncertain: true })},
    {"name": "L1S", "symbols": ["year", {"literal":"-"}, "d21_24"], "postprocess": data => season(data, 1)},
    {"name": "L2", "symbols": ["L2d"], "postprocess": id},
    {"name": "L2", "symbols": ["L2Y"], "postprocess": id},
    {"name": "L2", "symbols": ["L2S"], "postprocess": id},
    {"name": "L2", "symbols": ["L2D"], "postprocess": id},
    {"name": "L2", "symbols": ["L2i"], "postprocess": id},
    {"name": "L2", "symbols": ["set"], "postprocess": id},
    {"name": "L2", "symbols": ["list"], "postprocess": id},
    {"name": "L2d", "symbols": ["ua_date"], "postprocess": id},
    {"name": "L2d", "symbols": ["L2X"], "postprocess": merge(0, { type: 'Date', level: 2 })},
    {"name": "L2D", "symbols": ["decade"], "postprocess": id},
    {"name": "L2D", "symbols": ["decade", "UA"], "postprocess": merge(0, 1)},
    {"name": "ua_date", "symbols": ["ua_year"], "postprocess": qualify},
    {"name": "ua_date", "symbols": ["ua_year_month"], "postprocess": qualify},
    {"name": "ua_date", "symbols": ["ua_year_month_day"], "postprocess": qualify},
    {"name": "ua_year", "symbols": ["UA", "year"], "postprocess": data => [data]},
    {"name": "ua_year_month$macrocall$2", "symbols": ["year"]},
    {"name": "ua_year_month$macrocall$1$ebnf$1", "symbols": ["UA"], "postprocess": id},
    {"name": "ua_year_month$macrocall$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ua_year_month$macrocall$1$ebnf$2", "symbols": ["UA"], "postprocess": id},
    {"name": "ua_year_month$macrocall$1$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ua_year_month$macrocall$1", "symbols": ["ua_year_month$macrocall$1$ebnf$1", "ua_year_month$macrocall$2", "ua_year_month$macrocall$1$ebnf$2"]},
    {"name": "ua_year_month$macrocall$4", "symbols": ["month"]},
    {"name": "ua_year_month$macrocall$3$ebnf$1", "symbols": ["UA"], "postprocess": id},
    {"name": "ua_year_month$macrocall$3$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ua_year_month$macrocall$3$ebnf$2", "symbols": ["UA"], "postprocess": id},
    {"name": "ua_year_month$macrocall$3$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ua_year_month$macrocall$3", "symbols": ["ua_year_month$macrocall$3$ebnf$1", "ua_year_month$macrocall$4", "ua_year_month$macrocall$3$ebnf$2"]},
    {"name": "ua_year_month", "symbols": ["ua_year_month$macrocall$1", {"literal":"-"}, "ua_year_month$macrocall$3"], "postprocess": pluck(0, 2)},
    {"name": "ua_year_month_day$macrocall$2", "symbols": ["year"]},
    {"name": "ua_year_month_day$macrocall$1$ebnf$1", "symbols": ["UA"], "postprocess": id},
    {"name": "ua_year_month_day$macrocall$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ua_year_month_day$macrocall$1$ebnf$2", "symbols": ["UA"], "postprocess": id},
    {"name": "ua_year_month_day$macrocall$1$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ua_year_month_day$macrocall$1", "symbols": ["ua_year_month_day$macrocall$1$ebnf$1", "ua_year_month_day$macrocall$2", "ua_year_month_day$macrocall$1$ebnf$2"]},
    {"name": "ua_year_month_day", "symbols": ["ua_year_month_day$macrocall$1", {"literal":"-"}, "ua_month_day"], "postprocess": data => [data[0], ...data[2]]},
    {"name": "ua_month_day$macrocall$2", "symbols": ["m31"]},
    {"name": "ua_month_day$macrocall$1$ebnf$1", "symbols": ["UA"], "postprocess": id},
    {"name": "ua_month_day$macrocall$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ua_month_day$macrocall$1$ebnf$2", "symbols": ["UA"], "postprocess": id},
    {"name": "ua_month_day$macrocall$1$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ua_month_day$macrocall$1", "symbols": ["ua_month_day$macrocall$1$ebnf$1", "ua_month_day$macrocall$2", "ua_month_day$macrocall$1$ebnf$2"]},
    {"name": "ua_month_day$macrocall$4", "symbols": ["day"]},
    {"name": "ua_month_day$macrocall$3$ebnf$1", "symbols": ["UA"], "postprocess": id},
    {"name": "ua_month_day$macrocall$3$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ua_month_day$macrocall$3$ebnf$2", "symbols": ["UA"], "postprocess": id},
    {"name": "ua_month_day$macrocall$3$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ua_month_day$macrocall$3", "symbols": ["ua_month_day$macrocall$3$ebnf$1", "ua_month_day$macrocall$4", "ua_month_day$macrocall$3$ebnf$2"]},
    {"name": "ua_month_day", "symbols": ["ua_month_day$macrocall$1", {"literal":"-"}, "ua_month_day$macrocall$3"], "postprocess": pluck(0, 2)},
    {"name": "ua_month_day$macrocall$6", "symbols": ["m30"]},
    {"name": "ua_month_day$macrocall$5$ebnf$1", "symbols": ["UA"], "postprocess": id},
    {"name": "ua_month_day$macrocall$5$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ua_month_day$macrocall$5$ebnf$2", "symbols": ["UA"], "postprocess": id},
    {"name": "ua_month_day$macrocall$5$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ua_month_day$macrocall$5", "symbols": ["ua_month_day$macrocall$5$ebnf$1", "ua_month_day$macrocall$6", "ua_month_day$macrocall$5$ebnf$2"]},
    {"name": "ua_month_day$macrocall$8", "symbols": ["d01_30"]},
    {"name": "ua_month_day$macrocall$7$ebnf$1", "symbols": ["UA"], "postprocess": id},
    {"name": "ua_month_day$macrocall$7$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ua_month_day$macrocall$7$ebnf$2", "symbols": ["UA"], "postprocess": id},
    {"name": "ua_month_day$macrocall$7$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ua_month_day$macrocall$7", "symbols": ["ua_month_day$macrocall$7$ebnf$1", "ua_month_day$macrocall$8", "ua_month_day$macrocall$7$ebnf$2"]},
    {"name": "ua_month_day", "symbols": ["ua_month_day$macrocall$5", {"literal":"-"}, "ua_month_day$macrocall$7"], "postprocess": pluck(0, 2)},
    {"name": "ua_month_day$macrocall$10$string$1", "symbols": [{"literal":"0"}, {"literal":"2"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "ua_month_day$macrocall$10", "symbols": ["ua_month_day$macrocall$10$string$1"]},
    {"name": "ua_month_day$macrocall$9$ebnf$1", "symbols": ["UA"], "postprocess": id},
    {"name": "ua_month_day$macrocall$9$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ua_month_day$macrocall$9$ebnf$2", "symbols": ["UA"], "postprocess": id},
    {"name": "ua_month_day$macrocall$9$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ua_month_day$macrocall$9", "symbols": ["ua_month_day$macrocall$9$ebnf$1", "ua_month_day$macrocall$10", "ua_month_day$macrocall$9$ebnf$2"]},
    {"name": "ua_month_day$macrocall$12", "symbols": ["d01_29"]},
    {"name": "ua_month_day$macrocall$11$ebnf$1", "symbols": ["UA"], "postprocess": id},
    {"name": "ua_month_day$macrocall$11$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ua_month_day$macrocall$11$ebnf$2", "symbols": ["UA"], "postprocess": id},
    {"name": "ua_month_day$macrocall$11$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ua_month_day$macrocall$11", "symbols": ["ua_month_day$macrocall$11$ebnf$1", "ua_month_day$macrocall$12", "ua_month_day$macrocall$11$ebnf$2"]},
    {"name": "ua_month_day", "symbols": ["ua_month_day$macrocall$9", {"literal":"-"}, "ua_month_day$macrocall$11"], "postprocess": pluck(0, 2)},
    {"name": "L2X", "symbols": ["dx4"], "postprocess": masked()},
    {"name": "L2X", "symbols": ["dx4", {"literal":"-"}, "mx"], "postprocess": masked()},
    {"name": "L2X", "symbols": ["dx4", {"literal":"-"}, "mdx"], "postprocess": masked()},
    {"name": "mdx", "symbols": ["m31x", {"literal":"-"}, "d31x"], "postprocess": join},
    {"name": "mdx", "symbols": ["m30x", {"literal":"-"}, "d30x"], "postprocess": join},
    {"name": "mdx$string$1", "symbols": [{"literal":"0"}, {"literal":"2"}, {"literal":"-"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "mdx", "symbols": ["mdx$string$1", "d29x"], "postprocess": join},
    {"name": "L2i", "symbols": ["L2i_date", {"literal":"/"}, "L2i_date"], "postprocess": interval(2)},
    {"name": "L2i", "symbols": ["date_time", {"literal":"/"}, "L2i_date"], "postprocess": interval(2)},
    {"name": "L2i", "symbols": ["L2i_date", {"literal":"/"}, "date_time"], "postprocess": interval(2)},
    {"name": "L2i_date", "symbols": [], "postprocess": nothing},
    {"name": "L2i_date", "symbols": ["ua_date"], "postprocess": id},
    {"name": "L2i_date", "symbols": ["L2X"], "postprocess": id},
    {"name": "L2i_date", "symbols": ["INFINITY"], "postprocess": id},
    {"name": "L2Y", "symbols": ["exp_year"], "postprocess": id},
    {"name": "L2Y", "symbols": ["exp_year", "significant_digits"], "postprocess": merge(0, 1)},
    {"name": "L2Y", "symbols": ["L1Y", "significant_digits"], "postprocess": merge(0, 1, { level: 2 })},
    {"name": "L2Y", "symbols": ["year", "significant_digits"], "postprocess": data => year([data[0]], 2, data[1])},
    {"name": "significant_digits", "symbols": [{"literal":"S"}, "positive_digit"], "postprocess": data => ({ significant: num(data[1]) })},
    {"name": "exp_year", "symbols": [{"literal":"Y"}, "exp"], "postprocess": data => year([data[1]], 2)},
    {"name": "exp_year$string$1", "symbols": [{"literal":"Y"}, {"literal":"-"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "exp_year", "symbols": ["exp_year$string$1", "exp"], "postprocess": data => year([-data[1]], 2)},
    {"name": "exp", "symbols": ["digits", {"literal":"E"}, "digits"], "postprocess": data => num(data[0]) * Math.pow(10, num(data[2]))},
    {"name": "L2S", "symbols": ["year", {"literal":"-"}, "d25_41"], "postprocess": data => season(data, 2)},
    {"name": "decade", "symbols": ["positive_decade"], "postprocess": data => decade(data[0])},
    {"name": "decade$string$1", "symbols": [{"literal":"0"}, {"literal":"0"}, {"literal":"0"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "decade", "symbols": ["decade$string$1"], "postprocess": () => decade(0)},
    {"name": "decade", "symbols": [{"literal":"-"}, "positive_decade"], "postprocess": data => decade(-data[1])},
    {"name": "positive_decade", "symbols": ["positive_digit", "digit", "digit"], "postprocess": num},
    {"name": "positive_decade", "symbols": [{"literal":"0"}, "positive_digit", "digit"], "postprocess": num},
    {"name": "positive_decade$string$1", "symbols": [{"literal":"0"}, {"literal":"0"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "positive_decade", "symbols": ["positive_decade$string$1", "positive_digit"], "postprocess": num},
    {"name": "set", "symbols": ["LSB", "OL", "RSB"], "postprocess": list},
    {"name": "list", "symbols": ["LLB", "OL", "RLB"], "postprocess": list},
    {"name": "LSB", "symbols": [{"literal":"["}], "postprocess": () => ({ type: 'Set' })},
    {"name": "LSB$string$1", "symbols": [{"literal":"["}, {"literal":"."}, {"literal":"."}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "LSB", "symbols": ["LSB$string$1"], "postprocess": () => ({ type: 'Set', earlier: true })},
    {"name": "LLB", "symbols": [{"literal":"{"}], "postprocess": () => ({ type: 'List' })},
    {"name": "RSB", "symbols": [{"literal":"]"}], "postprocess": nothing},
    {"name": "RSB$string$1", "symbols": [{"literal":"."}, {"literal":"."}, {"literal":"]"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "RSB", "symbols": ["RSB$string$1"], "postprocess": () => ({ later: true })},
    {"name": "RLB", "symbols": [{"literal":"}"}], "postprocess": nothing},
    {"name": "OL", "symbols": ["LI"], "postprocess": data => [data[0]]},
    {"name": "OL", "symbols": ["OL", "_", {"literal":","}, "_", "LI"], "postprocess": data => [...data[0], data[4]]},
    {"name": "LI", "symbols": ["date"], "postprocess": id},
    {"name": "LI", "symbols": ["ua_date"], "postprocess": id},
    {"name": "LI", "symbols": ["L2X"], "postprocess": id},
    {"name": "LI", "symbols": ["consecutives"], "postprocess": id},
    {"name": "consecutives$string$1", "symbols": [{"literal":"."}, {"literal":"."}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "consecutives", "symbols": ["year_month_day", "consecutives$string$1", "year_month_day"], "postprocess": d => [date(d[0]), date(d[2])]},
    {"name": "consecutives$string$2", "symbols": [{"literal":"."}, {"literal":"."}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "consecutives", "symbols": ["year_month", "consecutives$string$2", "year_month"], "postprocess": d => [date(d[0]), date(d[2])]},
    {"name": "consecutives$string$3", "symbols": [{"literal":"."}, {"literal":"."}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "consecutives", "symbols": ["year", "consecutives$string$3", "year"], "postprocess": d => [date([d[0]]), date([d[2]])]},
    {"name": "digit", "symbols": ["positive_digit"], "postprocess": id},
    {"name": "digit", "symbols": [{"literal":"0"}], "postprocess": id},
    {"name": "digits", "symbols": ["digit"], "postprocess": id},
    {"name": "digits", "symbols": ["digits", "digit"], "postprocess": join},
    {"name": "d4", "symbols": ["d2", "d2"], "postprocess": join},
    {"name": "d3", "symbols": ["d2", "digit"], "postprocess": join},
    {"name": "d2", "symbols": ["digit", "digit"], "postprocess": join},
    {"name": "d5+", "symbols": ["positive_digit", "d3", "digits"], "postprocess": num},
    {"name": "d1x", "symbols": [/[1-9X]/], "postprocess": id},
    {"name": "dx", "symbols": ["d1x"], "postprocess": id},
    {"name": "dx", "symbols": [{"literal":"0"}], "postprocess": id},
    {"name": "dx2", "symbols": ["dx", "dx"], "postprocess": join},
    {"name": "dx4", "symbols": ["dx2", "dx2"], "postprocess": join},
    {"name": "md", "symbols": ["m31"], "postprocess": id},
    {"name": "md", "symbols": ["m30"], "postprocess": id},
    {"name": "md$string$1", "symbols": [{"literal":"0"}, {"literal":"2"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "md", "symbols": ["md$string$1"], "postprocess": id},
    {"name": "mx", "symbols": [{"literal":"0"}, "d1x"], "postprocess": join},
    {"name": "mx", "symbols": [/[1X]/, /[012X]/], "postprocess": join},
    {"name": "m31x", "symbols": [/[0X]/, /[13578X]/], "postprocess": join},
    {"name": "m31x", "symbols": [/[1X]/, /[02]/], "postprocess": join},
    {"name": "m31x$string$1", "symbols": [{"literal":"1"}, {"literal":"X"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "m31x", "symbols": ["m31x$string$1"], "postprocess": id},
    {"name": "m30x", "symbols": [/[0X]/, /[469]/], "postprocess": join},
    {"name": "m30x$string$1", "symbols": [{"literal":"1"}, {"literal":"1"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "m30x", "symbols": ["m30x$string$1"], "postprocess": join},
    {"name": "d29x", "symbols": [{"literal":"0"}, "d1x"], "postprocess": join},
    {"name": "d29x", "symbols": [/[1-2X]/, "dx"], "postprocess": join},
    {"name": "d30x", "symbols": ["d29x"], "postprocess": join},
    {"name": "d30x$string$1", "symbols": [{"literal":"3"}, {"literal":"0"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "d30x", "symbols": ["d30x$string$1"], "postprocess": id},
    {"name": "d31x", "symbols": ["d30x"], "postprocess": id},
    {"name": "d31x", "symbols": [{"literal":"3"}, /[1X]/], "postprocess": join},
    {"name": "positive_digit", "symbols": [/[1-9]/], "postprocess": id},
    {"name": "m31$subexpression$1$string$1", "symbols": [{"literal":"0"}, {"literal":"1"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "m31$subexpression$1", "symbols": ["m31$subexpression$1$string$1"]},
    {"name": "m31$subexpression$1$string$2", "symbols": [{"literal":"0"}, {"literal":"3"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "m31$subexpression$1", "symbols": ["m31$subexpression$1$string$2"]},
    {"name": "m31$subexpression$1$string$3", "symbols": [{"literal":"0"}, {"literal":"5"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "m31$subexpression$1", "symbols": ["m31$subexpression$1$string$3"]},
    {"name": "m31$subexpression$1$string$4", "symbols": [{"literal":"0"}, {"literal":"7"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "m31$subexpression$1", "symbols": ["m31$subexpression$1$string$4"]},
    {"name": "m31$subexpression$1$string$5", "symbols": [{"literal":"0"}, {"literal":"8"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "m31$subexpression$1", "symbols": ["m31$subexpression$1$string$5"]},
    {"name": "m31$subexpression$1$string$6", "symbols": [{"literal":"1"}, {"literal":"0"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "m31$subexpression$1", "symbols": ["m31$subexpression$1$string$6"]},
    {"name": "m31$subexpression$1$string$7", "symbols": [{"literal":"1"}, {"literal":"2"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "m31$subexpression$1", "symbols": ["m31$subexpression$1$string$7"]},
    {"name": "m31", "symbols": ["m31$subexpression$1"], "postprocess": id},
    {"name": "m30$subexpression$1$string$1", "symbols": [{"literal":"0"}, {"literal":"4"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "m30$subexpression$1", "symbols": ["m30$subexpression$1$string$1"]},
    {"name": "m30$subexpression$1$string$2", "symbols": [{"literal":"0"}, {"literal":"6"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "m30$subexpression$1", "symbols": ["m30$subexpression$1$string$2"]},
    {"name": "m30$subexpression$1$string$3", "symbols": [{"literal":"0"}, {"literal":"9"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "m30$subexpression$1", "symbols": ["m30$subexpression$1$string$3"]},
    {"name": "m30$subexpression$1$string$4", "symbols": [{"literal":"1"}, {"literal":"1"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "m30$subexpression$1", "symbols": ["m30$subexpression$1$string$4"]},
    {"name": "m30", "symbols": ["m30$subexpression$1"], "postprocess": id},
    {"name": "d01_11", "symbols": [{"literal":"0"}, "positive_digit"], "postprocess": join},
    {"name": "d01_11", "symbols": [{"literal":"1"}, /[0-1]/], "postprocess": join},
    {"name": "d01_12", "symbols": ["d01_11"], "postprocess": id},
    {"name": "d01_12$string$1", "symbols": [{"literal":"1"}, {"literal":"2"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "d01_12", "symbols": ["d01_12$string$1"], "postprocess": id},
    {"name": "d01_13", "symbols": ["d01_12"], "postprocess": id},
    {"name": "d01_13$string$1", "symbols": [{"literal":"1"}, {"literal":"3"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "d01_13", "symbols": ["d01_13$string$1"], "postprocess": id},
    {"name": "d00_14$string$1", "symbols": [{"literal":"0"}, {"literal":"0"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "d00_14", "symbols": ["d00_14$string$1"], "postprocess": id},
    {"name": "d00_14", "symbols": ["d01_13"], "postprocess": id},
    {"name": "d00_14$string$2", "symbols": [{"literal":"1"}, {"literal":"4"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "d00_14", "symbols": ["d00_14$string$2"], "postprocess": id},
    {"name": "d00_23$string$1", "symbols": [{"literal":"0"}, {"literal":"0"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "d00_23", "symbols": ["d00_23$string$1"], "postprocess": id},
    {"name": "d00_23", "symbols": ["d01_23"], "postprocess": id},
    {"name": "d01_23", "symbols": [{"literal":"0"}, "positive_digit"], "postprocess": join},
    {"name": "d01_23", "symbols": [{"literal":"1"}, "digit"], "postprocess": join},
    {"name": "d01_23", "symbols": [{"literal":"2"}, /[0-3]/], "postprocess": join},
    {"name": "d01_29", "symbols": [{"literal":"0"}, "positive_digit"], "postprocess": join},
    {"name": "d01_29", "symbols": [/[1-2]/, "digit"], "postprocess": join},
    {"name": "d01_30", "symbols": ["d01_29"], "postprocess": id},
    {"name": "d01_30$string$1", "symbols": [{"literal":"3"}, {"literal":"0"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "d01_30", "symbols": ["d01_30$string$1"], "postprocess": id},
    {"name": "d01_31", "symbols": ["d01_30"], "postprocess": id},
    {"name": "d01_31$string$1", "symbols": [{"literal":"3"}, {"literal":"1"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "d01_31", "symbols": ["d01_31$string$1"], "postprocess": id},
    {"name": "d00_59$string$1", "symbols": [{"literal":"0"}, {"literal":"0"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "d00_59", "symbols": ["d00_59$string$1"], "postprocess": id},
    {"name": "d00_59", "symbols": ["d01_59"], "postprocess": id},
    {"name": "d01_59", "symbols": ["d01_29"], "postprocess": id},
    {"name": "d01_59", "symbols": [/[345]/, "digit"], "postprocess": join},
    {"name": "d21_24", "symbols": [{"literal":"2"}, /[1-4]/], "postprocess": join},
    {"name": "d25_41", "symbols": [{"literal":"2"}, /[5-9]/], "postprocess": join},
    {"name": "d25_41", "symbols": [{"literal":"3"}, "digit"], "postprocess": join},
    {"name": "d25_41", "symbols": [{"literal":"4"}, /[01]/], "postprocess": join},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": [{"literal":" "}, "_$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "_", "symbols": ["_$ebnf$1"]}
]
  , ParserStart: "edtf"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();

},{"./bitmask":120,"./util":123}],122:[function(require,module,exports){
'use strict'

const nearley = require('nearley')
const grammar = require('./grammar')

function byLevel(a, b) {
  return a.level < b.level ? -1 : a.level > b.level ? 1 : 0
}

function limit(results, { level, types }) {
  if (!results.length) return results
  if (typeof level !== 'number') level = 2

  return results.filter(res =>
    (level >= res.level) && (!types || types.includes(res.type)))
}

function best(results) {
  if (results.length < 2) return results[0]

  // If there are multiple results, pick the first
  // one on the lowest level!
  return results.sort(byLevel)[0]
}

module.exports = {

  parse(input, constraints = {}) {
    try {
      let nep = module.exports.parser()
      let res = best(limit(nep.feed(input).results, constraints))

      if (!res) throw new Error('edtf: No possible parsings (@EOS)')

      return res

    } catch (error) {
      error.message += ` for "${input}"`
      throw error
    }
  },

  parser() {
    return new nearley.Parser(grammar.ParserRules, grammar.ParserStart)
  }
}

},{"./grammar":121,"nearley":124}],123:[function(require,module,exports){
'use strict'

const Bitmask = require('./bitmask')
const { assign } = Object

const util = {

  num(data) {
    return Number(Array.isArray(data) ? data.join('') : data)
  },

  join(data) {
    return data.join('')
  },

  zero() { return 0 },

  nothing() { return null },

  pick(...args) {
    return args.length === 1 ?
      data => data[args[0]] :
      data => util.concat(data, args)
  },

  pluck(...args) {
    return data => args.map(i => data[i])
  },

  concat(data, idx = data.keys()) {
    return Array.from(idx)
      .reduce((memo, i) => data[i] !== null ? memo.concat(data[i]) : memo, [])
  },

  merge(...args) {
    if (typeof args[args.length - 1] === 'object')
      var extra = args.pop()

    return data => assign(args.reduce((a, i) => assign(a, data[i]), {}), extra)
  },

  interval(level) {
    return data => ({
      values: [data[0], data[2]],
      type: 'Interval',
      level
    })
  },

  masked(type = 'unspecified', symbol = 'X') {
    return (data, _, reject) => {
      let mask = data.join('').replace(/-/g, '')

      return mask.indexOf(symbol) === -1 ? reject : {
        values: Bitmask.values(mask),
        [type]: Bitmask.compute(mask)
      }
    }
  },

  date(values, level = 0, extra = null) {
    return assign({
      type: 'Date',
      level,
      values: Bitmask.normalize(values.map(Number))
    }, extra)
  },

  year(values, level = 1, extra = null) {
    return assign({
      type: 'Year',
      level,
      values: values.map(Number)
    }, extra)
  },

  century(century, level = 0) {
    return {
      type: 'Century',
      level,
      values: [century]
    }
  },

  decade(decade, level = 2) {
    return {
      type: 'Decade',
      level,
      values: [decade]
    }
  },

  datetime(data) {
    return {
      values: Bitmask.normalize(data[0].map(Number)).concat(data[2]),
      offset: data[3],
      type: 'Date',
      level: 0
    }
  },

  season(data, level = 1) {
    return {
      type: 'Season',
      level,
      values: [Number(data[0]), Number(data[2])]
    }
  },

  list(data) {
    return assign({ values: data[1], level: 2 }, data[0], data[2])
  },

  qualify([parts], _, reject) {
    let q = {
      uncertain: new Bitmask(), approximate: new Bitmask()
    }

    let values = parts
      .map(([lhs, part, rhs], idx) => {
        for (let ua in lhs) q[ua].qualify(idx * 2)
        for (let ua in rhs) q[ua].qualify(1 + idx * 2)
        return part
      })

    return (!q.uncertain.value && !q.approximate.value) ?
      reject :
      assign(util.date(values, 2), {
        uncertain: q.uncertain.value,
        approximate: q.approximate.value
      })
  }

}

module.exports = util

},{"./bitmask":120}],124:[function(require,module,exports){
(function () {
function Rule(name, symbols, postprocess) {
    this.name = name;
    this.symbols = symbols;        // a list of literal | regex class | nonterminal
    this.postprocess = postprocess;
    return this;
}

Rule.prototype.toString = function(withCursorAt) {
    function stringifySymbolSequence (e) {
        return (e.literal) ? JSON.stringify(e.literal)
                           : e.toString();
    }
    var symbolSequence = (typeof withCursorAt === "undefined")
                         ? this.symbols.map(stringifySymbolSequence).join(' ')
                         : (   this.symbols.slice(0, withCursorAt).map(stringifySymbolSequence).join(' ')
                             + " ● "
                             + this.symbols.slice(withCursorAt).map(stringifySymbolSequence).join(' ')     );
    return this.name + " → " + symbolSequence;
}


// a State is a rule at a position from a given starting point in the input stream (reference)
function State(rule, expect, reference) {
    this.rule = rule;
    this.expect = expect;
    this.reference = reference;
    this.data = [];
}

State.prototype.toString = function() {
    return "{" + this.rule.toString(this.expect) + "}, from: " + (this.reference || 0);
};

State.prototype.nextState = function(data) {
    var state = new State(this.rule, this.expect + 1, this.reference);
    state.data = this.data.slice(0);  // make a cheap copy of currentState's data
    state.data.push(data);            // append the passed data
    return state;
};

State.prototype.consumeTerminal = function(inp) {
    var val = false;
    if (this.rule.symbols[this.expect]) {                  // is there a symbol to test?
       if (this.rule.symbols[this.expect].test) {          // is the symbol a regex?
          if (this.rule.symbols[this.expect].test(inp)) {  // does the regex match
             val = this.nextState(inp);  // nextState on a successful regex match
          }
       } else {   // not a regex, must be a literal
          if (this.rule.symbols[this.expect].literal === inp) {
             val = this.nextState(inp);  // nextState on a successful literal match
          }
       }
    }
    return val;
};

State.prototype.consumeNonTerminal = function(inp) {
    if (this.rule.symbols[this.expect] === inp) {
        return this.nextState(inp);
    }
    return false;
};

State.prototype.process = function(location, ind, table, rules, addedRules) {
    if (this.expect === this.rule.symbols.length) {
        // I have completed a rule
        if (this.rule.postprocess) {
            this.data = this.rule.postprocess(this.data, this.reference, Parser.fail);
        }
        if (!(this.data === Parser.fail)) {
            // LEO THE LION SAYS GER
            function findLeo(idx, rulename, finalData) {
                // performance optimization, avoid high order functions(map/filter) in hotspot code.
                var items = [];
                var row = table[idx];
                for (var col = 0; col < row.length; col++) {
                    var s = row[col].consumeNonTerminal(rulename);
                    if (s && s.isComplete() && s.rule.name === rulename) {
                        items.push(s);
                    }
                }
                if (items.length === 1) {
                    var item = items[0];
                    item.data[item.data.length-1] = finalData;
                    if (item.reference === idx) {
                        return item;
                    }
                    var newdata = item.data;
                    if (item.rule.postprocess) {
                        newdata = item.rule.postprocess(item.data, item.reference, Parser.fail);
                    }
                    if (newdata === Parser.fail) {
                        return false;
                    }
                    return findLeo(item.reference, item.rule.name, newdata) || item;
                } else {
                    return false;
                }
            }

            var leo = findLeo(this.reference, this.rule.name, this.data);
            if (leo) {
                leo.epsilonClosure(location, ind, table);
                return;
            }

            var w = 0;
            // We need a while here because the empty rule will
            // modify table[reference]. (when location === reference)
            var s,x;
            while (w < table[this.reference].length) {
                s = table[this.reference][w];
                x = s.consumeNonTerminal(this.rule.name);
                if (x && !(leo && x.isComplete())) { // ignore leo-ey terms
                    x.data[x.data.length-1] = this.data;
                    x.epsilonClosure(location, ind, table);
                }
                w++;
            }

            // --- The comment below is OUTDATED. It's left so that future
            // editors know not to try and do that.

            // Remove this rule from "addedRules" so that another one can be
            // added if some future added rule requires it.
            // Note: I can be optimized by someone clever and not-lazy. Somehow
            // queue rules so that everything that this completion "spawns" can
            // affect the rest of the rules yet-to-be-added-to-the-table.
            // Maybe.

            // I repeat, this is a *bad* idea.

            // var i = addedRules.indexOf(this.rule);
            // if (i !== -1) {
            //     addedRules.splice(i, 1);
            // }
        }
    } else {
        // I'm not done, but I can predict something
        var exp = this.rule.symbols[this.expect];

        // for each rule
        // implemented as for instead of forEach for performance
        for(var rule = 0; rule < rules.length; ++rule) {
            var r = rules[rule];
            // if I expect it, and it hasn't been added already
            if (r.name === exp && addedRules.indexOf(r) === -1) {
                // Make a note that you've added it already, and don't need to
                // add it again; otherwise left recursive rules are going to go
                // into an infinite loop by adding themselves over and over
                // again.

                // If it's the null rule, however, you don't do this because it
                // affects the current table row, so you might need it to be
                // called again later. Instead, I just insert a copy whose
                // state has been advanced one position (since that's all the
                // null rule means anyway)

                if (r.symbols.length > 0) {
                    addedRules.push(r);
                    new State(r, 0, location).epsilonClosure(location, ind, table);
                } else {
                    // Empty rule
                    // This is special
                    var copy = this.consumeNonTerminal(r.name);
                    if (r.postprocess) {
                        copy.data[copy.data.length-1] = r.postprocess([], this.reference);
                    } else {
                        copy.data[copy.data.length-1] = [];
                    }
                    copy.epsilonClosure(location, ind, table);
                }
            }
        }
    }
};

State.prototype.isComplete = function() {
    return this.expect === this.rule.symbols.length;
}

/**
 * Computes all possible epsilon-steps from the current state at
 * given location. States 0 through ind-1 in location are considered
 * for possible nullables.
 */
State.prototype.epsilonClosure = function(location, ind, table, result) {
    var col = table[location];
    if (!result) result = table[location]; // convenient common case

    result.push(this);

    if (!this.isComplete()) {
        for (var i = 0; i < ind; i++) {
            var state = col[i];
            if (state.isComplete() && state.reference === location) {
                var x = this.consumeNonTerminal(state.rule.name);
                if (x) {
                    x.data[x.data.length-1] = state.data;
                    x.epsilonClosure(location, ind, table);
                }
            }
        }
    }
}


function Parser(rules, start) {
    var table = this.table = [];
    this.rules = rules.map(function (r) { return (new Rule(r.name, r.symbols, r.postprocess)); });
    this.start = start = start || this.rules[0].name;
    // Setup a table
    var addedRules = [];
    this.table.push([]);
    // I could be expecting anything.
    this.rules.forEach(function (r) {
        if (r.name === start) {  // add all rules named start
            addedRules.push(r);
            table[0].push(new State(r, 0, 0));
        }});  // this should refer to this object, not each rule inside the forEach
    this.advanceTo(0, addedRules);
    this.current = 0;
}

// create a reserved token for indicating a parse fail
Parser.fail = {};

Parser.prototype.advanceTo = function(n, addedRules) {
    // Advance a table, take the closure of .process for location n in the input stream
    var w = 0;
    while (w < this.table[n].length) {
        (this.table[n][w]).process(n, w, this.table, this.rules, addedRules);
        w++;
    }
}

Parser.prototype.feed = function(chunk) {
    for (var chunkPos = 0; chunkPos < chunk.length; chunkPos++) {
        // We add new states to table[current+1]
        this.table.push([]);

        // Advance all tokens that expect the symbol
        // So for each state in the previous row,

        for (var w = 0; w < this.table[this.current + chunkPos].length; w++) {
            var s = this.table[this.current + chunkPos][w];
            var x = s.consumeTerminal(chunk[chunkPos]);      // Try to consume the token
            if (x) {
                // And then add it
                this.table[this.current + chunkPos + 1].push(x);
            }
        }

        // Next, for each of the rules, we either
        // (a) complete it, and try to see if the reference row expected that
        //     rule
        // (b) predict the next nonterminal it expects by adding that
        //     nonterminal's start state
        // To prevent duplication, we also keep track of rules we have already
        // added

        var addedRules = [];
        this.advanceTo(this.current + chunkPos + 1, addedRules);

        // If needed, throw an error:
        if (this.table[this.table.length-1].length === 0) {
            // No states at all! This is not good.
            var err = new Error(
                "nearley: No possible parsings (@" + (this.current + chunkPos)
                    + ": '" + chunk[chunkPos] + "')."
            );
            err.offset = this.current + chunkPos;
            throw err;
        }
    }

    this.current += chunkPos;
    // Incrementally keep track of results
    this.results = this.finish();

    // Allow chaining, for whatever it's worth
    return this;
};

Parser.prototype.finish = function() {
    // Return the possible parsings
    var considerations = [];
    var myself = this;
    this.table[this.table.length-1].forEach(function (t) {
        if (t.rule.name === myself.start
                && t.expect === t.rule.symbols.length
                && t.reference === 0
                && t.data !== Parser.fail) {
            considerations.push(t);
        }
    });
    return considerations.map(function(c) {return c.data; });
};

var nearley = {
    Parser: Parser,
    Rule: Rule
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
   module.exports = nearley;
} else {
   window.nearley = nearley;
}
})();

},{}],125:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var cov_1w8ie4z90q = function () {
    var path = '/home/travis/build/fiduswriter/biblatex-csl-converter/src/const.js',
        hash = '840f9cd3cc80523acf93c783e771c90c299bfbc1',
        global = new Function('return this')(),
        gcv = '__coverage__',
        coverageData = {
        path: '/home/travis/build/fiduswriter/biblatex-csl-converter/src/const.js',
        statementMap: {
            '0': {
                start: {
                    line: 2,
                    column: 29
                },
                end: {
                    line: 424,
                    column: 1
                }
            },
            '1': {
                start: {
                    line: 427,
                    column: 28
                },
                end: {
                    line: 628,
                    column: 1
                }
            },
            '2': {
                start: {
                    line: 631,
                    column: 24
                },
                end: {
                    line: 896,
                    column: 1
                }
            }
        },
        fnMap: {},
        branchMap: {},
        s: {
            '0': 0,
            '1': 0,
            '2': 0
        },
        f: {},
        b: {},
        _coverageSchema: '332fd63041d2c1bcb487cc26dd0d5f7d97098a6c'
    },
        coverage = global[gcv] || (global[gcv] = {});

    if (coverage[path] && coverage[path].hash === hash) {
        return coverage[path];
    }

    coverageData.hash = hash;
    return coverage[path] = coverageData;
}();

/** A list of field types of Bibligraphy DB with lookup by field name. */
var BibFieldTypes = exports.BibFieldTypes = (++cov_1w8ie4z90q.s[0], {
    'abstract': {
        type: 'f_long_literal',
        biblatex: 'abstract',
        csl: 'abstract'
    },
    'addendum': {
        type: 'f_literal',
        biblatex: 'addendum'
    },
    'afterword': {
        type: 'l_name',
        biblatex: 'afterword'
    },
    'annotation': {
        type: 'f_long_literal',
        biblatex: 'annotation'
    },
    'annotator': {
        type: 'l_name',
        biblatex: 'annotator'
    },
    'author': {
        type: 'l_name',
        biblatex: 'author',
        csl: 'author'
    },
    'bookauthor': {
        type: 'l_name',
        biblatex: 'bookauthor',
        csl: 'container-author'
    },
    'bookpagination': {
        type: 'f_key',
        biblatex: 'bookpagination',
        options: ['page', 'column', 'section', 'paragraph', 'verse', 'line']
    },
    'booksubtitle': {
        type: 'f_title',
        biblatex: 'booksubtitle'
    },
    'booktitle': {
        type: 'f_title',
        biblatex: 'booktitle',
        csl: 'container-title'
    },
    'booktitleaddon': {
        type: 'f_title',
        biblatex: 'booktitleaddon'
    },
    'chapter': {
        type: 'f_literal',
        biblatex: 'chapter',
        csl: 'chapter-number'
    },
    'commentator': {
        type: 'l_name',
        biblatex: 'commentator'
    },
    'date': {
        type: 'f_date',
        biblatex: 'date',
        csl: 'issued'
    },
    'doi': {
        type: 'f_verbatim',
        biblatex: 'doi',
        csl: 'DOI'
    },
    'edition': {
        type: 'f_integer',
        biblatex: 'edition',
        csl: 'edition'
    },
    'editor': {
        type: 'l_name',
        biblatex: 'editor',
        csl: 'editor'
    },
    'editora': {
        type: 'l_name',
        biblatex: 'editora'
    },
    'editorb': {
        type: 'l_name',
        biblatex: 'editorb'
    },
    'editorc': {
        type: 'l_name',
        biblatex: 'editorc'
    },
    'editortype': {
        type: 'f_key',
        biblatex: 'editortype',
        options: ['editor', 'compiler', 'founder', 'continuator', 'redactor', 'reviser', 'collaborator']
    },
    'editoratype': {
        type: 'f_key',
        biblatex: 'editoratype',
        options: ['editor', 'compiler', 'founder', 'continuator', 'redactor', 'reviser', 'collaborator']
    },
    'editorbtype': {
        type: 'f_key',
        biblatex: 'editorbtype',
        options: ['editor', 'compiler', 'founder', 'continuator', 'redactor', 'reviser', 'collaborator']
    },
    'editorctype': {
        type: 'f_key',
        biblatex: 'editorctype',
        options: ['editor', 'compiler', 'founder', 'continuator', 'redactor', 'reviser', 'collaborator']
    },
    'eid': {
        type: 'f_literal',
        biblatex: 'eid'
    },
    'entrysubtype': {
        type: 'f_literal',
        biblatex: 'entrysubtype'
    },
    'eprint': {
        type: 'f_verbatim',
        biblatex: 'eprint'
    },
    'eprintclass': {
        type: 'f_literal',
        biblatex: 'eprintclass'
    },
    'eprinttype': {
        type: 'f_literal',
        biblatex: 'eprinttype'
    },
    'eventdate': {
        type: 'f_date',
        biblatex: 'eventdate',
        csl: 'event-date'
    },
    'eventtitle': {
        type: 'f_title',
        biblatex: 'eventtitle',
        csl: 'event'
    },
    'file': {
        type: 'f_verbatim',
        biblatex: 'file'
    },
    'foreword': {
        type: 'l_name',
        biblatex: 'foreword'
    },
    'holder': {
        type: 'l_name',
        biblatex: 'holder'
    },
    'howpublished': {
        type: 'f_literal',
        biblatex: 'howpublished',
        csl: 'medium'
    },
    'indextitle': {
        type: 'f_literal',
        biblatex: 'indextitle'
    },
    'institution': {
        type: 'l_literal',
        biblatex: 'institution'
    },
    'introduction': {
        type: 'l_name',
        biblatex: 'introduction'
    },
    'isan': {
        type: 'f_literal',
        biblatex: 'isan'
    },
    'isbn': {
        type: 'f_literal',
        biblatex: 'isbn',
        csl: 'ISBN'
    },
    'ismn': {
        type: 'f_literal',
        biblatex: 'ismn'
    },
    'isrn': {
        type: 'f_literal',
        biblatex: 'isrn'
    },
    'issn': {
        type: 'f_literal',
        biblatex: 'issn',
        csl: 'ISSN'
    },
    'issue': {
        type: 'f_literal',
        biblatex: 'issue',
        csl: 'issue'
    },
    'issuesubtitle': {
        type: 'f_literal',
        biblatex: 'issuesubtitle'
    },
    'issuetitle': {
        type: 'f_literal',
        biblatex: 'issuetitle'
    },
    'iswc': {
        type: 'f_literal',
        biblatex: 'iswc'
    },
    'journalsubtitle': {
        type: 'f_literal',
        biblatex: 'journalsubtitle'
    },
    'journaltitle': {
        type: 'f_literal',
        biblatex: 'journaltitle',
        csl: 'container-title'
    },
    'keywords': {
        type: 'l_tag',
        biblatex: 'keywords'
    },
    'label': {
        type: 'f_literal',
        biblatex: 'label'
    },
    'language': {
        type: 'l_key',
        biblatex: 'language',
        options: ['american', 'brazilian', 'catalan', 'croation', 'czech', 'danish', 'dutch', 'english', 'finnish', 'french', 'german', 'greek', 'italian', 'latin', 'norwegian', 'polish', 'portuguese', 'russian', 'slovene', 'spanish', 'swedish']
    },
    'langid': {
        type: 'f_lang',
        biblatex: 'langid',
        csl: 'language'
    },
    'library': {
        type: 'f_literal',
        biblatex: 'library'
    },
    'location': {
        type: 'l_literal',
        biblatex: 'location',
        csl: 'publisher-place'
    },
    'mainsubtitle': {
        type: 'f_title',
        biblatex: 'mainsubtitle'
    },
    'maintitle': {
        type: 'f_title',
        biblatex: 'maintitle'
    },
    'maintitleaddon': {
        type: 'f_title',
        biblatex: 'maintitleaddon'
    },
    'nameaddon': {
        type: 'f_literal',
        biblatex: 'nameaddon'
    },
    'note': {
        type: 'f_literal',
        biblatex: 'note',
        csl: 'note'
    },
    'number': {
        type: 'f_literal',
        biblatex: 'number',
        csl: 'number'
    },
    'organization': {
        type: 'l_literal',
        biblatex: 'organization'
    },
    'origdate': {
        type: 'f_date',
        biblatex: 'origdate',
        csl: 'original-date'
    },
    'origlanguage': {
        type: 'f_key',
        biblatex: 'origlanguage',
        options: ['american', 'brazilian', 'catalan', 'croation', 'czech', 'danish', 'dutch', 'english', 'finnish', 'french', 'german', 'greek', 'italian', 'latin', 'norwegian', 'polish', 'portuguese', 'russian', 'slovene', 'spanish', 'swedish']
    },
    'origlocation': {
        type: 'l_literal',
        biblatex: 'origlocation',
        csl: 'original-publisher-place'
    },
    'origpublisher': {
        type: 'l_literal',
        biblatex: 'origpublisher',
        csl: 'original-publisher'
    },
    'origtitle': {
        type: 'f_title',
        biblatex: 'origtitle',
        csl: 'original-title'
    },
    'pages': {
        type: 'f_range',
        biblatex: 'pages',
        csl: 'page'
    },
    'pagetotal': {
        type: 'f_literal',
        biblatex: 'pagetotal',
        csl: 'number-of-pages'
    },
    'pagination': {
        type: 'f_key',
        biblatex: 'pagination',
        options: ['page', 'column', 'section', 'paragraph', 'verse', 'line']
    },
    'part': {
        type: 'f_literal',
        biblatex: 'part'
    },
    'publisher': {
        type: 'l_literal',
        biblatex: 'publisher',
        csl: 'publisher'
    },
    'pubstate': {
        type: 'f_key',
        biblatex: 'pubstate',
        csl: 'status',
        options: ['inpreparation', 'submitted', 'forthcoming', 'inpress', 'prepublished']
    },
    'reprinttitle': {
        type: 'f_literal',
        biblatex: 'reprinttitle'
    },
    'series': {
        type: 'f_literal',
        biblatex: 'series',
        csl: 'collection-title'
    },
    'shortauthor': {
        type: 'l_name',
        biblatex: 'shortauthor'
    },
    'shorteditor': {
        type: 'l_name',
        biblatex: 'shorteditor'
    },
    'shorthand': {
        type: 'f_literal',
        biblatex: 'shorthand'
    },
    'shorthandintro': {
        type: 'f_literal',
        biblatex: 'shorthandintro'
    },
    'shortjournal': {
        type: 'f_literal',
        biblatex: 'shortjournal',
        csl: 'container-title-short'
    },
    'shortseries': {
        type: 'f_literal',
        biblatex: 'shortseries'
    },
    'shorttitle': {
        type: 'f_literal',
        biblatex: 'shorttitle',
        csl: 'title-short'
    },
    'subtitle': {
        type: 'f_title',
        biblatex: 'subtitle'
    },
    'title': {
        type: 'f_title',
        biblatex: 'title',
        csl: 'title'
    },
    'titleaddon': {
        type: 'f_title',
        biblatex: 'titleaddon'
    },
    'translator': {
        type: 'l_name',
        biblatex: 'translator',
        csl: 'translator'
    },
    'type': {
        type: 'f_key',
        biblatex: 'type',
        options: ['manual', 'patent', 'report', 'thesis', 'mathesis', 'phdthesis', 'candthesis', 'techreport', 'resreport', 'software', 'datacd', 'audiocd']
    },
    'url': {
        type: 'f_uri',
        biblatex: 'url',
        csl: 'URL'
    },
    'urldate': {
        type: 'f_date',
        biblatex: 'urldate',
        csl: 'accessed'
    },
    'venue': {
        type: 'f_literal',
        biblatex: 'venue',
        csl: 'event-place'
    },
    'version': {
        type: 'f_literal',
        biblatex: 'version',
        csl: 'version'
    },
    'volume': {
        type: 'f_literal',
        biblatex: 'volume',
        csl: 'volume'
    },
    'volumes': {
        type: 'f_literal',
        biblatex: 'volumes',
        csl: 'number-of-volumes'
    }
});

/** A list of supported languages (without aliases) */
var BibLanguages = exports.BibLanguages = (++cov_1w8ie4z90q.s[1], {
    "usenglish": {
        "csl": "en-US",
        "biblatex": "usenglish"
    },
    "ukenglish": {
        "csl": "en-GB",
        "biblatex": "ukenglish"
    },
    "caenglish": {
        "csl": "en-US",
        "biblatex": "canadian"
    },
    "auenglish": {
        "csl": "en-GB",
        "biblatex": "australian"
    },
    "nzenglish": {
        "csl": "en-GB",
        "biblatex": "newzealand"
    },
    "afrikaans": {
        "csl": "af-ZA",
        "biblatex": "afrikaans"
    },
    "arabic": {
        "csl": "ar",
        "biblatex": "arabic"
    },
    "basque": {
        "csl": "eu",
        "biblatex": "basque"
    },
    "bulgarian": {
        "csl": "bg-BG",
        "biblatex": "bulgarian"
    },
    "catalan": {
        "csl": "ca-AD",
        "biblatex": "catalan"
    },
    "croatian": {
        "csl": "hr-HR",
        "biblatex": "croatian"
    },
    "czech": {
        "csl": "cs-CZ",
        "biblatex": "czech"
    },
    "danish": {
        "csl": "da-DK",
        "biblatex": "danish"
    },
    "dutch": {
        "csl": "nl-NL",
        "biblatex": "dutch"
    },
    "estonian": {
        "csl": "et-EE",
        "biblatex": "estonian"
    },
    "finnish": {
        "csl": "fi-FI",
        "biblatex": "finnish"
    },
    "cafrench": {
        "csl": "fr-CA",
        "biblatex": "canadien"
    },
    "acadian": {
        "csl": "fr-CA",
        "biblatex": "acadian"
    },
    "french": {
        "csl": "fr-FR",
        "biblatex": "french"
    },
    "atgerman": {
        "csl": "de-AT",
        "biblatex": "naustrian"
    },
    "german": {
        "csl": "de-DE",
        "biblatex": "ngerman"
    },
    "greek": {
        "csl": "el-GR",
        "biblatex": "greek"
    },
    "hebrew": {
        "csl": "he-IL",
        "biblatex": "hebrew"
    },
    "hungarian": {
        "csl": "hu-HU",
        "biblatex": "hungarian"
    },
    "icelandic": {
        "csl": "is-IS",
        "biblatex": "icelandic"
    },
    "italian": {
        "csl": "it-IT",
        "biblatex": "italian"
    },
    "japanese": {
        "csl": "ja-JP",
        "biblatex": "japanese"
    },
    "latvian": {
        "csl": "lv-LV",
        "biblatex": "latvian"
    },
    "lithuanian": {
        "csl": "lt-LT",
        "biblatex": "lithuanian"
    },
    "magyar": {
        "csl": "hu-HU",
        "biblatex": "magyar"
    },
    "mongolian": {
        "csl": "mn-MN",
        "biblatex": "mongolian"
    },
    "newnorwegian": {
        "csl": "nn-NO",
        "biblatex": "nynorsk"
    },
    "norwegian": {
        "csl": "nb-NO",
        "biblatex": "norsk"
    },
    "farsi": {
        "csl": "fa-IR",
        "biblatex": "farsi"
    },
    "polish": {
        "csl": "pl-PL",
        "biblatex": "polish"
    },
    "brportuguese": {
        "csl": "pt-BR",
        "biblatex": "brazilian"
    },
    "portuguese": {
        "csl": "pt-PT",
        "biblatex": "portuguese"
    },
    "romanian": {
        "csl": "ro-RO",
        "biblatex": "romanian"
    },
    "russian": {
        "csl": "ru-RU",
        "biblatex": "russian"
    },
    "serbian": {
        "csl": "sr-RS",
        "biblatex": "serbian"
    },
    "cyrillicserbian": {
        "csl": "sr-RS",
        "biblatex": "serbianc"
    },
    "slovak": {
        "csl": "sk-SK",
        "biblatex": "slovak"
    },
    "slovene": {
        "csl": "sl-SL",
        "biblatex": "slovene"
    },
    "spanish": {
        "csl": "es-ES",
        "biblatex": "spanish"
    },
    "swedish": {
        "csl": "sv-SE",
        "biblatex": "swedish"
    },
    "thai": {
        "csl": "th-TH",
        "biblatex": "thai"
    },
    "turkish": {
        "csl": "tr-TR",
        "biblatex": "turkish"
    },
    "ukrainian": {
        "csl": "uk-UA",
        "biblatex": "ukrainian"
    },
    "vietnamese": {
        "csl": "vi-VN",
        "biblatex": "vietnamese"
    },
    "latin": {
        "csl": "la",
        "biblatex": "latin"
    }
});

/** A list of all bib types and their fields. */
var BibTypes = exports.BibTypes = (++cov_1w8ie4z90q.s[2], {
    "article": {
        "order": 1,
        "biblatex": "article",
        "csl": "article",
        "required": ["journaltitle", "title", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "annotator", "commentator", "doi", "editor", "editora", "editorb", "editorc", "eid", "eprint", "eprintclass", "eprinttype", "issn", "issue", "issuesubtitle", "issuetitle", "journalsubtitle", "language", "langid", "note", "number", "origlanguage", "pages", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "version", "volume", "annotation", "keywords"]
    },
    "article-magazine": {
        "order": 2,
        "biblatex": "article",
        "csl": "article-magazine",
        "required": ["journaltitle", "title", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "annotator", "commentator", "doi", "editor", "editora", "editorb", "editorc", "eid", "eprint", "eprintclass", "eprinttype", "issn", "issue", "issuesubtitle", "issuetitle", "journalsubtitle", "language", "langid", "note", "number", "origlanguage", "pages", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "version", "volume", "annotation", "keywords"]
    },
    "article-newspaper": {
        "order": 3,
        "biblatex": "article",
        "csl": "article-newspaper",
        "required": ["journaltitle", "title", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "annotator", "commentator", "doi", "editor", "editora", "editorb", "editorc", "eid", "eprint", "eprintclass", "eprinttype", "issn", "issue", "issuesubtitle", "issuetitle", "journalsubtitle", "language", "langid", "note", "number", "origlanguage", "pages", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "version", "volume", "annotation", "keywords"]
    },
    "article-journal": {
        "order": 4,
        "biblatex": "article",
        "csl": "article-journal",
        "required": ["journaltitle", "title", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "annotator", "commentator", "doi", "editor", "editora", "editorb", "editorc", "eid", "eprint", "eprintclass", "eprinttype", "issn", "issue", "issuesubtitle", "issuetitle", "journalsubtitle", "language", "langid", "note", "number", "origlanguage", "pages", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "version", "volume", "annotation", "keywords"]
    },
    "post-weblog": {
        "order": 5,
        "biblatex": "online",
        "csl": "post-weblog",
        "required": ["date", "title", "url"],
        "eitheror": ["editor", "author"],
        "optional": ["abstract", "addendum", "pubstate", "subtitle", "language", "langid", "urldate", "titleaddon", "version", "note", "organization", "annotation", "keywords"]
    },
    "book": {
        "order": 10,
        "biblatex": "book",
        "csl": "book",
        "required": ["title", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "chapter", "commentator", "doi", "edition", "editor", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "origlanguage", "pages", "pagetotal", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volume", "volumes", "annotation", "keywords"]
    },
    "mvbook": {
        "order": 11,
        "biblatex": "mvbook",
        "csl": "book",
        "required": ["title", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "commentator", "doi", "edition", "editor", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "note", "number", "origlanguage", "pagetotal", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volumes", "annotation", "keywords"]
    },
    "inbook": {
        "order": 12,
        "biblatex": "inbook",
        "csl": "chapter",
        "required": ["title", "booktitle", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "bookauthor", "booksubtitle", "booktitleaddon", "chapter", "commentator", "doi", "edition", "editor", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "origlanguage", "pages", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volume", "volumes", "annotation", "keywords"]
    },
    "bookinbook": {
        "order": 13,
        "biblatex": "bookinbook",
        "csl": "chapter",
        "required": ["title", "booktitle", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "bookauthor", "booksubtitle", "booktitleaddon", "chapter", "commentator", "doi", "edition", "editor", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "origlanguage", "pages", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volume", "volumes", "annotation", "keywords"]
    },
    "suppbook": {
        "order": 14,
        "biblatex": "suppbook",
        "csl": "chapter",
        "required": ["title", "booktitle", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "bookauthor", "booksubtitle", "booktitleaddon", "chapter", "commentator", "doi", "edition", "editor", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "origlanguage", "pages", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volume", "volumes", "annotation", "keywords"]
    },
    "booklet": {
        "order": 15,
        "biblatex": "booklet",
        "csl": "pamphlet",
        "required": ["title", "date"],
        "eitheror": ["editor", "author"],
        "optional": ["abstract", "titleaddon", "addendum", "pages", "howpublished", "type", "pubstate", "chapter", "doi", "subtitle", "language", "langid", "location", "url", "urldate", "pagetotal", "note", "eprint", "eprintclass", "eprinttype", "annotation", "keywords"]
    },
    "collection": {
        "order": 20,
        "biblatex": "collection",
        "csl": "dataset",
        "required": ["editor", "title", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "chapter", "commentator", "doi", "edition", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "origlanguage", "pages", "pagetotal", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volume", "volumes", "annotation", "keywords"]
    },
    "mvcollection": {
        "order": 21,
        "biblatex": "mvcollection",
        "csl": "dataset",
        "required": ["editor", "title", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "commentator", "doi", "edition", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "note", "number", "origlanguage", "pagetotal", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volumes", "annotation", "keywords"]
    },
    "incollection": {
        "order": 22,
        "biblatex": "incollection",
        "csl": "entry",
        "required": ["title", "editor", "booktitle", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "booksubtitle", "booktitleaddon", "chapter", "commentator", "doi", "edition", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "origlanguage", "pages", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volume", "volumes", "annotation", "keywords"]
    },
    "suppcollection": {
        "order": 23,
        "biblatex": "suppcollection",
        "csl": "entry",
        "required": ["title", "editor", "booktitle", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "booksubtitle", "booktitleaddon", "chapter", "commentator", "doi", "edition", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "origlanguage", "pages", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volume", "volumes", "annotation", "keywords"]
    },
    "post": {
        "order": 30,
        "biblatex": "online",
        "csl": "post",
        "required": ["date", "title", "url"],
        "eitheror": ["editor", "author"],
        "optional": ["abstract", "addendum", "pubstate", "subtitle", "language", "langid", "urldate", "titleaddon", "version", "note", "organization", "annotation", "keywords"]
    },
    "manual": {
        "order": 40,
        "biblatex": "manual",
        "csl": "book",
        "required": ["title", "date"],
        "eitheror": ["editor", "author"],
        "optional": ["abstract", "addendum", "chapter", "doi", "edition", "eprint", "eprintclass", "eprinttype", "isbn", "language", "langid", "location", "note", "number", "organization", "pages", "pagetotal", "publisher", "pubstate", "series", "subtitle", "titleaddon", "type", "url", "urldate", "version", "annotation", "keywords"]
    },
    "misc": {
        "order": 41,
        "biblatex": "misc",
        "csl": "entry",
        "required": ["title", "date"],
        "eitheror": ["editor", "author"],
        "optional": ["abstract", "addendum", "howpublished", "type", "pubstate", "organization", "doi", "subtitle", "language", "langid", "location", "url", "urldate", "titleaddon", "version", "note", "eprint", "eprintclass", "eprinttype", "annotation", "keywords"]
    },
    "online": {
        "order": 42,
        "biblatex": "online",
        "csl": "webpage",
        "required": ["date", "title", "url"],
        "eitheror": ["editor", "author"],
        "optional": ["abstract", "addendum", "pubstate", "subtitle", "language", "langid", "urldate", "titleaddon", "version", "note", "organization", "annotation", "keywords"]
    },
    "patent": {
        "order": 43,
        "biblatex": "patent",
        "csl": "patent",
        "required": ["title", "number", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "holder", "location", "pubstate", "doi", "subtitle", "titleaddon", "type", "url", "urldate", "version", "note", "eprint", "eprintclass", "eprinttype", "annotation", "keywords"]
    },
    "periodical": {
        "order": 50,
        "biblatex": "periodical",
        "csl": "book",
        "required": ["editor", "title", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "volume", "pubstate", "number", "series", "issn", "issue", "issuesubtitle", "issuetitle", "doi", "subtitle", "editora", "editorb", "editorc", "url", "urldate", "language", "langid", "note", "eprint", "eprintclass", "eprinttype", "annotation", "keywords"]
    },
    "suppperiodical": {
        "order": 51,
        "biblatex": "suppperiodical",
        "csl": "entry",
        "required": ["journaltitle", "title", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "annotator", "commentator", "doi", "editor", "editora", "editorb", "editorc", "eid", "eprint", "eprintclass", "eprinttype", "issn", "issue", "issuesubtitle", "issuetitle", "journalsubtitle", "language", "langid", "note", "number", "origlanguage", "pages", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "version", "volume", "annotation", "keywords"]
    },
    "proceedings": {
        "order": 60,
        "biblatex": "proceedings",
        "csl": "entry",
        "required": ["editor", "title", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "chapter", "doi", "eprint", "eprintclass", "eprinttype", "eventdate", "eventtitle", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "organization", "pages", "pagetotal", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "url", "urldate", "venue", "volume", "volumes", "annotation", "keywords"]
    },
    "mvproceedings": {
        "order": 61,
        "biblatex": "mvproceedings",
        "csl": "entry",
        "required": ["editor", "title", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "doi", "eprint", "eprintclass", "eprinttype", "eventdate", "eventtitle", "isbn", "language", "langid", "location", "note", "number", "organization", "pagetotal", "publisher", "pubstate", "series", "subtitle", "titleaddon", "url", "urldate", "venue", "volumes", "annotation", "keywords"]
    },
    "inproceedings": {
        "order": 62,
        "biblatex": "inproceedings",
        "csl": "paper-conference",
        "required": ["title", "editor", "booktitle", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "booksubtitle", "booktitleaddon", "chapter", "doi", "eprint", "eprintclass", "eprinttype", "eventdate", "eventtitle", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "organization", "pages", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "url", "urldate", "venue", "volume", "volumes", "annotation", "keywords"]
    },
    "reference": {
        "order": 70,
        "biblatex": "book",
        "csl": "reference",
        "required": ["editor", "title", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "chapter", "commentator", "doi", "edition", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "origlanguage", "pages", "pagetotal", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volume", "volumes", "annotation", "keywords"]
    },
    "mvreference": {
        "order": 71,
        "biblatex": "mvreference",
        "csl": "book",
        "required": ["editor", "title", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "commentator", "doi", "edition", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "note", "number", "origlanguage", "pagetotal", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volumes", "annotation", "keywords"]
    },
    "inreference": {
        "order": 72,
        "biblatex": "inreference",
        "csl": "entry",
        "required": ["title", "editor", "booktitle", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "booksubtitle", "booktitleaddon", "chapter", "commentator", "doi", "edition", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "origlanguage", "pages", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volume", "volumes", "annotation", "keywords"]
    },
    "entry-encyclopedia": {
        "order": 73,
        "biblatex": "inreference",
        "csl": "entry-encyclopedia",
        "required": ["title", "editor", "booktitle", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "booksubtitle", "booktitleaddon", "chapter", "commentator", "doi", "edition", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "origlanguage", "pages", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volume", "volumes", "annotation", "keywords"]
    },
    "entry-dictionary": {
        "order": 74,
        "biblatex": "inreference",
        "csl": "entry-dictionary",
        "required": ["title", "editor", "booktitle", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "afterword", "annotator", "booksubtitle", "booktitleaddon", "chapter", "commentator", "doi", "edition", "editora", "editorb", "editorc", "eprint", "eprintclass", "eprinttype", "foreword", "introduction", "isbn", "language", "langid", "location", "mainsubtitle", "maintitle", "maintitleaddon", "note", "number", "origlanguage", "pages", "part", "publisher", "pubstate", "series", "subtitle", "titleaddon", "translator", "url", "urldate", "volume", "volumes", "annotation", "keywords"]
    },
    "report": {
        "order": 80,
        "biblatex": "report",
        "csl": "report",
        "required": ["author", "title", "type", "institution", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "pages", "pagetotal", "pubstate", "number", "isrn", "chapter", "doi", "subtitle", "language", "langid", "location", "url", "urldate", "titleaddon", "version", "note", "eprint", "eprintclass", "eprinttype", "annotation", "keywords"]
    },
    "thesis": {
        "order": 81,
        "biblatex": "thesis",
        "csl": "thesis",
        "required": ["author", "title", "type", "institution", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "pages", "pagetotal", "pubstate", "isbn", "chapter", "doi", "subtitle", "language", "langid", "location", "url", "urldate", "titleaddon", "note", "eprint", "eprintclass", "eprinttype", "annotation", "keywords"]
    },
    "unpublished": {
        "order": 90,
        "biblatex": "unpublished",
        "csl": "manuscript",
        "required": ["title", "author", "date"],
        "eitheror": [],
        "optional": ["abstract", "addendum", "howpublished", "pubstate", "isbn", "date", "subtitle", "language", "langid", "location", "url", "urldate", "titleaddon", "note", "annotation", "keywords"]
    }
});

},{}],126:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BibLatexExporter = undefined;

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var cov_18eh2feipe = function () {
    var path = "/home/travis/build/fiduswriter/biblatex-csl-converter/src/export/biblatex.js",
        hash = "b15673b8ddc47479ee222e8a52f09dfd9baea3fc",
        global = new Function('return this')(),
        gcv = "__coverage__",
        coverageData = {
        path: "/home/travis/build/fiduswriter/biblatex-csl-converter/src/export/biblatex.js",
        statementMap: {
            "0": {
                start: {
                    line: 9,
                    column: 14
                },
                end: {
                    line: 19,
                    column: 3
                }
            },
            "1": {
                start: {
                    line: 24,
                    column: 8
                },
                end: {
                    line: 24,
                    column: 26
                }
            },
            "2": {
                start: {
                    line: 25,
                    column: 8
                },
                end: {
                    line: 29,
                    column: 9
                }
            },
            "3": {
                start: {
                    line: 26,
                    column: 12
                },
                end: {
                    line: 26,
                    column: 26
                }
            },
            "4": {
                start: {
                    line: 28,
                    column: 12
                },
                end: {
                    line: 28,
                    column: 41
                }
            },
            "5": {
                start: {
                    line: 30,
                    column: 8
                },
                end: {
                    line: 30,
                    column: 28
                }
            },
            "6": {
                start: {
                    line: 31,
                    column: 8
                },
                end: {
                    line: 31,
                    column: 26
                }
            },
            "7": {
                start: {
                    line: 35,
                    column: 19
                },
                end: {
                    line: 35,
                    column: 23
                }
            },
            "8": {
                start: {
                    line: 36,
                    column: 8
                },
                end: {
                    line: 36,
                    column: 29
                }
            },
            "9": {
                start: {
                    line: 37,
                    column: 8
                },
                end: {
                    line: 37,
                    column: 27
                }
            },
            "10": {
                start: {
                    line: 39,
                    column: 18
                },
                end: {
                    line: 39,
                    column: 33
                }
            },
            "11": {
                start: {
                    line: 41,
                    column: 8
                },
                end: {
                    line: 102,
                    column: 9
                }
            },
            "12": {
                start: {
                    line: 42,
                    column: 21
                },
                end: {
                    line: 42,
                    column: 32
                }
            },
            "13": {
                start: {
                    line: 43,
                    column: 22
                },
                end: {
                    line: 43,
                    column: 36
                }
            },
            "14": {
                start: {
                    line: 44,
                    column: 27
                },
                end: {
                    line: 47,
                    column: 13
                }
            },
            "15": {
                start: {
                    line: 48,
                    column: 26
                },
                end: {
                    line: 48,
                    column: 28
                }
            },
            "16": {
                start: {
                    line: 49,
                    column: 12
                },
                end: {
                    line: 99,
                    column: 13
                }
            },
            "17": {
                start: {
                    line: 50,
                    column: 16
                },
                end: {
                    line: 52,
                    column: 17
                }
            },
            "18": {
                start: {
                    line: 51,
                    column: 20
                },
                end: {
                    line: 51,
                    column: 28
                }
            },
            "19": {
                start: {
                    line: 53,
                    column: 29
                },
                end: {
                    line: 53,
                    column: 45
                }
            },
            "20": {
                start: {
                    line: 54,
                    column: 28
                },
                end: {
                    line: 54,
                    column: 55
                }
            },
            "21": {
                start: {
                    line: 55,
                    column: 26
                },
                end: {
                    line: 55,
                    column: 57
                }
            },
            "22": {
                start: {
                    line: 56,
                    column: 16
                },
                end: {
                    line: 97,
                    column: 17
                }
            },
            "23": {
                start: {
                    line: 58,
                    column: 24
                },
                end: {
                    line: 58,
                    column: 45
                }
            },
            "24": {
                start: {
                    line: 59,
                    column: 24
                },
                end: {
                    line: 59,
                    column: 29
                }
            },
            "25": {
                start: {
                    line: 61,
                    column: 24
                },
                end: {
                    line: 61,
                    column: 66
                }
            },
            "26": {
                start: {
                    line: 62,
                    column: 24
                },
                end: {
                    line: 62,
                    column: 29
                }
            },
            "27": {
                start: {
                    line: 64,
                    column: 24
                },
                end: {
                    line: 64,
                    column: 62
                }
            },
            "28": {
                start: {
                    line: 65,
                    column: 24
                },
                end: {
                    line: 65,
                    column: 29
                }
            },
            "29": {
                start: {
                    line: 67,
                    column: 24
                },
                end: {
                    line: 67,
                    column: 71
                }
            },
            "30": {
                start: {
                    line: 68,
                    column: 24
                },
                end: {
                    line: 68,
                    column: 29
                }
            },
            "31": {
                start: {
                    line: 71,
                    column: 24
                },
                end: {
                    line: 71,
                    column: 63
                }
            },
            "32": {
                start: {
                    line: 72,
                    column: 24
                },
                end: {
                    line: 72,
                    column: 29
                }
            },
            "33": {
                start: {
                    line: 74,
                    column: 24
                },
                end: {
                    line: 74,
                    column: 64
                }
            },
            "34": {
                start: {
                    line: 75,
                    column: 24
                },
                end: {
                    line: 75,
                    column: 29
                }
            },
            "35": {
                start: {
                    line: 77,
                    column: 24
                },
                end: {
                    line: 77,
                    column: 63
                }
            },
            "36": {
                start: {
                    line: 78,
                    column: 24
                },
                end: {
                    line: 78,
                    column: 29
                }
            },
            "37": {
                start: {
                    line: 81,
                    column: 24
                },
                end: {
                    line: 81,
                    column: 65
                }
            },
            "38": {
                start: {
                    line: 82,
                    column: 24
                },
                end: {
                    line: 82,
                    column: 29
                }
            },
            "39": {
                start: {
                    line: 84,
                    column: 24
                },
                end: {
                    line: 84,
                    column: 116
                }
            },
            "40": {
                start: {
                    line: 84,
                    column: 72
                },
                end: {
                    line: 84,
                    column: 99
                }
            },
            "41": {
                start: {
                    line: 85,
                    column: 24
                },
                end: {
                    line: 85,
                    column: 29
                }
            },
            "42": {
                start: {
                    line: 87,
                    column: 24
                },
                end: {
                    line: 87,
                    column: 104
                }
            },
            "43": {
                start: {
                    line: 87,
                    column: 59
                },
                end: {
                    line: 87,
                    column: 88
                }
            },
            "44": {
                start: {
                    line: 88,
                    column: 24
                },
                end: {
                    line: 88,
                    column: 29
                }
            },
            "45": {
                start: {
                    line: 90,
                    column: 24
                },
                end: {
                    line: 90,
                    column: 63
                }
            },
            "46": {
                start: {
                    line: 91,
                    column: 24
                },
                end: {
                    line: 91,
                    column: 29
                }
            },
            "47": {
                start: {
                    line: 93,
                    column: 24
                },
                end: {
                    line: 93,
                    column: 73
                }
            },
            "48": {
                start: {
                    line: 94,
                    column: 24
                },
                end: {
                    line: 94,
                    column: 29
                }
            },
            "49": {
                start: {
                    line: 96,
                    column: 24
                },
                end: {
                    line: 96,
                    column: 68
                }
            },
            "50": {
                start: {
                    line: 100,
                    column: 12
                },
                end: {
                    line: 100,
                    column: 37
                }
            },
            "51": {
                start: {
                    line: 101,
                    column: 12
                },
                end: {
                    line: 101,
                    column: 64
                }
            },
            "52": {
                start: {
                    line: 103,
                    column: 8
                },
                end: {
                    line: 103,
                    column: 64
                }
            },
            "53": {
                start: {
                    line: 104,
                    column: 8
                },
                end: {
                    line: 104,
                    column: 29
                }
            },
            "54": {
                start: {
                    line: 108,
                    column: 8
                },
                end: {
                    line: 112,
                    column: 9
                }
            },
            "55": {
                start: {
                    line: 109,
                    column: 12
                },
                end: {
                    line: 109,
                    column: 44
                }
            },
            "56": {
                start: {
                    line: 111,
                    column: 12
                },
                end: {
                    line: 111,
                    column: 45
                }
            },
            "57": {
                start: {
                    line: 116,
                    column: 19
                },
                end: {
                    line: 116,
                    column: 23
                }
            },
            "58": {
                start: {
                    line: 117,
                    column: 8
                },
                end: {
                    line: 119,
                    column: 20
                }
            },
            "59": {
                start: {
                    line: 118,
                    column: 12
                },
                end: {
                    line: 118,
                    column: 52
                }
            },
            "60": {
                start: {
                    line: 123,
                    column: 8
                },
                end: {
                    line: 123,
                    column: 31
                }
            },
            "61": {
                start: {
                    line: 127,
                    column: 20
                },
                end: {
                    line: 127,
                    column: 22
                }
            },
            "62": {
                start: {
                    line: 127,
                    column: 31
                },
                end: {
                    line: 127,
                    column: 35
                }
            },
            "63": {
                start: {
                    line: 128,
                    column: 8
                },
                end: {
                    line: 166,
                    column: 10
                }
            },
            "64": {
                start: {
                    line: 129,
                    column: 12
                },
                end: {
                    line: 165,
                    column: 13
                }
            },
            "65": {
                start: {
                    line: 130,
                    column: 30
                },
                end: {
                    line: 130,
                    column: 60
                }
            },
            "66": {
                start: {
                    line: 131,
                    column: 16
                },
                end: {
                    line: 131,
                    column: 42
                }
            },
            "67": {
                start: {
                    line: 133,
                    column: 29
                },
                end: {
                    line: 133,
                    column: 77
                }
            },
            "68": {
                start: {
                    line: 134,
                    column: 28
                },
                end: {
                    line: 134,
                    column: 73
                }
            },
            "69": {
                start: {
                    line: 135,
                    column: 29
                },
                end: {
                    line: 135,
                    column: 80
                }
            },
            "70": {
                start: {
                    line: 136,
                    column: 29
                },
                end: {
                    line: 136,
                    column: 80
                }
            },
            "71": {
                start: {
                    line: 137,
                    column: 32
                },
                end: {
                    line: 137,
                    column: 70
                }
            },
            "72": {
                start: {
                    line: 138,
                    column: 16
                },
                end: {
                    line: 164,
                    column: 17
                }
            },
            "73": {
                start: {
                    line: 139,
                    column: 20
                },
                end: {
                    line: 147,
                    column: 21
                }
            },
            "74": {
                start: {
                    line: 140,
                    column: 24
                },
                end: {
                    line: 140,
                    column: 84
                }
            },
            "75": {
                start: {
                    line: 141,
                    column: 27
                },
                end: {
                    line: 147,
                    column: 21
                }
            },
            "76": {
                start: {
                    line: 142,
                    column: 24
                },
                end: {
                    line: 142,
                    column: 74
                }
            },
            "77": {
                start: {
                    line: 143,
                    column: 27
                },
                end: {
                    line: 147,
                    column: 21
                }
            },
            "78": {
                start: {
                    line: 144,
                    column: 24
                },
                end: {
                    line: 144,
                    column: 71
                }
            },
            "79": {
                start: {
                    line: 146,
                    column: 24
                },
                end: {
                    line: 146,
                    column: 61
                }
            },
            "80": {
                start: {
                    line: 149,
                    column: 36
                },
                end: {
                    line: 149,
                    column: 38
                }
            },
            "81": {
                start: {
                    line: 150,
                    column: 20
                },
                end: {
                    line: 152,
                    column: 21
                }
            },
            "82": {
                start: {
                    line: 151,
                    column: 24
                },
                end: {
                    line: 151,
                    column: 81
                }
            },
            "83": {
                start: {
                    line: 153,
                    column: 20
                },
                end: {
                    line: 155,
                    column: 21
                }
            },
            "84": {
                start: {
                    line: 154,
                    column: 24
                },
                end: {
                    line: 154,
                    column: 83
                }
            },
            "85": {
                start: {
                    line: 156,
                    column: 20
                },
                end: {
                    line: 158,
                    column: 21
                }
            },
            "86": {
                start: {
                    line: 157,
                    column: 24
                },
                end: {
                    line: 157,
                    column: 83
                }
            },
            "87": {
                start: {
                    line: 159,
                    column: 20
                },
                end: {
                    line: 162,
                    column: 21
                }
            },
            "88": {
                start: {
                    line: 160,
                    column: 24
                },
                end: {
                    line: 160,
                    column: 83
                }
            },
            "89": {
                start: {
                    line: 161,
                    column: 24
                },
                end: {
                    line: 161,
                    column: 69
                }
            },
            "90": {
                start: {
                    line: 163,
                    column: 20
                },
                end: {
                    line: 163,
                    column: 59
                }
            },
            "91": {
                start: {
                    line: 167,
                    column: 8
                },
                end: {
                    line: 167,
                    column: 34
                }
            },
            "92": {
                start: {
                    line: 171,
                    column: 8
                },
                end: {
                    line: 175,
                    column: 9
                }
            },
            "93": {
                start: {
                    line: 172,
                    column: 12
                },
                end: {
                    line: 172,
                    column: 34
                }
            },
            "94": {
                start: {
                    line: 174,
                    column: 12
                },
                end: {
                    line: 174,
                    column: 27
                }
            },
            "95": {
                start: {
                    line: 179,
                    column: 8
                },
                end: {
                    line: 181,
                    column: 9
                }
            },
            "96": {
                start: {
                    line: 180,
                    column: 12
                },
                end: {
                    line: 180,
                    column: 24
                }
            },
            "97": {
                start: {
                    line: 182,
                    column: 18
                },
                end: {
                    line: 182,
                    column: 40
                }
            },
            "98": {
                start: {
                    line: 183,
                    column: 8
                },
                end: {
                    line: 188,
                    column: 9
                }
            },
            "99": {
                start: {
                    line: 184,
                    column: 12
                },
                end: {
                    line: 187,
                    column: 13
                }
            },
            "100": {
                start: {
                    line: 189,
                    column: 8
                },
                end: {
                    line: 189,
                    column: 23
                }
            },
            "101": {
                start: {
                    line: 193,
                    column: 19
                },
                end: {
                    line: 193,
                    column: 23
                }
            },
            "102": {
                start: {
                    line: 193,
                    column: 33
                },
                end: {
                    line: 193,
                    column: 35
                }
            },
            "103": {
                start: {
                    line: 193,
                    column: 49
                },
                end: {
                    line: 193,
                    column: 51
                }
            },
            "104": {
                start: {
                    line: 194,
                    column: 8
                },
                end: {
                    line: 263,
                    column: 10
                }
            },
            "105": {
                start: {
                    line: 195,
                    column: 12
                },
                end: {
                    line: 205,
                    column: 13
                }
            },
            "106": {
                start: {
                    line: 199,
                    column: 16
                },
                end: {
                    line: 199,
                    column: 57
                }
            },
            "107": {
                start: {
                    line: 200,
                    column: 16
                },
                end: {
                    line: 203,
                    column: 18
                }
            },
            "108": {
                start: {
                    line: 204,
                    column: 16
                },
                end: {
                    line: 204,
                    column: 22
                }
            },
            "109": {
                start: {
                    line: 206,
                    column: 27
                },
                end: {
                    line: 206,
                    column: 29
                }
            },
            "110": {
                start: {
                    line: 207,
                    column: 12
                },
                end: {
                    line: 222,
                    column: 13
                }
            },
            "111": {
                start: {
                    line: 208,
                    column: 31
                },
                end: {
                    line: 208,
                    column: 36
                }
            },
            "112": {
                start: {
                    line: 209,
                    column: 16
                },
                end: {
                    line: 221,
                    column: 18
                }
            },
            "113": {
                start: {
                    line: 211,
                    column: 20
                },
                end: {
                    line: 220,
                    column: 21
                }
            },
            "114": {
                start: {
                    line: 212,
                    column: 24
                },
                end: {
                    line: 212,
                    column: 45
                }
            },
            "115": {
                start: {
                    line: 213,
                    column: 24
                },
                end: {
                    line: 213,
                    column: 48
                }
            },
            "116": {
                start: {
                    line: 214,
                    column: 24
                },
                end: {
                    line: 214,
                    column: 39
                }
            },
            "117": {
                start: {
                    line: 215,
                    column: 27
                },
                end: {
                    line: 220,
                    column: 21
                }
            },
            "118": {
                start: {
                    line: 217,
                    column: 24
                },
                end: {
                    line: 217,
                    column: 51
                }
            },
            "119": {
                start: {
                    line: 219,
                    column: 24
                },
                end: {
                    line: 219,
                    column: 48
                }
            },
            "120": {
                start: {
                    line: 225,
                    column: 26
                },
                end: {
                    line: 225,
                    column: 31
                }
            },
            "121": {
                start: {
                    line: 226,
                    column: 12
                },
                end: {
                    line: 239,
                    column: 14
                }
            },
            "122": {
                start: {
                    line: 227,
                    column: 28
                },
                end: {
                    line: 227,
                    column: 53
                }
            },
            "123": {
                start: {
                    line: 228,
                    column: 16
                },
                end: {
                    line: 230,
                    column: 17
                }
            },
            "124": {
                start: {
                    line: 229,
                    column: 20
                },
                end: {
                    line: 229,
                    column: 34
                }
            },
            "125": {
                start: {
                    line: 231,
                    column: 16
                },
                end: {
                    line: 237,
                    column: 17
                }
            },
            "126": {
                start: {
                    line: 232,
                    column: 20
                },
                end: {
                    line: 232,
                    column: 45
                }
            },
            "127": {
                start: {
                    line: 234,
                    column: 20
                },
                end: {
                    line: 236,
                    column: 21
                }
            },
            "128": {
                start: {
                    line: 235,
                    column: 24
                },
                end: {
                    line: 235,
                    column: 36
                }
            },
            "129": {
                start: {
                    line: 241,
                    column: 26
                },
                end: {
                    line: 241,
                    column: 31
                }
            },
            "130": {
                start: {
                    line: 241,
                    column: 44
                },
                end: {
                    line: 241,
                    column: 49
                }
            },
            "131": {
                start: {
                    line: 242,
                    column: 12
                },
                end: {
                    line: 256,
                    column: 14
                }
            },
            "132": {
                start: {
                    line: 243,
                    column: 16
                },
                end: {
                    line: 245,
                    column: 17
                }
            },
            "133": {
                start: {
                    line: 244,
                    column: 20
                },
                end: {
                    line: 244,
                    column: 34
                }
            },
            "134": {
                start: {
                    line: 246,
                    column: 16
                },
                end: {
                    line: 255,
                    column: 17
                }
            },
            "135": {
                start: {
                    line: 248,
                    column: 20
                },
                end: {
                    line: 250,
                    column: 21
                }
            },
            "136": {
                start: {
                    line: 249,
                    column: 24
                },
                end: {
                    line: 249,
                    column: 36
                }
            },
            "137": {
                start: {
                    line: 251,
                    column: 20
                },
                end: {
                    line: 251,
                    column: 44
                }
            },
            "138": {
                start: {
                    line: 252,
                    column: 20
                },
                end: {
                    line: 254,
                    column: 21
                }
            },
            "139": {
                start: {
                    line: 253,
                    column: 24
                },
                end: {
                    line: 253,
                    column: 39
                }
            },
            "140": {
                start: {
                    line: 257,
                    column: 12
                },
                end: {
                    line: 261,
                    column: 13
                }
            },
            "141": {
                start: {
                    line: 258,
                    column: 16
                },
                end: {
                    line: 258,
                    column: 34
                }
            },
            "142": {
                start: {
                    line: 260,
                    column: 16
                },
                end: {
                    line: 260,
                    column: 51
                }
            },
            "143": {
                start: {
                    line: 262,
                    column: 12
                },
                end: {
                    line: 262,
                    column: 32
                }
            },
            "144": {
                start: {
                    line: 265,
                    column: 8
                },
                end: {
                    line: 267,
                    column: 10
                }
            },
            "145": {
                start: {
                    line: 266,
                    column: 12
                },
                end: {
                    line: 266,
                    column: 37
                }
            },
            "146": {
                start: {
                    line: 268,
                    column: 8
                },
                end: {
                    line: 268,
                    column: 20
                }
            },
            "147": {
                start: {
                    line: 272,
                    column: 18
                },
                end: {
                    line: 272,
                    column: 32
                }
            },
            "148": {
                start: {
                    line: 273,
                    column: 18
                },
                end: {
                    line: 273,
                    column: 20
                }
            },
            "149": {
                start: {
                    line: 274,
                    column: 8
                },
                end: {
                    line: 285,
                    column: 9
                }
            },
            "150": {
                start: {
                    line: 275,
                    column: 12
                },
                end: {
                    line: 277,
                    column: 13
                }
            },
            "151": {
                start: {
                    line: 276,
                    column: 16
                },
                end: {
                    line: 276,
                    column: 29
                }
            },
            "152": {
                start: {
                    line: 278,
                    column: 23
                },
                end: {
                    line: 278,
                    column: 33
                }
            },
            "153": {
                start: {
                    line: 279,
                    column: 12
                },
                end: {
                    line: 279,
                    column: 46
                }
            },
            "154": {
                start: {
                    line: 280,
                    column: 12
                },
                end: {
                    line: 283,
                    column: 13
                }
            },
            "155": {
                start: {
                    line: 281,
                    column: 28
                },
                end: {
                    line: 281,
                    column: 99
                }
            },
            "156": {
                start: {
                    line: 282,
                    column: 16
                },
                end: {
                    line: 282,
                    column: 46
                }
            },
            "157": {
                start: {
                    line: 284,
                    column: 12
                },
                end: {
                    line: 284,
                    column: 24
                }
            },
            "158": {
                start: {
                    line: 286,
                    column: 8
                },
                end: {
                    line: 286,
                    column: 18
                }
            }
        },
        fnMap: {
            "0": {
                name: "(anonymous_0)",
                decl: {
                    start: {
                        line: 23,
                        column: 4
                    },
                    end: {
                        line: 23,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 23,
                        column: 49
                    },
                    end: {
                        line: 32,
                        column: 5
                    }
                }
            },
            "1": {
                name: "(anonymous_1)",
                decl: {
                    start: {
                        line: 34,
                        column: 4
                    },
                    end: {
                        line: 34,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 34,
                        column: 17
                    },
                    end: {
                        line: 105,
                        column: 5
                    }
                }
            },
            "2": {
                name: "(anonymous_2)",
                decl: {
                    start: {
                        line: 84,
                        column: 66
                    },
                    end: {
                        line: 84,
                        column: 67
                    }
                },
                loc: {
                    start: {
                        line: 84,
                        column: 71
                    },
                    end: {
                        line: 84,
                        column: 100
                    }
                }
            },
            "3": {
                name: "(anonymous_3)",
                decl: {
                    start: {
                        line: 87,
                        column: 50
                    },
                    end: {
                        line: 87,
                        column: 51
                    }
                },
                loc: {
                    start: {
                        line: 87,
                        column: 58
                    },
                    end: {
                        line: 87,
                        column: 89
                    }
                }
            },
            "4": {
                name: "(anonymous_4)",
                decl: {
                    start: {
                        line: 107,
                        column: 4
                    },
                    end: {
                        line: 107,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 107,
                        column: 25
                    },
                    end: {
                        line: 113,
                        column: 5
                    }
                }
            },
            "5": {
                name: "(anonymous_5)",
                decl: {
                    start: {
                        line: 115,
                        column: 4
                    },
                    end: {
                        line: 115,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 115,
                        column: 27
                    },
                    end: {
                        line: 120,
                        column: 5
                    }
                }
            },
            "6": {
                name: "(anonymous_6)",
                decl: {
                    start: {
                        line: 117,
                        column: 28
                    },
                    end: {
                        line: 117,
                        column: 29
                    }
                },
                loc: {
                    start: {
                        line: 117,
                        column: 35
                    },
                    end: {
                        line: 119,
                        column: 9
                    }
                }
            },
            "7": {
                name: "(anonymous_7)",
                decl: {
                    start: {
                        line: 122,
                        column: 4
                    },
                    end: {
                        line: 122,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 122,
                        column: 29
                    },
                    end: {
                        line: 124,
                        column: 5
                    }
                }
            },
            "8": {
                name: "(anonymous_8)",
                decl: {
                    start: {
                        line: 126,
                        column: 4
                    },
                    end: {
                        line: 126,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 126,
                        column: 26
                    },
                    end: {
                        line: 168,
                        column: 5
                    }
                }
            },
            "9": {
                name: "(anonymous_9)",
                decl: {
                    start: {
                        line: 128,
                        column: 25
                    },
                    end: {
                        line: 128,
                        column: 26
                    }
                },
                loc: {
                    start: {
                        line: 128,
                        column: 33
                    },
                    end: {
                        line: 166,
                        column: 9
                    }
                }
            },
            "10": {
                name: "(anonymous_10)",
                decl: {
                    start: {
                        line: 170,
                        column: 4
                    },
                    end: {
                        line: 170,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 170,
                        column: 31
                    },
                    end: {
                        line: 176,
                        column: 5
                    }
                }
            },
            "11": {
                name: "(anonymous_11)",
                decl: {
                    start: {
                        line: 178,
                        column: 4
                    },
                    end: {
                        line: 178,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 178,
                        column: 25
                    },
                    end: {
                        line: 190,
                        column: 5
                    }
                }
            },
            "12": {
                name: "(anonymous_12)",
                decl: {
                    start: {
                        line: 192,
                        column: 4
                    },
                    end: {
                        line: 192,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 192,
                        column: 26
                    },
                    end: {
                        line: 269,
                        column: 5
                    }
                }
            },
            "13": {
                name: "(anonymous_13)",
                decl: {
                    start: {
                        line: 194,
                        column: 25
                    },
                    end: {
                        line: 194,
                        column: 26
                    }
                },
                loc: {
                    start: {
                        line: 194,
                        column: 33
                    },
                    end: {
                        line: 263,
                        column: 9
                    }
                }
            },
            "14": {
                name: "(anonymous_14)",
                decl: {
                    start: {
                        line: 209,
                        column: 35
                    },
                    end: {
                        line: 209,
                        column: 36
                    }
                },
                loc: {
                    start: {
                        line: 209,
                        column: 43
                    },
                    end: {
                        line: 221,
                        column: 17
                    }
                }
            },
            "15": {
                name: "(anonymous_15)",
                decl: {
                    start: {
                        line: 226,
                        column: 48
                    },
                    end: {
                        line: 226,
                        column: 49
                    }
                },
                loc: {
                    start: {
                        line: 226,
                        column: 64
                    },
                    end: {
                        line: 239,
                        column: 13
                    }
                }
            },
            "16": {
                name: "(anonymous_16)",
                decl: {
                    start: {
                        line: 242,
                        column: 29
                    },
                    end: {
                        line: 242,
                        column: 30
                    }
                },
                loc: {
                    start: {
                        line: 242,
                        column: 44
                    },
                    end: {
                        line: 256,
                        column: 13
                    }
                }
            },
            "17": {
                name: "(anonymous_17)",
                decl: {
                    start: {
                        line: 265,
                        column: 44
                    },
                    end: {
                        line: 265,
                        column: 45
                    }
                },
                loc: {
                    start: {
                        line: 265,
                        column: 52
                    },
                    end: {
                        line: 267,
                        column: 9
                    }
                }
            },
            "18": {
                name: "(anonymous_18)",
                decl: {
                    start: {
                        line: 271,
                        column: 4
                    },
                    end: {
                        line: 271,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 271,
                        column: 30
                    },
                    end: {
                        line: 287,
                        column: 5
                    }
                }
            }
        },
        branchMap: {
            "0": {
                loc: {
                    start: {
                        line: 23,
                        column: 23
                    },
                    end: {
                        line: 23,
                        column: 34
                    }
                },
                type: "default-arg",
                locations: [{
                    start: {
                        line: 23,
                        column: 29
                    },
                    end: {
                        line: 23,
                        column: 34
                    }
                }]
            },
            "1": {
                loc: {
                    start: {
                        line: 23,
                        column: 36
                    },
                    end: {
                        line: 23,
                        column: 47
                    }
                },
                type: "default-arg",
                locations: [{
                    start: {
                        line: 23,
                        column: 45
                    },
                    end: {
                        line: 23,
                        column: 47
                    }
                }]
            },
            "2": {
                loc: {
                    start: {
                        line: 25,
                        column: 8
                    },
                    end: {
                        line: 29,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 25,
                        column: 8
                    },
                    end: {
                        line: 29,
                        column: 9
                    }
                }, {
                    start: {
                        line: 25,
                        column: 8
                    },
                    end: {
                        line: 29,
                        column: 9
                    }
                }]
            },
            "3": {
                loc: {
                    start: {
                        line: 46,
                        column: 23
                    },
                    end: {
                        line: 46,
                        column: 79
                    }
                },
                type: "cond-expr",
                locations: [{
                    start: {
                        line: 46,
                        column: 49
                    },
                    end: {
                        line: 46,
                        column: 65
                    }
                }, {
                    start: {
                        line: 46,
                        column: 68
                    },
                    end: {
                        line: 46,
                        column: 79
                    }
                }]
            },
            "4": {
                loc: {
                    start: {
                        line: 50,
                        column: 16
                    },
                    end: {
                        line: 52,
                        column: 17
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 50,
                        column: 16
                    },
                    end: {
                        line: 52,
                        column: 17
                    }
                }, {
                    start: {
                        line: 50,
                        column: 16
                    },
                    end: {
                        line: 52,
                        column: 17
                    }
                }]
            },
            "5": {
                loc: {
                    start: {
                        line: 56,
                        column: 16
                    },
                    end: {
                        line: 97,
                        column: 17
                    }
                },
                type: "switch",
                locations: [{
                    start: {
                        line: 57,
                        column: 20
                    },
                    end: {
                        line: 59,
                        column: 29
                    }
                }, {
                    start: {
                        line: 60,
                        column: 20
                    },
                    end: {
                        line: 62,
                        column: 29
                    }
                }, {
                    start: {
                        line: 63,
                        column: 20
                    },
                    end: {
                        line: 65,
                        column: 29
                    }
                }, {
                    start: {
                        line: 66,
                        column: 20
                    },
                    end: {
                        line: 68,
                        column: 29
                    }
                }, {
                    start: {
                        line: 69,
                        column: 20
                    },
                    end: {
                        line: 69,
                        column: 37
                    }
                }, {
                    start: {
                        line: 70,
                        column: 20
                    },
                    end: {
                        line: 72,
                        column: 29
                    }
                }, {
                    start: {
                        line: 73,
                        column: 20
                    },
                    end: {
                        line: 75,
                        column: 29
                    }
                }, {
                    start: {
                        line: 76,
                        column: 20
                    },
                    end: {
                        line: 78,
                        column: 29
                    }
                }, {
                    start: {
                        line: 79,
                        column: 20
                    },
                    end: {
                        line: 79,
                        column: 33
                    }
                }, {
                    start: {
                        line: 80,
                        column: 20
                    },
                    end: {
                        line: 82,
                        column: 29
                    }
                }, {
                    start: {
                        line: 83,
                        column: 20
                    },
                    end: {
                        line: 85,
                        column: 29
                    }
                }, {
                    start: {
                        line: 86,
                        column: 20
                    },
                    end: {
                        line: 88,
                        column: 29
                    }
                }, {
                    start: {
                        line: 89,
                        column: 20
                    },
                    end: {
                        line: 91,
                        column: 29
                    }
                }, {
                    start: {
                        line: 92,
                        column: 20
                    },
                    end: {
                        line: 94,
                        column: 29
                    }
                }, {
                    start: {
                        line: 95,
                        column: 20
                    },
                    end: {
                        line: 96,
                        column: 68
                    }
                }]
            },
            "6": {
                loc: {
                    start: {
                        line: 108,
                        column: 8
                    },
                    end: {
                        line: 112,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 108,
                        column: 8
                    },
                    end: {
                        line: 112,
                        column: 9
                    }
                }, {
                    start: {
                        line: 108,
                        column: 8
                    },
                    end: {
                        line: 112,
                        column: 9
                    }
                }]
            },
            "7": {
                loc: {
                    start: {
                        line: 129,
                        column: 12
                    },
                    end: {
                        line: 165,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 129,
                        column: 12
                    },
                    end: {
                        line: 165,
                        column: 13
                    }
                }, {
                    start: {
                        line: 129,
                        column: 12
                    },
                    end: {
                        line: 165,
                        column: 13
                    }
                }]
            },
            "8": {
                loc: {
                    start: {
                        line: 133,
                        column: 29
                    },
                    end: {
                        line: 133,
                        column: 77
                    }
                },
                type: "cond-expr",
                locations: [{
                    start: {
                        line: 133,
                        column: 43
                    },
                    end: {
                        line: 133,
                        column: 72
                    }
                }, {
                    start: {
                        line: 133,
                        column: 75
                    },
                    end: {
                        line: 133,
                        column: 77
                    }
                }]
            },
            "9": {
                loc: {
                    start: {
                        line: 134,
                        column: 28
                    },
                    end: {
                        line: 134,
                        column: 73
                    }
                },
                type: "cond-expr",
                locations: [{
                    start: {
                        line: 134,
                        column: 41
                    },
                    end: {
                        line: 134,
                        column: 69
                    }
                }, {
                    start: {
                        line: 134,
                        column: 71
                    },
                    end: {
                        line: 134,
                        column: 73
                    }
                }]
            },
            "10": {
                loc: {
                    start: {
                        line: 135,
                        column: 29
                    },
                    end: {
                        line: 135,
                        column: 80
                    }
                },
                type: "cond-expr",
                locations: [{
                    start: {
                        line: 135,
                        column: 43
                    },
                    end: {
                        line: 135,
                        column: 72
                    }
                }, {
                    start: {
                        line: 135,
                        column: 75
                    },
                    end: {
                        line: 135,
                        column: 80
                    }
                }]
            },
            "11": {
                loc: {
                    start: {
                        line: 136,
                        column: 29
                    },
                    end: {
                        line: 136,
                        column: 80
                    }
                },
                type: "cond-expr",
                locations: [{
                    start: {
                        line: 136,
                        column: 43
                    },
                    end: {
                        line: 136,
                        column: 72
                    }
                }, {
                    start: {
                        line: 136,
                        column: 75
                    },
                    end: {
                        line: 136,
                        column: 80
                    }
                }]
            },
            "12": {
                loc: {
                    start: {
                        line: 137,
                        column: 32
                    },
                    end: {
                        line: 137,
                        column: 70
                    }
                },
                type: "cond-expr",
                locations: [{
                    start: {
                        line: 137,
                        column: 49
                    },
                    end: {
                        line: 137,
                        column: 63
                    }
                }, {
                    start: {
                        line: 137,
                        column: 65
                    },
                    end: {
                        line: 137,
                        column: 70
                    }
                }]
            },
            "13": {
                loc: {
                    start: {
                        line: 138,
                        column: 16
                    },
                    end: {
                        line: 164,
                        column: 17
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 138,
                        column: 16
                    },
                    end: {
                        line: 164,
                        column: 17
                    }
                }, {
                    start: {
                        line: 138,
                        column: 16
                    },
                    end: {
                        line: 164,
                        column: 17
                    }
                }]
            },
            "14": {
                loc: {
                    start: {
                        line: 139,
                        column: 20
                    },
                    end: {
                        line: 147,
                        column: 21
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 139,
                        column: 20
                    },
                    end: {
                        line: 147,
                        column: 21
                    }
                }, {
                    start: {
                        line: 139,
                        column: 20
                    },
                    end: {
                        line: 147,
                        column: 21
                    }
                }]
            },
            "15": {
                loc: {
                    start: {
                        line: 139,
                        column: 24
                    },
                    end: {
                        line: 139,
                        column: 40
                    }
                },
                type: "binary-expr",
                locations: [{
                    start: {
                        line: 139,
                        column: 24
                    },
                    end: {
                        line: 139,
                        column: 30
                    }
                }, {
                    start: {
                        line: 139,
                        column: 34
                    },
                    end: {
                        line: 139,
                        column: 40
                    }
                }]
            },
            "16": {
                loc: {
                    start: {
                        line: 141,
                        column: 27
                    },
                    end: {
                        line: 147,
                        column: 21
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 141,
                        column: 27
                    },
                    end: {
                        line: 147,
                        column: 21
                    }
                }, {
                    start: {
                        line: 141,
                        column: 27
                    },
                    end: {
                        line: 147,
                        column: 21
                    }
                }]
            },
            "17": {
                loc: {
                    start: {
                        line: 143,
                        column: 27
                    },
                    end: {
                        line: 147,
                        column: 21
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 143,
                        column: 27
                    },
                    end: {
                        line: 147,
                        column: 21
                    }
                }, {
                    start: {
                        line: 143,
                        column: 27
                    },
                    end: {
                        line: 147,
                        column: 21
                    }
                }]
            },
            "18": {
                loc: {
                    start: {
                        line: 150,
                        column: 20
                    },
                    end: {
                        line: 152,
                        column: 21
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 150,
                        column: 20
                    },
                    end: {
                        line: 152,
                        column: 21
                    }
                }, {
                    start: {
                        line: 150,
                        column: 20
                    },
                    end: {
                        line: 152,
                        column: 21
                    }
                }]
            },
            "19": {
                loc: {
                    start: {
                        line: 153,
                        column: 20
                    },
                    end: {
                        line: 155,
                        column: 21
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 153,
                        column: 20
                    },
                    end: {
                        line: 155,
                        column: 21
                    }
                }, {
                    start: {
                        line: 153,
                        column: 20
                    },
                    end: {
                        line: 155,
                        column: 21
                    }
                }]
            },
            "20": {
                loc: {
                    start: {
                        line: 156,
                        column: 20
                    },
                    end: {
                        line: 158,
                        column: 21
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 156,
                        column: 20
                    },
                    end: {
                        line: 158,
                        column: 21
                    }
                }, {
                    start: {
                        line: 156,
                        column: 20
                    },
                    end: {
                        line: 158,
                        column: 21
                    }
                }]
            },
            "21": {
                loc: {
                    start: {
                        line: 159,
                        column: 20
                    },
                    end: {
                        line: 162,
                        column: 21
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 159,
                        column: 20
                    },
                    end: {
                        line: 162,
                        column: 21
                    }
                }, {
                    start: {
                        line: 159,
                        column: 20
                    },
                    end: {
                        line: 162,
                        column: 21
                    }
                }]
            },
            "22": {
                loc: {
                    start: {
                        line: 171,
                        column: 8
                    },
                    end: {
                        line: 175,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 171,
                        column: 8
                    },
                    end: {
                        line: 175,
                        column: 9
                    }
                }, {
                    start: {
                        line: 171,
                        column: 8
                    },
                    end: {
                        line: 175,
                        column: 9
                    }
                }]
            },
            "23": {
                loc: {
                    start: {
                        line: 179,
                        column: 8
                    },
                    end: {
                        line: 181,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 179,
                        column: 8
                    },
                    end: {
                        line: 181,
                        column: 9
                    }
                }, {
                    start: {
                        line: 179,
                        column: 8
                    },
                    end: {
                        line: 181,
                        column: 9
                    }
                }]
            },
            "24": {
                loc: {
                    start: {
                        line: 195,
                        column: 12
                    },
                    end: {
                        line: 205,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 195,
                        column: 12
                    },
                    end: {
                        line: 205,
                        column: 13
                    }
                }, {
                    start: {
                        line: 195,
                        column: 12
                    },
                    end: {
                        line: 205,
                        column: 13
                    }
                }]
            },
            "25": {
                loc: {
                    start: {
                        line: 207,
                        column: 12
                    },
                    end: {
                        line: 222,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 207,
                        column: 12
                    },
                    end: {
                        line: 222,
                        column: 13
                    }
                }, {
                    start: {
                        line: 207,
                        column: 12
                    },
                    end: {
                        line: 222,
                        column: 13
                    }
                }]
            },
            "26": {
                loc: {
                    start: {
                        line: 211,
                        column: 20
                    },
                    end: {
                        line: 220,
                        column: 21
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 211,
                        column: 20
                    },
                    end: {
                        line: 220,
                        column: 21
                    }
                }, {
                    start: {
                        line: 211,
                        column: 20
                    },
                    end: {
                        line: 220,
                        column: 21
                    }
                }]
            },
            "27": {
                loc: {
                    start: {
                        line: 211,
                        column: 24
                    },
                    end: {
                        line: 211,
                        column: 81
                    }
                },
                type: "binary-expr",
                locations: [{
                    start: {
                        line: 211,
                        column: 25
                    },
                    end: {
                        line: 211,
                        column: 44
                    }
                }, {
                    start: {
                        line: 211,
                        column: 48
                    },
                    end: {
                        line: 211,
                        column: 67
                    }
                }, {
                    start: {
                        line: 211,
                        column: 72
                    },
                    end: {
                        line: 211,
                        column: 81
                    }
                }]
            },
            "28": {
                loc: {
                    start: {
                        line: 215,
                        column: 27
                    },
                    end: {
                        line: 220,
                        column: 21
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 215,
                        column: 27
                    },
                    end: {
                        line: 220,
                        column: 21
                    }
                }, {
                    start: {
                        line: 215,
                        column: 27
                    },
                    end: {
                        line: 220,
                        column: 21
                    }
                }]
            },
            "29": {
                loc: {
                    start: {
                        line: 228,
                        column: 16
                    },
                    end: {
                        line: 230,
                        column: 17
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 228,
                        column: 16
                    },
                    end: {
                        line: 230,
                        column: 17
                    }
                }, {
                    start: {
                        line: 228,
                        column: 16
                    },
                    end: {
                        line: 230,
                        column: 17
                    }
                }]
            },
            "30": {
                loc: {
                    start: {
                        line: 231,
                        column: 16
                    },
                    end: {
                        line: 237,
                        column: 17
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 231,
                        column: 16
                    },
                    end: {
                        line: 237,
                        column: 17
                    }
                }, {
                    start: {
                        line: 231,
                        column: 16
                    },
                    end: {
                        line: 237,
                        column: 17
                    }
                }]
            },
            "31": {
                loc: {
                    start: {
                        line: 234,
                        column: 20
                    },
                    end: {
                        line: 236,
                        column: 21
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 234,
                        column: 20
                    },
                    end: {
                        line: 236,
                        column: 21
                    }
                }, {
                    start: {
                        line: 234,
                        column: 20
                    },
                    end: {
                        line: 236,
                        column: 21
                    }
                }]
            },
            "32": {
                loc: {
                    start: {
                        line: 234,
                        column: 24
                    },
                    end: {
                        line: 234,
                        column: 80
                    }
                },
                type: "binary-expr",
                locations: [{
                    start: {
                        line: 234,
                        column: 24
                    },
                    end: {
                        line: 234,
                        column: 49
                    }
                }, {
                    start: {
                        line: 234,
                        column: 53
                    },
                    end: {
                        line: 234,
                        column: 80
                    }
                }]
            },
            "33": {
                loc: {
                    start: {
                        line: 243,
                        column: 16
                    },
                    end: {
                        line: 245,
                        column: 17
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 243,
                        column: 16
                    },
                    end: {
                        line: 245,
                        column: 17
                    }
                }, {
                    start: {
                        line: 243,
                        column: 16
                    },
                    end: {
                        line: 245,
                        column: 17
                    }
                }]
            },
            "34": {
                loc: {
                    start: {
                        line: 246,
                        column: 16
                    },
                    end: {
                        line: 255,
                        column: 17
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 246,
                        column: 16
                    },
                    end: {
                        line: 255,
                        column: 17
                    }
                }, {
                    start: {
                        line: 246,
                        column: 16
                    },
                    end: {
                        line: 255,
                        column: 17
                    }
                }]
            },
            "35": {
                loc: {
                    start: {
                        line: 248,
                        column: 20
                    },
                    end: {
                        line: 250,
                        column: 21
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 248,
                        column: 20
                    },
                    end: {
                        line: 250,
                        column: 21
                    }
                }, {
                    start: {
                        line: 248,
                        column: 20
                    },
                    end: {
                        line: 250,
                        column: 21
                    }
                }]
            },
            "36": {
                loc: {
                    start: {
                        line: 248,
                        column: 24
                    },
                    end: {
                        line: 248,
                        column: 79
                    }
                },
                type: "binary-expr",
                locations: [{
                    start: {
                        line: 248,
                        column: 24
                    },
                    end: {
                        line: 248,
                        column: 48
                    }
                }, {
                    start: {
                        line: 248,
                        column: 52
                    },
                    end: {
                        line: 248,
                        column: 79
                    }
                }]
            },
            "37": {
                loc: {
                    start: {
                        line: 252,
                        column: 20
                    },
                    end: {
                        line: 254,
                        column: 21
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 252,
                        column: 20
                    },
                    end: {
                        line: 254,
                        column: 21
                    }
                }, {
                    start: {
                        line: 252,
                        column: 20
                    },
                    end: {
                        line: 254,
                        column: 21
                    }
                }]
            },
            "38": {
                loc: {
                    start: {
                        line: 257,
                        column: 12
                    },
                    end: {
                        line: 261,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 257,
                        column: 12
                    },
                    end: {
                        line: 261,
                        column: 13
                    }
                }, {
                    start: {
                        line: 257,
                        column: 12
                    },
                    end: {
                        line: 261,
                        column: 13
                    }
                }]
            },
            "39": {
                loc: {
                    start: {
                        line: 275,
                        column: 12
                    },
                    end: {
                        line: 277,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 275,
                        column: 12
                    },
                    end: {
                        line: 277,
                        column: 13
                    }
                }, {
                    start: {
                        line: 275,
                        column: 12
                    },
                    end: {
                        line: 277,
                        column: 13
                    }
                }]
            }
        },
        s: {
            "0": 0,
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0,
            "5": 0,
            "6": 0,
            "7": 0,
            "8": 0,
            "9": 0,
            "10": 0,
            "11": 0,
            "12": 0,
            "13": 0,
            "14": 0,
            "15": 0,
            "16": 0,
            "17": 0,
            "18": 0,
            "19": 0,
            "20": 0,
            "21": 0,
            "22": 0,
            "23": 0,
            "24": 0,
            "25": 0,
            "26": 0,
            "27": 0,
            "28": 0,
            "29": 0,
            "30": 0,
            "31": 0,
            "32": 0,
            "33": 0,
            "34": 0,
            "35": 0,
            "36": 0,
            "37": 0,
            "38": 0,
            "39": 0,
            "40": 0,
            "41": 0,
            "42": 0,
            "43": 0,
            "44": 0,
            "45": 0,
            "46": 0,
            "47": 0,
            "48": 0,
            "49": 0,
            "50": 0,
            "51": 0,
            "52": 0,
            "53": 0,
            "54": 0,
            "55": 0,
            "56": 0,
            "57": 0,
            "58": 0,
            "59": 0,
            "60": 0,
            "61": 0,
            "62": 0,
            "63": 0,
            "64": 0,
            "65": 0,
            "66": 0,
            "67": 0,
            "68": 0,
            "69": 0,
            "70": 0,
            "71": 0,
            "72": 0,
            "73": 0,
            "74": 0,
            "75": 0,
            "76": 0,
            "77": 0,
            "78": 0,
            "79": 0,
            "80": 0,
            "81": 0,
            "82": 0,
            "83": 0,
            "84": 0,
            "85": 0,
            "86": 0,
            "87": 0,
            "88": 0,
            "89": 0,
            "90": 0,
            "91": 0,
            "92": 0,
            "93": 0,
            "94": 0,
            "95": 0,
            "96": 0,
            "97": 0,
            "98": 0,
            "99": 0,
            "100": 0,
            "101": 0,
            "102": 0,
            "103": 0,
            "104": 0,
            "105": 0,
            "106": 0,
            "107": 0,
            "108": 0,
            "109": 0,
            "110": 0,
            "111": 0,
            "112": 0,
            "113": 0,
            "114": 0,
            "115": 0,
            "116": 0,
            "117": 0,
            "118": 0,
            "119": 0,
            "120": 0,
            "121": 0,
            "122": 0,
            "123": 0,
            "124": 0,
            "125": 0,
            "126": 0,
            "127": 0,
            "128": 0,
            "129": 0,
            "130": 0,
            "131": 0,
            "132": 0,
            "133": 0,
            "134": 0,
            "135": 0,
            "136": 0,
            "137": 0,
            "138": 0,
            "139": 0,
            "140": 0,
            "141": 0,
            "142": 0,
            "143": 0,
            "144": 0,
            "145": 0,
            "146": 0,
            "147": 0,
            "148": 0,
            "149": 0,
            "150": 0,
            "151": 0,
            "152": 0,
            "153": 0,
            "154": 0,
            "155": 0,
            "156": 0,
            "157": 0,
            "158": 0
        },
        f: {
            "0": 0,
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0,
            "5": 0,
            "6": 0,
            "7": 0,
            "8": 0,
            "9": 0,
            "10": 0,
            "11": 0,
            "12": 0,
            "13": 0,
            "14": 0,
            "15": 0,
            "16": 0,
            "17": 0,
            "18": 0
        },
        b: {
            "0": [0],
            "1": [0],
            "2": [0, 0],
            "3": [0, 0],
            "4": [0, 0],
            "5": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            "6": [0, 0],
            "7": [0, 0],
            "8": [0, 0],
            "9": [0, 0],
            "10": [0, 0],
            "11": [0, 0],
            "12": [0, 0],
            "13": [0, 0],
            "14": [0, 0],
            "15": [0, 0],
            "16": [0, 0],
            "17": [0, 0],
            "18": [0, 0],
            "19": [0, 0],
            "20": [0, 0],
            "21": [0, 0],
            "22": [0, 0],
            "23": [0, 0],
            "24": [0, 0],
            "25": [0, 0],
            "26": [0, 0],
            "27": [0, 0, 0],
            "28": [0, 0],
            "29": [0, 0],
            "30": [0, 0],
            "31": [0, 0],
            "32": [0, 0],
            "33": [0, 0],
            "34": [0, 0],
            "35": [0, 0],
            "36": [0, 0],
            "37": [0, 0],
            "38": [0, 0],
            "39": [0, 0]
        },
        _coverageSchema: "332fd63041d2c1bcb487cc26dd0d5f7d97098a6c"
    },
        coverage = global[gcv] || (global[gcv] = {});

    if (coverage[path] && coverage[path].hash === hash) {
        return coverage[path];
    }

    coverageData.hash = hash;
    return coverage[path] = coverageData;
}();

var _const = require("./const");

var _const2 = require("../const");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Export a list of bibliography items to bibLateX and serve the file to the user as a ZIP-file.
 * @class BibLatexExporter
 * @param pks A list of pks of the bibliography items that are to be exported.
 */

var TAGS = (++cov_18eh2feipe.s[0], {
    'strong': { open: '\\mkbibbold{', close: '}' },
    'em': { open: '\\mkbibitalic{', close: '}' },
    'smallcaps': { open: '\\textsc{', close: '}' },
    'enquote': { open: '\\enquote{', close: '}' },
    'nocase': { open: '{{', close: '}}' },
    'sub': { open: '_{', close: '}' },
    'sup': { open: '^{', close: '}' },
    'math': { open: '$', close: '$' },
    'url': { open: "\\url{", close: '}', verbatim: true }
});

var BibLatexExporter = exports.BibLatexExporter = function () {
    function BibLatexExporter(bibDB) {
        var pks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (++cov_18eh2feipe.b[0][0], false);
        var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : (++cov_18eh2feipe.b[1][0], {});
        (0, _classCallCheck3.default)(this, BibLatexExporter);
        ++cov_18eh2feipe.f[0];
        ++cov_18eh2feipe.s[1];

        this.bibDB = bibDB; // The bibliography database to export from.
        ++cov_18eh2feipe.s[2];
        if (pks) {
            ++cov_18eh2feipe.b[2][0];
            ++cov_18eh2feipe.s[3];

            this.pks = pks; // A list of pk values of the bibliography items to be exported.
        } else {
            ++cov_18eh2feipe.b[2][1];
            ++cov_18eh2feipe.s[4];

            this.pks = (0, _keys2.default)(bibDB); // If none are selected, all keys are exporter
        }
        ++cov_18eh2feipe.s[5];
        this.config = config;
        ++cov_18eh2feipe.s[6];
        this.warnings = [];
    }

    (0, _createClass3.default)(BibLatexExporter, [{
        key: "_reformKey",
        value: function _reformKey(theValue) {
            ++cov_18eh2feipe.f[4];
            ++cov_18eh2feipe.s[54];

            if (typeof theValue === 'string') {
                ++cov_18eh2feipe.b[6][0];
                ++cov_18eh2feipe.s[55];

                return this._escapeTeX(theValue);
            } else {
                ++cov_18eh2feipe.b[6][1];
                ++cov_18eh2feipe.s[56];

                return this._reformText(theValue);
            }
        }
    }, {
        key: "_reformRange",
        value: function _reformRange(theValue) {
            ++cov_18eh2feipe.f[5];

            var that = (++cov_18eh2feipe.s[57], this);
            ++cov_18eh2feipe.s[58];
            return theValue.map(function (range) {
                ++cov_18eh2feipe.f[6];
                ++cov_18eh2feipe.s[59];

                return that._escapeTeX(range.join('--'));
            }).join(',');
        }
    }, {
        key: "_reformInteger",
        value: function _reformInteger(theValue) {
            ++cov_18eh2feipe.f[7];
            ++cov_18eh2feipe.s[60];

            return String(theValue);
        }
    }, {
        key: "_reformName",
        value: function _reformName(theValue) {
            ++cov_18eh2feipe.f[8];

            var names = (++cov_18eh2feipe.s[61], []),
                that = (++cov_18eh2feipe.s[62], this);
            ++cov_18eh2feipe.s[63];
            theValue.forEach(function (name) {
                ++cov_18eh2feipe.f[9];
                ++cov_18eh2feipe.s[64];

                if (name.literal) {
                    ++cov_18eh2feipe.b[7][0];

                    var literal = (++cov_18eh2feipe.s[65], that._reformText(name.literal));
                    ++cov_18eh2feipe.s[66];
                    names.push("{" + literal + "}");
                } else {
                    ++cov_18eh2feipe.b[7][1];

                    var family = (++cov_18eh2feipe.s[67], name.family ? (++cov_18eh2feipe.b[8][0], that._reformText(name.family)) : (++cov_18eh2feipe.b[8][1], ''));
                    var given = (++cov_18eh2feipe.s[68], name.given ? (++cov_18eh2feipe.b[9][0], that._reformText(name.given)) : (++cov_18eh2feipe.b[9][1], ''));
                    var suffix = (++cov_18eh2feipe.s[69], name.suffix ? (++cov_18eh2feipe.b[10][0], that._reformText(name.suffix)) : (++cov_18eh2feipe.b[10][1], false));
                    var prefix = (++cov_18eh2feipe.s[70], name.prefix ? (++cov_18eh2feipe.b[11][0], that._reformText(name.prefix)) : (++cov_18eh2feipe.b[11][1], false));
                    var useprefix = (++cov_18eh2feipe.s[71], name.useprefix ? (++cov_18eh2feipe.b[12][0], name.useprefix) : (++cov_18eh2feipe.b[12][1], false));
                    ++cov_18eh2feipe.s[72];
                    if (that.config.traditionalNames) {
                        ++cov_18eh2feipe.b[13][0];
                        ++cov_18eh2feipe.s[73];

                        if ((++cov_18eh2feipe.b[15][0], suffix) && (++cov_18eh2feipe.b[15][1], prefix)) {
                            ++cov_18eh2feipe.b[14][0];
                            ++cov_18eh2feipe.s[74];

                            names.push("{" + prefix + " " + family + "}, {" + suffix + "}, {" + given + "}");
                        } else {
                                ++cov_18eh2feipe.b[14][1];
                                ++cov_18eh2feipe.s[75];
                                if (suffix) {
                                    ++cov_18eh2feipe.b[16][0];
                                    ++cov_18eh2feipe.s[76];

                                    names.push("{" + family + "}, {" + suffix + "}, {" + given + "}");
                                } else {
                                        ++cov_18eh2feipe.b[16][1];
                                        ++cov_18eh2feipe.s[77];
                                        if (prefix) {
                                            ++cov_18eh2feipe.b[17][0];
                                            ++cov_18eh2feipe.s[78];

                                            names.push("{" + prefix + " " + family + "}, {" + given + "}");
                                        } else {
                                            ++cov_18eh2feipe.b[17][1];
                                            ++cov_18eh2feipe.s[79];

                                            names.push("{" + family + "}, {" + given + "}");
                                        }
                                    }
                            }
                    } else {
                        ++cov_18eh2feipe.b[13][1];

                        var nameParts = (++cov_18eh2feipe.s[80], []);
                        ++cov_18eh2feipe.s[81];
                        if (given.length) {
                            ++cov_18eh2feipe.b[18][0];
                            ++cov_18eh2feipe.s[82];

                            nameParts.push(that._protectNamePart("given={" + given + "}"));
                        } else {
                            ++cov_18eh2feipe.b[18][1];
                        }
                        ++cov_18eh2feipe.s[83];
                        if (family.length) {
                            ++cov_18eh2feipe.b[19][0];
                            ++cov_18eh2feipe.s[84];

                            nameParts.push(that._protectNamePart("family={" + family + "}"));
                        } else {
                            ++cov_18eh2feipe.b[19][1];
                        }
                        ++cov_18eh2feipe.s[85];
                        if (suffix) {
                            ++cov_18eh2feipe.b[20][0];
                            ++cov_18eh2feipe.s[86];

                            nameParts.push(that._protectNamePart("suffix={" + suffix + "}"));
                        } else {
                            ++cov_18eh2feipe.b[20][1];
                        }
                        ++cov_18eh2feipe.s[87];
                        if (prefix) {
                            ++cov_18eh2feipe.b[21][0];
                            ++cov_18eh2feipe.s[88];

                            nameParts.push(that._protectNamePart("prefix={" + prefix + "}"));
                            ++cov_18eh2feipe.s[89];
                            nameParts.push("useprefix=" + name.useprefix);
                        } else {
                            ++cov_18eh2feipe.b[21][1];
                        }
                        ++cov_18eh2feipe.s[90];
                        names.push("{" + nameParts.join(', ') + "}");
                    }
                }
            });
            ++cov_18eh2feipe.s[91];
            return names.join(' and ');
        }
    }, {
        key: "_protectNamePart",
        value: function _protectNamePart(namePart) {
            ++cov_18eh2feipe.f[10];
            ++cov_18eh2feipe.s[92];

            if (namePart.includes(',')) {
                ++cov_18eh2feipe.b[22][0];
                ++cov_18eh2feipe.s[93];

                return "\"" + namePart + "\"";
            } else {
                ++cov_18eh2feipe.b[22][1];
                ++cov_18eh2feipe.s[94];

                return namePart;
            }
        }
    }, {
        key: "_escapeTeX",
        value: function _escapeTeX(theValue) {
            ++cov_18eh2feipe.f[11];
            ++cov_18eh2feipe.s[95];

            if ('string' != typeof theValue) {
                ++cov_18eh2feipe.b[23][0];
                ++cov_18eh2feipe.s[96];

                return false;
            } else {
                ++cov_18eh2feipe.b[23][1];
            }
            var len = (++cov_18eh2feipe.s[97], _const.TexSpecialChars.length);
            ++cov_18eh2feipe.s[98];
            for (var i = 0; i < len; i++) {
                ++cov_18eh2feipe.s[99];

                theValue = theValue.replace(_const.TexSpecialChars[i][0], _const.TexSpecialChars[i][1]);
            }
            ++cov_18eh2feipe.s[100];
            return theValue;
        }
    }, {
        key: "_reformText",
        value: function _reformText(theValue) {
            var _this = this;

            ++cov_18eh2feipe.f[12];

            var that = (++cov_18eh2feipe.s[101], this),
                latex = (++cov_18eh2feipe.s[102], ''),
                lastMarks = (++cov_18eh2feipe.s[103], []);
            ++cov_18eh2feipe.s[104];
            theValue.forEach(function (node) {
                ++cov_18eh2feipe.f[13];
                ++cov_18eh2feipe.s[105];

                if (node.type === 'variable') {
                    ++cov_18eh2feipe.b[24][0];
                    ++cov_18eh2feipe.s[106];

                    // This is an undefined variable
                    // This should usually not happen, as CSL doesn't know what to
                    // do with these. We'll put them into an unsupported tag.
                    latex += "} # " + node.attrs.variable + " # {";
                    ++cov_18eh2feipe.s[107];
                    _this.warnings.push({
                        type: 'undefined_variable',
                        variable: node.attrs.variable
                    });
                    ++cov_18eh2feipe.s[108];
                    return;
                } else {
                    ++cov_18eh2feipe.b[24][1];
                }
                var newMarks = (++cov_18eh2feipe.s[109], []);
                ++cov_18eh2feipe.s[110];
                if (node.marks) {
                    (function () {
                        ++cov_18eh2feipe.b[25][0];

                        var mathMode = (++cov_18eh2feipe.s[111], false);
                        ++cov_18eh2feipe.s[112];
                        node.marks.forEach(function (mark) {
                            ++cov_18eh2feipe.f[14];
                            ++cov_18eh2feipe.s[113];

                            // We need to activate mathmode for the lowest level sub/sup node.
                            if (((++cov_18eh2feipe.b[27][0], mark.type === 'sup') || (++cov_18eh2feipe.b[27][1], mark.type === 'sub')) && (++cov_18eh2feipe.b[27][2], !mathMode)) {
                                ++cov_18eh2feipe.b[26][0];
                                ++cov_18eh2feipe.s[114];

                                newMarks.push('math');
                                ++cov_18eh2feipe.s[115];
                                newMarks.push(mark.type);
                                ++cov_18eh2feipe.s[116];
                                mathMode = true;
                            } else {
                                    ++cov_18eh2feipe.b[26][1];
                                    ++cov_18eh2feipe.s[117];
                                    if (mark.type === 'nocase') {
                                        ++cov_18eh2feipe.b[28][0];
                                        ++cov_18eh2feipe.s[118];

                                        // No case has to be applied at the top level to be effective.
                                        newMarks.unshift(mark.type);
                                    } else {
                                        ++cov_18eh2feipe.b[28][1];
                                        ++cov_18eh2feipe.s[119];

                                        newMarks.push(mark.type);
                                    }
                                }
                        });
                    })();
                } else {
                    ++cov_18eh2feipe.b[25][1];
                }
                // close all tags that are not present in current text node.
                // Go through last marksd in revrse order to close innermost tags first.
                var closing = (++cov_18eh2feipe.s[120], false);
                ++cov_18eh2feipe.s[121];
                lastMarks.slice().reverse().forEach(function (mark, rIndex) {
                    ++cov_18eh2feipe.f[15];

                    var index = (++cov_18eh2feipe.s[122], lastMarks.length - rIndex);
                    ++cov_18eh2feipe.s[123];
                    if (mark != newMarks[index]) {
                        ++cov_18eh2feipe.b[29][0];
                        ++cov_18eh2feipe.s[124];

                        closing = true;
                    } else {
                        ++cov_18eh2feipe.b[29][1];
                    }
                    ++cov_18eh2feipe.s[125];
                    if (closing) {
                        ++cov_18eh2feipe.b[30][0];
                        ++cov_18eh2feipe.s[126];

                        latex += TAGS[mark].close;
                        // If not inside of a nocase, add a protective brace around tag.
                        ++cov_18eh2feipe.s[127];
                        if ((++cov_18eh2feipe.b[32][0], lastMarks[0] !== 'nocase') && (++cov_18eh2feipe.b[32][1], TAGS[mark].open[0] === '\\')) {
                            ++cov_18eh2feipe.b[31][0];
                            ++cov_18eh2feipe.s[128];

                            latex += '}';
                        } else {
                            ++cov_18eh2feipe.b[31][1];
                        }
                    } else {
                        ++cov_18eh2feipe.b[30][1];
                    }
                });
                // open all new tags that were not present in the last text node.
                var opening = (++cov_18eh2feipe.s[129], false),
                    verbatim = (++cov_18eh2feipe.s[130], false);
                ++cov_18eh2feipe.s[131];
                newMarks.forEach(function (mark, index) {
                    ++cov_18eh2feipe.f[16];
                    ++cov_18eh2feipe.s[132];

                    if (mark != lastMarks[index]) {
                        ++cov_18eh2feipe.b[33][0];
                        ++cov_18eh2feipe.s[133];

                        opening = true;
                    } else {
                        ++cov_18eh2feipe.b[33][1];
                    }
                    ++cov_18eh2feipe.s[134];
                    if (opening) {
                        ++cov_18eh2feipe.b[34][0];
                        ++cov_18eh2feipe.s[135];

                        // If not inside of a nocase, add a protective brace around tag.
                        if ((++cov_18eh2feipe.b[36][0], newMarks[0] !== 'nocase') && (++cov_18eh2feipe.b[36][1], TAGS[mark].open[0] === '\\')) {
                            ++cov_18eh2feipe.b[35][0];
                            ++cov_18eh2feipe.s[136];

                            latex += '{';
                        } else {
                            ++cov_18eh2feipe.b[35][1];
                        }
                        ++cov_18eh2feipe.s[137];
                        latex += TAGS[mark].open;
                        ++cov_18eh2feipe.s[138];
                        if (TAGS[mark].verbatim) {
                            ++cov_18eh2feipe.b[37][0];
                            ++cov_18eh2feipe.s[139];

                            verbatim = true;
                        } else {
                            ++cov_18eh2feipe.b[37][1];
                        }
                    } else {
                        ++cov_18eh2feipe.b[34][1];
                    }
                });
                ++cov_18eh2feipe.s[140];
                if (verbatim) {
                    ++cov_18eh2feipe.b[38][0];
                    ++cov_18eh2feipe.s[141];

                    latex += node.text;
                } else {
                    ++cov_18eh2feipe.b[38][1];
                    ++cov_18eh2feipe.s[142];

                    latex += that._escapeTeX(node.text);
                }
                ++cov_18eh2feipe.s[143];
                lastMarks = newMarks;
            });
            // Close all still open tags
            ++cov_18eh2feipe.s[144];
            lastMarks.slice().reverse().forEach(function (mark) {
                ++cov_18eh2feipe.f[17];
                ++cov_18eh2feipe.s[145];

                latex += TAGS[mark].close;
            });
            ++cov_18eh2feipe.s[146];
            return latex;
        }
    }, {
        key: "_getBibtexString",
        value: function _getBibtexString(biblist) {
            ++cov_18eh2feipe.f[18];

            var len = (++cov_18eh2feipe.s[147], biblist.length),
                str = (++cov_18eh2feipe.s[148], '');
            ++cov_18eh2feipe.s[149];
            for (var i = 0; i < len; i++) {
                ++cov_18eh2feipe.s[150];

                if (0 < i) {
                    ++cov_18eh2feipe.b[39][0];
                    ++cov_18eh2feipe.s[151];

                    str += '\n\n';
                } else {
                    ++cov_18eh2feipe.b[39][1];
                }
                var data = (++cov_18eh2feipe.s[152], biblist[i]);
                ++cov_18eh2feipe.s[153];
                str += "@" + data.type + "{" + data.key;
                ++cov_18eh2feipe.s[154];
                for (var vKey in data.values) {
                    var value = (++cov_18eh2feipe.s[155], ("{" + data.values[vKey] + "}").replace(/\{\} \# /g, '').replace(/\# \{\}/g, ''));
                    ++cov_18eh2feipe.s[156];
                    str += ",\n" + vKey + " = " + value;
                }
                ++cov_18eh2feipe.s[157];
                str += "\n}";
            }
            ++cov_18eh2feipe.s[158];
            return str;
        }
    }, {
        key: "output",
        get: function get() {
            ++cov_18eh2feipe.f[1];

            var that = (++cov_18eh2feipe.s[7], this);
            ++cov_18eh2feipe.s[8];
            this.bibtexArray = [];
            ++cov_18eh2feipe.s[9];
            this.bibtexStr = '';

            var len = (++cov_18eh2feipe.s[10], this.pks.length);

            ++cov_18eh2feipe.s[11];
            for (var i = 0; i < len; i++) {
                var pk = (++cov_18eh2feipe.s[12], this.pks[i]);
                var bib = (++cov_18eh2feipe.s[13], this.bibDB[pk]);
                var bibEntry = (++cov_18eh2feipe.s[14], {
                    'type': _const2.BibTypes[bib['bib_type']]['biblatex'],
                    'key': bib['entry_key'].length ? (++cov_18eh2feipe.b[3][0], bib['entry_key']) : (++cov_18eh2feipe.b[3][1], 'Undefined')
                });
                var fValues = (++cov_18eh2feipe.s[15], {});
                ++cov_18eh2feipe.s[16];
                for (var fKey in bib.fields) {
                    ++cov_18eh2feipe.s[17];

                    if (!_const2.BibFieldTypes[fKey]) {
                        ++cov_18eh2feipe.b[4][0];
                        ++cov_18eh2feipe.s[18];

                        continue;
                    } else {
                        ++cov_18eh2feipe.b[4][1];
                    }
                    var fValue = (++cov_18eh2feipe.s[19], bib.fields[fKey]);
                    var fType = (++cov_18eh2feipe.s[20], _const2.BibFieldTypes[fKey]['type']);
                    var key = (++cov_18eh2feipe.s[21], _const2.BibFieldTypes[fKey]['biblatex']);
                    ++cov_18eh2feipe.s[22];
                    switch (fType) {
                        case 'f_date':
                            ++cov_18eh2feipe.b[5][0];
                            ++cov_18eh2feipe.s[23];

                            fValues[key] = fValue; // EDTF 1.0 level 0/1 compliant string.
                            ++cov_18eh2feipe.s[24];
                            break;
                        case 'f_integer':
                            ++cov_18eh2feipe.b[5][1];
                            ++cov_18eh2feipe.s[25];

                            fValues[key] = this._reformInteger(fValue);
                            ++cov_18eh2feipe.s[26];
                            break;
                        case 'f_key':
                            ++cov_18eh2feipe.b[5][2];
                            ++cov_18eh2feipe.s[27];

                            fValues[key] = this._reformKey(fValue);
                            ++cov_18eh2feipe.s[28];
                            break;
                        case 'f_lang':
                            ++cov_18eh2feipe.b[5][3];
                            ++cov_18eh2feipe.s[29];

                            fValues[key] = _const2.BibLanguages[fValue]['biblatex'];
                            ++cov_18eh2feipe.s[30];
                            break;
                        case 'f_literal':
                            ++cov_18eh2feipe.b[5][4];

                        case 'f_long_literal':
                            ++cov_18eh2feipe.b[5][5];
                            ++cov_18eh2feipe.s[31];

                            fValues[key] = this._reformText(fValue);
                            ++cov_18eh2feipe.s[32];
                            break;
                        case 'f_range':
                            ++cov_18eh2feipe.b[5][6];
                            ++cov_18eh2feipe.s[33];

                            fValues[key] = this._reformRange(fValue);
                            ++cov_18eh2feipe.s[34];
                            break;
                        case 'f_title':
                            ++cov_18eh2feipe.b[5][7];
                            ++cov_18eh2feipe.s[35];

                            fValues[key] = this._reformText(fValue);
                            ++cov_18eh2feipe.s[36];
                            break;
                        case 'f_uri':
                            ++cov_18eh2feipe.b[5][8];

                        case 'f_verbatim':
                            ++cov_18eh2feipe.b[5][9];
                            ++cov_18eh2feipe.s[37];

                            fValues[key] = fValue.replace(/{|}/g, ''); // TODO: balanced braces should probably be ok here.
                            ++cov_18eh2feipe.s[38];
                            break;
                        case 'l_key':
                            ++cov_18eh2feipe.b[5][10];
                            ++cov_18eh2feipe.s[39];

                            fValues[key] = this._escapeTeX(fValue.map(function (key) {
                                ++cov_18eh2feipe.f[2];
                                ++cov_18eh2feipe.s[40];
                                return that._reformKey(key);
                            }).join(' and '));
                            ++cov_18eh2feipe.s[41];
                            break;
                        case 'l_literal':
                            ++cov_18eh2feipe.b[5][11];
                            ++cov_18eh2feipe.s[42];

                            fValues[key] = fValue.map(function (text) {
                                ++cov_18eh2feipe.f[3];
                                ++cov_18eh2feipe.s[43];
                                return that._reformText(text);
                            }).join(' and ');
                            ++cov_18eh2feipe.s[44];
                            break;
                        case 'l_name':
                            ++cov_18eh2feipe.b[5][12];
                            ++cov_18eh2feipe.s[45];

                            fValues[key] = this._reformName(fValue);
                            ++cov_18eh2feipe.s[46];
                            break;
                        case 'l_tag':
                            ++cov_18eh2feipe.b[5][13];
                            ++cov_18eh2feipe.s[47];

                            fValues[key] = this._escapeTeX(fValue.join(', '));
                            ++cov_18eh2feipe.s[48];
                            break;
                        default:
                            ++cov_18eh2feipe.b[5][14];
                            ++cov_18eh2feipe.s[49];

                            console.warn("Unrecognized type: " + fType + "!");
                    }
                }
                ++cov_18eh2feipe.s[50];
                bibEntry.values = fValues;
                ++cov_18eh2feipe.s[51];
                this.bibtexArray[this.bibtexArray.length] = bibEntry;
            }
            ++cov_18eh2feipe.s[52];
            this.bibtexStr = this._getBibtexString(this.bibtexArray);
            ++cov_18eh2feipe.s[53];
            return this.bibtexStr;
        }
    }]);
    return BibLatexExporter;
}();

},{"../const":125,"./const":127,"babel-runtime/core-js/object/keys":11,"babel-runtime/helpers/classCallCheck":15,"babel-runtime/helpers/createClass":16}],127:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var cov_12577grdop = function () {
    var path = '/home/travis/build/fiduswriter/biblatex-csl-converter/src/export/const.js',
        hash = 'b19bbacfe264b8add385dbea1d6d18d4bb7b06b6',
        global = new Function('return this')(),
        gcv = '__coverage__',
        coverageData = {
        path: '/home/travis/build/fiduswriter/biblatex-csl-converter/src/export/const.js',
        statementMap: {
            '0': {
                start: {
                    line: 2,
                    column: 31
                },
                end: {
                    line: 14,
                    column: 1
                }
            }
        },
        fnMap: {},
        branchMap: {},
        s: {
            '0': 0
        },
        f: {},
        b: {},
        _coverageSchema: '332fd63041d2c1bcb487cc26dd0d5f7d97098a6c'
    },
        coverage = global[gcv] || (global[gcv] = {});

    if (coverage[path] && coverage[path].hash === hash) {
        return coverage[path];
    }

    coverageData.hash = hash;
    return coverage[path] = coverageData;
}();

// A much smaller list for export than for import, as biblatex does understand utf8
var TexSpecialChars = exports.TexSpecialChars = (++cov_12577grdop.s[0], [[/\\/g, '\\textbackslash '], [/\{/g, '\\{ '], [/\}/g, '\\} '], [/&/g, '{\\&}'], [/%/g, '{\\%}'], [/\$/g, '{\\$}'], [/#/g, '{\\#}'], [/_/g, '{\\_}'], [/~/g, '{\\textasciitilde}'], [/\^/g, '{\\textasciicircum}'], [/ and /g, ' {and} ']]);

},{}],128:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CSLExporter = undefined;

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var cov_2dpcoexk8q = function () {
    var path = "/home/travis/build/fiduswriter/biblatex-csl-converter/src/export/csl.js",
        hash = "c7a0b7725a3525fd9efe4bf1106fbef406b5aa41",
        global = new Function('return this')(),
        gcv = "__coverage__",
        coverageData = {
        path: "/home/travis/build/fiduswriter/biblatex-csl-converter/src/export/csl.js",
        statementMap: {
            "0": {
                start: {
                    line: 8,
                    column: 13
                },
                end: {
                    line: 18,
                    column: 2
                }
            },
            "1": {
                start: {
                    line: 22,
                    column: 8
                },
                end: {
                    line: 22,
                    column: 26
                }
            },
            "2": {
                start: {
                    line: 23,
                    column: 8
                },
                end: {
                    line: 27,
                    column: 9
                }
            },
            "3": {
                start: {
                    line: 24,
                    column: 12
                },
                end: {
                    line: 24,
                    column: 26
                }
            },
            "4": {
                start: {
                    line: 26,
                    column: 12
                },
                end: {
                    line: 26,
                    column: 41
                }
            },
            "5": {
                start: {
                    line: 28,
                    column: 8
                },
                end: {
                    line: 28,
                    column: 23
                }
            },
            "6": {
                start: {
                    line: 29,
                    column: 8
                },
                end: {
                    line: 29,
                    column: 24
                }
            },
            "7": {
                start: {
                    line: 33,
                    column: 8
                },
                end: {
                    line: 38,
                    column: 9
                }
            },
            "8": {
                start: {
                    line: 34,
                    column: 12
                },
                end: {
                    line: 37,
                    column: 13
                }
            },
            "9": {
                start: {
                    line: 35,
                    column: 16
                },
                end: {
                    line: 35,
                    column: 59
                }
            },
            "10": {
                start: {
                    line: 36,
                    column: 16
                },
                end: {
                    line: 36,
                    column: 44
                }
            },
            "11": {
                start: {
                    line: 39,
                    column: 8
                },
                end: {
                    line: 39,
                    column: 25
                }
            },
            "12": {
                start: {
                    line: 46,
                    column: 19
                },
                end: {
                    line: 46,
                    column: 23
                }
            },
            "13": {
                start: {
                    line: 46,
                    column: 31
                },
                end: {
                    line: 46,
                    column: 45
                }
            },
            "14": {
                start: {
                    line: 46,
                    column: 57
                },
                end: {
                    line: 46,
                    column: 59
                }
            },
            "15": {
                start: {
                    line: 47,
                    column: 8
                },
                end: {
                    line: 99,
                    column: 9
                }
            },
            "16": {
                start: {
                    line: 48,
                    column: 12
                },
                end: {
                    line: 98,
                    column: 13
                }
            },
            "17": {
                start: {
                    line: 49,
                    column: 29
                },
                end: {
                    line: 49,
                    column: 45
                }
            },
            "18": {
                start: {
                    line: 50,
                    column: 28
                },
                end: {
                    line: 50,
                    column: 55
                }
            },
            "19": {
                start: {
                    line: 51,
                    column: 26
                },
                end: {
                    line: 51,
                    column: 52
                }
            },
            "20": {
                start: {
                    line: 52,
                    column: 16
                },
                end: {
                    line: 97,
                    column: 17
                }
            },
            "21": {
                start: {
                    line: 54,
                    column: 24
                },
                end: {
                    line: 54,
                    column: 63
                }
            },
            "22": {
                start: {
                    line: 55,
                    column: 24
                },
                end: {
                    line: 55,
                    column: 29
                }
            },
            "23": {
                start: {
                    line: 57,
                    column: 24
                },
                end: {
                    line: 57,
                    column: 66
                }
            },
            "24": {
                start: {
                    line: 58,
                    column: 24
                },
                end: {
                    line: 58,
                    column: 29
                }
            },
            "25": {
                start: {
                    line: 60,
                    column: 24
                },
                end: {
                    line: 60,
                    column: 62
                }
            },
            "26": {
                start: {
                    line: 61,
                    column: 24
                },
                end: {
                    line: 61,
                    column: 29
                }
            },
            "27": {
                start: {
                    line: 63,
                    column: 24
                },
                end: {
                    line: 63,
                    column: 66
                }
            },
            "28": {
                start: {
                    line: 64,
                    column: 24
                },
                end: {
                    line: 64,
                    column: 29
                }
            },
            "29": {
                start: {
                    line: 67,
                    column: 24
                },
                end: {
                    line: 67,
                    column: 63
                }
            },
            "30": {
                start: {
                    line: 68,
                    column: 24
                },
                end: {
                    line: 68,
                    column: 29
                }
            },
            "31": {
                start: {
                    line: 70,
                    column: 24
                },
                end: {
                    line: 70,
                    column: 64
                }
            },
            "32": {
                start: {
                    line: 71,
                    column: 24
                },
                end: {
                    line: 71,
                    column: 29
                }
            },
            "33": {
                start: {
                    line: 73,
                    column: 24
                },
                end: {
                    line: 73,
                    column: 63
                }
            },
            "34": {
                start: {
                    line: 74,
                    column: 24
                },
                end: {
                    line: 74,
                    column: 29
                }
            },
            "35": {
                start: {
                    line: 77,
                    column: 24
                },
                end: {
                    line: 77,
                    column: 63
                }
            },
            "36": {
                start: {
                    line: 78,
                    column: 24
                },
                end: {
                    line: 78,
                    column: 29
                }
            },
            "37": {
                start: {
                    line: 80,
                    column: 24
                },
                end: {
                    line: 80,
                    column: 117
                }
            },
            "38": {
                start: {
                    line: 80,
                    column: 73
                },
                end: {
                    line: 80,
                    column: 100
                }
            },
            "39": {
                start: {
                    line: 81,
                    column: 24
                },
                end: {
                    line: 81,
                    column: 29
                }
            },
            "40": {
                start: {
                    line: 83,
                    column: 44
                },
                end: {
                    line: 83,
                    column: 46
                }
            },
            "41": {
                start: {
                    line: 84,
                    column: 24
                },
                end: {
                    line: 86,
                    column: 26
                }
            },
            "42": {
                start: {
                    line: 85,
                    column: 28
                },
                end: {
                    line: 85,
                    column: 70
                }
            },
            "43": {
                start: {
                    line: 87,
                    column: 24
                },
                end: {
                    line: 87,
                    column: 63
                }
            },
            "44": {
                start: {
                    line: 88,
                    column: 24
                },
                end: {
                    line: 88,
                    column: 29
                }
            },
            "45": {
                start: {
                    line: 90,
                    column: 24
                },
                end: {
                    line: 90,
                    column: 63
                }
            },
            "46": {
                start: {
                    line: 91,
                    column: 24
                },
                end: {
                    line: 91,
                    column: 29
                }
            },
            "47": {
                start: {
                    line: 93,
                    column: 24
                },
                end: {
                    line: 93,
                    column: 74
                }
            },
            "48": {
                start: {
                    line: 94,
                    column: 24
                },
                end: {
                    line: 94,
                    column: 29
                }
            },
            "49": {
                start: {
                    line: 96,
                    column: 24
                },
                end: {
                    line: 96,
                    column: 68
                }
            },
            "50": {
                start: {
                    line: 100,
                    column: 8
                },
                end: {
                    line: 100,
                    column: 52
                }
            },
            "51": {
                start: {
                    line: 101,
                    column: 8
                },
                end: {
                    line: 101,
                    column: 22
                }
            },
            "52": {
                start: {
                    line: 105,
                    column: 8
                },
                end: {
                    line: 109,
                    column: 33
                }
            },
            "53": {
                start: {
                    line: 113,
                    column: 8
                },
                end: {
                    line: 117,
                    column: 9
                }
            },
            "54": {
                start: {
                    line: 114,
                    column: 12
                },
                end: {
                    line: 114,
                    column: 45
                }
            },
            "55": {
                start: {
                    line: 116,
                    column: 12
                },
                end: {
                    line: 116,
                    column: 45
                }
            },
            "56": {
                start: {
                    line: 121,
                    column: 19
                },
                end: {
                    line: 121,
                    column: 23
                }
            },
            "57": {
                start: {
                    line: 122,
                    column: 8
                },
                end: {
                    line: 124,
                    column: 20
                }
            },
            "58": {
                start: {
                    line: 123,
                    column: 12
                },
                end: {
                    line: 123,
                    column: 53
                }
            },
            "59": {
                start: {
                    line: 128,
                    column: 8
                },
                end: {
                    line: 128,
                    column: 31
                }
            },
            "60": {
                start: {
                    line: 132,
                    column: 19
                },
                end: {
                    line: 132,
                    column: 23
                }
            },
            "61": {
                start: {
                    line: 132,
                    column: 32
                },
                end: {
                    line: 132,
                    column: 34
                }
            },
            "62": {
                start: {
                    line: 132,
                    column: 48
                },
                end: {
                    line: 132,
                    column: 50
                }
            },
            "63": {
                start: {
                    line: 133,
                    column: 8
                },
                end: {
                    line: 175,
                    column: 10
                }
            },
            "64": {
                start: {
                    line: 134,
                    column: 12
                },
                end: {
                    line: 144,
                    column: 13
                }
            },
            "65": {
                start: {
                    line: 138,
                    column: 16
                },
                end: {
                    line: 138,
                    column: 93
                }
            },
            "66": {
                start: {
                    line: 139,
                    column: 16
                },
                end: {
                    line: 142,
                    column: 18
                }
            },
            "67": {
                start: {
                    line: 143,
                    column: 16
                },
                end: {
                    line: 143,
                    column: 22
                }
            },
            "68": {
                start: {
                    line: 145,
                    column: 27
                },
                end: {
                    line: 145,
                    column: 29
                }
            },
            "69": {
                start: {
                    line: 146,
                    column: 12
                },
                end: {
                    line: 150,
                    column: 13
                }
            },
            "70": {
                start: {
                    line: 147,
                    column: 16
                },
                end: {
                    line: 149,
                    column: 18
                }
            },
            "71": {
                start: {
                    line: 148,
                    column: 20
                },
                end: {
                    line: 148,
                    column: 44
                }
            },
            "72": {
                start: {
                    line: 153,
                    column: 26
                },
                end: {
                    line: 153,
                    column: 31
                }
            },
            "73": {
                start: {
                    line: 154,
                    column: 12
                },
                end: {
                    line: 162,
                    column: 14
                }
            },
            "74": {
                start: {
                    line: 155,
                    column: 28
                },
                end: {
                    line: 155,
                    column: 53
                }
            },
            "75": {
                start: {
                    line: 156,
                    column: 16
                },
                end: {
                    line: 158,
                    column: 17
                }
            },
            "76": {
                start: {
                    line: 157,
                    column: 20
                },
                end: {
                    line: 157,
                    column: 34
                }
            },
            "77": {
                start: {
                    line: 159,
                    column: 16
                },
                end: {
                    line: 161,
                    column: 17
                }
            },
            "78": {
                start: {
                    line: 160,
                    column: 20
                },
                end: {
                    line: 160,
                    column: 44
                }
            },
            "79": {
                start: {
                    line: 164,
                    column: 26
                },
                end: {
                    line: 164,
                    column: 31
                }
            },
            "80": {
                start: {
                    line: 165,
                    column: 12
                },
                end: {
                    line: 172,
                    column: 14
                }
            },
            "81": {
                start: {
                    line: 166,
                    column: 16
                },
                end: {
                    line: 168,
                    column: 17
                }
            },
            "82": {
                start: {
                    line: 167,
                    column: 20
                },
                end: {
                    line: 167,
                    column: 34
                }
            },
            "83": {
                start: {
                    line: 169,
                    column: 16
                },
                end: {
                    line: 171,
                    column: 17
                }
            },
            "84": {
                start: {
                    line: 170,
                    column: 20
                },
                end: {
                    line: 170,
                    column: 43
                }
            },
            "85": {
                start: {
                    line: 173,
                    column: 12
                },
                end: {
                    line: 173,
                    column: 47
                }
            },
            "86": {
                start: {
                    line: 174,
                    column: 12
                },
                end: {
                    line: 174,
                    column: 32
                }
            },
            "87": {
                start: {
                    line: 177,
                    column: 8
                },
                end: {
                    line: 179,
                    column: 10
                }
            },
            "88": {
                start: {
                    line: 178,
                    column: 12
                },
                end: {
                    line: 178,
                    column: 36
                }
            },
            "89": {
                start: {
                    line: 180,
                    column: 8
                },
                end: {
                    line: 180,
                    column: 19
                }
            },
            "90": {
                start: {
                    line: 184,
                    column: 22
                },
                end: {
                    line: 190,
                    column: 9
                }
            },
            "91": {
                start: {
                    line: 191,
                    column: 8
                },
                end: {
                    line: 202,
                    column: 9
                }
            },
            "92": {
                start: {
                    line: 192,
                    column: 12
                },
                end: {
                    line: 197,
                    column: 13
                }
            },
            "93": {
                start: {
                    line: 199,
                    column: 12
                },
                end: {
                    line: 201,
                    column: 13
                }
            },
            "94": {
                start: {
                    line: 206,
                    column: 28
                },
                end: {
                    line: 206,
                    column: 30
                }
            },
            "95": {
                start: {
                    line: 206,
                    column: 39
                },
                end: {
                    line: 206,
                    column: 43
                }
            },
            "96": {
                start: {
                    line: 207,
                    column: 8
                },
                end: {
                    line: 227,
                    column: 10
                }
            },
            "97": {
                start: {
                    line: 208,
                    column: 31
                },
                end: {
                    line: 208,
                    column: 33
                }
            },
            "98": {
                start: {
                    line: 209,
                    column: 12
                },
                end: {
                    line: 225,
                    column: 13
                }
            },
            "99": {
                start: {
                    line: 210,
                    column: 16
                },
                end: {
                    line: 210,
                    column: 72
                }
            },
            "100": {
                start: {
                    line: 212,
                    column: 16
                },
                end: {
                    line: 212,
                    column: 68
                }
            },
            "101": {
                start: {
                    line: 213,
                    column: 16
                },
                end: {
                    line: 213,
                    column: 70
                }
            },
            "102": {
                start: {
                    line: 214,
                    column: 16
                },
                end: {
                    line: 216,
                    column: 17
                }
            },
            "103": {
                start: {
                    line: 215,
                    column: 20
                },
                end: {
                    line: 215,
                    column: 74
                }
            },
            "104": {
                start: {
                    line: 217,
                    column: 16
                },
                end: {
                    line: 223,
                    column: 17
                }
            },
            "105": {
                start: {
                    line: 218,
                    column: 20
                },
                end: {
                    line: 222,
                    column: 21
                }
            },
            "106": {
                start: {
                    line: 219,
                    column: 24
                },
                end: {
                    line: 219,
                    column: 93
                }
            },
            "107": {
                start: {
                    line: 221,
                    column: 24
                },
                end: {
                    line: 221,
                    column: 89
                }
            },
            "108": {
                start: {
                    line: 224,
                    column: 16
                },
                end: {
                    line: 224,
                    column: 73
                }
            },
            "109": {
                start: {
                    line: 226,
                    column: 12
                },
                end: {
                    line: 226,
                    column: 44
                }
            },
            "110": {
                start: {
                    line: 228,
                    column: 8
                },
                end: {
                    line: 228,
                    column: 28
                }
            }
        },
        fnMap: {
            "0": {
                name: "(anonymous_0)",
                decl: {
                    start: {
                        line: 21,
                        column: 4
                    },
                    end: {
                        line: 21,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 21,
                        column: 28
                    },
                    end: {
                        line: 30,
                        column: 5
                    }
                }
            },
            "1": {
                name: "(anonymous_1)",
                decl: {
                    start: {
                        line: 32,
                        column: 4
                    },
                    end: {
                        line: 32,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 32,
                        column: 17
                    },
                    end: {
                        line: 40,
                        column: 5
                    }
                }
            },
            "2": {
                name: "(anonymous_2)",
                decl: {
                    start: {
                        line: 45,
                        column: 4
                    },
                    end: {
                        line: 45,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 45,
                        column: 20
                    },
                    end: {
                        line: 102,
                        column: 5
                    }
                }
            },
            "3": {
                name: "(anonymous_3)",
                decl: {
                    start: {
                        line: 80,
                        column: 67
                    },
                    end: {
                        line: 80,
                        column: 68
                    }
                },
                loc: {
                    start: {
                        line: 80,
                        column: 72
                    },
                    end: {
                        line: 80,
                        column: 101
                    }
                }
            },
            "4": {
                name: "(anonymous_4)",
                decl: {
                    start: {
                        line: 84,
                        column: 39
                    },
                    end: {
                        line: 84,
                        column: 40
                    }
                },
                loc: {
                    start: {
                        line: 84,
                        column: 47
                    },
                    end: {
                        line: 86,
                        column: 25
                    }
                }
            },
            "5": {
                name: "(anonymous_5)",
                decl: {
                    start: {
                        line: 104,
                        column: 4
                    },
                    end: {
                        line: 104,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 104,
                        column: 24
                    },
                    end: {
                        line: 110,
                        column: 5
                    }
                }
            },
            "6": {
                name: "(anonymous_6)",
                decl: {
                    start: {
                        line: 112,
                        column: 4
                    },
                    end: {
                        line: 112,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 112,
                        column: 25
                    },
                    end: {
                        line: 118,
                        column: 5
                    }
                }
            },
            "7": {
                name: "(anonymous_7)",
                decl: {
                    start: {
                        line: 120,
                        column: 4
                    },
                    end: {
                        line: 120,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 120,
                        column: 27
                    },
                    end: {
                        line: 125,
                        column: 5
                    }
                }
            },
            "8": {
                name: "(anonymous_8)",
                decl: {
                    start: {
                        line: 122,
                        column: 28
                    },
                    end: {
                        line: 122,
                        column: 29
                    }
                },
                loc: {
                    start: {
                        line: 122,
                        column: 35
                    },
                    end: {
                        line: 124,
                        column: 9
                    }
                }
            },
            "9": {
                name: "(anonymous_9)",
                decl: {
                    start: {
                        line: 127,
                        column: 4
                    },
                    end: {
                        line: 127,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 127,
                        column: 29
                    },
                    end: {
                        line: 129,
                        column: 5
                    }
                }
            },
            "10": {
                name: "(anonymous_10)",
                decl: {
                    start: {
                        line: 131,
                        column: 4
                    },
                    end: {
                        line: 131,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 131,
                        column: 26
                    },
                    end: {
                        line: 181,
                        column: 5
                    }
                }
            },
            "11": {
                name: "(anonymous_11)",
                decl: {
                    start: {
                        line: 133,
                        column: 25
                    },
                    end: {
                        line: 133,
                        column: 26
                    }
                },
                loc: {
                    start: {
                        line: 133,
                        column: 33
                    },
                    end: {
                        line: 175,
                        column: 9
                    }
                }
            },
            "12": {
                name: "(anonymous_12)",
                decl: {
                    start: {
                        line: 147,
                        column: 35
                    },
                    end: {
                        line: 147,
                        column: 36
                    }
                },
                loc: {
                    start: {
                        line: 147,
                        column: 43
                    },
                    end: {
                        line: 149,
                        column: 17
                    }
                }
            },
            "13": {
                name: "(anonymous_13)",
                decl: {
                    start: {
                        line: 154,
                        column: 48
                    },
                    end: {
                        line: 154,
                        column: 49
                    }
                },
                loc: {
                    start: {
                        line: 154,
                        column: 64
                    },
                    end: {
                        line: 162,
                        column: 13
                    }
                }
            },
            "14": {
                name: "(anonymous_14)",
                decl: {
                    start: {
                        line: 165,
                        column: 29
                    },
                    end: {
                        line: 165,
                        column: 30
                    }
                },
                loc: {
                    start: {
                        line: 165,
                        column: 44
                    },
                    end: {
                        line: 172,
                        column: 13
                    }
                }
            },
            "15": {
                name: "(anonymous_15)",
                decl: {
                    start: {
                        line: 177,
                        column: 44
                    },
                    end: {
                        line: 177,
                        column: 45
                    }
                },
                loc: {
                    start: {
                        line: 177,
                        column: 52
                    },
                    end: {
                        line: 179,
                        column: 9
                    }
                }
            },
            "16": {
                name: "(anonymous_16)",
                decl: {
                    start: {
                        line: 183,
                        column: 4
                    },
                    end: {
                        line: 183,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 183,
                        column: 25
                    },
                    end: {
                        line: 203,
                        column: 5
                    }
                }
            },
            "17": {
                name: "(anonymous_17)",
                decl: {
                    start: {
                        line: 205,
                        column: 4
                    },
                    end: {
                        line: 205,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 205,
                        column: 26
                    },
                    end: {
                        line: 229,
                        column: 5
                    }
                }
            },
            "18": {
                name: "(anonymous_18)",
                decl: {
                    start: {
                        line: 207,
                        column: 25
                    },
                    end: {
                        line: 207,
                        column: 26
                    }
                },
                loc: {
                    start: {
                        line: 207,
                        column: 35
                    },
                    end: {
                        line: 227,
                        column: 9
                    }
                }
            }
        },
        branchMap: {
            "0": {
                loc: {
                    start: {
                        line: 23,
                        column: 8
                    },
                    end: {
                        line: 27,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 23,
                        column: 8
                    },
                    end: {
                        line: 27,
                        column: 9
                    }
                }, {
                    start: {
                        line: 23,
                        column: 8
                    },
                    end: {
                        line: 27,
                        column: 9
                    }
                }]
            },
            "1": {
                loc: {
                    start: {
                        line: 34,
                        column: 12
                    },
                    end: {
                        line: 37,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 34,
                        column: 12
                    },
                    end: {
                        line: 37,
                        column: 13
                    }
                }, {
                    start: {
                        line: 34,
                        column: 12
                    },
                    end: {
                        line: 37,
                        column: 13
                    }
                }]
            },
            "2": {
                loc: {
                    start: {
                        line: 48,
                        column: 12
                    },
                    end: {
                        line: 98,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 48,
                        column: 12
                    },
                    end: {
                        line: 98,
                        column: 13
                    }
                }, {
                    start: {
                        line: 48,
                        column: 12
                    },
                    end: {
                        line: 98,
                        column: 13
                    }
                }]
            },
            "3": {
                loc: {
                    start: {
                        line: 48,
                        column: 16
                    },
                    end: {
                        line: 48,
                        column: 96
                    }
                },
                type: "binary-expr",
                locations: [{
                    start: {
                        line: 48,
                        column: 16
                    },
                    end: {
                        line: 48,
                        column: 39
                    }
                }, {
                    start: {
                        line: 48,
                        column: 43
                    },
                    end: {
                        line: 48,
                        column: 64
                    }
                }, {
                    start: {
                        line: 48,
                        column: 68
                    },
                    end: {
                        line: 48,
                        column: 96
                    }
                }]
            },
            "4": {
                loc: {
                    start: {
                        line: 52,
                        column: 16
                    },
                    end: {
                        line: 97,
                        column: 17
                    }
                },
                type: "switch",
                locations: [{
                    start: {
                        line: 53,
                        column: 20
                    },
                    end: {
                        line: 55,
                        column: 29
                    }
                }, {
                    start: {
                        line: 56,
                        column: 20
                    },
                    end: {
                        line: 58,
                        column: 29
                    }
                }, {
                    start: {
                        line: 59,
                        column: 20
                    },
                    end: {
                        line: 61,
                        column: 29
                    }
                }, {
                    start: {
                        line: 62,
                        column: 20
                    },
                    end: {
                        line: 64,
                        column: 29
                    }
                }, {
                    start: {
                        line: 65,
                        column: 20
                    },
                    end: {
                        line: 65,
                        column: 37
                    }
                }, {
                    start: {
                        line: 66,
                        column: 20
                    },
                    end: {
                        line: 68,
                        column: 29
                    }
                }, {
                    start: {
                        line: 69,
                        column: 20
                    },
                    end: {
                        line: 71,
                        column: 29
                    }
                }, {
                    start: {
                        line: 72,
                        column: 20
                    },
                    end: {
                        line: 74,
                        column: 29
                    }
                }, {
                    start: {
                        line: 75,
                        column: 20
                    },
                    end: {
                        line: 75,
                        column: 33
                    }
                }, {
                    start: {
                        line: 76,
                        column: 20
                    },
                    end: {
                        line: 78,
                        column: 29
                    }
                }, {
                    start: {
                        line: 79,
                        column: 20
                    },
                    end: {
                        line: 81,
                        column: 29
                    }
                }, {
                    start: {
                        line: 82,
                        column: 20
                    },
                    end: {
                        line: 88,
                        column: 29
                    }
                }, {
                    start: {
                        line: 89,
                        column: 20
                    },
                    end: {
                        line: 91,
                        column: 29
                    }
                }, {
                    start: {
                        line: 92,
                        column: 20
                    },
                    end: {
                        line: 94,
                        column: 29
                    }
                }, {
                    start: {
                        line: 95,
                        column: 20
                    },
                    end: {
                        line: 96,
                        column: 68
                    }
                }]
            },
            "5": {
                loc: {
                    start: {
                        line: 113,
                        column: 8
                    },
                    end: {
                        line: 117,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 113,
                        column: 8
                    },
                    end: {
                        line: 117,
                        column: 9
                    }
                }, {
                    start: {
                        line: 113,
                        column: 8
                    },
                    end: {
                        line: 117,
                        column: 9
                    }
                }]
            },
            "6": {
                loc: {
                    start: {
                        line: 134,
                        column: 12
                    },
                    end: {
                        line: 144,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 134,
                        column: 12
                    },
                    end: {
                        line: 144,
                        column: 13
                    }
                }, {
                    start: {
                        line: 134,
                        column: 12
                    },
                    end: {
                        line: 144,
                        column: 13
                    }
                }]
            },
            "7": {
                loc: {
                    start: {
                        line: 146,
                        column: 12
                    },
                    end: {
                        line: 150,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 146,
                        column: 12
                    },
                    end: {
                        line: 150,
                        column: 13
                    }
                }, {
                    start: {
                        line: 146,
                        column: 12
                    },
                    end: {
                        line: 150,
                        column: 13
                    }
                }]
            },
            "8": {
                loc: {
                    start: {
                        line: 156,
                        column: 16
                    },
                    end: {
                        line: 158,
                        column: 17
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 156,
                        column: 16
                    },
                    end: {
                        line: 158,
                        column: 17
                    }
                }, {
                    start: {
                        line: 156,
                        column: 16
                    },
                    end: {
                        line: 158,
                        column: 17
                    }
                }]
            },
            "9": {
                loc: {
                    start: {
                        line: 159,
                        column: 16
                    },
                    end: {
                        line: 161,
                        column: 17
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 159,
                        column: 16
                    },
                    end: {
                        line: 161,
                        column: 17
                    }
                }, {
                    start: {
                        line: 159,
                        column: 16
                    },
                    end: {
                        line: 161,
                        column: 17
                    }
                }]
            },
            "10": {
                loc: {
                    start: {
                        line: 166,
                        column: 16
                    },
                    end: {
                        line: 168,
                        column: 17
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 166,
                        column: 16
                    },
                    end: {
                        line: 168,
                        column: 17
                    }
                }, {
                    start: {
                        line: 166,
                        column: 16
                    },
                    end: {
                        line: 168,
                        column: 17
                    }
                }]
            },
            "11": {
                loc: {
                    start: {
                        line: 169,
                        column: 16
                    },
                    end: {
                        line: 171,
                        column: 17
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 169,
                        column: 16
                    },
                    end: {
                        line: 171,
                        column: 17
                    }
                }, {
                    start: {
                        line: 169,
                        column: 16
                    },
                    end: {
                        line: 171,
                        column: 17
                    }
                }]
            },
            "12": {
                loc: {
                    start: {
                        line: 191,
                        column: 8
                    },
                    end: {
                        line: 202,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 191,
                        column: 8
                    },
                    end: {
                        line: 202,
                        column: 9
                    }
                }, {
                    start: {
                        line: 191,
                        column: 8
                    },
                    end: {
                        line: 202,
                        column: 9
                    }
                }]
            },
            "13": {
                loc: {
                    start: {
                        line: 209,
                        column: 12
                    },
                    end: {
                        line: 225,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 209,
                        column: 12
                    },
                    end: {
                        line: 225,
                        column: 13
                    }
                }, {
                    start: {
                        line: 209,
                        column: 12
                    },
                    end: {
                        line: 225,
                        column: 13
                    }
                }]
            },
            "14": {
                loc: {
                    start: {
                        line: 214,
                        column: 16
                    },
                    end: {
                        line: 216,
                        column: 17
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 214,
                        column: 16
                    },
                    end: {
                        line: 216,
                        column: 17
                    }
                }, {
                    start: {
                        line: 214,
                        column: 16
                    },
                    end: {
                        line: 216,
                        column: 17
                    }
                }]
            },
            "15": {
                loc: {
                    start: {
                        line: 217,
                        column: 16
                    },
                    end: {
                        line: 223,
                        column: 17
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 217,
                        column: 16
                    },
                    end: {
                        line: 223,
                        column: 17
                    }
                }, {
                    start: {
                        line: 217,
                        column: 16
                    },
                    end: {
                        line: 223,
                        column: 17
                    }
                }]
            },
            "16": {
                loc: {
                    start: {
                        line: 218,
                        column: 20
                    },
                    end: {
                        line: 222,
                        column: 21
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 218,
                        column: 20
                    },
                    end: {
                        line: 222,
                        column: 21
                    }
                }, {
                    start: {
                        line: 218,
                        column: 20
                    },
                    end: {
                        line: 222,
                        column: 21
                    }
                }]
            }
        },
        s: {
            "0": 0,
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0,
            "5": 0,
            "6": 0,
            "7": 0,
            "8": 0,
            "9": 0,
            "10": 0,
            "11": 0,
            "12": 0,
            "13": 0,
            "14": 0,
            "15": 0,
            "16": 0,
            "17": 0,
            "18": 0,
            "19": 0,
            "20": 0,
            "21": 0,
            "22": 0,
            "23": 0,
            "24": 0,
            "25": 0,
            "26": 0,
            "27": 0,
            "28": 0,
            "29": 0,
            "30": 0,
            "31": 0,
            "32": 0,
            "33": 0,
            "34": 0,
            "35": 0,
            "36": 0,
            "37": 0,
            "38": 0,
            "39": 0,
            "40": 0,
            "41": 0,
            "42": 0,
            "43": 0,
            "44": 0,
            "45": 0,
            "46": 0,
            "47": 0,
            "48": 0,
            "49": 0,
            "50": 0,
            "51": 0,
            "52": 0,
            "53": 0,
            "54": 0,
            "55": 0,
            "56": 0,
            "57": 0,
            "58": 0,
            "59": 0,
            "60": 0,
            "61": 0,
            "62": 0,
            "63": 0,
            "64": 0,
            "65": 0,
            "66": 0,
            "67": 0,
            "68": 0,
            "69": 0,
            "70": 0,
            "71": 0,
            "72": 0,
            "73": 0,
            "74": 0,
            "75": 0,
            "76": 0,
            "77": 0,
            "78": 0,
            "79": 0,
            "80": 0,
            "81": 0,
            "82": 0,
            "83": 0,
            "84": 0,
            "85": 0,
            "86": 0,
            "87": 0,
            "88": 0,
            "89": 0,
            "90": 0,
            "91": 0,
            "92": 0,
            "93": 0,
            "94": 0,
            "95": 0,
            "96": 0,
            "97": 0,
            "98": 0,
            "99": 0,
            "100": 0,
            "101": 0,
            "102": 0,
            "103": 0,
            "104": 0,
            "105": 0,
            "106": 0,
            "107": 0,
            "108": 0,
            "109": 0,
            "110": 0
        },
        f: {
            "0": 0,
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0,
            "5": 0,
            "6": 0,
            "7": 0,
            "8": 0,
            "9": 0,
            "10": 0,
            "11": 0,
            "12": 0,
            "13": 0,
            "14": 0,
            "15": 0,
            "16": 0,
            "17": 0,
            "18": 0
        },
        b: {
            "0": [0, 0],
            "1": [0, 0],
            "2": [0, 0],
            "3": [0, 0, 0],
            "4": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            "5": [0, 0],
            "6": [0, 0],
            "7": [0, 0],
            "8": [0, 0],
            "9": [0, 0],
            "10": [0, 0],
            "11": [0, 0],
            "12": [0, 0],
            "13": [0, 0],
            "14": [0, 0],
            "15": [0, 0],
            "16": [0, 0]
        },
        _coverageSchema: "332fd63041d2c1bcb487cc26dd0d5f7d97098a6c"
    },
        coverage = global[gcv] || (global[gcv] = {});

    if (coverage[path] && coverage[path].hash === hash) {
        return coverage[path];
    }

    coverageData.hash = hash;
    return coverage[path] = coverageData;
}();

var _const = require("../const");

var _parser = require("../../lib/edtf/src/parser");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Converts a BibDB to a DB of the CSL type.
 * @param bibDB The bibliography database to convert.
 */

var TAGS = (++cov_2dpcoexk8q.s[0], {
    'strong': { open: '<b>', close: '</b>' },
    'em': { open: '<i>', close: '</i>' },
    'sub': { open: '<sub>', close: '</sub>' },
    'sup': { open: '<sup>', close: '</sup>' },
    'smallcaps': { open: '<span style="font-variant: small-caps;">', close: '</span>' },
    'nocase': { open: '<span class="nocase">', close: '</span>' },
    'enquote': { open: '&ldquo;', close: '&rdquo;' },
    'url': { open: '', close: '' },
    'undefined': { open: '<span class="undef-variable">', close: '</span>' }
});

var CSLExporter = exports.CSLExporter = function () {
    function CSLExporter(bibDB, pks) {
        (0, _classCallCheck3.default)(this, CSLExporter);
        ++cov_2dpcoexk8q.f[0];
        ++cov_2dpcoexk8q.s[1];

        this.bibDB = bibDB;
        ++cov_2dpcoexk8q.s[2];
        if (pks) {
            ++cov_2dpcoexk8q.b[0][0];
            ++cov_2dpcoexk8q.s[3];

            this.pks = pks; // A list of pk values of the bibliography items to be exported.
        } else {
            ++cov_2dpcoexk8q.b[0][1];
            ++cov_2dpcoexk8q.s[4];

            this.pks = (0, _keys2.default)(bibDB); // If none are selected, all keys are exporter
        }
        ++cov_2dpcoexk8q.s[5];
        this.cslDB = {};
        ++cov_2dpcoexk8q.s[6];
        this.errors = [];
    }

    (0, _createClass3.default)(CSLExporter, [{
        key: "getCSLEntry",

        /** Converts one BibDB entry to CSL format.
         * @function getCSLEntry
         * @param id The id identifying the bibliography entry.
         */
        value: function getCSLEntry(id) {
            var _this = this;

            ++cov_2dpcoexk8q.f[2];

            var that = (++cov_2dpcoexk8q.s[12], this),
                bib = (++cov_2dpcoexk8q.s[13], this.bibDB[id]),
                fValues = (++cov_2dpcoexk8q.s[14], {});
            ++cov_2dpcoexk8q.s[15];
            for (var fKey in bib.fields) {
                ++cov_2dpcoexk8q.s[16];

                if ((++cov_2dpcoexk8q.b[3][0], bib.fields[fKey] !== '') && (++cov_2dpcoexk8q.b[3][1], fKey in _const.BibFieldTypes) && (++cov_2dpcoexk8q.b[3][2], 'csl' in _const.BibFieldTypes[fKey])) {
                    ++cov_2dpcoexk8q.b[2][0];

                    var fValue = (++cov_2dpcoexk8q.s[17], bib.fields[fKey]);
                    var fType = (++cov_2dpcoexk8q.s[18], _const.BibFieldTypes[fKey]['type']);
                    var key = (++cov_2dpcoexk8q.s[19], _const.BibFieldTypes[fKey]['csl']);
                    ++cov_2dpcoexk8q.s[20];

                    (function () {
                        switch (fType) {
                            case 'f_date':
                                ++cov_2dpcoexk8q.b[4][0];
                                ++cov_2dpcoexk8q.s[21];

                                fValues[key] = _this._reformDate(fValue);
                                ++cov_2dpcoexk8q.s[22];
                                break;
                            case 'f_integer':
                                ++cov_2dpcoexk8q.b[4][1];
                                ++cov_2dpcoexk8q.s[23];

                                fValues[key] = _this._reformInteger(fValue);
                                ++cov_2dpcoexk8q.s[24];
                                break;
                            case 'f_key':
                                ++cov_2dpcoexk8q.b[4][2];
                                ++cov_2dpcoexk8q.s[25];

                                fValues[key] = _this._reformKey(fValue);
                                ++cov_2dpcoexk8q.s[26];
                                break;
                            case 'f_lang':
                                ++cov_2dpcoexk8q.b[4][3];
                                ++cov_2dpcoexk8q.s[27];

                                fValues[key] = _const.BibLanguages[fValue]['csl'];
                                ++cov_2dpcoexk8q.s[28];
                                break;
                            case 'f_literal':
                                ++cov_2dpcoexk8q.b[4][4];

                            case 'f_long_literal':
                                ++cov_2dpcoexk8q.b[4][5];
                                ++cov_2dpcoexk8q.s[29];

                                fValues[key] = _this._reformText(fValue);
                                ++cov_2dpcoexk8q.s[30];
                                break;
                            case 'f_range':
                                ++cov_2dpcoexk8q.b[4][6];
                                ++cov_2dpcoexk8q.s[31];

                                fValues[key] = _this._reformRange(fValue);
                                ++cov_2dpcoexk8q.s[32];
                                break;
                            case 'f_title':
                                ++cov_2dpcoexk8q.b[4][7];
                                ++cov_2dpcoexk8q.s[33];

                                fValues[key] = _this._reformText(fValue);
                                ++cov_2dpcoexk8q.s[34];
                                break;
                            case 'f_uri':
                                ++cov_2dpcoexk8q.b[4][8];

                            case 'f_verbatim':
                                ++cov_2dpcoexk8q.b[4][9];
                                ++cov_2dpcoexk8q.s[35];

                                fValues[key] = _this._escapeHtml(fValue);
                                ++cov_2dpcoexk8q.s[36];
                                break;
                            case 'l_key':
                                ++cov_2dpcoexk8q.b[4][10];
                                ++cov_2dpcoexk8q.s[37];

                                fValues[key] = _this._escapeHtml(fValue.map(function (key) {
                                    ++cov_2dpcoexk8q.f[3];
                                    ++cov_2dpcoexk8q.s[38];
                                    return that._reformKey(key);
                                }).join(' and '));
                                ++cov_2dpcoexk8q.s[39];
                                break;
                            case 'l_literal':
                                ++cov_2dpcoexk8q.b[4][11];

                                var reformedTexts = (++cov_2dpcoexk8q.s[40], []);
                                ++cov_2dpcoexk8q.s[41];
                                fValue.forEach(function (text) {
                                    ++cov_2dpcoexk8q.f[4];
                                    ++cov_2dpcoexk8q.s[42];

                                    reformedTexts.push(that._reformText(text));
                                });
                                ++cov_2dpcoexk8q.s[43];
                                fValues[key] = reformedTexts.join(', ');
                                ++cov_2dpcoexk8q.s[44];
                                break;
                            case 'l_name':
                                ++cov_2dpcoexk8q.b[4][12];
                                ++cov_2dpcoexk8q.s[45];

                                fValues[key] = _this._reformName(fValue);
                                ++cov_2dpcoexk8q.s[46];
                                break;
                            case 'l_tag':
                                ++cov_2dpcoexk8q.b[4][13];
                                ++cov_2dpcoexk8q.s[47];

                                fValues[key] = _this._escapeHtml(fValue.join(', '));
                                ++cov_2dpcoexk8q.s[48];
                                break;
                            default:
                                ++cov_2dpcoexk8q.b[4][14];
                                ++cov_2dpcoexk8q.s[49];

                                console.warn("Unrecognized type: " + fType + "!");
                        }
                    })();
                } else {
                    ++cov_2dpcoexk8q.b[2][1];
                }
            }
            ++cov_2dpcoexk8q.s[50];
            fValues['type'] = _const.BibTypes[bib.bib_type].csl;
            ++cov_2dpcoexk8q.s[51];
            return fValues;
        }
    }, {
        key: "_escapeHtml",
        value: function _escapeHtml(string) {
            ++cov_2dpcoexk8q.f[5];
            ++cov_2dpcoexk8q.s[52];

            return string.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&apos;").replace(/"/g, "&quot;");
        }
    }, {
        key: "_reformKey",
        value: function _reformKey(theValue) {
            ++cov_2dpcoexk8q.f[6];
            ++cov_2dpcoexk8q.s[53];

            if (typeof theValue === 'string') {
                ++cov_2dpcoexk8q.b[5][0];
                ++cov_2dpcoexk8q.s[54];

                return this._escapeHtml(theValue);
            } else {
                ++cov_2dpcoexk8q.b[5][1];
                ++cov_2dpcoexk8q.s[55];

                return this._reformText(theValue);
            }
        }
    }, {
        key: "_reformRange",
        value: function _reformRange(theValue) {
            ++cov_2dpcoexk8q.f[7];

            var that = (++cov_2dpcoexk8q.s[56], this);
            ++cov_2dpcoexk8q.s[57];
            return theValue.map(function (range) {
                ++cov_2dpcoexk8q.f[8];
                ++cov_2dpcoexk8q.s[58];

                return that._escapeHtml(range.join('--'));
            }).join(',');
        }
    }, {
        key: "_reformInteger",
        value: function _reformInteger(theValue) {
            ++cov_2dpcoexk8q.f[9];
            ++cov_2dpcoexk8q.s[59];

            return String(theValue);
        }
    }, {
        key: "_reformText",
        value: function _reformText(theValue) {
            var _this2 = this;

            ++cov_2dpcoexk8q.f[10];

            var that = (++cov_2dpcoexk8q.s[60], this),
                html = (++cov_2dpcoexk8q.s[61], ''),
                lastMarks = (++cov_2dpcoexk8q.s[62], []);
            ++cov_2dpcoexk8q.s[63];
            theValue.forEach(function (node) {
                ++cov_2dpcoexk8q.f[11];
                ++cov_2dpcoexk8q.s[64];

                if (node.type === 'variable') {
                    ++cov_2dpcoexk8q.b[6][0];
                    ++cov_2dpcoexk8q.s[65];

                    // This is an undefined variable
                    // This should usually not happen, as CSL doesn't know what to
                    // do with these. We'll put them into an unsupported tag.
                    html += "" + TAGS.undefined.open + node.attrs.variable + TAGS.undefined.close;
                    ++cov_2dpcoexk8q.s[66];
                    _this2.errors.push({
                        type: 'undefined_variable',
                        variable: node.attrs.variable
                    });
                    ++cov_2dpcoexk8q.s[67];
                    return;
                } else {
                    ++cov_2dpcoexk8q.b[6][1];
                }
                var newMarks = (++cov_2dpcoexk8q.s[68], []);
                ++cov_2dpcoexk8q.s[69];
                if (node.marks) {
                    ++cov_2dpcoexk8q.b[7][0];
                    ++cov_2dpcoexk8q.s[70];

                    node.marks.forEach(function (mark) {
                        ++cov_2dpcoexk8q.f[12];
                        ++cov_2dpcoexk8q.s[71];

                        newMarks.push(mark.type);
                    });
                } else {
                    ++cov_2dpcoexk8q.b[7][1];
                }
                // close all tags that are not present in current text node.
                // Go through last marksd in reverse order to close innermost tags first.
                var closing = (++cov_2dpcoexk8q.s[72], false);
                ++cov_2dpcoexk8q.s[73];
                lastMarks.slice().reverse().forEach(function (mark, rIndex) {
                    ++cov_2dpcoexk8q.f[13];

                    var index = (++cov_2dpcoexk8q.s[74], lastMarks.length - rIndex);
                    ++cov_2dpcoexk8q.s[75];
                    if (mark != newMarks[index]) {
                        ++cov_2dpcoexk8q.b[8][0];
                        ++cov_2dpcoexk8q.s[76];

                        closing = true;
                    } else {
                        ++cov_2dpcoexk8q.b[8][1];
                    }
                    ++cov_2dpcoexk8q.s[77];
                    if (closing) {
                        ++cov_2dpcoexk8q.b[9][0];
                        ++cov_2dpcoexk8q.s[78];

                        html += TAGS[mark].close;
                    } else {
                        ++cov_2dpcoexk8q.b[9][1];
                    }
                });
                // open all new tags that were not present in the last text node.
                var opening = (++cov_2dpcoexk8q.s[79], false);
                ++cov_2dpcoexk8q.s[80];
                newMarks.forEach(function (mark, index) {
                    ++cov_2dpcoexk8q.f[14];
                    ++cov_2dpcoexk8q.s[81];

                    if (mark != lastMarks[index]) {
                        ++cov_2dpcoexk8q.b[10][0];
                        ++cov_2dpcoexk8q.s[82];

                        opening = true;
                    } else {
                        ++cov_2dpcoexk8q.b[10][1];
                    }
                    ++cov_2dpcoexk8q.s[83];
                    if (opening) {
                        ++cov_2dpcoexk8q.b[11][0];
                        ++cov_2dpcoexk8q.s[84];

                        html += TAGS[mark].open;
                    } else {
                        ++cov_2dpcoexk8q.b[11][1];
                    }
                });
                ++cov_2dpcoexk8q.s[85];
                html += that._escapeHtml(node.text);
                ++cov_2dpcoexk8q.s[86];
                lastMarks = newMarks;
            });
            // Close all still open tags
            ++cov_2dpcoexk8q.s[87];
            lastMarks.slice().reverse().forEach(function (mark) {
                ++cov_2dpcoexk8q.f[15];
                ++cov_2dpcoexk8q.s[88];

                html += TAGS[mark].close;
            });
            ++cov_2dpcoexk8q.s[89];
            return html;
        }
    }, {
        key: "_reformDate",
        value: function _reformDate(dateStr) {
            ++cov_2dpcoexk8q.f[16];

            var dateObj = (++cov_2dpcoexk8q.s[90], (0, _parser.parse)(dateStr.replace(/^y/, 'Y') // Convert to edtf draft spec format supported by edtf.js
            .replace(/unknown/g, '*').replace(/open/g, '').replace(/u/g, 'X').replace(/\?~/g, '%')));
            ++cov_2dpcoexk8q.s[91];
            if (dateObj.type === 'Interval') {
                ++cov_2dpcoexk8q.b[12][0];
                ++cov_2dpcoexk8q.s[92];

                return {
                    'date-parts': [dateObj.values[0].values.slice(0, 3), dateObj.values[1].values.slice(0, 3)]
                };
            } else {
                ++cov_2dpcoexk8q.b[12][1];
                ++cov_2dpcoexk8q.s[93];

                return {
                    'date-parts': dateObj.values.slice(0, 3)
                };
            }
        }
    }, {
        key: "_reformName",
        value: function _reformName(theNames) {
            ++cov_2dpcoexk8q.f[17];

            var reformedNames = (++cov_2dpcoexk8q.s[94], []),
                that = (++cov_2dpcoexk8q.s[95], this);
            ++cov_2dpcoexk8q.s[96];
            theNames.forEach(function (name) {
                ++cov_2dpcoexk8q.f[18];

                var reformedName = (++cov_2dpcoexk8q.s[97], {});
                ++cov_2dpcoexk8q.s[98];
                if (name.literal) {
                    ++cov_2dpcoexk8q.b[13][0];
                    ++cov_2dpcoexk8q.s[99];

                    reformedName['literal'] = that._reformText(name.literal);
                } else {
                    ++cov_2dpcoexk8q.b[13][1];
                    ++cov_2dpcoexk8q.s[100];

                    reformedName['given'] = that._reformText(name.given);
                    ++cov_2dpcoexk8q.s[101];
                    reformedName['family'] = that._reformText(name.family);
                    ++cov_2dpcoexk8q.s[102];
                    if (name.suffix) {
                        ++cov_2dpcoexk8q.b[14][0];
                        ++cov_2dpcoexk8q.s[103];

                        reformedName['suffix'] = that._reformText(name.suffix);
                    } else {
                        ++cov_2dpcoexk8q.b[14][1];
                    }
                    ++cov_2dpcoexk8q.s[104];
                    if (name.prefix) {
                        ++cov_2dpcoexk8q.b[15][0];
                        ++cov_2dpcoexk8q.s[105];

                        if (name.useprefix === true) {
                            ++cov_2dpcoexk8q.b[16][0];
                            ++cov_2dpcoexk8q.s[106];

                            reformedName['non-dropping-particle'] = that._reformText(name.prefix);
                        } else {
                            ++cov_2dpcoexk8q.b[16][1];
                            ++cov_2dpcoexk8q.s[107];

                            reformedName['dropping-particle'] = that._reformText(name.prefix);
                        }
                    } else {
                        ++cov_2dpcoexk8q.b[15][1];
                    }
                    ++cov_2dpcoexk8q.s[108];
                    reformedName['family'] = that._reformText(name['family']);
                }
                ++cov_2dpcoexk8q.s[109];
                reformedNames.push(reformedName);
            });
            ++cov_2dpcoexk8q.s[110];
            return reformedNames;
        }
    }, {
        key: "output",
        get: function get() {
            ++cov_2dpcoexk8q.f[1];
            ++cov_2dpcoexk8q.s[7];

            for (var bibId in this.bibDB) {
                ++cov_2dpcoexk8q.s[8];

                if (this.pks.indexOf(bibId) !== -1) {
                    ++cov_2dpcoexk8q.b[1][0];
                    ++cov_2dpcoexk8q.s[9];

                    this.cslDB[bibId] = this.getCSLEntry(bibId);
                    ++cov_2dpcoexk8q.s[10];
                    this.cslDB[bibId].id = bibId;
                } else {
                    ++cov_2dpcoexk8q.b[1][1];
                }
            }
            ++cov_2dpcoexk8q.s[11];
            return this.cslDB;
        }
    }]);
    return CSLExporter;
}();

},{"../../lib/edtf/src/parser":4,"../const":125,"babel-runtime/core-js/object/keys":11,"babel-runtime/helpers/classCallCheck":15,"babel-runtime/helpers/createClass":16}],129:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BibLatexParser = undefined;

var _set = require("babel-runtime/core-js/set");

var _set2 = _interopRequireDefault(_set);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var cov_1nqd9talwx = function () {
    var path = "/home/travis/build/fiduswriter/biblatex-csl-converter/src/import/biblatex.js",
        hash = "edd5124ce8e6fd160b0cde5ae3d879bc69fe7aa6",
        global = new Function('return this')(),
        gcv = "__coverage__",
        coverageData = {
        path: "/home/travis/build/fiduswriter/biblatex-csl-converter/src/import/biblatex.js",
        statementMap: {
            "0": {
                start: {
                    line: 66,
                    column: 8
                },
                end: {
                    line: 66,
                    column: 26
                }
            },
            "1": {
                start: {
                    line: 67,
                    column: 8
                },
                end: {
                    line: 67,
                    column: 28
                }
            },
            "2": {
                start: {
                    line: 68,
                    column: 8
                },
                end: {
                    line: 68,
                    column: 20
                }
            },
            "3": {
                start: {
                    line: 69,
                    column: 8
                },
                end: {
                    line: 69,
                    column: 25
                }
            },
            "4": {
                start: {
                    line: 70,
                    column: 8
                },
                end: {
                    line: 70,
                    column: 23
                }
            },
            "5": {
                start: {
                    line: 71,
                    column: 8
                },
                end: {
                    line: 71,
                    column: 31
                }
            },
            "6": {
                start: {
                    line: 72,
                    column: 8
                },
                end: {
                    line: 72,
                    column: 33
                }
            },
            "7": {
                start: {
                    line: 73,
                    column: 8
                },
                end: {
                    line: 73,
                    column: 29
                }
            },
            "8": {
                start: {
                    line: 74,
                    column: 8
                },
                end: {
                    line: 74,
                    column: 24
                }
            },
            "9": {
                start: {
                    line: 75,
                    column: 8
                },
                end: {
                    line: 75,
                    column: 26
                }
            },
            "10": {
                start: {
                    line: 77,
                    column: 8
                },
                end: {
                    line: 90,
                    column: 9
                }
            },
            "11": {
                start: {
                    line: 94,
                    column: 8
                },
                end: {
                    line: 94,
                    column: 64
                }
            },
            "12": {
                start: {
                    line: 98,
                    column: 8
                },
                end: {
                    line: 98,
                    column: 29
                }
            },
            "13": {
                start: {
                    line: 99,
                    column: 8
                },
                end: {
                    line: 108,
                    column: 9
                }
            },
            "14": {
                start: {
                    line: 100,
                    column: 12
                },
                end: {
                    line: 100,
                    column: 32
                }
            },
            "15": {
                start: {
                    line: 103,
                    column: 12
                },
                end: {
                    line: 107,
                    column: 14
                }
            },
            "16": {
                start: {
                    line: 109,
                    column: 8
                },
                end: {
                    line: 109,
                    column: 29
                }
            },
            "17": {
                start: {
                    line: 113,
                    column: 8
                },
                end: {
                    line: 113,
                    column: 29
                }
            },
            "18": {
                start: {
                    line: 114,
                    column: 8
                },
                end: {
                    line: 118,
                    column: 9
                }
            },
            "19": {
                start: {
                    line: 115,
                    column: 12
                },
                end: {
                    line: 115,
                    column: 23
                }
            },
            "20": {
                start: {
                    line: 117,
                    column: 12
                },
                end: {
                    line: 117,
                    column: 24
                }
            },
            "21": {
                start: {
                    line: 119,
                    column: 8
                },
                end: {
                    line: 119,
                    column: 29
                }
            },
            "22": {
                start: {
                    line: 123,
                    column: 8
                },
                end: {
                    line: 125,
                    column: 9
                }
            },
            "23": {
                start: {
                    line: 124,
                    column: 12
                },
                end: {
                    line: 124,
                    column: 22
                }
            },
            "24": {
                start: {
                    line: 126,
                    column: 8
                },
                end: {
                    line: 131,
                    column: 9
                }
            },
            "25": {
                start: {
                    line: 127,
                    column: 12
                },
                end: {
                    line: 129,
                    column: 13
                }
            },
            "26": {
                start: {
                    line: 128,
                    column: 16
                },
                end: {
                    line: 128,
                    column: 26
                }
            },
            "27": {
                start: {
                    line: 130,
                    column: 12
                },
                end: {
                    line: 130,
                    column: 33
                }
            },
            "28": {
                start: {
                    line: 135,
                    column: 8
                },
                end: {
                    line: 138,
                    column: 9
                }
            },
            "29": {
                start: {
                    line: 137,
                    column: 12
                },
                end: {
                    line: 137,
                    column: 22
                }
            },
            "30": {
                start: {
                    line: 139,
                    column: 8
                },
                end: {
                    line: 143,
                    column: 9
                }
            },
            "31": {
                start: {
                    line: 140,
                    column: 12
                },
                end: {
                    line: 140,
                    column: 24
                }
            },
            "32": {
                start: {
                    line: 142,
                    column: 12
                },
                end: {
                    line: 142,
                    column: 23
                }
            },
            "33": {
                start: {
                    line: 147,
                    column: 25
                },
                end: {
                    line: 147,
                    column: 26
                }
            },
            "34": {
                start: {
                    line: 148,
                    column: 8
                },
                end: {
                    line: 148,
                    column: 23
                }
            },
            "35": {
                start: {
                    line: 149,
                    column: 20
                },
                end: {
                    line: 149,
                    column: 28
                }
            },
            "36": {
                start: {
                    line: 150,
                    column: 8
                },
                end: {
                    line: 167,
                    column: 9
                }
            },
            "37": {
                start: {
                    line: 151,
                    column: 12
                },
                end: {
                    line: 165,
                    column: 13
                }
            },
            "38": {
                start: {
                    line: 153,
                    column: 16
                },
                end: {
                    line: 159,
                    column: 17
                }
            },
            "39": {
                start: {
                    line: 154,
                    column: 20
                },
                end: {
                    line: 154,
                    column: 32
                }
            },
            "40": {
                start: {
                    line: 156,
                    column: 30
                },
                end: {
                    line: 156,
                    column: 38
                }
            },
            "41": {
                start: {
                    line: 157,
                    column: 20
                },
                end: {
                    line: 157,
                    column: 35
                }
            },
            "42": {
                start: {
                    line: 158,
                    column: 20
                },
                end: {
                    line: 158,
                    column: 59
                }
            },
            "43": {
                start: {
                    line: 160,
                    column: 19
                },
                end: {
                    line: 165,
                    column: 13
                }
            },
            "44": {
                start: {
                    line: 162,
                    column: 16
                },
                end: {
                    line: 162,
                    column: 28
                }
            },
            "45": {
                start: {
                    line: 163,
                    column: 19
                },
                end: {
                    line: 165,
                    column: 13
                }
            },
            "46": {
                start: {
                    line: 164,
                    column: 16
                },
                end: {
                    line: 164,
                    column: 58
                }
            },
            "47": {
                start: {
                    line: 166,
                    column: 12
                },
                end: {
                    line: 166,
                    column: 22
                }
            },
            "48": {
                start: {
                    line: 171,
                    column: 8
                },
                end: {
                    line: 171,
                    column: 23
                }
            },
            "49": {
                start: {
                    line: 172,
                    column: 20
                },
                end: {
                    line: 172,
                    column: 28
                }
            },
            "50": {
                start: {
                    line: 173,
                    column: 8
                },
                end: {
                    line: 185,
                    column: 9
                }
            },
            "51": {
                start: {
                    line: 174,
                    column: 12
                },
                end: {
                    line: 183,
                    column: 13
                }
            },
            "52": {
                start: {
                    line: 175,
                    column: 26
                },
                end: {
                    line: 175,
                    column: 34
                }
            },
            "53": {
                start: {
                    line: 176,
                    column: 16
                },
                end: {
                    line: 176,
                    column: 31
                }
            },
            "54": {
                start: {
                    line: 177,
                    column: 16
                },
                end: {
                    line: 177,
                    column: 55
                }
            },
            "55": {
                start: {
                    line: 178,
                    column: 19
                },
                end: {
                    line: 183,
                    column: 13
                }
            },
            "56": {
                start: {
                    line: 179,
                    column: 16
                },
                end: {
                    line: 182,
                    column: 18
                }
            },
            "57": {
                start: {
                    line: 184,
                    column: 12
                },
                end: {
                    line: 184,
                    column: 22
                }
            },
            "58": {
                start: {
                    line: 189,
                    column: 20
                },
                end: {
                    line: 189,
                    column: 28
                }
            },
            "59": {
                start: {
                    line: 190,
                    column: 8
                },
                end: {
                    line: 209,
                    column: 9
                }
            },
            "60": {
                start: {
                    line: 191,
                    column: 12
                },
                end: {
                    line: 191,
                    column: 37
                }
            },
            "61": {
                start: {
                    line: 192,
                    column: 15
                },
                end: {
                    line: 209,
                    column: 9
                }
            },
            "62": {
                start: {
                    line: 193,
                    column: 12
                },
                end: {
                    line: 193,
                    column: 37
                }
            },
            "63": {
                start: {
                    line: 195,
                    column: 20
                },
                end: {
                    line: 195,
                    column: 30
                }
            },
            "64": {
                start: {
                    line: 196,
                    column: 12
                },
                end: {
                    line: 208,
                    column: 13
                }
            },
            "65": {
                start: {
                    line: 197,
                    column: 16
                },
                end: {
                    line: 197,
                    column: 54
                }
            },
            "66": {
                start: {
                    line: 198,
                    column: 19
                },
                end: {
                    line: 208,
                    column: 13
                }
            },
            "67": {
                start: {
                    line: 199,
                    column: 16
                },
                end: {
                    line: 199,
                    column: 24
                }
            },
            "68": {
                start: {
                    line: 201,
                    column: 16
                },
                end: {
                    line: 206,
                    column: 18
                }
            },
            "69": {
                start: {
                    line: 207,
                    column: 16
                },
                end: {
                    line: 207,
                    column: 31
                }
            },
            "70": {
                start: {
                    line: 213,
                    column: 21
                },
                end: {
                    line: 213,
                    column: 23
                }
            },
            "71": {
                start: {
                    line: 214,
                    column: 8
                },
                end: {
                    line: 214,
                    column: 39
                }
            },
            "72": {
                start: {
                    line: 215,
                    column: 8
                },
                end: {
                    line: 218,
                    column: 9
                }
            },
            "73": {
                start: {
                    line: 216,
                    column: 12
                },
                end: {
                    line: 216,
                    column: 27
                }
            },
            "74": {
                start: {
                    line: 217,
                    column: 12
                },
                end: {
                    line: 217,
                    column: 43
                }
            },
            "75": {
                start: {
                    line: 219,
                    column: 8
                },
                end: {
                    line: 219,
                    column: 30
                }
            },
            "76": {
                start: {
                    line: 223,
                    column: 20
                },
                end: {
                    line: 223,
                    column: 28
                }
            },
            "77": {
                start: {
                    line: 224,
                    column: 8
                },
                end: {
                    line: 238,
                    column: 9
                }
            },
            "78": {
                start: {
                    line: 225,
                    column: 12
                },
                end: {
                    line: 228,
                    column: 13
                }
            },
            "79": {
                start: {
                    line: 226,
                    column: 16
                },
                end: {
                    line: 226,
                    column: 55
                }
            },
            "80": {
                start: {
                    line: 227,
                    column: 16
                },
                end: {
                    line: 227,
                    column: 22
                }
            },
            "81": {
                start: {
                    line: 229,
                    column: 12
                },
                end: {
                    line: 237,
                    column: 13
                }
            },
            "82": {
                start: {
                    line: 230,
                    column: 16
                },
                end: {
                    line: 233,
                    column: 17
                }
            },
            "83": {
                start: {
                    line: 231,
                    column: 20
                },
                end: {
                    line: 231,
                    column: 36
                }
            },
            "84": {
                start: {
                    line: 232,
                    column: 20
                },
                end: {
                    line: 232,
                    column: 31
                }
            },
            "85": {
                start: {
                    line: 234,
                    column: 16
                },
                end: {
                    line: 234,
                    column: 60
                }
            },
            "86": {
                start: {
                    line: 236,
                    column: 16
                },
                end: {
                    line: 236,
                    column: 26
                }
            },
            "87": {
                start: {
                    line: 242,
                    column: 18
                },
                end: {
                    line: 242,
                    column: 28
                }
            },
            "88": {
                start: {
                    line: 243,
                    column: 8
                },
                end: {
                    line: 251,
                    column: 9
                }
            },
            "89": {
                start: {
                    line: 244,
                    column: 12
                },
                end: {
                    line: 247,
                    column: 14
                }
            },
            "90": {
                start: {
                    line: 249,
                    column: 12
                },
                end: {
                    line: 249,
                    column: 50
                }
            },
            "91": {
                start: {
                    line: 250,
                    column: 12
                },
                end: {
                    line: 250,
                    column: 18
                }
            },
            "92": {
                start: {
                    line: 252,
                    column: 8
                },
                end: {
                    line: 252,
                    column: 43
                }
            },
            "93": {
                start: {
                    line: 253,
                    column: 8
                },
                end: {
                    line: 263,
                    column: 9
                }
            },
            "94": {
                start: {
                    line: 254,
                    column: 12
                },
                end: {
                    line: 254,
                    column: 27
                }
            },
            "95": {
                start: {
                    line: 255,
                    column: 22
                },
                end: {
                    line: 255,
                    column: 34
                }
            },
            "96": {
                start: {
                    line: 256,
                    column: 12
                },
                end: {
                    line: 256,
                    column: 41
                }
            },
            "97": {
                start: {
                    line: 258,
                    column: 12
                },
                end: {
                    line: 262,
                    column: 14
                }
            },
            "98": {
                start: {
                    line: 267,
                    column: 17
                },
                end: {
                    line: 267,
                    column: 38
                }
            },
            "99": {
                start: {
                    line: 268,
                    column: 8
                },
                end: {
                    line: 273,
                    column: 9
                }
            },
            "100": {
                start: {
                    line: 271,
                    column: 12
                },
                end: {
                    line: 271,
                    column: 30
                }
            },
            "101": {
                start: {
                    line: 272,
                    column: 12
                },
                end: {
                    line: 272,
                    column: 18
                }
            },
            "102": {
                start: {
                    line: 274,
                    column: 24
                },
                end: {
                    line: 274,
                    column: 45
                }
            },
            "103": {
                start: {
                    line: 275,
                    column: 8
                },
                end: {
                    line: 275,
                    column: 32
                }
            },
            "104": {
                start: {
                    line: 276,
                    column: 8
                },
                end: {
                    line: 291,
                    column: 9
                }
            },
            "105": {
                start: {
                    line: 277,
                    column: 12
                },
                end: {
                    line: 277,
                    column: 27
                }
            },
            "106": {
                start: {
                    line: 279,
                    column: 12
                },
                end: {
                    line: 281,
                    column: 13
                }
            },
            "107": {
                start: {
                    line: 280,
                    column: 16
                },
                end: {
                    line: 280,
                    column: 21
                }
            },
            "108": {
                start: {
                    line: 282,
                    column: 12
                },
                end: {
                    line: 282,
                    column: 38
                }
            },
            "109": {
                start: {
                    line: 283,
                    column: 12
                },
                end: {
                    line: 289,
                    column: 13
                }
            },
            "110": {
                start: {
                    line: 284,
                    column: 16
                },
                end: {
                    line: 287,
                    column: 18
                }
            },
            "111": {
                start: {
                    line: 288,
                    column: 16
                },
                end: {
                    line: 288,
                    column: 21
                }
            },
            "112": {
                start: {
                    line: 290,
                    column: 12
                },
                end: {
                    line: 290,
                    column: 36
                }
            },
            "113": {
                start: {
                    line: 295,
                    column: 19
                },
                end: {
                    line: 295,
                    column: 23
                }
            },
            "114": {
                start: {
                    line: 296,
                    column: 24
                },
                end: {
                    line: 296,
                    column: 45
                }
            },
            "115": {
                start: {
                    line: 297,
                    column: 21
                },
                end: {
                    line: 297,
                    column: 48
                }
            },
            "116": {
                start: {
                    line: 305,
                    column: 8
                },
                end: {
                    line: 312,
                    column: 9
                }
            },
            "117": {
                start: {
                    line: 307,
                    column: 12
                },
                end: {
                    line: 307,
                    column: 33
                }
            },
            "118": {
                start: {
                    line: 308,
                    column: 15
                },
                end: {
                    line: 312,
                    column: 9
                }
            },
            "119": {
                start: {
                    line: 309,
                    column: 12
                },
                end: {
                    line: 309,
                    column: 57
                }
            },
            "120": {
                start: {
                    line: 310,
                    column: 15
                },
                end: {
                    line: 312,
                    column: 9
                }
            },
            "121": {
                start: {
                    line: 311,
                    column: 12
                },
                end: {
                    line: 311,
                    column: 38
                }
            },
            "122": {
                start: {
                    line: 313,
                    column: 8
                },
                end: {
                    line: 338,
                    column: 9
                }
            },
            "123": {
                start: {
                    line: 314,
                    column: 12
                },
                end: {
                    line: 337,
                    column: 13
                }
            },
            "124": {
                start: {
                    line: 315,
                    column: 16
                },
                end: {
                    line: 315,
                    column: 37
                }
            },
            "125": {
                start: {
                    line: 318,
                    column: 16
                },
                end: {
                    line: 330,
                    column: 17
                }
            },
            "126": {
                start: {
                    line: 319,
                    column: 20
                },
                end: {
                    line: 319,
                    column: 38
                }
            },
            "127": {
                start: {
                    line: 320,
                    column: 20
                },
                end: {
                    line: 320,
                    column: 42
                }
            },
            "128": {
                start: {
                    line: 321,
                    column: 20
                },
                end: {
                    line: 321,
                    column: 43
                }
            },
            "129": {
                start: {
                    line: 322,
                    column: 23
                },
                end: {
                    line: 330,
                    column: 17
                }
            },
            "130": {
                start: {
                    line: 323,
                    column: 20
                },
                end: {
                    line: 323,
                    column: 44
                }
            },
            "131": {
                start: {
                    line: 324,
                    column: 20
                },
                end: {
                    line: 324,
                    column: 61
                }
            },
            "132": {
                start: {
                    line: 325,
                    column: 20
                },
                end: {
                    line: 325,
                    column: 45
                }
            },
            "133": {
                start: {
                    line: 327,
                    column: 20
                },
                end: {
                    line: 327,
                    column: 38
                }
            },
            "134": {
                start: {
                    line: 328,
                    column: 20
                },
                end: {
                    line: 328,
                    column: 42
                }
            },
            "135": {
                start: {
                    line: 329,
                    column: 20
                },
                end: {
                    line: 329,
                    column: 45
                }
            },
            "136": {
                start: {
                    line: 331,
                    column: 16
                },
                end: {
                    line: 336,
                    column: 18
                }
            },
            "137": {
                start: {
                    line: 341,
                    column: 26
                },
                end: {
                    line: 341,
                    column: 30
                }
            },
            "138": {
                start: {
                    line: 342,
                    column: 8
                },
                end: {
                    line: 361,
                    column: 9
                }
            },
            "139": {
                start: {
                    line: 343,
                    column: 29
                },
                end: {
                    line: 343,
                    column: 66
                }
            },
            "140": {
                start: {
                    line: 344,
                    column: 33
                },
                end: {
                    line: 344,
                    column: 133
                }
            },
            "141": {
                start: {
                    line: 345,
                    column: 12
                },
                end: {
                    line: 347,
                    column: 13
                }
            },
            "142": {
                start: {
                    line: 345,
                    column: 48
                },
                end: {
                    line: 345,
                    column: 76
                }
            },
            "143": {
                start: {
                    line: 346,
                    column: 16
                },
                end: {
                    line: 346,
                    column: 35
                }
            },
            "144": {
                start: {
                    line: 348,
                    column: 15
                },
                end: {
                    line: 361,
                    column: 9
                }
            },
            "145": {
                start: {
                    line: 353,
                    column: 29
                },
                end: {
                    line: 353,
                    column: 68
                }
            },
            "146": {
                start: {
                    line: 354,
                    column: 25
                },
                end: {
                    line: 354,
                    column: 53
                }
            },
            "147": {
                start: {
                    line: 355,
                    column: 12
                },
                end: {
                    line: 360,
                    column: 13
                }
            },
            "148": {
                start: {
                    line: 356,
                    column: 16
                },
                end: {
                    line: 356,
                    column: 41
                }
            },
            "149": {
                start: {
                    line: 357,
                    column: 16
                },
                end: {
                    line: 359,
                    column: 17
                }
            },
            "150": {
                start: {
                    line: 358,
                    column: 20
                },
                end: {
                    line: 358,
                    column: 39
                }
            },
            "151": {
                start: {
                    line: 363,
                    column: 27
                },
                end: {
                    line: 363,
                    column: 32
                }
            },
            "152": {
                start: {
                    line: 365,
                    column: 8
                },
                end: {
                    line: 523,
                    column: 9
                }
            },
            "153": {
                start: {
                    line: 365,
                    column: 23
                },
                end: {
                    line: 523,
                    column: 9
                }
            },
            "154": {
                start: {
                    line: 367,
                    column: 12
                },
                end: {
                    line: 370,
                    column: 13
                }
            },
            "155": {
                start: {
                    line: 369,
                    column: 16
                },
                end: {
                    line: 369,
                    column: 38
                }
            },
            "156": {
                start: {
                    line: 373,
                    column: 27
                },
                end: {
                    line: 373,
                    column: 56
                }
            },
            "157": {
                start: {
                    line: 374,
                    column: 12
                },
                end: {
                    line: 394,
                    column: 13
                }
            },
            "158": {
                start: {
                    line: 375,
                    column: 16
                },
                end: {
                    line: 385,
                    column: 17
                }
            },
            "159": {
                start: {
                    line: 376,
                    column: 20
                },
                end: {
                    line: 383,
                    column: 22
                }
            },
            "160": {
                start: {
                    line: 384,
                    column: 20
                },
                end: {
                    line: 384,
                    column: 42
                }
            },
            "161": {
                start: {
                    line: 387,
                    column: 16
                },
                end: {
                    line: 389,
                    column: 18
                }
            },
            "162": {
                start: {
                    line: 388,
                    column: 20
                },
                end: {
                    line: 388,
                    column: 66
                }
            },
            "163": {
                start: {
                    line: 391,
                    column: 16
                },
                end: {
                    line: 393,
                    column: 18
                }
            },
            "164": {
                start: {
                    line: 392,
                    column: 20
                },
                end: {
                    line: 392,
                    column: 62
                }
            },
            "165": {
                start: {
                    line: 397,
                    column: 24
                },
                end: {
                    line: 397,
                    column: 63
                }
            },
            "166": {
                start: {
                    line: 399,
                    column: 12
                },
                end: {
                    line: 441,
                    column: 13
                }
            },
            "167": {
                start: {
                    line: 400,
                    column: 16
                },
                end: {
                    line: 404,
                    column: 18
                }
            },
            "168": {
                start: {
                    line: 405,
                    column: 16
                },
                end: {
                    line: 407,
                    column: 17
                }
            },
            "169": {
                start: {
                    line: 406,
                    column: 20
                },
                end: {
                    line: 406,
                    column: 42
                }
            },
            "170": {
                start: {
                    line: 408,
                    column: 16
                },
                end: {
                    line: 410,
                    column: 17
                }
            },
            "171": {
                start: {
                    line: 409,
                    column: 20
                },
                end: {
                    line: 409,
                    column: 60
                }
            },
            "172": {
                start: {
                    line: 411,
                    column: 16
                },
                end: {
                    line: 411,
                    column: 61
                }
            },
            "173": {
                start: {
                    line: 412,
                    column: 16
                },
                end: {
                    line: 412,
                    column: 105
                }
            },
            "174": {
                start: {
                    line: 413,
                    column: 16
                },
                end: {
                    line: 413,
                    column: 27
                }
            },
            "175": {
                start: {
                    line: 414,
                    column: 19
                },
                end: {
                    line: 441,
                    column: 13
                }
            },
            "176": {
                start: {
                    line: 418,
                    column: 16
                },
                end: {
                    line: 418,
                    column: 32
                }
            },
            "177": {
                start: {
                    line: 419,
                    column: 16
                },
                end: {
                    line: 419,
                    column: 51
                }
            },
            "178": {
                start: {
                    line: 420,
                    column: 19
                },
                end: {
                    line: 441,
                    column: 13
                }
            },
            "179": {
                start: {
                    line: 424,
                    column: 16
                },
                end: {
                    line: 424,
                    column: 35
                }
            },
            "180": {
                start: {
                    line: 425,
                    column: 16
                },
                end: {
                    line: 425,
                    column: 32
                }
            },
            "181": {
                start: {
                    line: 426,
                    column: 16
                },
                end: {
                    line: 426,
                    column: 51
                }
            },
            "182": {
                start: {
                    line: 428,
                    column: 16
                },
                end: {
                    line: 432,
                    column: 18
                }
            },
            "183": {
                start: {
                    line: 433,
                    column: 16
                },
                end: {
                    line: 435,
                    column: 17
                }
            },
            "184": {
                start: {
                    line: 434,
                    column: 20
                },
                end: {
                    line: 434,
                    column: 42
                }
            },
            "185": {
                start: {
                    line: 436,
                    column: 16
                },
                end: {
                    line: 438,
                    column: 17
                }
            },
            "186": {
                start: {
                    line: 437,
                    column: 20
                },
                end: {
                    line: 437,
                    column: 63
                }
            },
            "187": {
                start: {
                    line: 439,
                    column: 16
                },
                end: {
                    line: 439,
                    column: 64
                }
            },
            "188": {
                start: {
                    line: 440,
                    column: 16
                },
                end: {
                    line: 440,
                    column: 51
                }
            },
            "189": {
                start: {
                    line: 444,
                    column: 25
                },
                end: {
                    line: 444,
                    column: 40
                }
            },
            "190": {
                start: {
                    line: 445,
                    column: 12
                },
                end: {
                    line: 522,
                    column: 13
                }
            },
            "191": {
                start: {
                    line: 447,
                    column: 20
                },
                end: {
                    line: 456,
                    column: 21
                }
            },
            "192": {
                start: {
                    line: 448,
                    column: 24
                },
                end: {
                    line: 448,
                    column: 46
                }
            },
            "193": {
                start: {
                    line: 450,
                    column: 24
                },
                end: {
                    line: 455,
                    column: 26
                }
            },
            "194": {
                start: {
                    line: 457,
                    column: 20
                },
                end: {
                    line: 457,
                    column: 25
                }
            },
            "195": {
                start: {
                    line: 459,
                    column: 20
                },
                end: {
                    line: 459,
                    column: 63
                }
            },
            "196": {
                start: {
                    line: 460,
                    column: 20
                },
                end: {
                    line: 460,
                    column: 25
                }
            },
            "197": {
                start: {
                    line: 462,
                    column: 20
                },
                end: {
                    line: 462,
                    column: 65
                }
            },
            "198": {
                start: {
                    line: 463,
                    column: 20
                },
                end: {
                    line: 463,
                    column: 25
                }
            },
            "199": {
                start: {
                    line: 466,
                    column: 20
                },
                end: {
                    line: 466,
                    column: 63
                }
            },
            "200": {
                start: {
                    line: 467,
                    column: 20
                },
                end: {
                    line: 467,
                    column: 25
                }
            },
            "201": {
                start: {
                    line: 469,
                    column: 20
                },
                end: {
                    line: 469,
                    column: 61
                }
            },
            "202": {
                start: {
                    line: 470,
                    column: 20
                },
                end: {
                    line: 470,
                    column: 25
                }
            },
            "203": {
                start: {
                    line: 472,
                    column: 20
                },
                end: {
                    line: 472,
                    column: 76
                }
            },
            "204": {
                start: {
                    line: 473,
                    column: 20
                },
                end: {
                    line: 473,
                    column: 25
                }
            },
            "205": {
                start: {
                    line: 475,
                    column: 20
                },
                end: {
                    line: 484,
                    column: 21
                }
            },
            "206": {
                start: {
                    line: 476,
                    column: 24
                },
                end: {
                    line: 476,
                    column: 46
                }
            },
            "207": {
                start: {
                    line: 478,
                    column: 24
                },
                end: {
                    line: 483,
                    column: 26
                }
            },
            "208": {
                start: {
                    line: 485,
                    column: 20
                },
                end: {
                    line: 485,
                    column: 25
                }
            },
            "209": {
                start: {
                    line: 487,
                    column: 20
                },
                end: {
                    line: 487,
                    column: 42
                }
            },
            "210": {
                start: {
                    line: 488,
                    column: 20
                },
                end: {
                    line: 488,
                    column: 25
                }
            },
            "211": {
                start: {
                    line: 490,
                    column: 20
                },
                end: {
                    line: 490,
                    column: 114
                }
            },
            "212": {
                start: {
                    line: 490,
                    column: 74
                },
                end: {
                    line: 490,
                    column: 112
                }
            },
            "213": {
                start: {
                    line: 491,
                    column: 20
                },
                end: {
                    line: 491,
                    column: 25
                }
            },
            "214": {
                start: {
                    line: 493,
                    column: 20
                },
                end: {
                    line: 493,
                    column: 91
                }
            },
            "215": {
                start: {
                    line: 493,
                    column: 69
                },
                end: {
                    line: 493,
                    column: 89
                }
            },
            "216": {
                start: {
                    line: 494,
                    column: 20
                },
                end: {
                    line: 494,
                    column: 25
                }
            },
            "217": {
                start: {
                    line: 496,
                    column: 32
                },
                end: {
                    line: 496,
                    column: 54
                }
            },
            "218": {
                start: {
                    line: 497,
                    column: 20
                },
                end: {
                    line: 497,
                    column: 38
                }
            },
            "219": {
                start: {
                    line: 498,
                    column: 20
                },
                end: {
                    line: 500,
                    column: 22
                }
            },
            "220": {
                start: {
                    line: 499,
                    column: 24
                },
                end: {
                    line: 499,
                    column: 69
                }
            },
            "221": {
                start: {
                    line: 501,
                    column: 20
                },
                end: {
                    line: 501,
                    column: 25
                }
            },
            "222": {
                start: {
                    line: 503,
                    column: 20
                },
                end: {
                    line: 503,
                    column: 64
                }
            },
            "223": {
                start: {
                    line: 504,
                    column: 20
                },
                end: {
                    line: 504,
                    column: 25
                }
            },
            "224": {
                start: {
                    line: 506,
                    column: 33
                },
                end: {
                    line: 506,
                    column: 57
                }
            },
            "225": {
                start: {
                    line: 507,
                    column: 20
                },
                end: {
                    line: 516,
                    column: 21
                }
            },
            "226": {
                start: {
                    line: 508,
                    column: 24
                },
                end: {
                    line: 508,
                    column: 46
                }
            },
            "227": {
                start: {
                    line: 510,
                    column: 24
                },
                end: {
                    line: 515,
                    column: 26
                }
            },
            "228": {
                start: {
                    line: 518,
                    column: 20
                },
                end: {
                    line: 518,
                    column: 25
                }
            },
            "229": {
                start: {
                    line: 521,
                    column: 20
                },
                end: {
                    line: 521,
                    column: 64
                }
            },
            "230": {
                start: {
                    line: 528,
                    column: 23
                },
                end: {
                    line: 528,
                    column: 53
                }
            },
            "231": {
                start: {
                    line: 529,
                    column: 8
                },
                end: {
                    line: 531,
                    column: 9
                }
            },
            "232": {
                start: {
                    line: 530,
                    column: 12
                },
                end: {
                    line: 530,
                    column: 50
                }
            },
            "233": {
                start: {
                    line: 532,
                    column: 8
                },
                end: {
                    line: 536,
                    column: 9
                }
            },
            "234": {
                start: {
                    line: 533,
                    column: 12
                },
                end: {
                    line: 533,
                    column: 27
                }
            },
            "235": {
                start: {
                    line: 535,
                    column: 12
                },
                end: {
                    line: 535,
                    column: 49
                }
            },
            "236": {
                start: {
                    line: 540,
                    column: 8
                },
                end: {
                    line: 540,
                    column: 38
                }
            },
            "237": {
                start: {
                    line: 541,
                    column: 8
                },
                end: {
                    line: 543,
                    column: 9
                }
            },
            "238": {
                start: {
                    line: 542,
                    column: 12
                },
                end: {
                    line: 542,
                    column: 59
                }
            },
            "239": {
                start: {
                    line: 544,
                    column: 8
                },
                end: {
                    line: 546,
                    column: 10
                }
            },
            "240": {
                start: {
                    line: 545,
                    column: 12
                },
                end: {
                    line: 545,
                    column: 65
                }
            },
            "241": {
                start: {
                    line: 553,
                    column: 8
                },
                end: {
                    line: 553,
                    column: 489
                }
            },
            "242": {
                start: {
                    line: 557,
                    column: 21
                },
                end: {
                    line: 557,
                    column: 47
                }
            },
            "243": {
                start: {
                    line: 558,
                    column: 8
                },
                end: {
                    line: 561,
                    column: 10
                }
            },
            "244": {
                start: {
                    line: 559,
                    column: 29
                },
                end: {
                    line: 559,
                    column: 59
                }
            },
            "245": {
                start: {
                    line: 560,
                    column: 12
                },
                end: {
                    line: 560,
                    column: 36
                }
            },
            "246": {
                start: {
                    line: 565,
                    column: 8
                },
                end: {
                    line: 573,
                    column: 10
                }
            },
            "247": {
                start: {
                    line: 566,
                    column: 24
                },
                end: {
                    line: 566,
                    column: 41
                }
            },
            "248": {
                start: {
                    line: 567,
                    column: 12
                },
                end: {
                    line: 572,
                    column: 13
                }
            },
            "249": {
                start: {
                    line: 568,
                    column: 16
                },
                end: {
                    line: 568,
                    column: 65
                }
            },
            "250": {
                start: {
                    line: 571,
                    column: 16
                },
                end: {
                    line: 571,
                    column: 38
                }
            },
            "251": {
                start: {
                    line: 578,
                    column: 8
                },
                end: {
                    line: 599,
                    column: 9
                }
            },
            "252": {
                start: {
                    line: 579,
                    column: 26
                },
                end: {
                    line: 585,
                    column: 13
                }
            },
            "253": {
                start: {
                    line: 586,
                    column: 12
                },
                end: {
                    line: 596,
                    column: 13
                }
            },
            "254": {
                start: {
                    line: 593,
                    column: 16
                },
                end: {
                    line: 593,
                    column: 27
                }
            },
            "255": {
                start: {
                    line: 595,
                    column: 16
                },
                end: {
                    line: 595,
                    column: 28
                }
            },
            "256": {
                start: {
                    line: 598,
                    column: 12
                },
                end: {
                    line: 598,
                    column: 24
                }
            },
            "257": {
                start: {
                    line: 604,
                    column: 21
                },
                end: {
                    line: 604,
                    column: 64
                }
            },
            "258": {
                start: {
                    line: 605,
                    column: 8
                },
                end: {
                    line: 605,
                    column: 28
                }
            },
            "259": {
                start: {
                    line: 609,
                    column: 21
                },
                end: {
                    line: 609,
                    column: 39
                }
            },
            "260": {
                start: {
                    line: 610,
                    column: 8
                },
                end: {
                    line: 612,
                    column: 9
                }
            },
            "261": {
                start: {
                    line: 611,
                    column: 12
                },
                end: {
                    line: 611,
                    column: 22
                }
            },
            "262": {
                start: {
                    line: 613,
                    column: 8
                },
                end: {
                    line: 613,
                    column: 21
                }
            },
            "263": {
                start: {
                    line: 617,
                    column: 27
                },
                end: {
                    line: 617,
                    column: 43
                }
            },
            "264": {
                start: {
                    line: 618,
                    column: 8
                },
                end: {
                    line: 620,
                    column: 9
                }
            },
            "265": {
                start: {
                    line: 619,
                    column: 12
                },
                end: {
                    line: 619,
                    column: 59
                }
            },
            "266": {
                start: {
                    line: 622,
                    column: 22
                },
                end: {
                    line: 624,
                    column: 10
                }
            },
            "267": {
                start: {
                    line: 623,
                    column: 12
                },
                end: {
                    line: 623,
                    column: 63
                }
            },
            "268": {
                start: {
                    line: 626,
                    column: 8
                },
                end: {
                    line: 632,
                    column: 9
                }
            },
            "269": {
                start: {
                    line: 627,
                    column: 12
                },
                end: {
                    line: 630,
                    column: 14
                }
            },
            "270": {
                start: {
                    line: 631,
                    column: 12
                },
                end: {
                    line: 631,
                    column: 28
                }
            },
            "271": {
                start: {
                    line: 634,
                    column: 8
                },
                end: {
                    line: 634,
                    column: 22
                }
            },
            "272": {
                start: {
                    line: 638,
                    column: 8
                },
                end: {
                    line: 642,
                    column: 9
                }
            },
            "273": {
                start: {
                    line: 643,
                    column: 8
                },
                end: {
                    line: 643,
                    column: 34
                }
            },
            "274": {
                start: {
                    line: 644,
                    column: 8
                },
                end: {
                    line: 646,
                    column: 9
                }
            },
            "275": {
                start: {
                    line: 645,
                    column: 12
                },
                end: {
                    line: 645,
                    column: 67
                }
            },
            "276": {
                start: {
                    line: 647,
                    column: 8
                },
                end: {
                    line: 647,
                    column: 44
                }
            },
            "277": {
                start: {
                    line: 648,
                    column: 8
                },
                end: {
                    line: 650,
                    column: 9
                }
            },
            "278": {
                start: {
                    line: 649,
                    column: 12
                },
                end: {
                    line: 649,
                    column: 27
                }
            },
            "279": {
                start: {
                    line: 651,
                    column: 8
                },
                end: {
                    line: 651,
                    column: 27
                }
            },
            "280": {
                start: {
                    line: 652,
                    column: 8
                },
                end: {
                    line: 654,
                    column: 9
                }
            },
            "281": {
                start: {
                    line: 653,
                    column: 12
                },
                end: {
                    line: 653,
                    column: 47
                }
            },
            "282": {
                start: {
                    line: 655,
                    column: 8
                },
                end: {
                    line: 655,
                    column: 28
                }
            },
            "283": {
                start: {
                    line: 659,
                    column: 8
                },
                end: {
                    line: 659,
                    column: 23
                }
            },
            "284": {
                start: {
                    line: 660,
                    column: 8
                },
                end: {
                    line: 660,
                    column: 51
                }
            },
            "285": {
                start: {
                    line: 661,
                    column: 8
                },
                end: {
                    line: 661,
                    column: 37
                }
            },
            "286": {
                start: {
                    line: 665,
                    column: 17
                },
                end: {
                    line: 665,
                    column: 38
                }
            },
            "287": {
                start: {
                    line: 666,
                    column: 8
                },
                end: {
                    line: 666,
                    column: 51
                }
            },
            "288": {
                start: {
                    line: 670,
                    column: 8
                },
                end: {
                    line: 670,
                    column: 20
                }
            },
            "289": {
                start: {
                    line: 675,
                    column: 20
                },
                end: {
                    line: 675,
                    column: 30
                }
            },
            "290": {
                start: {
                    line: 676,
                    column: 18
                },
                end: {
                    line: 676,
                    column: 40
                }
            },
            "291": {
                start: {
                    line: 677,
                    column: 8
                },
                end: {
                    line: 681,
                    column: 9
                }
            },
            "292": {
                start: {
                    line: 678,
                    column: 26
                },
                end: {
                    line: 678,
                    column: 44
                }
            },
            "293": {
                start: {
                    line: 679,
                    column: 28
                },
                end: {
                    line: 679,
                    column: 77
                }
            },
            "294": {
                start: {
                    line: 680,
                    column: 12
                },
                end: {
                    line: 680,
                    column: 56
                }
            },
            "295": {
                start: {
                    line: 683,
                    column: 8
                },
                end: {
                    line: 683,
                    column: 50
                }
            },
            "296": {
                start: {
                    line: 684,
                    column: 8
                },
                end: {
                    line: 684,
                    column: 14
                }
            },
            "297": {
                start: {
                    line: 688,
                    column: 8
                },
                end: {
                    line: 701,
                    column: 9
                }
            },
            "298": {
                start: {
                    line: 689,
                    column: 20
                },
                end: {
                    line: 689,
                    column: 36
                }
            },
            "299": {
                start: {
                    line: 690,
                    column: 12
                },
                end: {
                    line: 690,
                    column: 27
                }
            },
            "300": {
                start: {
                    line: 691,
                    column: 12
                },
                end: {
                    line: 699,
                    column: 13
                }
            },
            "301": {
                start: {
                    line: 692,
                    column: 16
                },
                end: {
                    line: 692,
                    column: 29
                }
            },
            "302": {
                start: {
                    line: 693,
                    column: 19
                },
                end: {
                    line: 699,
                    column: 13
                }
            },
            "303": {
                start: {
                    line: 694,
                    column: 16
                },
                end: {
                    line: 694,
                    column: 31
                }
            },
            "304": {
                start: {
                    line: 695,
                    column: 19
                },
                end: {
                    line: 699,
                    column: 13
                }
            },
            "305": {
                start: {
                    line: 696,
                    column: 16
                },
                end: {
                    line: 696,
                    column: 34
                }
            },
            "306": {
                start: {
                    line: 698,
                    column: 16
                },
                end: {
                    line: 698,
                    column: 37
                }
            },
            "307": {
                start: {
                    line: 700,
                    column: 12
                },
                end: {
                    line: 700,
                    column: 27
                }
            },
            "308": {
                start: {
                    line: 705,
                    column: 21
                },
                end: {
                    line: 705,
                    column: 47
                }
            },
            "309": {
                start: {
                    line: 706,
                    column: 16
                },
                end: {
                    line: 706,
                    column: 52
                }
            },
            "310": {
                start: {
                    line: 707,
                    column: 6
                },
                end: {
                    line: 707,
                    column: 29
                }
            },
            "311": {
                start: {
                    line: 707,
                    column: 21
                },
                end: {
                    line: 707,
                    column: 27
                }
            },
            "312": {
                start: {
                    line: 708,
                    column: 6
                },
                end: {
                    line: 708,
                    column: 36
                }
            },
            "313": {
                start: {
                    line: 725,
                    column: 6
                },
                end: {
                    line: 725,
                    column: 107
                }
            },
            "314": {
                start: {
                    line: 725,
                    column: 95
                },
                end: {
                    line: 725,
                    column: 105
                }
            },
            "315": {
                start: {
                    line: 727,
                    column: 18
                },
                end: {
                    line: 727,
                    column: 26
                }
            },
            "316": {
                start: {
                    line: 728,
                    column: 19
                },
                end: {
                    line: 728,
                    column: 20
                }
            },
            "317": {
                start: {
                    line: 729,
                    column: 6
                },
                end: {
                    line: 738,
                    column: 7
                }
            },
            "318": {
                start: {
                    line: 730,
                    column: 8
                },
                end: {
                    line: 736,
                    column: 9
                }
            },
            "319": {
                start: {
                    line: 732,
                    column: 12
                },
                end: {
                    line: 732,
                    column: 23
                }
            },
            "320": {
                start: {
                    line: 733,
                    column: 12
                },
                end: {
                    line: 733,
                    column: 17
                }
            },
            "321": {
                start: {
                    line: 735,
                    column: 12
                },
                end: {
                    line: 735,
                    column: 23
                }
            },
            "322": {
                start: {
                    line: 737,
                    column: 8
                },
                end: {
                    line: 737,
                    column: 18
                }
            },
            "323": {
                start: {
                    line: 741,
                    column: 6
                },
                end: {
                    line: 741,
                    column: 34
                }
            },
            "324": {
                start: {
                    line: 741,
                    column: 26
                },
                end: {
                    line: 741,
                    column: 32
                }
            },
            "325": {
                start: {
                    line: 744,
                    column: 6
                },
                end: {
                    line: 744,
                    column: 16
                }
            },
            "326": {
                start: {
                    line: 749,
                    column: 18
                },
                end: {
                    line: 749,
                    column: 145
                }
            },
            "327": {
                start: {
                    line: 750,
                    column: 6
                },
                end: {
                    line: 752,
                    column: 8
                }
            },
            "328": {
                start: {
                    line: 751,
                    column: 10
                },
                end: {
                    line: 751,
                    column: 44
                }
            },
            "329": {
                start: {
                    line: 753,
                    column: 19
                },
                end: {
                    line: 753,
                    column: 58
                }
            },
            "330": {
                start: {
                    line: 754,
                    column: 6
                },
                end: {
                    line: 794,
                    column: 7
                }
            },
            "331": {
                start: {
                    line: 755,
                    column: 8
                },
                end: {
                    line: 755,
                    column: 37
                }
            },
            "332": {
                start: {
                    line: 755,
                    column: 27
                },
                end: {
                    line: 755,
                    column: 35
                }
            },
            "333": {
                start: {
                    line: 756,
                    column: 20
                },
                end: {
                    line: 756,
                    column: 57
                }
            },
            "334": {
                start: {
                    line: 757,
                    column: 8
                },
                end: {
                    line: 757,
                    column: 30
                }
            },
            "335": {
                start: {
                    line: 757,
                    column: 22
                },
                end: {
                    line: 757,
                    column: 28
                }
            },
            "336": {
                start: {
                    line: 758,
                    column: 20
                },
                end: {
                    line: 758,
                    column: 38
                }
            },
            "337": {
                start: {
                    line: 759,
                    column: 19
                },
                end: {
                    line: 759,
                    column: 27
                }
            },
            "338": {
                start: {
                    line: 760,
                    column: 25
                },
                end: {
                    line: 760,
                    column: 33
                }
            },
            "339": {
                start: {
                    line: 761,
                    column: 8
                },
                end: {
                    line: 761,
                    column: 84
                }
            },
            "340": {
                start: {
                    line: 761,
                    column: 75
                },
                end: {
                    line: 761,
                    column: 78
                }
            },
            "341": {
                start: {
                    line: 762,
                    column: 19
                },
                end: {
                    line: 762,
                    column: 37
                }
            },
            "342": {
                start: {
                    line: 763,
                    column: 27
                },
                end: {
                    line: 763,
                    column: 45
                }
            },
            "343": {
                start: {
                    line: 766,
                    column: 8
                },
                end: {
                    line: 766,
                    column: 37
                }
            },
            "344": {
                start: {
                    line: 766,
                    column: 27
                },
                end: {
                    line: 766,
                    column: 35
                }
            },
            "345": {
                start: {
                    line: 769,
                    column: 8
                },
                end: {
                    line: 769,
                    column: 56
                }
            },
            "346": {
                start: {
                    line: 771,
                    column: 8
                },
                end: {
                    line: 771,
                    column: 52
                }
            },
            "347": {
                start: {
                    line: 774,
                    column: 8
                },
                end: {
                    line: 779,
                    column: 9
                }
            },
            "348": {
                start: {
                    line: 775,
                    column: 12
                },
                end: {
                    line: 778,
                    column: 14
                }
            },
            "349": {
                start: {
                    line: 781,
                    column: 8
                },
                end: {
                    line: 793,
                    column: 9
                }
            },
            "350": {
                start: {
                    line: 784,
                    column: 12
                },
                end: {
                    line: 784,
                    column: 17
                }
            },
            "351": {
                start: {
                    line: 787,
                    column: 12
                },
                end: {
                    line: 787,
                    column: 114
                }
            },
            "352": {
                start: {
                    line: 787,
                    column: 78
                },
                end: {
                    line: 787,
                    column: 113
                }
            },
            "353": {
                start: {
                    line: 788,
                    column: 12
                },
                end: {
                    line: 788,
                    column: 17
                }
            },
            "354": {
                start: {
                    line: 791,
                    column: 12
                },
                end: {
                    line: 791,
                    column: 115
                }
            },
            "355": {
                start: {
                    line: 792,
                    column: 12
                },
                end: {
                    line: 792,
                    column: 17
                }
            },
            "356": {
                start: {
                    line: 796,
                    column: 6
                },
                end: {
                    line: 796,
                    column: 38
                }
            },
            "357": {
                start: {
                    line: 800,
                    column: 19
                },
                end: {
                    line: 800,
                    column: 23
                }
            },
            "358": {
                start: {
                    line: 801,
                    column: 8
                },
                end: {
                    line: 803,
                    column: 10
                }
            },
            "359": {
                start: {
                    line: 802,
                    column: 12
                },
                end: {
                    line: 802,
                    column: 37
                }
            },
            "360": {
                start: {
                    line: 807,
                    column: 8
                },
                end: {
                    line: 807,
                    column: 30
                }
            },
            "361": {
                start: {
                    line: 808,
                    column: 8
                },
                end: {
                    line: 808,
                    column: 32
                }
            },
            "362": {
                start: {
                    line: 809,
                    column: 8
                },
                end: {
                    line: 809,
                    column: 26
                }
            },
            "363": {
                start: {
                    line: 810,
                    column: 8
                },
                end: {
                    line: 810,
                    column: 25
                }
            }
        },
        fnMap: {
            "0": {
                name: "(anonymous_0)",
                decl: {
                    start: {
                        line: 65,
                        column: 4
                    },
                    end: {
                        line: 65,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 65,
                        column: 36
                    },
                    end: {
                        line: 91,
                        column: 5
                    }
                }
            },
            "1": {
                name: "(anonymous_1)",
                decl: {
                    start: {
                        line: 93,
                        column: 4
                    },
                    end: {
                        line: 93,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 93,
                        column: 20
                    },
                    end: {
                        line: 95,
                        column: 5
                    }
                }
            },
            "2": {
                name: "(anonymous_2)",
                decl: {
                    start: {
                        line: 97,
                        column: 4
                    },
                    end: {
                        line: 97,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 97,
                        column: 13
                    },
                    end: {
                        line: 110,
                        column: 5
                    }
                }
            },
            "3": {
                name: "(anonymous_3)",
                decl: {
                    start: {
                        line: 112,
                        column: 4
                    },
                    end: {
                        line: 112,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 112,
                        column: 16
                    },
                    end: {
                        line: 120,
                        column: 5
                    }
                }
            },
            "4": {
                name: "(anonymous_4)",
                decl: {
                    start: {
                        line: 122,
                        column: 4
                    },
                    end: {
                        line: 122,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 122,
                        column: 21
                    },
                    end: {
                        line: 132,
                        column: 5
                    }
                }
            },
            "5": {
                name: "(anonymous_5)",
                decl: {
                    start: {
                        line: 134,
                        column: 4
                    },
                    end: {
                        line: 134,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 134,
                        column: 17
                    },
                    end: {
                        line: 144,
                        column: 5
                    }
                }
            },
            "6": {
                name: "(anonymous_6)",
                decl: {
                    start: {
                        line: 146,
                        column: 4
                    },
                    end: {
                        line: 146,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 146,
                        column: 18
                    },
                    end: {
                        line: 168,
                        column: 5
                    }
                }
            },
            "7": {
                name: "(anonymous_7)",
                decl: {
                    start: {
                        line: 170,
                        column: 4
                    },
                    end: {
                        line: 170,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 170,
                        column: 18
                    },
                    end: {
                        line: 186,
                        column: 5
                    }
                }
            },
            "8": {
                name: "(anonymous_8)",
                decl: {
                    start: {
                        line: 188,
                        column: 4
                    },
                    end: {
                        line: 188,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 188,
                        column: 18
                    },
                    end: {
                        line: 210,
                        column: 5
                    }
                }
            },
            "9": {
                name: "(anonymous_9)",
                decl: {
                    start: {
                        line: 212,
                        column: 4
                    },
                    end: {
                        line: 212,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 212,
                        column: 12
                    },
                    end: {
                        line: 220,
                        column: 5
                    }
                }
            },
            "10": {
                name: "(anonymous_10)",
                decl: {
                    start: {
                        line: 222,
                        column: 4
                    },
                    end: {
                        line: 222,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 222,
                        column: 18
                    },
                    end: {
                        line: 239,
                        column: 5
                    }
                }
            },
            "11": {
                name: "(anonymous_11)",
                decl: {
                    start: {
                        line: 241,
                        column: 4
                    },
                    end: {
                        line: 241,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 241,
                        column: 21
                    },
                    end: {
                        line: 264,
                        column: 5
                    }
                }
            },
            "12": {
                name: "(anonymous_12)",
                decl: {
                    start: {
                        line: 266,
                        column: 4
                    },
                    end: {
                        line: 266,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 266,
                        column: 19
                    },
                    end: {
                        line: 292,
                        column: 5
                    }
                }
            },
            "13": {
                name: "(anonymous_13)",
                decl: {
                    start: {
                        line: 294,
                        column: 4
                    },
                    end: {
                        line: 294,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 294,
                        column: 20
                    },
                    end: {
                        line: 525,
                        column: 5
                    }
                }
            },
            "14": {
                name: "(anonymous_14)",
                decl: {
                    start: {
                        line: 345,
                        column: 37
                    },
                    end: {
                        line: 345,
                        column: 38
                    }
                },
                loc: {
                    start: {
                        line: 345,
                        column: 47
                    },
                    end: {
                        line: 345,
                        column: 77
                    }
                }
            },
            "15": {
                name: "(anonymous_15)",
                decl: {
                    start: {
                        line: 387,
                        column: 55
                    },
                    end: {
                        line: 387,
                        column: 56
                    }
                },
                loc: {
                    start: {
                        line: 387,
                        column: 61
                    },
                    end: {
                        line: 389,
                        column: 17
                    }
                }
            },
            "16": {
                name: "(anonymous_16)",
                decl: {
                    start: {
                        line: 391,
                        column: 55
                    },
                    end: {
                        line: 391,
                        column: 56
                    }
                },
                loc: {
                    start: {
                        line: 391,
                        column: 61
                    },
                    end: {
                        line: 393,
                        column: 17
                    }
                }
            },
            "17": {
                name: "(anonymous_17)",
                decl: {
                    start: {
                        line: 490,
                        column: 63
                    },
                    end: {
                        line: 490,
                        column: 64
                    }
                },
                loc: {
                    start: {
                        line: 490,
                        column: 73
                    },
                    end: {
                        line: 490,
                        column: 113
                    }
                }
            },
            "18": {
                name: "(anonymous_18)",
                decl: {
                    start: {
                        line: 493,
                        column: 58
                    },
                    end: {
                        line: 493,
                        column: 59
                    }
                },
                loc: {
                    start: {
                        line: 493,
                        column: 68
                    },
                    end: {
                        line: 493,
                        column: 90
                    }
                }
            },
            "19": {
                name: "(anonymous_19)",
                decl: {
                    start: {
                        line: 498,
                        column: 34
                    },
                    end: {
                        line: 498,
                        column: 35
                    }
                },
                loc: {
                    start: {
                        line: 498,
                        column: 44
                    },
                    end: {
                        line: 500,
                        column: 21
                    }
                }
            },
            "20": {
                name: "(anonymous_20)",
                decl: {
                    start: {
                        line: 527,
                        column: 4
                    },
                    end: {
                        line: 527,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 527,
                        column: 32
                    },
                    end: {
                        line: 537,
                        column: 5
                    }
                }
            },
            "21": {
                name: "(anonymous_21)",
                decl: {
                    start: {
                        line: 539,
                        column: 4
                    },
                    end: {
                        line: 539,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 539,
                        column: 28
                    },
                    end: {
                        line: 547,
                        column: 5
                    }
                }
            },
            "22": {
                name: "(anonymous_22)",
                decl: {
                    start: {
                        line: 544,
                        column: 46
                    },
                    end: {
                        line: 544,
                        column: 47
                    }
                },
                loc: {
                    start: {
                        line: 544,
                        column: 57
                    },
                    end: {
                        line: 546,
                        column: 9
                    }
                }
            },
            "23": {
                name: "(anonymous_23)",
                decl: {
                    start: {
                        line: 549,
                        column: 4
                    },
                    end: {
                        line: 549,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 549,
                        column: 25
                    },
                    end: {
                        line: 554,
                        column: 5
                    }
                }
            },
            "24": {
                name: "(anonymous_24)",
                decl: {
                    start: {
                        line: 556,
                        column: 4
                    },
                    end: {
                        line: 556,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 556,
                        column: 32
                    },
                    end: {
                        line: 562,
                        column: 5
                    }
                }
            },
            "25": {
                name: "(anonymous_25)",
                decl: {
                    start: {
                        line: 558,
                        column: 26
                    },
                    end: {
                        line: 558,
                        column: 27
                    }
                },
                loc: {
                    start: {
                        line: 558,
                        column: 36
                    },
                    end: {
                        line: 561,
                        column: 9
                    }
                }
            },
            "26": {
                name: "(anonymous_26)",
                decl: {
                    start: {
                        line: 564,
                        column: 4
                    },
                    end: {
                        line: 564,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 564,
                        column: 30
                    },
                    end: {
                        line: 574,
                        column: 5
                    }
                }
            },
            "27": {
                name: "(anonymous_27)",
                decl: {
                    start: {
                        line: 565,
                        column: 42
                    },
                    end: {
                        line: 565,
                        column: 43
                    }
                },
                loc: {
                    start: {
                        line: 565,
                        column: 52
                    },
                    end: {
                        line: 573,
                        column: 9
                    }
                }
            },
            "28": {
                name: "(anonymous_28)",
                decl: {
                    start: {
                        line: 576,
                        column: 4
                    },
                    end: {
                        line: 576,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 576,
                        column: 24
                    },
                    end: {
                        line: 600,
                        column: 5
                    }
                }
            },
            "29": {
                name: "(anonymous_29)",
                decl: {
                    start: {
                        line: 603,
                        column: 4
                    },
                    end: {
                        line: 603,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 603,
                        column: 37
                    },
                    end: {
                        line: 606,
                        column: 5
                    }
                }
            },
            "30": {
                name: "(anonymous_30)",
                decl: {
                    start: {
                        line: 608,
                        column: 4
                    },
                    end: {
                        line: 608,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 608,
                        column: 29
                    },
                    end: {
                        line: 614,
                        column: 5
                    }
                }
            },
            "31": {
                name: "(anonymous_31)",
                decl: {
                    start: {
                        line: 616,
                        column: 4
                    },
                    end: {
                        line: 616,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 616,
                        column: 14
                    },
                    end: {
                        line: 635,
                        column: 5
                    }
                }
            },
            "32": {
                name: "(anonymous_32)",
                decl: {
                    start: {
                        line: 622,
                        column: 49
                    },
                    end: {
                        line: 622,
                        column: 50
                    }
                },
                loc: {
                    start: {
                        line: 622,
                        column: 60
                    },
                    end: {
                        line: 624,
                        column: 9
                    }
                }
            },
            "33": {
                name: "(anonymous_33)",
                decl: {
                    start: {
                        line: 637,
                        column: 4
                    },
                    end: {
                        line: 637,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 637,
                        column: 21
                    },
                    end: {
                        line: 656,
                        column: 5
                    }
                }
            },
            "34": {
                name: "(anonymous_34)",
                decl: {
                    start: {
                        line: 658,
                        column: 4
                    },
                    end: {
                        line: 658,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 658,
                        column: 16
                    },
                    end: {
                        line: 662,
                        column: 5
                    }
                }
            },
            "35": {
                name: "(anonymous_35)",
                decl: {
                    start: {
                        line: 664,
                        column: 4
                    },
                    end: {
                        line: 664,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 664,
                        column: 13
                    },
                    end: {
                        line: 667,
                        column: 5
                    }
                }
            },
            "36": {
                name: "(anonymous_36)",
                decl: {
                    start: {
                        line: 669,
                        column: 4
                    },
                    end: {
                        line: 669,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 669,
                        column: 15
                    },
                    end: {
                        line: 671,
                        column: 5
                    }
                }
            },
            "37": {
                name: "(anonymous_37)",
                decl: {
                    start: {
                        line: 674,
                        column: 4
                    },
                    end: {
                        line: 674,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 674,
                        column: 22
                    },
                    end: {
                        line: 685,
                        column: 5
                    }
                }
            },
            "38": {
                name: "(anonymous_38)",
                decl: {
                    start: {
                        line: 687,
                        column: 4
                    },
                    end: {
                        line: 687,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 687,
                        column: 24
                    },
                    end: {
                        line: 702,
                        column: 5
                    }
                }
            },
            "39": {
                name: "(anonymous_39)",
                decl: {
                    start: {
                        line: 704,
                        column: 4
                    },
                    end: {
                        line: 704,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 704,
                        column: 18
                    },
                    end: {
                        line: 797,
                        column: 5
                    }
                }
            },
            "40": {
                name: "(anonymous_40)",
                decl: {
                    start: {
                        line: 750,
                        column: 24
                    },
                    end: {
                        line: 750,
                        column: 25
                    }
                },
                loc: {
                    start: {
                        line: 750,
                        column: 32
                    },
                    end: {
                        line: 752,
                        column: 7
                    }
                }
            },
            "41": {
                name: "(anonymous_41)",
                decl: {
                    start: {
                        line: 761,
                        column: 68
                    },
                    end: {
                        line: 761,
                        column: 69
                    }
                },
                loc: {
                    start: {
                        line: 761,
                        column: 75
                    },
                    end: {
                        line: 761,
                        column: 78
                    }
                }
            },
            "42": {
                name: "(anonymous_42)",
                decl: {
                    start: {
                        line: 787,
                        column: 71
                    },
                    end: {
                        line: 787,
                        column: 72
                    }
                },
                loc: {
                    start: {
                        line: 787,
                        column: 78
                    },
                    end: {
                        line: 787,
                        column: 113
                    }
                }
            },
            "43": {
                name: "(anonymous_43)",
                decl: {
                    start: {
                        line: 799,
                        column: 4
                    },
                    end: {
                        line: 799,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 799,
                        column: 18
                    },
                    end: {
                        line: 804,
                        column: 5
                    }
                }
            },
            "44": {
                name: "(anonymous_44)",
                decl: {
                    start: {
                        line: 801,
                        column: 29
                    },
                    end: {
                        line: 801,
                        column: 30
                    }
                },
                loc: {
                    start: {
                        line: 801,
                        column: 46
                    },
                    end: {
                        line: 803,
                        column: 9
                    }
                }
            },
            "45": {
                name: "(anonymous_45)",
                decl: {
                    start: {
                        line: 806,
                        column: 4
                    },
                    end: {
                        line: 806,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 806,
                        column: 17
                    },
                    end: {
                        line: 811,
                        column: 5
                    }
                }
            }
        },
        branchMap: {
            "0": {
                loc: {
                    start: {
                        line: 65,
                        column: 23
                    },
                    end: {
                        line: 65,
                        column: 34
                    }
                },
                type: "default-arg",
                locations: [{
                    start: {
                        line: 65,
                        column: 32
                    },
                    end: {
                        line: 65,
                        column: 34
                    }
                }]
            },
            "1": {
                loc: {
                    start: {
                        line: 94,
                        column: 16
                    },
                    end: {
                        line: 94,
                        column: 63
                    }
                },
                type: "binary-expr",
                locations: [{
                    start: {
                        line: 94,
                        column: 16
                    },
                    end: {
                        line: 94,
                        column: 24
                    }
                }, {
                    start: {
                        line: 94,
                        column: 28
                    },
                    end: {
                        line: 94,
                        column: 37
                    }
                }, {
                    start: {
                        line: 94,
                        column: 41
                    },
                    end: {
                        line: 94,
                        column: 50
                    }
                }, {
                    start: {
                        line: 94,
                        column: 54
                    },
                    end: {
                        line: 94,
                        column: 63
                    }
                }]
            },
            "2": {
                loc: {
                    start: {
                        line: 99,
                        column: 8
                    },
                    end: {
                        line: 108,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 99,
                        column: 8
                    },
                    end: {
                        line: 108,
                        column: 9
                    }
                }, {
                    start: {
                        line: 99,
                        column: 8
                    },
                    end: {
                        line: 108,
                        column: 9
                    }
                }]
            },
            "3": {
                loc: {
                    start: {
                        line: 114,
                        column: 8
                    },
                    end: {
                        line: 118,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 114,
                        column: 8
                    },
                    end: {
                        line: 118,
                        column: 9
                    }
                }, {
                    start: {
                        line: 114,
                        column: 8
                    },
                    end: {
                        line: 118,
                        column: 9
                    }
                }]
            },
            "4": {
                loc: {
                    start: {
                        line: 126,
                        column: 8
                    },
                    end: {
                        line: 131,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 126,
                        column: 8
                    },
                    end: {
                        line: 131,
                        column: 9
                    }
                }, {
                    start: {
                        line: 126,
                        column: 8
                    },
                    end: {
                        line: 131,
                        column: 9
                    }
                }]
            },
            "5": {
                loc: {
                    start: {
                        line: 135,
                        column: 15
                    },
                    end: {
                        line: 136,
                        column: 16
                    }
                },
                type: "binary-expr",
                locations: [{
                    start: {
                        line: 135,
                        column: 16
                    },
                    end: {
                        line: 135,
                        column: 44
                    }
                }, {
                    start: {
                        line: 135,
                        column: 50
                    },
                    end: {
                        line: 136,
                        column: 15
                    }
                }]
            },
            "6": {
                loc: {
                    start: {
                        line: 139,
                        column: 8
                    },
                    end: {
                        line: 143,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 139,
                        column: 8
                    },
                    end: {
                        line: 143,
                        column: 9
                    }
                }, {
                    start: {
                        line: 139,
                        column: 8
                    },
                    end: {
                        line: 143,
                        column: 9
                    }
                }]
            },
            "7": {
                loc: {
                    start: {
                        line: 151,
                        column: 12
                    },
                    end: {
                        line: 165,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 151,
                        column: 12
                    },
                    end: {
                        line: 165,
                        column: 13
                    }
                }, {
                    start: {
                        line: 151,
                        column: 12
                    },
                    end: {
                        line: 165,
                        column: 13
                    }
                }]
            },
            "8": {
                loc: {
                    start: {
                        line: 151,
                        column: 16
                    },
                    end: {
                        line: 152,
                        column: 20
                    }
                },
                type: "binary-expr",
                locations: [{
                    start: {
                        line: 151,
                        column: 16
                    },
                    end: {
                        line: 151,
                        column: 43
                    }
                }, {
                    start: {
                        line: 151,
                        column: 47
                    },
                    end: {
                        line: 152,
                        column: 20
                    }
                }]
            },
            "9": {
                loc: {
                    start: {
                        line: 153,
                        column: 16
                    },
                    end: {
                        line: 159,
                        column: 17
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 153,
                        column: 16
                    },
                    end: {
                        line: 159,
                        column: 17
                    }
                }, {
                    start: {
                        line: 153,
                        column: 16
                    },
                    end: {
                        line: 159,
                        column: 17
                    }
                }]
            },
            "10": {
                loc: {
                    start: {
                        line: 160,
                        column: 19
                    },
                    end: {
                        line: 165,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 160,
                        column: 19
                    },
                    end: {
                        line: 165,
                        column: 13
                    }
                }, {
                    start: {
                        line: 160,
                        column: 19
                    },
                    end: {
                        line: 165,
                        column: 13
                    }
                }]
            },
            "11": {
                loc: {
                    start: {
                        line: 160,
                        column: 23
                    },
                    end: {
                        line: 161,
                        column: 20
                    }
                },
                type: "binary-expr",
                locations: [{
                    start: {
                        line: 160,
                        column: 23
                    },
                    end: {
                        line: 160,
                        column: 50
                    }
                }, {
                    start: {
                        line: 160,
                        column: 54
                    },
                    end: {
                        line: 161,
                        column: 20
                    }
                }]
            },
            "12": {
                loc: {
                    start: {
                        line: 163,
                        column: 19
                    },
                    end: {
                        line: 165,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 163,
                        column: 19
                    },
                    end: {
                        line: 165,
                        column: 13
                    }
                }, {
                    start: {
                        line: 163,
                        column: 19
                    },
                    end: {
                        line: 165,
                        column: 13
                    }
                }]
            },
            "13": {
                loc: {
                    start: {
                        line: 174,
                        column: 12
                    },
                    end: {
                        line: 183,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 174,
                        column: 12
                    },
                    end: {
                        line: 183,
                        column: 13
                    }
                }, {
                    start: {
                        line: 174,
                        column: 12
                    },
                    end: {
                        line: 183,
                        column: 13
                    }
                }]
            },
            "14": {
                loc: {
                    start: {
                        line: 174,
                        column: 16
                    },
                    end: {
                        line: 174,
                        column: 80
                    }
                },
                type: "binary-expr",
                locations: [{
                    start: {
                        line: 174,
                        column: 16
                    },
                    end: {
                        line: 174,
                        column: 44
                    }
                }, {
                    start: {
                        line: 174,
                        column: 48
                    },
                    end: {
                        line: 174,
                        column: 80
                    }
                }]
            },
            "15": {
                loc: {
                    start: {
                        line: 178,
                        column: 19
                    },
                    end: {
                        line: 183,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 178,
                        column: 19
                    },
                    end: {
                        line: 183,
                        column: 13
                    }
                }, {
                    start: {
                        line: 178,
                        column: 19
                    },
                    end: {
                        line: 183,
                        column: 13
                    }
                }]
            },
            "16": {
                loc: {
                    start: {
                        line: 190,
                        column: 8
                    },
                    end: {
                        line: 209,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 190,
                        column: 8
                    },
                    end: {
                        line: 209,
                        column: 9
                    }
                }, {
                    start: {
                        line: 190,
                        column: 8
                    },
                    end: {
                        line: 209,
                        column: 9
                    }
                }]
            },
            "17": {
                loc: {
                    start: {
                        line: 192,
                        column: 15
                    },
                    end: {
                        line: 209,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 192,
                        column: 15
                    },
                    end: {
                        line: 209,
                        column: 9
                    }
                }, {
                    start: {
                        line: 192,
                        column: 15
                    },
                    end: {
                        line: 209,
                        column: 9
                    }
                }]
            },
            "18": {
                loc: {
                    start: {
                        line: 196,
                        column: 12
                    },
                    end: {
                        line: 208,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 196,
                        column: 12
                    },
                    end: {
                        line: 208,
                        column: 13
                    }
                }, {
                    start: {
                        line: 196,
                        column: 12
                    },
                    end: {
                        line: 208,
                        column: 13
                    }
                }]
            },
            "19": {
                loc: {
                    start: {
                        line: 198,
                        column: 19
                    },
                    end: {
                        line: 208,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 198,
                        column: 19
                    },
                    end: {
                        line: 208,
                        column: 13
                    }
                }, {
                    start: {
                        line: 198,
                        column: 19
                    },
                    end: {
                        line: 208,
                        column: 13
                    }
                }]
            },
            "20": {
                loc: {
                    start: {
                        line: 225,
                        column: 12
                    },
                    end: {
                        line: 228,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 225,
                        column: 12
                    },
                    end: {
                        line: 228,
                        column: 13
                    }
                }, {
                    start: {
                        line: 225,
                        column: 12
                    },
                    end: {
                        line: 228,
                        column: 13
                    }
                }]
            },
            "21": {
                loc: {
                    start: {
                        line: 229,
                        column: 12
                    },
                    end: {
                        line: 237,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 229,
                        column: 12
                    },
                    end: {
                        line: 237,
                        column: 13
                    }
                }, {
                    start: {
                        line: 229,
                        column: 12
                    },
                    end: {
                        line: 237,
                        column: 13
                    }
                }]
            },
            "22": {
                loc: {
                    start: {
                        line: 230,
                        column: 16
                    },
                    end: {
                        line: 233,
                        column: 17
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 230,
                        column: 16
                    },
                    end: {
                        line: 233,
                        column: 17
                    }
                }, {
                    start: {
                        line: 230,
                        column: 16
                    },
                    end: {
                        line: 233,
                        column: 17
                    }
                }]
            },
            "23": {
                loc: {
                    start: {
                        line: 230,
                        column: 20
                    },
                    end: {
                        line: 230,
                        column: 59
                    }
                },
                type: "binary-expr",
                locations: [{
                    start: {
                        line: 230,
                        column: 20
                    },
                    end: {
                        line: 230,
                        column: 28
                    }
                }, {
                    start: {
                        line: 230,
                        column: 32
                    },
                    end: {
                        line: 230,
                        column: 59
                    }
                }]
            },
            "24": {
                loc: {
                    start: {
                        line: 243,
                        column: 8
                    },
                    end: {
                        line: 251,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 243,
                        column: 8
                    },
                    end: {
                        line: 251,
                        column: 9
                    }
                }, {
                    start: {
                        line: 243,
                        column: 8
                    },
                    end: {
                        line: 251,
                        column: 9
                    }
                }]
            },
            "25": {
                loc: {
                    start: {
                        line: 253,
                        column: 8
                    },
                    end: {
                        line: 263,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 253,
                        column: 8
                    },
                    end: {
                        line: 263,
                        column: 9
                    }
                }, {
                    start: {
                        line: 253,
                        column: 8
                    },
                    end: {
                        line: 263,
                        column: 9
                    }
                }]
            },
            "26": {
                loc: {
                    start: {
                        line: 268,
                        column: 8
                    },
                    end: {
                        line: 273,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 268,
                        column: 8
                    },
                    end: {
                        line: 273,
                        column: 9
                    }
                }, {
                    start: {
                        line: 268,
                        column: 8
                    },
                    end: {
                        line: 273,
                        column: 9
                    }
                }]
            },
            "27": {
                loc: {
                    start: {
                        line: 279,
                        column: 12
                    },
                    end: {
                        line: 281,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 279,
                        column: 12
                    },
                    end: {
                        line: 281,
                        column: 13
                    }
                }, {
                    start: {
                        line: 279,
                        column: 12
                    },
                    end: {
                        line: 281,
                        column: 13
                    }
                }]
            },
            "28": {
                loc: {
                    start: {
                        line: 283,
                        column: 12
                    },
                    end: {
                        line: 289,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 283,
                        column: 12
                    },
                    end: {
                        line: 289,
                        column: 13
                    }
                }, {
                    start: {
                        line: 283,
                        column: 12
                    },
                    end: {
                        line: 289,
                        column: 13
                    }
                }]
            },
            "29": {
                loc: {
                    start: {
                        line: 305,
                        column: 8
                    },
                    end: {
                        line: 312,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 305,
                        column: 8
                    },
                    end: {
                        line: 312,
                        column: 9
                    }
                }, {
                    start: {
                        line: 305,
                        column: 8
                    },
                    end: {
                        line: 312,
                        column: 9
                    }
                }]
            },
            "30": {
                loc: {
                    start: {
                        line: 308,
                        column: 15
                    },
                    end: {
                        line: 312,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 308,
                        column: 15
                    },
                    end: {
                        line: 312,
                        column: 9
                    }
                }, {
                    start: {
                        line: 308,
                        column: 15
                    },
                    end: {
                        line: 312,
                        column: 9
                    }
                }]
            },
            "31": {
                loc: {
                    start: {
                        line: 308,
                        column: 19
                    },
                    end: {
                        line: 308,
                        column: 52
                    }
                },
                type: "binary-expr",
                locations: [{
                    start: {
                        line: 308,
                        column: 19
                    },
                    end: {
                        line: 308,
                        column: 33
                    }
                }, {
                    start: {
                        line: 308,
                        column: 37
                    },
                    end: {
                        line: 308,
                        column: 52
                    }
                }]
            },
            "32": {
                loc: {
                    start: {
                        line: 310,
                        column: 15
                    },
                    end: {
                        line: 312,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 310,
                        column: 15
                    },
                    end: {
                        line: 312,
                        column: 9
                    }
                }, {
                    start: {
                        line: 310,
                        column: 15
                    },
                    end: {
                        line: 312,
                        column: 9
                    }
                }]
            },
            "33": {
                loc: {
                    start: {
                        line: 313,
                        column: 8
                    },
                    end: {
                        line: 338,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 313,
                        column: 8
                    },
                    end: {
                        line: 338,
                        column: 9
                    }
                }, {
                    start: {
                        line: 313,
                        column: 8
                    },
                    end: {
                        line: 338,
                        column: 9
                    }
                }]
            },
            "34": {
                loc: {
                    start: {
                        line: 314,
                        column: 12
                    },
                    end: {
                        line: 337,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 314,
                        column: 12
                    },
                    end: {
                        line: 337,
                        column: 13
                    }
                }, {
                    start: {
                        line: 314,
                        column: 12
                    },
                    end: {
                        line: 337,
                        column: 13
                    }
                }]
            },
            "35": {
                loc: {
                    start: {
                        line: 318,
                        column: 16
                    },
                    end: {
                        line: 330,
                        column: 17
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 318,
                        column: 16
                    },
                    end: {
                        line: 330,
                        column: 17
                    }
                }, {
                    start: {
                        line: 318,
                        column: 16
                    },
                    end: {
                        line: 330,
                        column: 17
                    }
                }]
            },
            "36": {
                loc: {
                    start: {
                        line: 322,
                        column: 23
                    },
                    end: {
                        line: 330,
                        column: 17
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 322,
                        column: 23
                    },
                    end: {
                        line: 330,
                        column: 17
                    }
                }, {
                    start: {
                        line: 322,
                        column: 23
                    },
                    end: {
                        line: 330,
                        column: 17
                    }
                }]
            },
            "37": {
                loc: {
                    start: {
                        line: 322,
                        column: 27
                    },
                    end: {
                        line: 322,
                        column: 60
                    }
                },
                type: "binary-expr",
                locations: [{
                    start: {
                        line: 322,
                        column: 27
                    },
                    end: {
                        line: 322,
                        column: 41
                    }
                }, {
                    start: {
                        line: 322,
                        column: 45
                    },
                    end: {
                        line: 322,
                        column: 60
                    }
                }]
            },
            "38": {
                loc: {
                    start: {
                        line: 342,
                        column: 8
                    },
                    end: {
                        line: 361,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 342,
                        column: 8
                    },
                    end: {
                        line: 361,
                        column: 9
                    }
                }, {
                    start: {
                        line: 342,
                        column: 8
                    },
                    end: {
                        line: 361,
                        column: 9
                    }
                }]
            },
            "39": {
                loc: {
                    start: {
                        line: 342,
                        column: 12
                    },
                    end: {
                        line: 342,
                        column: 55
                    }
                },
                type: "binary-expr",
                locations: [{
                    start: {
                        line: 342,
                        column: 12
                    },
                    end: {
                        line: 342,
                        column: 28
                    }
                }, {
                    start: {
                        line: 342,
                        column: 32
                    },
                    end: {
                        line: 342,
                        column: 55
                    }
                }]
            },
            "40": {
                loc: {
                    start: {
                        line: 345,
                        column: 12
                    },
                    end: {
                        line: 347,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 345,
                        column: 12
                    },
                    end: {
                        line: 347,
                        column: 13
                    }
                }, {
                    start: {
                        line: 345,
                        column: 12
                    },
                    end: {
                        line: 347,
                        column: 13
                    }
                }]
            },
            "41": {
                loc: {
                    start: {
                        line: 348,
                        column: 15
                    },
                    end: {
                        line: 361,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 348,
                        column: 15
                    },
                    end: {
                        line: 361,
                        column: 9
                    }
                }, {
                    start: {
                        line: 348,
                        column: 15
                    },
                    end: {
                        line: 361,
                        column: 9
                    }
                }]
            },
            "42": {
                loc: {
                    start: {
                        line: 355,
                        column: 12
                    },
                    end: {
                        line: 360,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 355,
                        column: 12
                    },
                    end: {
                        line: 360,
                        column: 13
                    }
                }, {
                    start: {
                        line: 355,
                        column: 12
                    },
                    end: {
                        line: 360,
                        column: 13
                    }
                }]
            },
            "43": {
                loc: {
                    start: {
                        line: 357,
                        column: 16
                    },
                    end: {
                        line: 359,
                        column: 17
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 357,
                        column: 16
                    },
                    end: {
                        line: 359,
                        column: 17
                    }
                }, {
                    start: {
                        line: 357,
                        column: 16
                    },
                    end: {
                        line: 359,
                        column: 17
                    }
                }]
            },
            "44": {
                loc: {
                    start: {
                        line: 367,
                        column: 12
                    },
                    end: {
                        line: 370,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 367,
                        column: 12
                    },
                    end: {
                        line: 370,
                        column: 13
                    }
                }, {
                    start: {
                        line: 367,
                        column: 12
                    },
                    end: {
                        line: 370,
                        column: 13
                    }
                }]
            },
            "45": {
                loc: {
                    start: {
                        line: 367,
                        column: 16
                    },
                    end: {
                        line: 367,
                        column: 97
                    }
                },
                type: "binary-expr",
                locations: [{
                    start: {
                        line: 367,
                        column: 16
                    },
                    end: {
                        line: 367,
                        column: 29
                    }
                }, {
                    start: {
                        line: 367,
                        column: 34
                    },
                    end: {
                        line: 367,
                        column: 65
                    }
                }, {
                    start: {
                        line: 367,
                        column: 69
                    },
                    end: {
                        line: 367,
                        column: 96
                    }
                }]
            },
            "46": {
                loc: {
                    start: {
                        line: 374,
                        column: 12
                    },
                    end: {
                        line: 394,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 374,
                        column: 12
                    },
                    end: {
                        line: 394,
                        column: 13
                    }
                }, {
                    start: {
                        line: 374,
                        column: 12
                    },
                    end: {
                        line: 394,
                        column: 13
                    }
                }]
            },
            "47": {
                loc: {
                    start: {
                        line: 375,
                        column: 16
                    },
                    end: {
                        line: 385,
                        column: 17
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 375,
                        column: 16
                    },
                    end: {
                        line: 385,
                        column: 17
                    }
                }, {
                    start: {
                        line: 375,
                        column: 16
                    },
                    end: {
                        line: 385,
                        column: 17
                    }
                }]
            },
            "48": {
                loc: {
                    start: {
                        line: 399,
                        column: 12
                    },
                    end: {
                        line: 441,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 399,
                        column: 12
                    },
                    end: {
                        line: 441,
                        column: 13
                    }
                }, {
                    start: {
                        line: 399,
                        column: 12
                    },
                    end: {
                        line: 441,
                        column: 13
                    }
                }]
            },
            "49": {
                loc: {
                    start: {
                        line: 405,
                        column: 16
                    },
                    end: {
                        line: 407,
                        column: 17
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 405,
                        column: 16
                    },
                    end: {
                        line: 407,
                        column: 17
                    }
                }, {
                    start: {
                        line: 405,
                        column: 16
                    },
                    end: {
                        line: 407,
                        column: 17
                    }
                }]
            },
            "50": {
                loc: {
                    start: {
                        line: 408,
                        column: 16
                    },
                    end: {
                        line: 410,
                        column: 17
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 408,
                        column: 16
                    },
                    end: {
                        line: 410,
                        column: 17
                    }
                }, {
                    start: {
                        line: 408,
                        column: 16
                    },
                    end: {
                        line: 410,
                        column: 17
                    }
                }]
            },
            "51": {
                loc: {
                    start: {
                        line: 412,
                        column: 24
                    },
                    end: {
                        line: 412,
                        column: 105
                    }
                },
                type: "cond-expr",
                locations: [{
                    start: {
                        line: 412,
                        column: 59
                    },
                    end: {
                        line: 412,
                        column: 91
                    }
                }, {
                    start: {
                        line: 412,
                        column: 94
                    },
                    end: {
                        line: 412,
                        column: 105
                    }
                }]
            },
            "52": {
                loc: {
                    start: {
                        line: 414,
                        column: 19
                    },
                    end: {
                        line: 441,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 414,
                        column: 19
                    },
                    end: {
                        line: 441,
                        column: 13
                    }
                }, {
                    start: {
                        line: 414,
                        column: 19
                    },
                    end: {
                        line: 441,
                        column: 13
                    }
                }]
            },
            "53": {
                loc: {
                    start: {
                        line: 415,
                        column: 16
                    },
                    end: {
                        line: 416,
                        column: 48
                    }
                },
                type: "binary-expr",
                locations: [{
                    start: {
                        line: 415,
                        column: 16
                    },
                    end: {
                        line: 415,
                        column: 48
                    }
                }, {
                    start: {
                        line: 416,
                        column: 16
                    },
                    end: {
                        line: 416,
                        column: 48
                    }
                }]
            },
            "54": {
                loc: {
                    start: {
                        line: 420,
                        column: 19
                    },
                    end: {
                        line: 441,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 420,
                        column: 19
                    },
                    end: {
                        line: 441,
                        column: 13
                    }
                }, {
                    start: {
                        line: 420,
                        column: 19
                    },
                    end: {
                        line: 441,
                        column: 13
                    }
                }]
            },
            "55": {
                loc: {
                    start: {
                        line: 421,
                        column: 16
                    },
                    end: {
                        line: 422,
                        column: 38
                    }
                },
                type: "binary-expr",
                locations: [{
                    start: {
                        line: 421,
                        column: 16
                    },
                    end: {
                        line: 421,
                        column: 48
                    }
                }, {
                    start: {
                        line: 422,
                        column: 16
                    },
                    end: {
                        line: 422,
                        column: 38
                    }
                }]
            },
            "56": {
                loc: {
                    start: {
                        line: 433,
                        column: 16
                    },
                    end: {
                        line: 435,
                        column: 17
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 433,
                        column: 16
                    },
                    end: {
                        line: 435,
                        column: 17
                    }
                }, {
                    start: {
                        line: 433,
                        column: 16
                    },
                    end: {
                        line: 435,
                        column: 17
                    }
                }]
            },
            "57": {
                loc: {
                    start: {
                        line: 436,
                        column: 16
                    },
                    end: {
                        line: 438,
                        column: 17
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 436,
                        column: 16
                    },
                    end: {
                        line: 438,
                        column: 17
                    }
                }, {
                    start: {
                        line: 436,
                        column: 16
                    },
                    end: {
                        line: 438,
                        column: 17
                    }
                }]
            },
            "58": {
                loc: {
                    start: {
                        line: 445,
                        column: 12
                    },
                    end: {
                        line: 522,
                        column: 13
                    }
                },
                type: "switch",
                locations: [{
                    start: {
                        line: 446,
                        column: 16
                    },
                    end: {
                        line: 457,
                        column: 25
                    }
                }, {
                    start: {
                        line: 458,
                        column: 16
                    },
                    end: {
                        line: 460,
                        column: 25
                    }
                }, {
                    start: {
                        line: 461,
                        column: 16
                    },
                    end: {
                        line: 463,
                        column: 25
                    }
                }, {
                    start: {
                        line: 464,
                        column: 16
                    },
                    end: {
                        line: 464,
                        column: 33
                    }
                }, {
                    start: {
                        line: 465,
                        column: 16
                    },
                    end: {
                        line: 467,
                        column: 25
                    }
                }, {
                    start: {
                        line: 468,
                        column: 16
                    },
                    end: {
                        line: 470,
                        column: 25
                    }
                }, {
                    start: {
                        line: 471,
                        column: 16
                    },
                    end: {
                        line: 473,
                        column: 25
                    }
                }, {
                    start: {
                        line: 474,
                        column: 16
                    },
                    end: {
                        line: 485,
                        column: 25
                    }
                }, {
                    start: {
                        line: 486,
                        column: 16
                    },
                    end: {
                        line: 488,
                        column: 25
                    }
                }, {
                    start: {
                        line: 489,
                        column: 16
                    },
                    end: {
                        line: 491,
                        column: 25
                    }
                }, {
                    start: {
                        line: 492,
                        column: 16
                    },
                    end: {
                        line: 494,
                        column: 25
                    }
                }, {
                    start: {
                        line: 495,
                        column: 16
                    },
                    end: {
                        line: 501,
                        column: 25
                    }
                }, {
                    start: {
                        line: 502,
                        column: 16
                    },
                    end: {
                        line: 504,
                        column: 25
                    }
                }, {
                    start: {
                        line: 505,
                        column: 16
                    },
                    end: {
                        line: 518,
                        column: 25
                    }
                }, {
                    start: {
                        line: 519,
                        column: 16
                    },
                    end: {
                        line: 521,
                        column: 64
                    }
                }]
            },
            "59": {
                loc: {
                    start: {
                        line: 447,
                        column: 20
                    },
                    end: {
                        line: 456,
                        column: 21
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 447,
                        column: 20
                    },
                    end: {
                        line: 456,
                        column: 21
                    }
                }, {
                    start: {
                        line: 447,
                        column: 20
                    },
                    end: {
                        line: 456,
                        column: 21
                    }
                }]
            },
            "60": {
                loc: {
                    start: {
                        line: 475,
                        column: 20
                    },
                    end: {
                        line: 484,
                        column: 21
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 475,
                        column: 20
                    },
                    end: {
                        line: 484,
                        column: 21
                    }
                }, {
                    start: {
                        line: 475,
                        column: 20
                    },
                    end: {
                        line: 484,
                        column: 21
                    }
                }]
            },
            "61": {
                loc: {
                    start: {
                        line: 507,
                        column: 20
                    },
                    end: {
                        line: 516,
                        column: 21
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 507,
                        column: 20
                    },
                    end: {
                        line: 516,
                        column: 21
                    }
                }, {
                    start: {
                        line: 507,
                        column: 20
                    },
                    end: {
                        line: 516,
                        column: 21
                    }
                }]
            },
            "62": {
                loc: {
                    start: {
                        line: 529,
                        column: 8
                    },
                    end: {
                        line: 531,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 529,
                        column: 8
                    },
                    end: {
                        line: 531,
                        column: 9
                    }
                }, {
                    start: {
                        line: 529,
                        column: 8
                    },
                    end: {
                        line: 531,
                        column: 9
                    }
                }]
            },
            "63": {
                loc: {
                    start: {
                        line: 532,
                        column: 8
                    },
                    end: {
                        line: 536,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 532,
                        column: 8
                    },
                    end: {
                        line: 536,
                        column: 9
                    }
                }, {
                    start: {
                        line: 532,
                        column: 8
                    },
                    end: {
                        line: 536,
                        column: 9
                    }
                }]
            },
            "64": {
                loc: {
                    start: {
                        line: 532,
                        column: 12
                    },
                    end: {
                        line: 532,
                        column: 95
                    }
                },
                type: "binary-expr",
                locations: [{
                    start: {
                        line: 532,
                        column: 12
                    },
                    end: {
                        line: 532,
                        column: 42
                    }
                }, {
                    start: {
                        line: 532,
                        column: 46
                    },
                    end: {
                        line: 532,
                        column: 95
                    }
                }]
            },
            "65": {
                loc: {
                    start: {
                        line: 541,
                        column: 8
                    },
                    end: {
                        line: 543,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 541,
                        column: 8
                    },
                    end: {
                        line: 543,
                        column: 9
                    }
                }, {
                    start: {
                        line: 541,
                        column: 8
                    },
                    end: {
                        line: 543,
                        column: 9
                    }
                }]
            },
            "66": {
                loc: {
                    start: {
                        line: 567,
                        column: 12
                    },
                    end: {
                        line: 572,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 567,
                        column: 12
                    },
                    end: {
                        line: 572,
                        column: 13
                    }
                }, {
                    start: {
                        line: 567,
                        column: 12
                    },
                    end: {
                        line: 572,
                        column: 13
                    }
                }]
            },
            "67": {
                loc: {
                    start: {
                        line: 586,
                        column: 12
                    },
                    end: {
                        line: 596,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 586,
                        column: 12
                    },
                    end: {
                        line: 596,
                        column: 13
                    }
                }, {
                    start: {
                        line: 586,
                        column: 12
                    },
                    end: {
                        line: 596,
                        column: 13
                    }
                }]
            },
            "68": {
                loc: {
                    start: {
                        line: 587,
                        column: 16
                    },
                    end: {
                        line: 591,
                        column: 17
                    }
                },
                type: "binary-expr",
                locations: [{
                    start: {
                        line: 587,
                        column: 16
                    },
                    end: {
                        line: 587,
                        column: 33
                    }
                }, {
                    start: {
                        line: 588,
                        column: 21
                    },
                    end: {
                        line: 588,
                        column: 42
                    }
                }, {
                    start: {
                        line: 588,
                        column: 46
                    },
                    end: {
                        line: 588,
                        column: 60
                    }
                }, {
                    start: {
                        line: 589,
                        column: 21
                    },
                    end: {
                        line: 589,
                        column: 44
                    }
                }, {
                    start: {
                        line: 589,
                        column: 48
                    },
                    end: {
                        line: 589,
                        column: 62
                    }
                }, {
                    start: {
                        line: 590,
                        column: 21
                    },
                    end: {
                        line: 590,
                        column: 46
                    }
                }, {
                    start: {
                        line: 590,
                        column: 50
                    },
                    end: {
                        line: 590,
                        column: 74
                    }
                }, {
                    start: {
                        line: 590,
                        column: 78
                    },
                    end: {
                        line: 590,
                        column: 102
                    }
                }]
            },
            "69": {
                loc: {
                    start: {
                        line: 610,
                        column: 8
                    },
                    end: {
                        line: 612,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 610,
                        column: 8
                    },
                    end: {
                        line: 612,
                        column: 9
                    }
                }, {
                    start: {
                        line: 610,
                        column: 8
                    },
                    end: {
                        line: 612,
                        column: 9
                    }
                }]
            },
            "70": {
                loc: {
                    start: {
                        line: 618,
                        column: 8
                    },
                    end: {
                        line: 620,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 618,
                        column: 8
                    },
                    end: {
                        line: 620,
                        column: 9
                    }
                }, {
                    start: {
                        line: 618,
                        column: 8
                    },
                    end: {
                        line: 620,
                        column: 9
                    }
                }]
            },
            "71": {
                loc: {
                    start: {
                        line: 626,
                        column: 8
                    },
                    end: {
                        line: 632,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 626,
                        column: 8
                    },
                    end: {
                        line: 632,
                        column: 9
                    }
                }, {
                    start: {
                        line: 626,
                        column: 8
                    },
                    end: {
                        line: 632,
                        column: 9
                    }
                }]
            },
            "72": {
                loc: {
                    start: {
                        line: 644,
                        column: 8
                    },
                    end: {
                        line: 646,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 644,
                        column: 8
                    },
                    end: {
                        line: 646,
                        column: 9
                    }
                }, {
                    start: {
                        line: 644,
                        column: 8
                    },
                    end: {
                        line: 646,
                        column: 9
                    }
                }]
            },
            "73": {
                loc: {
                    start: {
                        line: 648,
                        column: 8
                    },
                    end: {
                        line: 650,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 648,
                        column: 8
                    },
                    end: {
                        line: 650,
                        column: 9
                    }
                }, {
                    start: {
                        line: 648,
                        column: 8
                    },
                    end: {
                        line: 650,
                        column: 9
                    }
                }]
            },
            "74": {
                loc: {
                    start: {
                        line: 652,
                        column: 8
                    },
                    end: {
                        line: 654,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 652,
                        column: 8
                    },
                    end: {
                        line: 654,
                        column: 9
                    }
                }, {
                    start: {
                        line: 652,
                        column: 8
                    },
                    end: {
                        line: 654,
                        column: 9
                    }
                }]
            },
            "75": {
                loc: {
                    start: {
                        line: 691,
                        column: 12
                    },
                    end: {
                        line: 699,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 691,
                        column: 12
                    },
                    end: {
                        line: 699,
                        column: 13
                    }
                }, {
                    start: {
                        line: 691,
                        column: 12
                    },
                    end: {
                        line: 699,
                        column: 13
                    }
                }]
            },
            "76": {
                loc: {
                    start: {
                        line: 693,
                        column: 19
                    },
                    end: {
                        line: 699,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 693,
                        column: 19
                    },
                    end: {
                        line: 699,
                        column: 13
                    }
                }, {
                    start: {
                        line: 693,
                        column: 19
                    },
                    end: {
                        line: 699,
                        column: 13
                    }
                }]
            },
            "77": {
                loc: {
                    start: {
                        line: 695,
                        column: 19
                    },
                    end: {
                        line: 699,
                        column: 13
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 695,
                        column: 19
                    },
                    end: {
                        line: 699,
                        column: 13
                    }
                }, {
                    start: {
                        line: 695,
                        column: 19
                    },
                    end: {
                        line: 699,
                        column: 13
                    }
                }]
            },
            "78": {
                loc: {
                    start: {
                        line: 707,
                        column: 6
                    },
                    end: {
                        line: 707,
                        column: 29
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 707,
                        column: 6
                    },
                    end: {
                        line: 707,
                        column: 29
                    }
                }, {
                    start: {
                        line: 707,
                        column: 6
                    },
                    end: {
                        line: 707,
                        column: 29
                    }
                }]
            },
            "79": {
                loc: {
                    start: {
                        line: 725,
                        column: 13
                    },
                    end: {
                        line: 725,
                        column: 91
                    }
                },
                type: "binary-expr",
                locations: [{
                    start: {
                        line: 725,
                        column: 14
                    },
                    end: {
                        line: 725,
                        column: 42
                    }
                }, {
                    start: {
                        line: 725,
                        column: 48
                    },
                    end: {
                        line: 725,
                        column: 90
                    }
                }]
            },
            "80": {
                loc: {
                    start: {
                        line: 729,
                        column: 13
                    },
                    end: {
                        line: 729,
                        column: 55
                    }
                },
                type: "binary-expr",
                locations: [{
                    start: {
                        line: 729,
                        column: 13
                    },
                    end: {
                        line: 729,
                        column: 41
                    }
                }, {
                    start: {
                        line: 729,
                        column: 45
                    },
                    end: {
                        line: 729,
                        column: 55
                    }
                }]
            },
            "81": {
                loc: {
                    start: {
                        line: 730,
                        column: 8
                    },
                    end: {
                        line: 736,
                        column: 9
                    }
                },
                type: "switch",
                locations: [{
                    start: {
                        line: 731,
                        column: 10
                    },
                    end: {
                        line: 733,
                        column: 17
                    }
                }, {
                    start: {
                        line: 734,
                        column: 10
                    },
                    end: {
                        line: 735,
                        column: 23
                    }
                }]
            },
            "82": {
                loc: {
                    start: {
                        line: 741,
                        column: 6
                    },
                    end: {
                        line: 741,
                        column: 34
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 741,
                        column: 6
                    },
                    end: {
                        line: 741,
                        column: 34
                    }
                }, {
                    start: {
                        line: 741,
                        column: 6
                    },
                    end: {
                        line: 741,
                        column: 34
                    }
                }]
            },
            "83": {
                loc: {
                    start: {
                        line: 755,
                        column: 8
                    },
                    end: {
                        line: 755,
                        column: 37
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 755,
                        column: 8
                    },
                    end: {
                        line: 755,
                        column: 37
                    }
                }, {
                    start: {
                        line: 755,
                        column: 8
                    },
                    end: {
                        line: 755,
                        column: 37
                    }
                }]
            },
            "84": {
                loc: {
                    start: {
                        line: 757,
                        column: 8
                    },
                    end: {
                        line: 757,
                        column: 30
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 757,
                        column: 8
                    },
                    end: {
                        line: 757,
                        column: 30
                    }
                }, {
                    start: {
                        line: 757,
                        column: 8
                    },
                    end: {
                        line: 757,
                        column: 30
                    }
                }]
            },
            "85": {
                loc: {
                    start: {
                        line: 761,
                        column: 21
                    },
                    end: {
                        line: 761,
                        column: 84
                    }
                },
                type: "cond-expr",
                locations: [{
                    start: {
                        line: 761,
                        column: 34
                    },
                    end: {
                        line: 761,
                        column: 79
                    }
                }, {
                    start: {
                        line: 761,
                        column: 82
                    },
                    end: {
                        line: 761,
                        column: 84
                    }
                }]
            },
            "86": {
                loc: {
                    start: {
                        line: 766,
                        column: 8
                    },
                    end: {
                        line: 766,
                        column: 37
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 766,
                        column: 8
                    },
                    end: {
                        line: 766,
                        column: 37
                    }
                }, {
                    start: {
                        line: 766,
                        column: 8
                    },
                    end: {
                        line: 766,
                        column: 37
                    }
                }]
            },
            "87": {
                loc: {
                    start: {
                        line: 774,
                        column: 8
                    },
                    end: {
                        line: 779,
                        column: 9
                    }
                },
                type: "if",
                locations: [{
                    start: {
                        line: 774,
                        column: 8
                    },
                    end: {
                        line: 779,
                        column: 9
                    }
                }, {
                    start: {
                        line: 774,
                        column: 8
                    },
                    end: {
                        line: 779,
                        column: 9
                    }
                }]
            },
            "88": {
                loc: {
                    start: {
                        line: 781,
                        column: 8
                    },
                    end: {
                        line: 793,
                        column: 9
                    }
                },
                type: "switch",
                locations: [{
                    start: {
                        line: 782,
                        column: 10
                    },
                    end: {
                        line: 784,
                        column: 17
                    }
                }, {
                    start: {
                        line: 785,
                        column: 10
                    },
                    end: {
                        line: 788,
                        column: 17
                    }
                }, {
                    start: {
                        line: 789,
                        column: 10
                    },
                    end: {
                        line: 792,
                        column: 17
                    }
                }]
            }
        },
        s: {
            "0": 0,
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0,
            "5": 0,
            "6": 0,
            "7": 0,
            "8": 0,
            "9": 0,
            "10": 0,
            "11": 0,
            "12": 0,
            "13": 0,
            "14": 0,
            "15": 0,
            "16": 0,
            "17": 0,
            "18": 0,
            "19": 0,
            "20": 0,
            "21": 0,
            "22": 0,
            "23": 0,
            "24": 0,
            "25": 0,
            "26": 0,
            "27": 0,
            "28": 0,
            "29": 0,
            "30": 0,
            "31": 0,
            "32": 0,
            "33": 0,
            "34": 0,
            "35": 0,
            "36": 0,
            "37": 0,
            "38": 0,
            "39": 0,
            "40": 0,
            "41": 0,
            "42": 0,
            "43": 0,
            "44": 0,
            "45": 0,
            "46": 0,
            "47": 0,
            "48": 0,
            "49": 0,
            "50": 0,
            "51": 0,
            "52": 0,
            "53": 0,
            "54": 0,
            "55": 0,
            "56": 0,
            "57": 0,
            "58": 0,
            "59": 0,
            "60": 0,
            "61": 0,
            "62": 0,
            "63": 0,
            "64": 0,
            "65": 0,
            "66": 0,
            "67": 0,
            "68": 0,
            "69": 0,
            "70": 0,
            "71": 0,
            "72": 0,
            "73": 0,
            "74": 0,
            "75": 0,
            "76": 0,
            "77": 0,
            "78": 0,
            "79": 0,
            "80": 0,
            "81": 0,
            "82": 0,
            "83": 0,
            "84": 0,
            "85": 0,
            "86": 0,
            "87": 0,
            "88": 0,
            "89": 0,
            "90": 0,
            "91": 0,
            "92": 0,
            "93": 0,
            "94": 0,
            "95": 0,
            "96": 0,
            "97": 0,
            "98": 0,
            "99": 0,
            "100": 0,
            "101": 0,
            "102": 0,
            "103": 0,
            "104": 0,
            "105": 0,
            "106": 0,
            "107": 0,
            "108": 0,
            "109": 0,
            "110": 0,
            "111": 0,
            "112": 0,
            "113": 0,
            "114": 0,
            "115": 0,
            "116": 0,
            "117": 0,
            "118": 0,
            "119": 0,
            "120": 0,
            "121": 0,
            "122": 0,
            "123": 0,
            "124": 0,
            "125": 0,
            "126": 0,
            "127": 0,
            "128": 0,
            "129": 0,
            "130": 0,
            "131": 0,
            "132": 0,
            "133": 0,
            "134": 0,
            "135": 0,
            "136": 0,
            "137": 0,
            "138": 0,
            "139": 0,
            "140": 0,
            "141": 0,
            "142": 0,
            "143": 0,
            "144": 0,
            "145": 0,
            "146": 0,
            "147": 0,
            "148": 0,
            "149": 0,
            "150": 0,
            "151": 0,
            "152": 0,
            "153": 0,
            "154": 0,
            "155": 0,
            "156": 0,
            "157": 0,
            "158": 0,
            "159": 0,
            "160": 0,
            "161": 0,
            "162": 0,
            "163": 0,
            "164": 0,
            "165": 0,
            "166": 0,
            "167": 0,
            "168": 0,
            "169": 0,
            "170": 0,
            "171": 0,
            "172": 0,
            "173": 0,
            "174": 0,
            "175": 0,
            "176": 0,
            "177": 0,
            "178": 0,
            "179": 0,
            "180": 0,
            "181": 0,
            "182": 0,
            "183": 0,
            "184": 0,
            "185": 0,
            "186": 0,
            "187": 0,
            "188": 0,
            "189": 0,
            "190": 0,
            "191": 0,
            "192": 0,
            "193": 0,
            "194": 0,
            "195": 0,
            "196": 0,
            "197": 0,
            "198": 0,
            "199": 0,
            "200": 0,
            "201": 0,
            "202": 0,
            "203": 0,
            "204": 0,
            "205": 0,
            "206": 0,
            "207": 0,
            "208": 0,
            "209": 0,
            "210": 0,
            "211": 0,
            "212": 0,
            "213": 0,
            "214": 0,
            "215": 0,
            "216": 0,
            "217": 0,
            "218": 0,
            "219": 0,
            "220": 0,
            "221": 0,
            "222": 0,
            "223": 0,
            "224": 0,
            "225": 0,
            "226": 0,
            "227": 0,
            "228": 0,
            "229": 0,
            "230": 0,
            "231": 0,
            "232": 0,
            "233": 0,
            "234": 0,
            "235": 0,
            "236": 0,
            "237": 0,
            "238": 0,
            "239": 0,
            "240": 0,
            "241": 0,
            "242": 0,
            "243": 0,
            "244": 0,
            "245": 0,
            "246": 0,
            "247": 0,
            "248": 0,
            "249": 0,
            "250": 0,
            "251": 0,
            "252": 0,
            "253": 0,
            "254": 0,
            "255": 0,
            "256": 0,
            "257": 0,
            "258": 0,
            "259": 0,
            "260": 0,
            "261": 0,
            "262": 0,
            "263": 0,
            "264": 0,
            "265": 0,
            "266": 0,
            "267": 0,
            "268": 0,
            "269": 0,
            "270": 0,
            "271": 0,
            "272": 0,
            "273": 0,
            "274": 0,
            "275": 0,
            "276": 0,
            "277": 0,
            "278": 0,
            "279": 0,
            "280": 0,
            "281": 0,
            "282": 0,
            "283": 0,
            "284": 0,
            "285": 0,
            "286": 0,
            "287": 0,
            "288": 0,
            "289": 0,
            "290": 0,
            "291": 0,
            "292": 0,
            "293": 0,
            "294": 0,
            "295": 0,
            "296": 0,
            "297": 0,
            "298": 0,
            "299": 0,
            "300": 0,
            "301": 0,
            "302": 0,
            "303": 0,
            "304": 0,
            "305": 0,
            "306": 0,
            "307": 0,
            "308": 0,
            "309": 0,
            "310": 0,
            "311": 0,
            "312": 0,
            "313": 0,
            "314": 0,
            "315": 0,
            "316": 0,
            "317": 0,
            "318": 0,
            "319": 0,
            "320": 0,
            "321": 0,
            "322": 0,
            "323": 0,
            "324": 0,
            "325": 0,
            "326": 0,
            "327": 0,
            "328": 0,
            "329": 0,
            "330": 0,
            "331": 0,
            "332": 0,
            "333": 0,
            "334": 0,
            "335": 0,
            "336": 0,
            "337": 0,
            "338": 0,
            "339": 0,
            "340": 0,
            "341": 0,
            "342": 0,
            "343": 0,
            "344": 0,
            "345": 0,
            "346": 0,
            "347": 0,
            "348": 0,
            "349": 0,
            "350": 0,
            "351": 0,
            "352": 0,
            "353": 0,
            "354": 0,
            "355": 0,
            "356": 0,
            "357": 0,
            "358": 0,
            "359": 0,
            "360": 0,
            "361": 0,
            "362": 0,
            "363": 0
        },
        f: {
            "0": 0,
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0,
            "5": 0,
            "6": 0,
            "7": 0,
            "8": 0,
            "9": 0,
            "10": 0,
            "11": 0,
            "12": 0,
            "13": 0,
            "14": 0,
            "15": 0,
            "16": 0,
            "17": 0,
            "18": 0,
            "19": 0,
            "20": 0,
            "21": 0,
            "22": 0,
            "23": 0,
            "24": 0,
            "25": 0,
            "26": 0,
            "27": 0,
            "28": 0,
            "29": 0,
            "30": 0,
            "31": 0,
            "32": 0,
            "33": 0,
            "34": 0,
            "35": 0,
            "36": 0,
            "37": 0,
            "38": 0,
            "39": 0,
            "40": 0,
            "41": 0,
            "42": 0,
            "43": 0,
            "44": 0,
            "45": 0
        },
        b: {
            "0": [0],
            "1": [0, 0, 0, 0],
            "2": [0, 0],
            "3": [0, 0],
            "4": [0, 0],
            "5": [0, 0],
            "6": [0, 0],
            "7": [0, 0],
            "8": [0, 0],
            "9": [0, 0],
            "10": [0, 0],
            "11": [0, 0],
            "12": [0, 0],
            "13": [0, 0],
            "14": [0, 0],
            "15": [0, 0],
            "16": [0, 0],
            "17": [0, 0],
            "18": [0, 0],
            "19": [0, 0],
            "20": [0, 0],
            "21": [0, 0],
            "22": [0, 0],
            "23": [0, 0],
            "24": [0, 0],
            "25": [0, 0],
            "26": [0, 0],
            "27": [0, 0],
            "28": [0, 0],
            "29": [0, 0],
            "30": [0, 0],
            "31": [0, 0],
            "32": [0, 0],
            "33": [0, 0],
            "34": [0, 0],
            "35": [0, 0],
            "36": [0, 0],
            "37": [0, 0],
            "38": [0, 0],
            "39": [0, 0],
            "40": [0, 0],
            "41": [0, 0],
            "42": [0, 0],
            "43": [0, 0],
            "44": [0, 0],
            "45": [0, 0, 0],
            "46": [0, 0],
            "47": [0, 0],
            "48": [0, 0],
            "49": [0, 0],
            "50": [0, 0],
            "51": [0, 0],
            "52": [0, 0],
            "53": [0, 0],
            "54": [0, 0],
            "55": [0, 0],
            "56": [0, 0],
            "57": [0, 0],
            "58": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            "59": [0, 0],
            "60": [0, 0],
            "61": [0, 0],
            "62": [0, 0],
            "63": [0, 0],
            "64": [0, 0],
            "65": [0, 0],
            "66": [0, 0],
            "67": [0, 0],
            "68": [0, 0, 0, 0, 0, 0, 0, 0],
            "69": [0, 0],
            "70": [0, 0],
            "71": [0, 0],
            "72": [0, 0],
            "73": [0, 0],
            "74": [0, 0],
            "75": [0, 0],
            "76": [0, 0],
            "77": [0, 0],
            "78": [0, 0],
            "79": [0, 0],
            "80": [0, 0],
            "81": [0, 0],
            "82": [0, 0],
            "83": [0, 0],
            "84": [0, 0],
            "85": [0, 0],
            "86": [0, 0],
            "87": [0, 0],
            "88": [0, 0, 0]
        },
        _coverageSchema: "332fd63041d2c1bcb487cc26dd0d5f7d97098a6c"
    },
        coverage = global[gcv] || (global[gcv] = {});

    if (coverage[path] && coverage[path].hash === hash) {
        return coverage[path];
    }

    coverageData.hash = hash;
    return coverage[path] = coverageData;
}();

var _const = require("../const");

var _const2 = require("./const");

var _nameParser = require("./name-parser");

var _literalParser = require("./literal-parser");

var _tools = require("./tools");

var _parser = require("../../lib/edtf/src/parser");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Parses files in BibTeX/BibLaTeX format
 */

/* Based on original work by Henrik Muehe (c) 2010,
 * licensed under the MIT license,
 * https://code.google.com/archive/p/bibtex-js/
 */

/* Config options (default value for every option is false)
   - rawFields (false/true):
   Adds a `raw_fields` object to each entry which contains all fields with only
  TeX character replacement and no other processing.
   - processUnexpected (false/true):
   Processes fields with names that are known, but are not expected for the given bibtype,
  adding them to an `unexpected_fields` object to each entry.
   - processUnknown (false/true/object [specifying content type for specific unknown]):
   Processes fields with names that are unknown, adding them to an `unknown_fields`
  object to each entry.
   example:
      > a = new BibLatexParser(..., {processUnknown: true})
      > a.output
      {
          "0:": {
              ...
              unknown_fields: {
                  ...
              }
          }
      }
       > a = new BibLatexParser(..., {processUnknown: {commentator: 'l_name'}})
      > a.output
      {
          "0:": {
              ...
              unknown_fields: {
                  commentator: [
                      {
                          given: ...,
                          family: ...
                      }
                  ]
                  ...
              }
          }
      }
*/

var BibLatexParser = exports.BibLatexParser = function () {
    function BibLatexParser(input) {
        var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (++cov_1nqd9talwx.b[0][0], {});
        (0, _classCallCheck3.default)(this, BibLatexParser);
        ++cov_1nqd9talwx.f[0];
        ++cov_1nqd9talwx.s[0];

        this.input = input;
        ++cov_1nqd9talwx.s[1];
        this.config = config;
        ++cov_1nqd9talwx.s[2];
        this.pos = 0;
        ++cov_1nqd9talwx.s[3];
        this.entries = [];
        ++cov_1nqd9talwx.s[4];
        this.bibDB = {};
        ++cov_1nqd9talwx.s[5];
        this.currentKey = false;
        ++cov_1nqd9talwx.s[6];
        this.currentEntry = false;
        ++cov_1nqd9talwx.s[7];
        this.currentType = "";
        ++cov_1nqd9talwx.s[8];
        this.errors = [];
        ++cov_1nqd9talwx.s[9];
        this.warnings = [];
        // These variables are expected to be defined by some bibtex sources.
        ++cov_1nqd9talwx.s[10];
        this.variables = {
            JAN: "January",
            FEB: "February",
            MAR: "March",
            APR: "April",
            MAY: "May",
            JUN: "June",
            JUL: "July",
            AUG: "August",
            SEP: "September",
            OCT: "October",
            NOV: "November",
            DEC: "December"
        };
    }

    (0, _createClass3.default)(BibLatexParser, [{
        key: "isWhitespace",
        value: function isWhitespace(s) {
            ++cov_1nqd9talwx.f[1];
            ++cov_1nqd9talwx.s[11];

            return (++cov_1nqd9talwx.b[1][0], s == ' ') || (++cov_1nqd9talwx.b[1][1], s == '\r') || (++cov_1nqd9talwx.b[1][2], s == '\t') || (++cov_1nqd9talwx.b[1][3], s == '\n');
        }
    }, {
        key: "match",
        value: function match(s) {
            ++cov_1nqd9talwx.f[2];
            ++cov_1nqd9talwx.s[12];

            this.skipWhitespace();
            ++cov_1nqd9talwx.s[13];
            if (this.input.substring(this.pos, this.pos + s.length) == s) {
                ++cov_1nqd9talwx.b[2][0];
                ++cov_1nqd9talwx.s[14];

                this.pos += s.length;
            } else {
                ++cov_1nqd9talwx.b[2][1];
                ++cov_1nqd9talwx.s[15];


                this.errors.push({
                    type: 'token_mismatch',
                    expected: s,
                    found: this.input.substring(this.pos, this.pos + s.length)
                });
            }
            ++cov_1nqd9talwx.s[16];
            this.skipWhitespace();
        }
    }, {
        key: "tryMatch",
        value: function tryMatch(s) {
            ++cov_1nqd9talwx.f[3];
            ++cov_1nqd9talwx.s[17];

            this.skipWhitespace();
            ++cov_1nqd9talwx.s[18];
            if (this.input.substring(this.pos, this.pos + s.length) == s) {
                ++cov_1nqd9talwx.b[3][0];
                ++cov_1nqd9talwx.s[19];

                return true;
            } else {
                ++cov_1nqd9talwx.b[3][1];
                ++cov_1nqd9talwx.s[20];

                return false;
            }
            ++cov_1nqd9talwx.s[21];
            this.skipWhitespace();
        }
    }, {
        key: "skipWhitespace",
        value: function skipWhitespace() {
            ++cov_1nqd9talwx.f[4];
            ++cov_1nqd9talwx.s[22];

            while (this.isWhitespace(this.input[this.pos])) {
                ++cov_1nqd9talwx.s[23];

                this.pos++;
            }
            ++cov_1nqd9talwx.s[24];
            if (this.input[this.pos] == "%") {
                ++cov_1nqd9talwx.b[4][0];
                ++cov_1nqd9talwx.s[25];

                while (this.input[this.pos] != "\n") {
                    ++cov_1nqd9talwx.s[26];

                    this.pos++;
                }
                ++cov_1nqd9talwx.s[27];
                this.skipWhitespace();
            } else {
                ++cov_1nqd9talwx.b[4][1];
            }
        }
    }, {
        key: "skipToNext",
        value: function skipToNext() {
            ++cov_1nqd9talwx.f[5];
            ++cov_1nqd9talwx.s[28];

            while ((++cov_1nqd9talwx.b[5][0], this.input.length > this.pos) && (++cov_1nqd9talwx.b[5][1], this.input[this.pos] != "@")) {
                ++cov_1nqd9talwx.s[29];

                this.pos++;
            }
            ++cov_1nqd9talwx.s[30];
            if (this.input.length == this.pos) {
                ++cov_1nqd9talwx.b[6][0];
                ++cov_1nqd9talwx.s[31];

                return false;
            } else {
                ++cov_1nqd9talwx.b[6][1];
                ++cov_1nqd9talwx.s[32];

                return true;
            }
        }
    }, {
        key: "valueBraces",
        value: function valueBraces() {
            ++cov_1nqd9talwx.f[6];

            var bracecount = (++cov_1nqd9talwx.s[33], 0);
            ++cov_1nqd9talwx.s[34];
            this.match("{");
            var start = (++cov_1nqd9talwx.s[35], this.pos);
            ++cov_1nqd9talwx.s[36];
            while (true) {
                ++cov_1nqd9talwx.s[37];

                if ((++cov_1nqd9talwx.b[8][0], this.input[this.pos] == '}') && (++cov_1nqd9talwx.b[8][1], this.input[this.pos - 1] != '\\')) {
                    ++cov_1nqd9talwx.b[7][0];
                    ++cov_1nqd9talwx.s[38];

                    if (bracecount > 0) {
                        ++cov_1nqd9talwx.b[9][0];
                        ++cov_1nqd9talwx.s[39];

                        bracecount--;
                    } else {
                        ++cov_1nqd9talwx.b[9][1];

                        var end = (++cov_1nqd9talwx.s[40], this.pos);
                        ++cov_1nqd9talwx.s[41];
                        this.match("}");
                        ++cov_1nqd9talwx.s[42];
                        return this.input.substring(start, end);
                    }
                } else {
                        ++cov_1nqd9talwx.b[7][1];
                        ++cov_1nqd9talwx.s[43];
                        if ((++cov_1nqd9talwx.b[11][0], this.input[this.pos] == '{') && (++cov_1nqd9talwx.b[11][1], this.input[this.pos - 1] != '\\')) {
                            ++cov_1nqd9talwx.b[10][0];
                            ++cov_1nqd9talwx.s[44];

                            bracecount++;
                        } else {
                                ++cov_1nqd9talwx.b[10][1];
                                ++cov_1nqd9talwx.s[45];
                                if (this.pos == this.input.length - 1) {
                                    ++cov_1nqd9talwx.b[12][0];
                                    ++cov_1nqd9talwx.s[46];

                                    this.errors.push({ type: 'unexpected_eof' });
                                } else {
                                    ++cov_1nqd9talwx.b[12][1];
                                }
                            }
                    }++cov_1nqd9talwx.s[47];
                this.pos++;
            }
        }
    }, {
        key: "valueQuotes",
        value: function valueQuotes() {
            ++cov_1nqd9talwx.f[7];
            ++cov_1nqd9talwx.s[48];

            this.match('"');
            var start = (++cov_1nqd9talwx.s[49], this.pos);
            ++cov_1nqd9talwx.s[50];
            while (this.pos < this.input.length) {
                ++cov_1nqd9talwx.s[51];

                if ((++cov_1nqd9talwx.b[14][0], this.input[this.pos] === '"') && (++cov_1nqd9talwx.b[14][1], this.input[this.pos - 1] != '\\')) {
                    ++cov_1nqd9talwx.b[13][0];

                    var end = (++cov_1nqd9talwx.s[52], this.pos);
                    ++cov_1nqd9talwx.s[53];
                    this.match('"');
                    ++cov_1nqd9talwx.s[54];
                    return this.input.substring(start, end);
                } else {
                        ++cov_1nqd9talwx.b[13][1];
                        ++cov_1nqd9talwx.s[55];
                        if (this.pos == this.input.length - 1) {
                            ++cov_1nqd9talwx.b[15][0];
                            ++cov_1nqd9talwx.s[56];

                            this.errors.push({
                                type: 'unterminated_value',
                                value: this.input.substring(start)
                            });
                        } else {
                            ++cov_1nqd9talwx.b[15][1];
                        }
                    }++cov_1nqd9talwx.s[57];
                this.pos++;
            }
        }
    }, {
        key: "singleValue",
        value: function singleValue() {
            ++cov_1nqd9talwx.f[8];

            var start = (++cov_1nqd9talwx.s[58], this.pos);
            ++cov_1nqd9talwx.s[59];
            if (this.tryMatch("{")) {
                ++cov_1nqd9talwx.b[16][0];
                ++cov_1nqd9talwx.s[60];

                return this.valueBraces();
            } else {
                    ++cov_1nqd9talwx.b[16][1];
                    ++cov_1nqd9talwx.s[61];
                    if (this.tryMatch('"')) {
                        ++cov_1nqd9talwx.b[17][0];
                        ++cov_1nqd9talwx.s[62];

                        return this.valueQuotes();
                    } else {
                        ++cov_1nqd9talwx.b[17][1];

                        var k = (++cov_1nqd9talwx.s[63], this.key());
                        ++cov_1nqd9talwx.s[64];
                        if (this.variables[k.toUpperCase()]) {
                            ++cov_1nqd9talwx.b[18][0];
                            ++cov_1nqd9talwx.s[65];

                            return this.variables[k.toUpperCase()];
                        } else {
                                ++cov_1nqd9talwx.b[18][1];
                                ++cov_1nqd9talwx.s[66];
                                if (k.match("^[0-9]+$")) {
                                    ++cov_1nqd9talwx.b[19][0];
                                    ++cov_1nqd9talwx.s[67];

                                    return k;
                                } else {
                                    ++cov_1nqd9talwx.b[19][1];
                                    ++cov_1nqd9talwx.s[68];

                                    this.warnings.push({
                                        type: 'undefined_variable',
                                        entry: this.currentEntry['entry_key'],
                                        key: this.currentKey,
                                        variable: k
                                    });
                                    ++cov_1nqd9talwx.s[69];
                                    return "%" + k + "%"; // Using % as a delimiter for variables as they cannot be used in regular latex code.
                                }
                            }
                    }
                }
        }
    }, {
        key: "value",
        value: function value() {
            ++cov_1nqd9talwx.f[9];

            var values = (++cov_1nqd9talwx.s[70], []);
            ++cov_1nqd9talwx.s[71];
            values.push(this.singleValue());
            ++cov_1nqd9talwx.s[72];
            while (this.tryMatch("#")) {
                ++cov_1nqd9talwx.s[73];

                this.match("#");
                ++cov_1nqd9talwx.s[74];
                values.push(this.singleValue());
            }
            ++cov_1nqd9talwx.s[75];
            return values.join("");
        }
    }, {
        key: "key",
        value: function key(optional) {
            ++cov_1nqd9talwx.f[10];

            var start = (++cov_1nqd9talwx.s[76], this.pos);
            ++cov_1nqd9talwx.s[77];
            while (true) {
                ++cov_1nqd9talwx.s[78];

                if (this.pos == this.input.length) {
                    ++cov_1nqd9talwx.b[20][0];
                    ++cov_1nqd9talwx.s[79];

                    this.errors.push({ type: 'runaway_key' });
                    ++cov_1nqd9talwx.s[80];
                    return;
                } else {
                    ++cov_1nqd9talwx.b[20][1];
                }
                ++cov_1nqd9talwx.s[81];
                if ([',', '{', '}', ' ', '='].includes(this.input[this.pos])) {
                    ++cov_1nqd9talwx.b[21][0];
                    ++cov_1nqd9talwx.s[82];

                    if ((++cov_1nqd9talwx.b[23][0], optional) && (++cov_1nqd9talwx.b[23][1], this.input[this.pos] != ',')) {
                        ++cov_1nqd9talwx.b[22][0];
                        ++cov_1nqd9talwx.s[83];

                        this.pos = start;
                        ++cov_1nqd9talwx.s[84];
                        return null;
                    } else {
                        ++cov_1nqd9talwx.b[22][1];
                    }
                    ++cov_1nqd9talwx.s[85];
                    return this.input.substring(start, this.pos);
                } else {
                    ++cov_1nqd9talwx.b[21][1];
                    ++cov_1nqd9talwx.s[86];

                    this.pos++;
                }
            }
        }
    }, {
        key: "keyEqualsValue",
        value: function keyEqualsValue() {
            ++cov_1nqd9talwx.f[11];

            var key = (++cov_1nqd9talwx.s[87], this.key());
            ++cov_1nqd9talwx.s[88];
            if (!key) {
                ++cov_1nqd9talwx.b[24][0];
                ++cov_1nqd9talwx.s[89];

                this.errors.push({
                    type: 'cut_off_citation',
                    entry: this.currentEntry['entry_key']
                });
                // The citation is not full, we remove the existing parts.
                ++cov_1nqd9talwx.s[90];
                this.currentEntry['incomplete'] = true;
                ++cov_1nqd9talwx.s[91];
                return;
            } else {
                ++cov_1nqd9talwx.b[24][1];
            }
            ++cov_1nqd9talwx.s[92];
            this.currentKey = key.toLowerCase();
            ++cov_1nqd9talwx.s[93];
            if (this.tryMatch("=")) {
                ++cov_1nqd9talwx.b[25][0];
                ++cov_1nqd9talwx.s[94];

                this.match("=");
                var val = (++cov_1nqd9talwx.s[95], this.value());
                ++cov_1nqd9talwx.s[96];
                return [this.currentKey, val];
            } else {
                ++cov_1nqd9talwx.b[25][1];
                ++cov_1nqd9talwx.s[97];

                this.errors.push({
                    type: 'missing_equal_sign',
                    key: this.currentKey,
                    entry: this.currentEntry['entry_key']
                });
            }
        }
    }, {
        key: "keyValueList",
        value: function keyValueList() {
            ++cov_1nqd9talwx.f[12];

            var kv = (++cov_1nqd9talwx.s[98], this.keyEqualsValue());
            ++cov_1nqd9talwx.s[99];
            if (typeof kv === 'undefined') {
                ++cov_1nqd9talwx.b[26][0];
                ++cov_1nqd9talwx.s[100];

                // Entry has no fields, so we delete it.
                // It was the last one pushed, so we remove the last one
                this.entries.pop();
                ++cov_1nqd9talwx.s[101];
                return;
            } else {
                ++cov_1nqd9talwx.b[26][1];
            }
            var rawFields = (++cov_1nqd9talwx.s[102], this.currentRawFields);
            ++cov_1nqd9talwx.s[103];
            rawFields[kv[0]] = kv[1];
            ++cov_1nqd9talwx.s[104];
            while (this.tryMatch(",")) {
                ++cov_1nqd9talwx.s[105];

                this.match(",");
                //fixes problems with commas at the end of a list
                ++cov_1nqd9talwx.s[106];
                if (this.tryMatch("}")) {
                    ++cov_1nqd9talwx.b[27][0];
                    ++cov_1nqd9talwx.s[107];

                    break;
                } else {
                    ++cov_1nqd9talwx.b[27][1];
                }
                ++cov_1nqd9talwx.s[108];
                kv = this.keyEqualsValue();
                ++cov_1nqd9talwx.s[109];
                if (typeof kv === 'undefined') {
                    ++cov_1nqd9talwx.b[28][0];
                    ++cov_1nqd9talwx.s[110];

                    this.errors.push({
                        type: 'key_value_error',
                        entry: this.currentEntry['entry_key']
                    });
                    ++cov_1nqd9talwx.s[111];
                    break;
                } else {
                    ++cov_1nqd9talwx.b[28][1];
                }
                ++cov_1nqd9talwx.s[112];
                rawFields[kv[0]] = kv[1];
            }
        }
    }, {
        key: "processFields",
        value: function processFields() {
            var _this = this;

            ++cov_1nqd9talwx.f[13];

            var that = (++cov_1nqd9talwx.s[113], this);
            var rawFields = (++cov_1nqd9talwx.s[114], this.currentRawFields);
            var fields = (++cov_1nqd9talwx.s[115], this.currentEntry['fields']);

            // date may come either as year, year + month or as date field.
            // We therefore need to catch these hear and transform it to the
            // date field after evaluating all the fields.
            // All other date fields only come in the form of a date string.

            var date = void 0;
            ++cov_1nqd9talwx.s[116];
            if (rawFields.date) {
                ++cov_1nqd9talwx.b[29][0];
                ++cov_1nqd9talwx.s[117];

                // date string has precedence.
                date = rawFields.date;
            } else {
                    ++cov_1nqd9talwx.b[29][1];
                    ++cov_1nqd9talwx.s[118];
                    if ((++cov_1nqd9talwx.b[31][0], rawFields.year) && (++cov_1nqd9talwx.b[31][1], rawFields.month)) {
                        ++cov_1nqd9talwx.b[30][0];
                        ++cov_1nqd9talwx.s[119];

                        date = rawFields.year + "-" + rawFields.month;
                    } else {
                            ++cov_1nqd9talwx.b[30][1];
                            ++cov_1nqd9talwx.s[120];
                            if (rawFields.year) {
                                ++cov_1nqd9talwx.b[32][0];
                                ++cov_1nqd9talwx.s[121];

                                date = "" + rawFields.year;
                            } else {
                                ++cov_1nqd9talwx.b[32][1];
                            }
                        }
                }++cov_1nqd9talwx.s[122];
            if (date) {
                ++cov_1nqd9talwx.b[33][0];
                ++cov_1nqd9talwx.s[123];

                if (this._checkDate(date)) {
                    ++cov_1nqd9talwx.b[34][0];
                    ++cov_1nqd9talwx.s[124];

                    fields['date'] = date;
                } else {
                    ++cov_1nqd9talwx.b[34][1];

                    var fieldName = void 0,
                        value = void 0,
                        errorList = void 0;
                    ++cov_1nqd9talwx.s[125];
                    if (rawFields.date) {
                        ++cov_1nqd9talwx.b[35][0];
                        ++cov_1nqd9talwx.s[126];

                        fieldName = 'date';
                        ++cov_1nqd9talwx.s[127];
                        value = rawFields.date;
                        ++cov_1nqd9talwx.s[128];
                        errorList = this.errors;
                    } else {
                            ++cov_1nqd9talwx.b[35][1];
                            ++cov_1nqd9talwx.s[129];
                            if ((++cov_1nqd9talwx.b[37][0], rawFields.year) && (++cov_1nqd9talwx.b[37][1], rawFields.month)) {
                                ++cov_1nqd9talwx.b[36][0];
                                ++cov_1nqd9talwx.s[130];

                                fieldName = 'year,month';
                                ++cov_1nqd9talwx.s[131];
                                value = [rawFields.year, rawFields.month];
                                ++cov_1nqd9talwx.s[132];
                                errorList = this.warnings;
                            } else {
                                ++cov_1nqd9talwx.b[36][1];
                                ++cov_1nqd9talwx.s[133];

                                fieldName = 'year';
                                ++cov_1nqd9talwx.s[134];
                                value = rawFields.year;
                                ++cov_1nqd9talwx.s[135];
                                errorList = this.warnings;
                            }
                        }++cov_1nqd9talwx.s[136];
                    errorList.push({
                        type: 'unknown_date',
                        entry: this.currentEntry['entry_key'],
                        field_name: fieldName,
                        value: value
                    });
                }
            } else {
                ++cov_1nqd9talwx.b[33][1];
            }
            // Check for English language. If the citation is in English language,
            // titles may use case preservation.
            var langEnglish = (++cov_1nqd9talwx.s[137], true); // By default we assume everything to be written in English.
            ++cov_1nqd9talwx.s[138];
            if ((++cov_1nqd9talwx.b[39][0], rawFields.langid) && (++cov_1nqd9talwx.b[39][1], rawFields.langid.length)) {
                (function () {
                    ++cov_1nqd9talwx.b[38][0];

                    var langString = (++cov_1nqd9talwx.s[139], rawFields.langid.toLowerCase().trim());
                    var englishOptions = (++cov_1nqd9talwx.s[140], ['english', 'american', 'british', 'usenglish', 'ukenglish', 'canadian', 'australian', 'newzealand']);
                    ++cov_1nqd9talwx.s[141];
                    if (!englishOptions.some(function (option) {
                        ++cov_1nqd9talwx.f[14];
                        ++cov_1nqd9talwx.s[142];
                        return langString === option;
                    })) {
                        ++cov_1nqd9talwx.b[40][0];
                        ++cov_1nqd9talwx.s[143];

                        langEnglish = false;
                    } else {
                        ++cov_1nqd9talwx.b[40][1];
                    }
                })();
            } else {
                    ++cov_1nqd9talwx.b[38][1];
                    ++cov_1nqd9talwx.s[144];
                    if (rawFields.language) {
                        ++cov_1nqd9talwx.b[41][0];

                        // langid and language. The two mean different things, see discussion https://forums.zotero.org/discussion/33960/biblatex-import-export-csl-language-biblatex-langid
                        // but in bibtex, language is often used for what is essentially langid.
                        // If there is no langid, but a language, and the language happens to be
                        // a known langid, set the langid to be equal to the language.
                        var _langString = (++cov_1nqd9talwx.s[145], rawFields.language.toLowerCase().trim());
                        var langid = (++cov_1nqd9talwx.s[146], this._reformLang(_langString));
                        ++cov_1nqd9talwx.s[147];
                        if (langid) {
                            ++cov_1nqd9talwx.b[42][0];
                            ++cov_1nqd9talwx.s[148];

                            fields['langid'] = langid;
                            ++cov_1nqd9talwx.s[149];
                            if (!['usenglish', 'ukenglish', 'caenglish', 'auenglish', 'nzenglish'].includes(langid)) {
                                ++cov_1nqd9talwx.b[43][0];
                                ++cov_1nqd9talwx.s[150];

                                langEnglish = false;
                            } else {
                                ++cov_1nqd9talwx.b[43][1];
                            }
                        } else {
                            ++cov_1nqd9talwx.b[42][1];
                        }
                    } else {
                        ++cov_1nqd9talwx.b[41][1];
                    }
                }var eitherOrUsed = (++cov_1nqd9talwx.s[151], false); // Whether the eitheror editor/author field is used.

            ++cov_1nqd9talwx.s[152];
            ++cov_1nqd9talwx.s[153];

            var _loop = function _loop(bKey) {
                ++cov_1nqd9talwx.s[154];


                if ((++cov_1nqd9talwx.b[45][0], bKey === 'date') || (++cov_1nqd9talwx.b[45][1], ['year', 'month'].includes(bKey)) && (++cov_1nqd9talwx.b[45][2], !_this.config.processUnknown)) {
                    ++cov_1nqd9talwx.b[44][0];
                    ++cov_1nqd9talwx.s[155];

                    // Handled above
                    return "continue|iterateFields";
                } else {
                    ++cov_1nqd9talwx.b[44][1];
                }

                // Replace alias fields with their main term.
                var aliasKey = (++cov_1nqd9talwx.s[156], _const2.BiblatexFieldAliasTypes[bKey]),
                    fKey = void 0;
                ++cov_1nqd9talwx.s[157];
                if (aliasKey) {
                    ++cov_1nqd9talwx.b[46][0];
                    ++cov_1nqd9talwx.s[158];

                    if (rawFields[aliasKey]) {
                        ++cov_1nqd9talwx.b[47][0];
                        ++cov_1nqd9talwx.s[159];

                        _this.warnings.push({
                            type: 'alias_creates_duplicate_field',
                            entry: _this.currentEntry['entry_key'],
                            field: bKey,
                            alias_of: aliasKey,
                            value: rawFields[bKey],
                            alias_of_value: rawFields[aliasKey]
                        });
                        ++cov_1nqd9talwx.s[160];
                        return "continue|iterateFields";
                    } else {
                        ++cov_1nqd9talwx.b[47][1];
                    }

                    ++cov_1nqd9talwx.s[161];
                    fKey = (0, _keys2.default)(_const.BibFieldTypes).find(function (ft) {
                        ++cov_1nqd9talwx.f[15];
                        ++cov_1nqd9talwx.s[162];

                        return _const.BibFieldTypes[ft].biblatex === aliasKey;
                    });
                } else {
                    ++cov_1nqd9talwx.b[46][1];
                    ++cov_1nqd9talwx.s[163];

                    fKey = (0, _keys2.default)(_const.BibFieldTypes).find(function (ft) {
                        ++cov_1nqd9talwx.f[16];
                        ++cov_1nqd9talwx.s[164];

                        return _const.BibFieldTypes[ft].biblatex === bKey;
                    });
                }

                var oFields = void 0,
                    fType = void 0;
                var bType = (++cov_1nqd9talwx.s[165], _const.BibTypes[_this.currentEntry['bib_type']]);

                ++cov_1nqd9talwx.s[166];
                if ('undefined' == typeof fKey) {
                    ++cov_1nqd9talwx.b[48][0];
                    ++cov_1nqd9talwx.s[167];

                    _this.warnings.push({
                        type: 'unknown_field',
                        entry: _this.currentEntry['entry_key'],
                        field_name: bKey
                    });
                    ++cov_1nqd9talwx.s[168];
                    if (!_this.config.processUnknown) {
                        ++cov_1nqd9talwx.b[49][0];
                        ++cov_1nqd9talwx.s[169];

                        return "continue|iterateFields";
                    } else {
                        ++cov_1nqd9talwx.b[49][1];
                    }
                    ++cov_1nqd9talwx.s[170];
                    if (!_this.currentEntry['unknown_fields']) {
                        ++cov_1nqd9talwx.b[50][0];
                        ++cov_1nqd9talwx.s[171];

                        _this.currentEntry['unknown_fields'] = {};
                    } else {
                        ++cov_1nqd9talwx.b[50][1];
                    }
                    ++cov_1nqd9talwx.s[172];
                    oFields = _this.currentEntry['unknown_fields'];
                    ++cov_1nqd9talwx.s[173];
                    fType = _this.config.processUnknown[bKey] ? (++cov_1nqd9talwx.b[51][0], _this.config.processUnknown[bKey]) : (++cov_1nqd9talwx.b[51][1], 'f_literal');
                    ++cov_1nqd9talwx.s[174];
                    fKey = bKey;
                } else {
                        ++cov_1nqd9talwx.b[48][1];
                        ++cov_1nqd9talwx.s[175];
                        if ((++cov_1nqd9talwx.b[53][0], bType['required'].includes(fKey)) || (++cov_1nqd9talwx.b[53][1], bType['optional'].includes(fKey))) {
                            ++cov_1nqd9talwx.b[52][0];
                            ++cov_1nqd9talwx.s[176];

                            oFields = fields;
                            ++cov_1nqd9talwx.s[177];
                            fType = _const.BibFieldTypes[fKey]['type'];
                        } else {
                                ++cov_1nqd9talwx.b[52][1];
                                ++cov_1nqd9talwx.s[178];
                                if ((++cov_1nqd9talwx.b[55][0], bType['eitheror'].includes(fKey)) && (++cov_1nqd9talwx.b[55][1], eitherOrUsed === false)) {
                                    ++cov_1nqd9talwx.b[54][0];
                                    ++cov_1nqd9talwx.s[179];

                                    eitherOrUsed = true;
                                    ++cov_1nqd9talwx.s[180];
                                    oFields = fields;
                                    ++cov_1nqd9talwx.s[181];
                                    fType = _const.BibFieldTypes[fKey]['type'];
                                } else {
                                    ++cov_1nqd9talwx.b[54][1];
                                    ++cov_1nqd9talwx.s[182];

                                    _this.warnings.push({
                                        type: 'unexpected_field',
                                        entry: _this.currentEntry['entry_key'],
                                        field_name: bKey
                                    });
                                    ++cov_1nqd9talwx.s[183];
                                    if (!_this.config.processUnexpected) {
                                        ++cov_1nqd9talwx.b[56][0];
                                        ++cov_1nqd9talwx.s[184];

                                        return "continue|iterateFields";
                                    } else {
                                        ++cov_1nqd9talwx.b[56][1];
                                    }
                                    ++cov_1nqd9talwx.s[185];
                                    if (!_this.currentEntry['unexpected_fields']) {
                                        ++cov_1nqd9talwx.b[57][0];
                                        ++cov_1nqd9talwx.s[186];

                                        _this.currentEntry['unexpected_fields'] = {};
                                    } else {
                                        ++cov_1nqd9talwx.b[57][1];
                                    }
                                    ++cov_1nqd9talwx.s[187];
                                    oFields = _this.currentEntry['unexpected_fields'];
                                    ++cov_1nqd9talwx.s[188];
                                    fType = _const.BibFieldTypes[fKey]['type'];
                                }
                            }
                    }var fValue = (++cov_1nqd9talwx.s[189], rawFields[bKey]);
                ++cov_1nqd9talwx.s[190];
                switch (fType) {
                    case 'f_date':
                        ++cov_1nqd9talwx.b[58][0];
                        ++cov_1nqd9talwx.s[191];

                        if (_this._checkDate(fValue)) {
                            ++cov_1nqd9talwx.b[59][0];
                            ++cov_1nqd9talwx.s[192];

                            oFields[fKey] = fValue;
                        } else {
                            ++cov_1nqd9talwx.b[59][1];
                            ++cov_1nqd9talwx.s[193];

                            _this.errors.push({
                                type: 'unknown_date',
                                entry: _this.currentEntry['entry_key'],
                                field_name: fKey,
                                value: fValue
                            });
                        }
                        ++cov_1nqd9talwx.s[194];
                        break;
                    case 'f_integer':
                        ++cov_1nqd9talwx.b[58][1];
                        ++cov_1nqd9talwx.s[195];

                        oFields[fKey] = _this._reformInteger(fValue);
                        ++cov_1nqd9talwx.s[196];
                        break;
                    case 'f_key':
                        ++cov_1nqd9talwx.b[58][2];
                        ++cov_1nqd9talwx.s[197];

                        oFields[fKey] = _this._reformKey(fValue, fKey);
                        ++cov_1nqd9talwx.s[198];
                        break;
                    case 'f_literal':
                        ++cov_1nqd9talwx.b[58][3];

                    case 'f_long_literal':
                        ++cov_1nqd9talwx.b[58][4];
                        ++cov_1nqd9talwx.s[199];

                        oFields[fKey] = _this._reformLiteral(fValue);
                        ++cov_1nqd9talwx.s[200];
                        break;
                    case 'f_range':
                        ++cov_1nqd9talwx.b[58][5];
                        ++cov_1nqd9talwx.s[201];

                        oFields[fKey] = _this._reformRange(fValue);
                        ++cov_1nqd9talwx.s[202];
                        break;
                    case 'f_title':
                        ++cov_1nqd9talwx.b[58][6];
                        ++cov_1nqd9talwx.s[203];

                        oFields[fKey] = _this._reformLiteral(fValue, langEnglish);
                        ++cov_1nqd9talwx.s[204];
                        break;
                    case 'f_uri':
                        ++cov_1nqd9talwx.b[58][7];
                        ++cov_1nqd9talwx.s[205];

                        if (_this._checkURI(fValue)) {
                            ++cov_1nqd9talwx.b[60][0];
                            ++cov_1nqd9talwx.s[206];

                            oFields[fKey] = fValue;
                        } else {
                            ++cov_1nqd9talwx.b[60][1];
                            ++cov_1nqd9talwx.s[207];

                            _this.errors.push({
                                type: 'unknown_uri',
                                entry: _this.currentEntry['entry_key'],
                                field_name: fKey,
                                value: fValue
                            });
                        }
                        ++cov_1nqd9talwx.s[208];
                        break;
                    case 'f_verbatim':
                        ++cov_1nqd9talwx.b[58][8];
                        ++cov_1nqd9talwx.s[209];

                        oFields[fKey] = fValue;
                        ++cov_1nqd9talwx.s[210];
                        break;
                    case 'l_key':
                        ++cov_1nqd9talwx.b[58][9];
                        ++cov_1nqd9talwx.s[211];

                        oFields[fKey] = (0, _tools.splitTeXString)(fValue).map(function (keyField) {
                            ++cov_1nqd9talwx.f[17];
                            ++cov_1nqd9talwx.s[212];
                            return that._reformKey(keyField, fKey);
                        });
                        ++cov_1nqd9talwx.s[213];
                        break;
                    case 'l_tag':
                        ++cov_1nqd9talwx.b[58][10];
                        ++cov_1nqd9talwx.s[214];

                        oFields[fKey] = fValue.split(',').map(function (string) {
                            ++cov_1nqd9talwx.f[18];
                            ++cov_1nqd9talwx.s[215];
                            return string.trim();
                        });
                        ++cov_1nqd9talwx.s[216];
                        break;
                    case 'l_literal':
                        ++cov_1nqd9talwx.b[58][11];

                        var items = (++cov_1nqd9talwx.s[217], (0, _tools.splitTeXString)(fValue));
                        ++cov_1nqd9talwx.s[218];
                        oFields[fKey] = [];
                        ++cov_1nqd9talwx.s[219];
                        items.forEach(function (item) {
                            ++cov_1nqd9talwx.f[19];
                            ++cov_1nqd9talwx.s[220];

                            oFields[fKey].push(_this._reformLiteral(item));
                        });
                        ++cov_1nqd9talwx.s[221];
                        break;
                    case 'l_name':
                        ++cov_1nqd9talwx.b[58][12];
                        ++cov_1nqd9talwx.s[222];

                        oFields[fKey] = _this._reformNameList(fValue);
                        ++cov_1nqd9talwx.s[223];
                        break;
                    case 'f_lang':
                        ++cov_1nqd9talwx.b[58][13];

                        var langId = (++cov_1nqd9talwx.s[224], _this._reformLang(fValue));
                        ++cov_1nqd9talwx.s[225];
                        if (langId) {
                            ++cov_1nqd9talwx.b[61][0];
                            ++cov_1nqd9talwx.s[226];

                            oFields[fKey] = langId;
                        } else {
                            ++cov_1nqd9talwx.b[61][1];
                            ++cov_1nqd9talwx.s[227];

                            _this.errors.push({
                                type: 'unknown_language_key',
                                entry: _this.currentEntry['entry_key'],
                                field_name: fKey,
                                value: fValue
                            });
                        }

                        ++cov_1nqd9talwx.s[228];
                        break;
                    default:
                        ++cov_1nqd9talwx.b[58][14];
                        ++cov_1nqd9talwx.s[229];

                        // Something must be wrong in the code.
                        console.warn("Unrecognized type: " + fType + "!");
                }
            };

            iterateFields: for (var bKey in rawFields) {
                var _ret2 = _loop(bKey);

                if (_ret2 === "continue|iterateFields") continue iterateFields;
            }
        }
    }, {
        key: "_reformKey",
        value: function _reformKey(keyString, fKey) {
            ++cov_1nqd9talwx.f[20];

            var keyValue = (++cov_1nqd9talwx.s[230], keyString.trim().toLowerCase());
            ++cov_1nqd9talwx.s[231];
            if (_const2.BiblatexAliasKeys[keyValue]) {
                ++cov_1nqd9talwx.b[62][0];
                ++cov_1nqd9talwx.s[232];

                keyValue = _const2.BiblatexAliasKeys[keyValue];
            } else {
                ++cov_1nqd9talwx.b[62][1];
            }
            ++cov_1nqd9talwx.s[233];
            if ((++cov_1nqd9talwx.b[64][0], _const.BibFieldTypes[fKey]['options']) && (++cov_1nqd9talwx.b[64][1], _const.BibFieldTypes[fKey]['options'].includes(keyValue))) {
                ++cov_1nqd9talwx.b[63][0];
                ++cov_1nqd9talwx.s[234];

                return keyValue;
            } else {
                ++cov_1nqd9talwx.b[63][1];
                ++cov_1nqd9talwx.s[235];

                return this._reformLiteral(keyString);
            }
        }
    }, {
        key: "_reformLang",
        value: function _reformLang(langString) {
            ++cov_1nqd9talwx.f[21];
            ++cov_1nqd9talwx.s[236];

            langString = langString.trim();
            ++cov_1nqd9talwx.s[237];
            if (_const2.BiblatexAliasLanguages[langString]) {
                ++cov_1nqd9talwx.b[65][0];
                ++cov_1nqd9talwx.s[238];

                langString = _const2.BiblatexAliasLanguages[langString];
            } else {
                ++cov_1nqd9talwx.b[65][1];
            }
            ++cov_1nqd9talwx.s[239];
            return (0, _keys2.default)(_const.BibLanguages).find(function (bLang) {
                ++cov_1nqd9talwx.f[22];
                ++cov_1nqd9talwx.s[240];

                return _const.BibLanguages[bLang]['biblatex'] === langString;
            });
        }
    }, {
        key: "_checkURI",
        value: function _checkURI(uriString) {
            ++cov_1nqd9talwx.f[23];
            ++cov_1nqd9talwx.s[241];

            /* Copyright (c) 2010-2013 Diego Perini, MIT licensed
               https://gist.github.com/dperini/729294
             */
            return (/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(uriString)
            );
        }
    }, {
        key: "_reformNameList",
        value: function _reformNameList(nameString) {
            ++cov_1nqd9talwx.f[24];

            var people = (++cov_1nqd9talwx.s[242], (0, _tools.splitTeXString)(nameString));
            ++cov_1nqd9talwx.s[243];
            return people.map(function (person) {
                ++cov_1nqd9talwx.f[25];

                var nameParser = (++cov_1nqd9talwx.s[244], new _nameParser.BibLatexNameParser(person));
                ++cov_1nqd9talwx.s[245];
                return nameParser.output;
            });
        }
    }, {
        key: "_reformRange",
        value: function _reformRange(rangeString) {
            ++cov_1nqd9talwx.f[26];
            ++cov_1nqd9talwx.s[246];

            return rangeString.split(',').map(function (string) {
                ++cov_1nqd9talwx.f[27];

                var parts = (++cov_1nqd9talwx.s[247], string.split('-'));
                ++cov_1nqd9talwx.s[248];
                if (parts.length > 1) {
                    ++cov_1nqd9talwx.b[66][0];
                    ++cov_1nqd9talwx.s[249];

                    return [parts.shift().trim(), parts.pop().trim()];
                } else {
                    ++cov_1nqd9talwx.b[66][1];
                    ++cov_1nqd9talwx.s[250];

                    // Is this valid bibtex?
                    return [string.trim()];
                }
            });
        }
    }, {
        key: "_checkDate",
        value: function _checkDate(dateStr) {
            ++cov_1nqd9talwx.f[28];
            ++cov_1nqd9talwx.s[251];

            // check if date is valid edtf string (level 0 or 1).
            try {
                var dateObj = (++cov_1nqd9talwx.s[252], (0, _parser.parse)(dateStr.replace(/^y/, 'Y') // Convert to edtf draft spec format supported by edtf.js
                .replace(/unknown/g, '*').replace(/open/g, '').replace(/u/g, 'X').replace(/\?~/g, '%')));
                ++cov_1nqd9talwx.s[253];
                if ((++cov_1nqd9talwx.b[68][0], dateObj.level < 2) && ((++cov_1nqd9talwx.b[68][1], dateObj.type === 'Date') && (++cov_1nqd9talwx.b[68][2], dateObj.values) || (++cov_1nqd9talwx.b[68][3], dateObj.type === 'Season') && (++cov_1nqd9talwx.b[68][4], dateObj.values) || (++cov_1nqd9talwx.b[68][5], dateObj.type === 'Interval') && (++cov_1nqd9talwx.b[68][6], dateObj.values[0].values) && (++cov_1nqd9talwx.b[68][7], dateObj.values[1].values))) {
                    ++cov_1nqd9talwx.b[67][0];
                    ++cov_1nqd9talwx.s[254];

                    return true;
                } else {
                    ++cov_1nqd9talwx.b[67][1];
                    ++cov_1nqd9talwx.s[255];

                    return false;
                }
            } catch (err) {
                ++cov_1nqd9talwx.s[256];

                return false;
            }
        }
    }, {
        key: "_reformLiteral",
        value: function _reformLiteral(theValue, cpMode) {
            ++cov_1nqd9talwx.f[29];

            var parser = (++cov_1nqd9talwx.s[257], new _literalParser.BibLatexLiteralParser(theValue, cpMode));
            ++cov_1nqd9talwx.s[258];
            return parser.output;
        }
    }, {
        key: "_reformInteger",
        value: function _reformInteger(theValue) {
            ++cov_1nqd9talwx.f[30];

            var theInt = (++cov_1nqd9talwx.s[259], parseInt(theValue));
            ++cov_1nqd9talwx.s[260];
            if (isNaN(theInt)) {
                ++cov_1nqd9talwx.b[69][0];
                ++cov_1nqd9talwx.s[261];

                theInt = 0;
            } else {
                ++cov_1nqd9talwx.b[69][1];
            }
            ++cov_1nqd9talwx.s[262];
            return theInt;
        }
    }, {
        key: "bibType",
        value: function bibType() {
            ++cov_1nqd9talwx.f[31];

            var biblatexType = (++cov_1nqd9talwx.s[263], this.currentType);
            ++cov_1nqd9talwx.s[264];
            if (_const2.BiblatexAliasTypes[biblatexType]) {
                ++cov_1nqd9talwx.b[70][0];
                ++cov_1nqd9talwx.s[265];

                biblatexType = _const2.BiblatexAliasTypes[biblatexType];
            } else {
                ++cov_1nqd9talwx.b[70][1];
            }

            var bibType = (++cov_1nqd9talwx.s[266], (0, _keys2.default)(_const.BibTypes).find(function (bType) {
                ++cov_1nqd9talwx.f[32];
                ++cov_1nqd9talwx.s[267];

                return _const.BibTypes[bType]['biblatex'] === biblatexType;
            }));

            ++cov_1nqd9talwx.s[268];
            if (typeof bibType === 'undefined') {
                ++cov_1nqd9talwx.b[71][0];
                ++cov_1nqd9talwx.s[269];

                this.warnings.push({
                    type: 'unknown_type',
                    type_name: biblatexType
                });
                ++cov_1nqd9talwx.s[270];
                bibType = 'misc';
            } else {
                ++cov_1nqd9talwx.b[71][1];
            }

            ++cov_1nqd9talwx.s[271];
            return bibType;
        }
    }, {
        key: "createNewEntry",
        value: function createNewEntry() {
            ++cov_1nqd9talwx.f[33];
            ++cov_1nqd9talwx.s[272];

            this.currentEntry = {
                'bib_type': this.bibType(),
                'entry_key': this.key(true),
                'fields': {}
            };
            ++cov_1nqd9talwx.s[273];
            this.currentRawFields = {};
            ++cov_1nqd9talwx.s[274];
            if (this.config.rawFields) {
                ++cov_1nqd9talwx.b[72][0];
                ++cov_1nqd9talwx.s[275];

                this.currentEntry['raw_fields'] = this.currentRawFields;
            } else {
                ++cov_1nqd9talwx.b[72][1];
            }
            ++cov_1nqd9talwx.s[276];
            this.entries.push(this.currentEntry);
            ++cov_1nqd9talwx.s[277];
            if (this.currentEntry['entry_key'] !== null) {
                ++cov_1nqd9talwx.b[73][0];
                ++cov_1nqd9talwx.s[278];

                this.match(",");
            } else {
                ++cov_1nqd9talwx.b[73][1];
            }
            ++cov_1nqd9talwx.s[279];
            this.keyValueList();
            ++cov_1nqd9talwx.s[280];
            if (this.currentEntry['entry_key'] === null) {
                ++cov_1nqd9talwx.b[74][0];
                ++cov_1nqd9talwx.s[281];

                this.currentEntry['entry_key'] = '';
            } else {
                ++cov_1nqd9talwx.b[74][1];
            }
            ++cov_1nqd9talwx.s[282];
            this.processFields();
        }
    }, {
        key: "directive",
        value: function directive() {
            ++cov_1nqd9talwx.f[34];
            ++cov_1nqd9talwx.s[283];

            this.match("@");
            ++cov_1nqd9talwx.s[284];
            this.currentType = this.key().toLowerCase();
            ++cov_1nqd9talwx.s[285];
            return "@" + this.currentType;
        }
    }, {
        key: "string",
        value: function string() {
            ++cov_1nqd9talwx.f[35];

            var kv = (++cov_1nqd9talwx.s[286], this.keyEqualsValue());
            ++cov_1nqd9talwx.s[287];
            this.variables[kv[0].toUpperCase()] = kv[1];
        }
    }, {
        key: "preamble",
        value: function preamble() {
            ++cov_1nqd9talwx.f[36];
            ++cov_1nqd9talwx.s[288];

            this.value();
        }
    }, {
        key: "replaceTeXChars",
        value: function replaceTeXChars() {
            ++cov_1nqd9talwx.f[37];

            var value = (++cov_1nqd9talwx.s[289], this.input);
            var len = (++cov_1nqd9talwx.s[290], _const2.TeXSpecialChars.length);
            ++cov_1nqd9talwx.s[291];
            for (var i = 0; i < len; i++) {
                var texChar = (++cov_1nqd9talwx.s[292], _const2.TeXSpecialChars[i]);
                var texCharRe = (++cov_1nqd9talwx.s[293], new RegExp("{(" + texChar[0] + ")}|" + texChar[0], 'g'));
                ++cov_1nqd9talwx.s[294];
                value = value.replace(texCharRe, texChar[1]);
            }
            // Delete multiple spaces
            ++cov_1nqd9talwx.s[295];
            this.input = value.replace(/ +(?= )/g, '');
            ++cov_1nqd9talwx.s[296];
            return;
        }
    }, {
        key: "stepThroughBibtex",
        value: function stepThroughBibtex() {
            ++cov_1nqd9talwx.f[38];
            ++cov_1nqd9talwx.s[297];

            while (this.skipToNext()) {
                var d = (++cov_1nqd9talwx.s[298], this.directive());
                ++cov_1nqd9talwx.s[299];
                this.match("{");
                ++cov_1nqd9talwx.s[300];
                if (d == "@string") {
                    ++cov_1nqd9talwx.b[75][0];
                    ++cov_1nqd9talwx.s[301];

                    this.string();
                } else {
                        ++cov_1nqd9talwx.b[75][1];
                        ++cov_1nqd9talwx.s[302];
                        if (d == "@preamble") {
                            ++cov_1nqd9talwx.b[76][0];
                            ++cov_1nqd9talwx.s[303];

                            this.preamble();
                        } else {
                                ++cov_1nqd9talwx.b[76][1];
                                ++cov_1nqd9talwx.s[304];
                                if (d == "@comment") {
                                    ++cov_1nqd9talwx.b[77][0];
                                    ++cov_1nqd9talwx.s[305];

                                    this.parseGroups();
                                } else {
                                    ++cov_1nqd9talwx.b[77][1];
                                    ++cov_1nqd9talwx.s[306];

                                    this.createNewEntry();
                                }
                            }
                    }++cov_1nqd9talwx.s[307];
                this.match("}");
            }
        }
    }, {
        key: "parseGroups",
        value: function parseGroups() {
            var _this2 = this;

            ++cov_1nqd9talwx.f[39];

            var prefix = (++cov_1nqd9talwx.s[308], 'jabref-meta: groupstree:');
            var pos = (++cov_1nqd9talwx.s[309], this.input.indexOf(prefix, this.pos));
            ++cov_1nqd9talwx.s[310];
            if (pos < 0) {
                ++cov_1nqd9talwx.b[78][0];
                ++cov_1nqd9talwx.s[311];
                return;
            } else {
                ++cov_1nqd9talwx.b[78][1];
            }
            ++cov_1nqd9talwx.s[312];
            this.pos = pos + prefix.length;

            /*  The JabRef Groups format is... interesting. To parse it, you must:
                1. Unwrap the lines (just remove the newlines)
                2. Split the lines on ';' (but not on '\;')
                3. Each line is a group which is formatted as follows:
                   <level> <type>:<name>\;<intersect>\;<citekey1>\;<citekey2>\;....
                 Each level can interact with the level it is nested under; either no interaction (intersect = 0), intersection
                (intersect = 1) or union (intersect = 2).
                 There are several group types: root-level (all references are implicitly available on the root level),
                ExplicitGroup (the citation keys are listed in the group line) or query-type groups. I have only implemented
                explicit groups.
            */

            // skip any whitespace after the identifying string */
            ++cov_1nqd9talwx.s[313];
            while ((++cov_1nqd9talwx.b[79][0], this.input.length > this.pos) && (++cov_1nqd9talwx.b[79][1], '\r\n '.indexOf(this.input[this.pos]) >= 0)) {
                ++cov_1nqd9talwx.s[314];
                this.pos++;
            }

            var start = (++cov_1nqd9talwx.s[315], this.pos);
            var braces = (++cov_1nqd9talwx.s[316], 1);
            ++cov_1nqd9talwx.s[317];
            while ((++cov_1nqd9talwx.b[80][0], this.input.length > this.pos) && (++cov_1nqd9talwx.b[80][1], braces > 0)) {
                ++cov_1nqd9talwx.s[318];

                switch (this.input[this.pos]) {
                    case '{':
                        ++cov_1nqd9talwx.b[81][0];
                        ++cov_1nqd9talwx.s[319];

                        braces += 1;
                        ++cov_1nqd9talwx.s[320];
                        break;
                    case '}':
                        ++cov_1nqd9talwx.b[81][1];
                        ++cov_1nqd9talwx.s[321];

                        braces -= 1;
                }
                ++cov_1nqd9talwx.s[322];
                this.pos++;
            }

            // no ending brace found
            ++cov_1nqd9talwx.s[323];
            if (braces !== 0) {
                ++cov_1nqd9talwx.b[82][0];
                ++cov_1nqd9talwx.s[324];
                return;
            } else {
                ++cov_1nqd9talwx.b[82][1];
            }

            // leave the ending brace for the main parser to pick up
            ++cov_1nqd9talwx.s[325];
            this.pos--;

            // simplify parsing by taking the whole comment, throw away newlines, replace the escaped separators with tabs, and
            // then split on the remaining non-secaped separators
            // I use \u2004 to protect \; and \u2005 to protect \\\; (the escaped version of ';') when splitting lines at ;
            var lines = (++cov_1nqd9talwx.s[326], this.input.substring(start, this.pos).replace(/[\r\n]/g, '').replace(/\\\\\\;/g, "\u2005").replace(/\\;/g, "\u2004").split(';'));
            ++cov_1nqd9talwx.s[327];
            lines = lines.map(function (line) {
                ++cov_1nqd9talwx.f[40];
                ++cov_1nqd9talwx.s[328];

                return line.replace(/\u2005/g, ';');
            });
            var levels = (++cov_1nqd9talwx.s[329], { '0': { references: [], groups: [] } });
            ++cov_1nqd9talwx.s[330];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                var _loop2 = function _loop2() {
                    var line = _step.value;
                    ++cov_1nqd9talwx.s[331];

                    if (line === '') {
                        ++cov_1nqd9talwx.b[83][0];
                        ++cov_1nqd9talwx.s[332];
                        return "continue";
                    } else {
                        ++cov_1nqd9talwx.b[83][1];
                    }
                    var match = (++cov_1nqd9talwx.s[333], line.match(/^([0-9])\s+([^:]+):(.*)/));
                    ++cov_1nqd9talwx.s[334];
                    if (!match) {
                        ++cov_1nqd9talwx.b[84][0];
                        ++cov_1nqd9talwx.s[335];
                        return {
                            v: void 0
                        };
                    } else {
                        ++cov_1nqd9talwx.b[84][1];
                    }
                    var level = (++cov_1nqd9talwx.s[336], parseInt(match[1]));
                    var type = (++cov_1nqd9talwx.s[337], match[2]);
                    var references = (++cov_1nqd9talwx.s[338], match[3]);
                    ++cov_1nqd9talwx.s[339];
                    references = references ? (++cov_1nqd9talwx.b[85][0], references.split("\u2004").filter(function (key) {
                        ++cov_1nqd9talwx.f[41];
                        ++cov_1nqd9talwx.s[340];
                        return key;
                    })) : (++cov_1nqd9talwx.b[85][1], []);
                    var name = (++cov_1nqd9talwx.s[341], references.shift());
                    var intersection = (++cov_1nqd9talwx.s[342], references.shift()); // 0 = independent, 1 = intersection, 2 = union

                    // ignore root level, has no refs anyway in the comment
                    ++cov_1nqd9talwx.s[343];
                    if (level === 0) {
                        ++cov_1nqd9talwx.b[86][0];
                        ++cov_1nqd9talwx.s[344];
                        return "continue";
                    } else {
                        ++cov_1nqd9talwx.b[86][1];
                    }

                    // remember this group as the current `level` level, so that any following `level + 1` levels can find it
                    ++cov_1nqd9talwx.s[345];
                    levels[level] = { name: name, groups: [], references: references };
                    // and add it to its parent
                    ++cov_1nqd9talwx.s[346];
                    levels[level - 1].groups.push(levels[level]);

                    // treat all groups as explicit
                    ++cov_1nqd9talwx.s[347];
                    if (type != 'ExplicitGroup') {
                        ++cov_1nqd9talwx.b[87][0];
                        ++cov_1nqd9talwx.s[348];

                        _this2.warnings.push({
                            type: 'unsupported_jabref_group',
                            group_type: type
                        });
                    } else {
                        ++cov_1nqd9talwx.b[87][1];
                    }

                    ++cov_1nqd9talwx.s[349];
                    switch (intersection) {
                        case '0':
                            ++cov_1nqd9talwx.b[88][0];
                            ++cov_1nqd9talwx.s[350];

                            // do nothing more
                            break;
                        case '1':
                            ++cov_1nqd9talwx.b[88][1];
                            ++cov_1nqd9talwx.s[351];

                            // intersect with parent. Hardly ever used.
                            levels[level].references = levels[level].references.filter(function (key) {
                                ++cov_1nqd9talwx.f[42];
                                ++cov_1nqd9talwx.s[352];
                                return levels[level - 1].indexOf(key) >= 0;
                            });
                            ++cov_1nqd9talwx.s[353];
                            break;
                        case '2':
                            ++cov_1nqd9talwx.b[88][2];
                            ++cov_1nqd9talwx.s[354];

                            // union with parent
                            levels[level].references = [].concat((0, _toConsumableArray3.default)(new _set2.default([].concat((0, _toConsumableArray3.default)(levels[level].references), (0, _toConsumableArray3.default)(levels[level - 1].references)))));
                            ++cov_1nqd9talwx.s[355];
                            break;
                    }
                };

                for (var _iterator = (0, _getIterator3.default)(lines), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _ret3 = _loop2();

                    switch (_ret3) {
                        case "continue":
                            continue;

                        default:
                            if ((typeof _ret3 === "undefined" ? "undefined" : (0, _typeof3.default)(_ret3)) === "object") return _ret3.v;
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            ++cov_1nqd9talwx.s[356];
            this.groups = levels['0'].groups;
        }
    }, {
        key: "createBibDB",
        value: function createBibDB() {
            ++cov_1nqd9talwx.f[43];

            var that = (++cov_1nqd9talwx.s[357], this);
            ++cov_1nqd9talwx.s[358];
            this.entries.forEach(function (entry, index) {
                ++cov_1nqd9talwx.f[44];
                ++cov_1nqd9talwx.s[359];

                that.bibDB[index] = entry;
            });
        }
    }, {
        key: "output",
        get: function get() {
            ++cov_1nqd9talwx.f[45];
            ++cov_1nqd9talwx.s[360];

            this.replaceTeXChars();
            ++cov_1nqd9talwx.s[361];
            this.stepThroughBibtex();
            ++cov_1nqd9talwx.s[362];
            this.createBibDB();
            ++cov_1nqd9talwx.s[363];
            return this.bibDB;
        }
    }]);
    return BibLatexParser;
}();

},{"../../lib/edtf/src/parser":4,"../const":125,"./const":130,"./literal-parser":131,"./name-parser":132,"./tools":133,"babel-runtime/core-js/get-iterator":7,"babel-runtime/core-js/object/keys":11,"babel-runtime/core-js/set":12,"babel-runtime/helpers/classCallCheck":15,"babel-runtime/helpers/createClass":16,"babel-runtime/helpers/toConsumableArray":19,"babel-runtime/helpers/typeof":20}],130:[function(require,module,exports){
'use strict';Object.defineProperty(exports,"__esModule",{value:true});var cov_1eryzo4kra=function(){var path='/home/travis/build/fiduswriter/biblatex-csl-converter/src/import/const.js',hash='20cfd84e7ef291a1c4bbd4d4933535a967ff5b1f',global=new Function('return this')(),gcv='__coverage__',coverageData={path:'/home/travis/build/fiduswriter/biblatex-csl-converter/src/import/const.js',statementMap:{'0':{start:{line:2,column:39},end:{line:10,column:1}},'1':{start:{line:13,column:34},end:{line:20,column:1}},'2':{start:{line:23,column:38},end:{line:36,column:1}},'3':{start:{line:38,column:33},end:{line:60,column:1}},'4':{start:{line:73,column:31},end:{line:3013,column:1}}},fnMap:{},branchMap:{},s:{'0':0,'1':0,'2':0,'3':0,'4':0},f:{},b:{},_coverageSchema:'332fd63041d2c1bcb487cc26dd0d5f7d97098a6c'},coverage=global[gcv]||(global[gcv]={});if(coverage[path]&&coverage[path].hash===hash){return coverage[path];}coverageData.hash=hash;return coverage[path]=coverageData;}();/** A list of all field aliases and what they refer to. */var BiblatexFieldAliasTypes=exports.BiblatexFieldAliasTypes=(++cov_1eryzo4kra.s[0],{'address':'location','annote':'annotation','archiveprefix':'eprinttype','journal':'journaltitle','pdf':'file','primaryclass':'eprintclass','school':'institution'});/** A list of all bibentry aliases and what they refer to. */var BiblatexAliasTypes=exports.BiblatexAliasTypes=(++cov_1eryzo4kra.s[1],{'conference':'inproceedings','electronic':'online','mastersthesis':'thesis','phdthesis':'thesis','techreport':'thesis','www':'online'});/** A list of aliases for languages known by biblatex/babel/polyglosia and what they refer to. */var BiblatexAliasLanguages=exports.BiblatexAliasLanguages=(++cov_1eryzo4kra.s[2],{'english':'usenglish','american':'usenglish','british':'ukenglish','en':'usenglish','anglais':'usenglish','francais':'french','austrian':'naustrian','german':'ngerman','germanb':'german','polutonikogreek':'greek','brazil':'brazilian','portugues':'portuguese'});var BiblatexAliasKeys=exports.BiblatexAliasKeys=(++cov_1eryzo4kra.s[3],{"langamerican":"american","langbrazilian":"brazilian","langcatalan":"catalan","langcroation":"croation","langczech":"czech","langdanish":"danish","langdutch":"dutch","langenglish":"english","langfinnish":"finnish","langfrench":"french","langgerman":"german","langgreek":"greek","langitalian":"italian","langlatin":"latin","langnorwegian":"norwegian","langpolish":"polish","langportuguese":"portuguese","langrussian":"russian","langslovene":"slovene","langspanish":"spanish","langswedish":"swedish"});/** A list of special chars in Tex and their unicode equivalent. *//* The copyright holder of the below composition is Emiliano Heyns, and it is made available under the MIT license.

Data sources for the composition are:

http://milde.users.sourceforge.net/LUCR/Math/data/unimathsymbols.txt
http://www.w3.org/2003/entities/2007xml/unicode.xml
http://www.w3.org/Math/characters/unicode.xml
*/var TeXSpecialChars=exports.TeXSpecialChars=(++cov_1eryzo4kra.s[4],[["\\{\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char220\\}|\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char220",'\u033C'],["\\{\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char225\\}|\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char225",'\u0361'],["\\{\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char201\\}|\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char201",'\u013F'],["\\{\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char218\\}|\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char218",'\u033A'],["\\{\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char202\\}|\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char202",'\u0140'],["\\{\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char207\\}|\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char207",'\u032F'],["\\{\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char203\\}|\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char203",'\u032B'],["\\{\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char185\\}|\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char185",'\u0319'],["\\{\\\\fontencoding\\{LEIP\\}\\\\selectfont\\\\char202\\}|\\\\fontencoding\\{LEIP\\}\\\\selectfont\\\\char202",'\u027F'],["\\{\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char184\\}|\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char184",'\u0318'],["\\{\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char177\\}|\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char177",'\u0311'],["\\{\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char195\\}|\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char195",'\u01BA'],["\\{\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char215\\}|\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char215",'\u0337'],["\\{\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char216\\}|\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char216",'\u0338'],["\\{\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char219\\}|\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char219",'\u033B'],["\\{\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char221\\}|\\\\fontencoding\\{LECO\\}\\\\selectfont\\\\char221",'\u033D'],["\\{\\\\fontencoding\\{LEIP\\}\\\\selectfont\\\\char61\\}|\\\\fontencoding\\{LEIP\\}\\\\selectfont\\\\char61",'\u0258'],["\\{\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char63\\}|\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char63",'\u0167'],["\\{\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char91\\}|\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char91",'\u0138'],["\\{\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char40\\}|\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char40",'\u0126'],["\\{\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char47\\}|\\\\fontencoding\\{LELA\\}\\\\selectfont\\\\char47",'\u0166'],["\\\\mathbin\\{\\{:\\}\\\\!\\\\!\\{\\-\\}\\\\!\\\\!\\{:\\}\\}",'\u223A'],["\\\\cyrchar\\\\cyrhundredthousands",'\u0488'],['\\\\acute\\{\\\\ddot\\{\\\\upsilon\\}\\}','\u03B0'],["\\\\Pisymbol\\{ppi020\\}\\{105\\}",'\u2A9E'],["\\\\acute\\{\\\\ddot\\{\\\\iota\\}\\}",'\u0390'],["\\\\Pisymbol\\{ppi020\\}\\{117\\}",'\u2A9D'],["\\\\mathsfbfsl\\{\\\\varkappa\\}",'\uD835\uDFC6'],["\\\\barleftarrowrightarrowba",'\u21B9'],["\\\\mathsfbfsl\\{\\\\vartheta\\}",'\uD835\uDF97'],["\\\\not\\\\kern\\-0\\.3em\\\\times",'\u226D'],["\\\\leftarrowshortrightarrow",'\u2943'],["\\\\mathsfbfsl\\{\\\\varsigma\\}",'\uD835\uDFBB'],["\\\\Pisymbol\\{ppi022\\}\\{87\\}",'\u03D0'],["\\\\concavediamondtickright",'\u27E3'],["\\\\invwhiteupperhalfcircle",'\u25DA'],['\\\\mathsfbfsl\\{\\\\Upsilon\\}','\uD835\uDFA4'],["\\\\nvtwoheadrightarrowtail",'\u2917'],["\\\\nVtwoheadrightarrowtail",'\u2918'],["\\\\invwhitelowerhalfcircle",'\u25DB'],["\\\\leftrightarrowtriangle",'\u21FF'],["\\\\partialmeetcontraction",'\u2AA3'],['\\\\updownharpoonleftright','\u294D'],["\\\\ensuremath\\{\\\\Elzpes\\}",'\u20A7'],["\\\\texteuro|\\{\\\\mbox\\{\\\\texteuro\\}\\}|\\\\mbox\\{\\\\texteuro\\}",'\u20AC'],["\\\\cyrchar\\\\CYROMEGATITLO",'\u047C'],["\\\\mathsfbfsl\\{\\\\varrho\\}",'\uD835\uDFC8'],["\\\\cyrchar\\\\cyromegatitlo",'\u047D'],["\\\\nVtwoheadleftarrowtail",'\u2B3D'],["\\\\concavediamondtickleft",'\u27E2'],['\\\\updownharpoonrightleft','\u294C'],["\\\\blackcircleulquadwhite",'\u25D5'],["\\\\mathsfbfsl\\{\\\\Lambda\\}",'\uD835\uDF9A'],["\\\\mathsfbf\\{\\\\varsigma\\}",'\uD835\uDF81'],["\\\\mathsfbf\\{\\\\varkappa\\}",'\uD835\uDF8C'],["\\\\nvtwoheadleftarrowtail",'\u2B3C'],["\\\\mathsfbf\\{\\\\vartheta\\}",'\uD835\uDF67'],["\\\\downtrianglerightblack",'\u29E9'],["\\\\ElsevierGlyph\\{E838\\}",'\u233D'],["\\\\ElsevierGlyph\\{2129\\}",'\u2129'],["\\\\ElsevierGlyph\\{E219\\}",'\u2937'],["\\\\rangledownzigzagarrow",'\u237C'],["\\\\mathsfbfsl\\{\\\\Omega\\}",'\uD835\uDFA8'],["\\\\mathrm\\{\\\\ddot\\{Y\\}\\}",'\u03AB'],["\\\\mathsfbfsl\\{\\\\nabla\\}",'\uD835\uDFA9'],["\\\\mathrm\\{\\\\ddot\\{I\\}\\}",'\u03AA'],["\\\\mathsfbfsl\\{\\\\Gamma\\}",'\uD835\uDF92'],["\\\\ElsevierGlyph\\{2275\\}",'\u2275'],["\\\\ElsevierGlyph\\{E21A\\}",'\u2936'],["\\\\ElsevierGlyph\\{E214\\}",'\u297C'],["\\\\ElsevierGlyph\\{E215\\}",'\u297D'],["\\\\ElsevierGlyph\\{2274\\}",'\u2274'],["\\\\ElsevierGlyph\\{2232\\}",'\u2232'],["\\\\ElsevierGlyph\\{E212\\}",'\u2905'],["\\\\ElsevierGlyph\\{2233\\}",'\u2233'],["\\\\ElsevierGlyph\\{3018\\}",'\u2985'],["\\\\sim\\\\joinrel\\\\leadsto",'\u27FF'],["\\\\ElsevierGlyph\\{2238\\}",'\u2238'],["\\\\ElsevierGlyph\\{E291\\}",'\u2994'],["\\\\ElsevierGlyph\\{E21C\\}",'\u2933'],['\\\\underrightharpoondown','\u20EC'],["\\\\ElsevierGlyph\\{2242\\}",'\u2242'],["\\\\ElsevierGlyph\\{E260\\}",'\u29B5'],["\\\\ElsevierGlyph\\{E61B\\}",'\u29B6'],["\\\\cyrchar\\\\cyrsemisftsn",'\u048D'],["\\\\cyrchar\\\\CYRSEMISFTSN",'\u048C'],["\\\\cyrchar\\\\cyrthousands",'\u0482'],["\\\\ElsevierGlyph\\{3019\\}",'\u3019'],["\\\\ElsevierGlyph\\{300B\\}",'\u300B'],["\\\\leftrightharpoonsdown",'\u2967'],["\\\\rightleftharpoonsdown",'\u2969'],["\\\\ElsevierGlyph\\{E210\\}",'\u292A'],["\\\\ElsevierGlyph\\{300A\\}",'\u300A'],["\\\\ElsevierGlyph\\{E372\\}",'\u29DC'],["\\\\ElsevierGlyph\\{22C0\\}",'\u22C0'],["\\\\downtriangleleftblack",'\u29E8'],["\\\\blackdiamonddownarrow",'\u29EA'],["\\\\ElsevierGlyph\\{E20F\\}",'\u2929'],["\\\\ElsevierGlyph\\{E20E\\}",'\u2928'],["\\\\ElsevierGlyph\\{E211\\}",'\u2927'],["\\\\ElsevierGlyph\\{E20A\\}",'\u2926'],["\\\\ElsevierGlyph\\{225A\\}",'\u225A'],["\\\\ElsevierGlyph\\{225F\\}",'\u225F'],["\\\\ElsevierGlyph\\{E20B\\}",'\u2925'],["\\\\ElsevierGlyph\\{E20D\\}",'\u2924'],['\\\\mathsfbf\\{\\\\Upsilon\\}','\uD835\uDF6A'],["\\\\ElsevierGlyph\\{22C1\\}",'\u22C1'],["\\\\mathbit\\{\\\\varkappa\\}",'\uD835\uDF52'],["\\\\mathbit\\{\\\\vartheta\\}",'\uD835\uDF51'],["\\\\mathbit\\{\\\\varsigma\\}",'\uD835\uDF47'],["\\\\ElsevierGlyph\\{E20C\\}",'\u2923'],["\\\\ElsevierGlyph\\{E395\\}",'\u2A10'],["\\\\ElsevierGlyph\\{E25A\\}",'\u2A25'],["\\\\ElsevierGlyph\\{21B3\\}",'\u21B3'],["\\\\ElsevierGlyph\\{E25B\\}",'\u2A2A'],["\\\\ElsevierGlyph\\{E25C\\}",'\u2A2D'],["\\\\ElsevierGlyph\\{E25D\\}",'\u2A2E'],["\\\\ElsevierGlyph\\{E25E\\}",'\u2A34'],["\\\\ElsevierGlyph\\{E259\\}",'\u2A3C'],["\\\\ElsevierGlyph\\{E381\\}",'\u25B1'],["\\\\closedvarcupsmashprod",'\u2A50'],["\\\\ElsevierGlyph\\{E36E\\}",'\u2A55'],["\\\\barovernorthwestarrow",'\u21B8'],["\\\\mathsfbfsl\\{\\\\Delta\\}",'\uD835\uDF93'],["\\\\ElsevierGlyph\\{E30D\\}",'\u2AEB'],["\\\\mathsfbfsl\\{\\\\Sigma\\}",'\uD835\uDFA2'],["\\\\mathsfbfsl\\{\\\\varpi\\}",'\uD835\uDFC9'],['\\\\mathbit\\{\\\\Upsilon\\}','\uD835\uDF30'],["\\\\whiteinwhitetriangle",'\u27C1'],["\\\\cyrchar\\\\cyromegarnd",'\u047B'],["\\\\cyrchar\\\\CYRABHCHDSC",'\u04BE'],["\\\\cyrchar\\\\CYROMEGARND",'\u047A'],["\\\\twoheadleftarrowtail",'\u2B3B'],["\\\\mathsl\\{\\\\varkappa\\}",'\uD835\uDF18'],["\\\\mathsl\\{\\\\varsigma\\}",'\uD835\uDF0D'],["\\\\cyrchar\\\\cyrabhchdsc",'\u04BF'],["\\\\cyrchar\\\\CYRpalochka",'\u04C0'],["\\\\mathbf\\{\\\\varkappa\\}",'\uD835\uDEDE'],["\\\\CapitalDifferentialD",'\u2145'],["\\\\mathbf\\{\\\\varsigma\\}",'\uD835\uDED3'],["\\\\mathsfbf\\{\\\\varrho\\}",'\uD835\uDF8E'],["\\\\twoheaduparrowcircle",'\u2949'],["\\\\rightarrowbackapprox",'\u2B48'],["\\\\curvearrowrightminus",'\u293C'],["\\\\barrightarrowdiamond",'\u2920'],["\\\\leftrightarrowcircle",'\u2948'],["\\\\downrightcurvedarrow",'\u2935'],["\\\\NestedGreaterGreater",'\u2AA2'],["\\\\cyrchar\\{\\\\'\\\\CYRK\\}",'\u040C'],["\\\\mathsl\\{\\\\vartheta\\}",'\uD835\uDEF3'],["\\\\mathsfbf\\{\\\\Lambda\\}",'\uD835\uDF60'],['\\\\underleftharpoondown','\u20ED'],["\\\\mathbf\\{\\\\vartheta\\}",'\uD835\uDEB9'],["\\\\cyrchar\\{\\\\'\\\\cyrk\\}",'\u045C'],["\\\\blackcircledrightdot",'\u2688'],["\\\\whitesquaretickright",'\u27E5'],["\\\\cyrchar\\{\\\\'\\\\cyrg\\}",'\u0453'],["\\\\cyrchar\\{\\\\'\\\\CYRG\\}",'\u0403'],["\\\\cyrchar\\\\cyrmillions",'\u0489'],["\\\\ReverseUpEquilibrium",'\u296F'],["\\\\blackcircledownarrow",'\u29ED'],["\\\\int\\\\!\\\\int\\\\!\\\\int",'\u222D'],["\\\\leftrightsquigarrow",'\u21AD'],["\\\\leftarrowbackapprox",'\u2B42'],["\\\\mathbit\\{\\\\Lambda\\}",'\uD835\uDF26'],["\\\\mathsfbfsl\\{\\\\phi\\}",'\uD835\uDFC7'],["\\\\blockthreeqtrshaded",'\u2593'],["\\\\whitesquaretickleft",'\u27E4'],["\\\\blackcircledtwodots",'\u2689'],["\\\\stackrel\\{\\*\\}\\{=\\}",'\u2A6E'],["\\\\whitearrowupfrombar",'\u21EA'],["\\\\mathsfbfsl\\{\\\\Phi\\}",'\uD835\uDFA5'],["\\\\mathsfbf\\{\\\\Theta\\}",'\uD835\uDF5D'],["\\\\leftrightharpoonsup",'\u2966'],["\\\\mathsfbf\\{\\\\varpi\\}",'\uD835\uDF8F'],["\\\\blackinwhitediamond",'\u25C8'],["\\\\cyrchar\\\\cyriotbyus",'\u046D'],["\\\\mathsfbf\\{\\\\Omega\\}",'\uD835\uDF6E'],["\\\\cyrchar\\\\CYRIOTBYUS",'\u046C'],['\\\\mathbf\\{\\\\Upsilon\\}','\uD835\uDEBC'],["\\\\mathsfbf\\{\\\\Delta\\}",'\uD835\uDF59'],["\\\\mathsfbfsl\\{\\\\Psi\\}",'\uD835\uDFA7'],["\\\\DownLeftRightVector",'\u2950'],["\\\\cyrchar\\\\textnumero",'\u2116'],["\\\\twoheadleftdbkarrow",'\u2B37'],["\\\\mathsfbf\\{\\\\Gamma\\}",'\uD835\uDF58'],["\\\\rightleftharpoonsup",'\u2968'],['\\\\mathsl\\{\\\\Upsilon\\}','\uD835\uDEF6'],["\\\\cyrchar\\\\cyriotlyus",'\u0469'],["\\\\nVtwoheadrightarrow",'\u2901'],["\\\\mathbit\\{\\\\varrho\\}",'\uD835\uDF54'],["\\\\mathsfbf\\{\\\\nabla\\}",'\uD835\uDF6F'],["\\\\mathsfbf\\{\\\\Sigma\\}",'\uD835\uDF68'],["\\\\cyrchar\\\\CYRIOTLYUS",'\u0468'],["\\\\diamondleftarrowbar",'\u291F'],["\\\\cyrchar\\\\CYRCHLDSC",'\u04CB'],["\\\\longleftsquigarrow",'\u2B33'],["\\\\textfrac\\{2\\}\\{5\\}",'\u2156'],["\\\\RightDownTeeVector",'\u295D'],["\\\\textfrac\\{7\\}\\{8\\}",'\u215E'],["\\\\DownRightVectorBar",'\u2957'],["\\\\mathrm\\{'\\\\Omega\\}",'\u038F'],["\\\\textfrac\\{5\\}\\{8\\}",'\u215D'],["\\\\rightpentagonblack",'\u2B53'],["\\\\rightarrowbsimilar",'\u2B4C'],["\\\\textfrac\\{3\\}\\{8\\}",'\u215C'],["\\\\blackinwhitesquare",'\u25A3'],["\\\\bsimilarrightarrow",'\u2B47'],["\\\\textfrac\\{1\\}\\{8\\}",'\u215B'],["\\\\textfrac\\{5\\}\\{6\\}",'\u215A'],["\\\\errbarblackdiamond",'\u29F1'],["\\\\mathbf\\{\\\\varrho\\}",'\uD835\uDEE0'],["\\\\textfrac\\{1\\}\\{6\\}",'\u2159'],["\\\\parallelogramblack",'\u25B0'],["\\\\precedesnotsimilar",'\u22E8'],["\\\\ccwundercurvearrow",'\u293F'],["\\\\textfrac\\{4\\}\\{5\\}",'\u2158'],["\\\\inversewhitecircle",'\u25D9'],["\\\\textfrac\\{3\\}\\{5\\}",'\u2157'],["\\\\textfrac\\{1\\}\\{5\\}",'\u2155'],["\\\\mathbit\\{\\\\varpi\\}",'\uD835\uDF55'],["\\\\DownRightTeeVector",'\u295F'],["\\{\\{/\\}\\\\!\\\\!\\{/\\}\\}",'\u2AFD'],["\\\\textfrac\\{1\\}\\{3\\}",'\u2153'],["\\\\mathbit\\{\\\\nabla\\}",'\uD835\uDF35'],["\\\\mathbit\\{\\\\Omega\\}",'\uD835\uDF34'],["\\\\overleftrightarrow",'\u20E1'],["\\\\acute\\{\\\\epsilon\\}",'\u03AD'],["\\\\mathbit\\{\\\\Sigma\\}",'\uD835\uDF2E'],["\\\\mathbf\\{\\\\Lambda\\}",'\uD835\uDEB2'],['\\\\acute\\{\\\\upsilon\\}','\u03CD'],["\\\\mathbit\\{\\\\Theta\\}",'\uD835\uDF23'],["\\\\mathbit\\{\\\\Delta\\}",'\uD835\uDF1F'],["\\\\mathbit\\{\\\\Gamma\\}",'\uD835\uDF1E'],["\\\\mathsfbfsl\\{\\\\Xi\\}",'\uD835\uDF9D'],["\\\\mathsl\\{\\\\varrho\\}",'\uD835\uDF1A'],["\\\\RightDownVectorBar",'\u2955'],["\\\\textperiodcentered",'\u02D9'],["\\\\textfrac\\{2\\}\\{3\\}",'\u2154'],["\\\\hspace\\{0\\.166em\\}",'\u2006'],["\\\\,|\\\\hspace\\{0\\.167em\\}",'\u2009'],["\\\\circletophalfblack",'\u25D3'],["\\\\rule\\{1em\\}\\{1pt\\}",'\u2015'],["\\\\curvearrowleftplus",'\u293D'],["\\\\rightarrowtriangle",'\u21FE'],["\\\\Longleftrightarrow",'\u27FA'],["\\\\cyrchar\\\\cyrabhdze",'\u04E1'],["\\\\longleftrightarrow",'\u27F7'],["\\\\blacktriangleright",'\u25B8'],["\\\\circleonrightarrow",'\u21F4'],["\\\\cyrchar\\\\CYRABHDZE",'\u04E0'],["\\\\nVtwoheadleftarrow",'\u2B35'],["\\\\rightrightharpoons",'\u2964'],["\\\\cyrchar\\\\CYRCHRDSC",'\u04B6'],["\\\\trianglerightblack",'\u25EE'],["\\\\cyrchar\\\\cyrchldsc",'\u04CC'],["\\\\cyrchar\\\\cyrchrdsc",'\u04B7'],["\\\\mathsfbfsl\\{\\\\Pi\\}",'\uD835\uDF9F'],["\\\\nvtwoheadleftarrow",'\u2B34'],["\\\\textpertenthousand",'\u2031'],["\\\\circledwhitebullet",'\u29BE'],["\\\\cyrchar\\\\CYRCHVCRS",'\u04B8'],["\\\\cyrchar\\\\cyrchvcrs",'\u04B9'],["\\\\mathsl\\{\\\\Lambda\\}",'\uD835\uDEEC'],["\\\\blacktriangleleft",'\u25C2'],["\\\\mathsl\\{\\\\Theta\\}",'\uD835\uDEE9'],["\\\\blacktriangledown",'\u25BE'],["\\\\mathsl\\{\\\\Delta\\}",'\uD835\uDEE5'],["\\\\whitepointerright",'\u25BB'],["\\\\blackpointerright",'\u25BA'],["\\\\mathsl\\{\\\\Gamma\\}",'\uD835\uDEE4'],["\\\\mathbf\\{\\\\Gamma\\}",'\uD835\uDEAA'],["\\\\mathbf\\{\\\\varpi\\}",'\uD835\uDEE1'],["\\\\mathbf\\{\\\\Delta\\}",'\uD835\uDEAB'],["\\\\mathbf\\{\\\\Theta\\}",'\uD835\uDEAF'],["\\\\mathbf\\{\\\\theta\\}",'\uD835\uDEC9'],["\\\\mathbf\\{\\\\nabla\\}",'\uD835\uDEC1'],["\\\\mathbf\\{\\\\Omega\\}",'\uD835\uDEC0'],['\\\\uprightcurvearrow','\u2934'],["\\\\mathbf\\{\\\\Sigma\\}",'\uD835\uDEBA'],["\\\\similarrightarrow",'\u2972'],["\\\\rightarrowdiamond",'\u291E'],["\\\\rightarrowsimilar",'\u2974'],["\\\\cyrchar\\\\CYRKBEAK",'\u04A0'],["\\\\LeftDownVectorBar",'\u2959'],["\\\\cyrchar\\\\CYRABHHA",'\u04A8'],["\\\\cyrchar\\\\cyrabhha",'\u04A9'],["\\\\cyrchar\\\\cyrkhcrs",'\u049F'],["\\\\cyrchar\\\\CYRKHCRS",'\u049E'],["\\\\cyrchar\\\\cyrkvcrs",'\u049D'],["\\\\downslopeellipsis",'\u22F1'],["\\\\cyrchar\\\\CYRKVCRS",'\u049C'],["\\\\cyrchar\\\\cyrzhdsc",'\u0497'],["\\\\cyrchar\\\\CYRZHDSC",'\u0496'],["\\\\cyrchar\\\\cyrghcrs",'\u0493'],["\\\\cyrchar\\\\CYRGHCRS",'\u0492'],["\\\\rightarrowonoplus",'\u27F4'],["\\\\acwgapcirclearrow",'\u27F2'],["\\\\measuredangleleft",'\u299B'],["\\\\cyrchar\\\\CYRYHCRS",'\u04B0'],["\\\\cyrchar\\\\cyryhcrs",'\u04B1'],["\\\\cyrchar\\\\CYRTETSE",'\u04B4'],["\\\\cyrchar\\\\cyrtetse",'\u04B5'],["\\\\cyrchar\\\\cyrrtick",'\u048F'],["\\\\cyrchar\\\\CYRRTICK",'\u048E'],["\\\\cyrchar\\\\CYRABHCH",'\u04BC'],["\\\\cyrchar\\\\cyrabhch",'\u04BD'],["\\\\cyrchar\\\\cyrkoppa",'\u0481'],["\\\\cyrchar\\\\CYRKOPPA",'\u0480'],["\\\\RightUpDownVector",'\u294F'],["\\\\errbarblacksquare",'\u29EF'],["\\\\errbarblackcircle",'\u29F3'],["\\\\cyrchar\\\\cyromega",'\u0461'],["\\\\cyrchar\\\\CYROMEGA",'\u0460'],["\\\\mathsfbf\\{\\\\Psi\\}",'\uD835\uDF6D'],["\\\\mathsfbf\\{\\\\Phi\\}",'\uD835\uDF6B'],["\\\\mathsl\\{\\\\varpi\\}",'\uD835\uDF1B'],["\\\\mathsl\\{\\\\nabla\\}",'\uD835\uDEFB'],["\\\\mathsl\\{\\\\Omega\\}",'\uD835\uDEFA'],["\\\\mathsl\\{\\\\Sigma\\}",'\uD835\uDEF4'],["\\\\cyrchar\\\\cyrkbeak",'\u04A1'],["\\\\cyrchar\\\\cyrushrt",'\u045E'],["\\\\cyrchar\\\\cyrsftsn",'\u044C'],["\\\\cyrchar\\\\cyrhrdsn",'\u044A'],["\\\\cyrchar\\\\cyrishrt",'\u0439'],["\\\\cyrchar\\\\CYRSFTSN",'\u042C'],["\\\\cyrchar\\\\CYRHRDSN",'\u042A'],["\\\\twoheadrightarrow",'\u21A0'],["\\\\cyrchar\\\\CYRISHRT",'\u0419'],["\\\\cyrchar\\\\CYRUSHRT",'\u040E'],["\\\\varhexagonlrbonds",'\u232C'],["\\\\DownLeftTeeVector",'\u295E'],["\\\\mathbb\\{\\\\Gamma\\}",'\u213E'],["\\\\mathbb\\{\\\\gamma\\}",'\u213D'],['\\\\ddot\\{\\\\upsilon\\}','\u03CB'],["\\\\varcarriagereturn",'\u23CE'],["\\\\cyrchar\\\\CYRSCHWA",'\u04D8'],["\\\\cyrchar\\\\cyrschwa",'\u04D9'],["\\\\hspace\\{0\\.33em\\}",'\u2004'],["\\\\hspace\\{0\\.25em\\}",'\u2005'],["\\\\textquotedblright",'\u201D'],["\\\\textthreequarters",'\xBE'],["\\\\textasciidieresis",'\xA8'],["\\\\diamondrightblack",'\u2B17'],["\\\\circleonleftarrow",'\u2B30'],["\\\\bsimilarleftarrow",'\u2B41'],["\\\\LeftDownTeeVector",'\u2961'],["\\\\leftarrowbsimilar",'\u2B4B'],["\\\\triangleleftblack",'\u25ED'],["\\\\leftrightharpoons",'\u21CB'],["\\\\cwundercurvearrow",'\u293E'],["\\\\DownLeftVectorBar",'\u2956'],["\\\\rightleftharpoons",'\u21CC'],["\\\\circleurquadblack",'\u25D4'],["\\\\mathsfbf\\{\\\\phi\\}",'\uD835\uDF8D'],["\\\\leftarrowtriangle",'\u21FD'],["\\\\mathbb\\{\\\\Sigma\\}",'\u2140'],["\\\\textordmasculine",'\xBA'],["\\\\nvleftrightarrow",'\u21F9'],["\\\\twoheadleftarrow",'\u219E'],["\\\\diamondleftblack",'\u2B16'],["\\\\cyrchar\\\\CYRSHCH",'\u0429'],["\\\\leftarrowsimilar",'\u2973'],["\\\\cyrchar\\\\CYREREV",'\u042D'],["\\\\downdownharpoons",'\u2965'],["\\\\leftarrowonoplus",'\u2B32'],["\\\\cyrchar\\\\cyrshch",'\u0449'],["\\\\cyrchar\\\\cyrerev",'\u044D'],["\\\\cyrchar\\\\cyrtshe",'\u045B'],["\\\\leftrightharpoon",'\u294A'],["\\\\rightleftharpoon",'\u294B'],["\\\\mathbit\\{\\\\Phi\\}",'\uD835\uDF31'],["\\\\mathbit\\{\\\\Psi\\}",'\uD835\uDF33'],["\\\\mathbit\\{\\\\phi\\}",'\uD835\uDF53'],["\\\\cyrchar\\\\cyrdzhe",'\u045F'],["\\\\mathsfbf\\{\\\\Xi\\}",'\uD835\uDF63'],["\\\\leftleftharpoons",'\u2962'],["\\\\RightUpVectorBar",'\u2954'],["\\\\mathsfbf\\{\\\\Pi\\}",'\uD835\uDF65'],["\\\\rightrightarrows",'\u21C9'],["\\\\cyrchar\\\\CYRIOTE",'\u0464'],["\\\\rightarrowsupset",'\u2B44'],["\\\\cyrchar\\\\cyriote",'\u0465'],["\\\\cyrchar\\\\CYRLYUS",'\u0466'],["\\\\cyrchar\\\\cyrlyus",'\u0467'],["\\\\cyrchar\\\\CYRBYUS",'\u046A'],["\\\\similarleftarrow",'\u2B49'],["\\\\DownArrowUpArrow",'\u21F5'],["\\\\cyrchar\\\\CYRFITA",'\u0472'],["\\\\RightTriangleBar",'\u29D0'],["\\\\twoheaddownarrow",'\u21A1'],["\\\\cyrchar\\\\cyrshha",'\u04BB'],["\\\\cyrchar\\\\CYRSHHA",'\u04BA'],["\\\\openbracketright",'\u301B'],["\\\\sphericalangleup",'\u29A1'],["\\\\whitepointerleft",'\u25C5'],["\\\\cyrchar\\\\cyrhdsc",'\u04B3'],["\\\\cyrchar\\\\CYRHDSC",'\u04B2'],["\\\\cwgapcirclearrow",'\u27F3'],["\\\\blackpointerleft",'\u25C4'],["<\\\\kern\\-0\\.58em\\(",'\u2993'],["\\\\rightthreearrows",'\u21F6'],["\\\\ntrianglerighteq",'\u22ED'],["\\\\cyrchar\\\\CYRZDSC",'\u0498'],["\\\\cyrchar\\\\cyrzdsc",'\u0499'],["\\\\acwunderarcarrow",'\u293B'],["\\\\nVleftrightarrow",'\u21FC'],["\\\\cyrchar\\\\CYRKDSC",'\u049A'],["\\\\nvLeftrightarrow",'\u2904'],["\\\\cyrchar\\\\cyrkdsc",'\u049B'],["\\\\cyrchar\\\\cyrtdsc",'\u04AD'],["\\\\cyrchar\\\\CYRTDSC",'\u04AC'],["\\\\cyrchar\\\\cyrsdsc",'\u04AB'],["\\\\cyrchar\\\\CYRSDSC",'\u04AA'],["\\\\LeftUpDownVector",'\u2951'],["\\\\RightUpTeeVector",'\u295C'],["\\\\rightarrowapprox",'\u2975'],["\\\\hermitconjmatrix",'\u22B9'],["\\\\downharpoonright",'\u21C2'],["\\\\rightharpoondown",'\u21C1'],["\\\\hspace\\{0\\.6em\\}",'\u2002'],["\\\\cyrchar\\\\cyrotld",'\u04E9'],["\\\\cyrchar\\\\CYROTLD",'\u04E8'],["\\\\circlearrowright",'\u21BB'],["\\\\textquotedblleft",'\u201C'],["\\\\vartriangleright",'\u22B3'],["\\\\cyrchar\\\\CYRNDSC",'\u04A2'],["\\\\acute\\{\\\\omega\\}",'\u03CE'],["\\\\textvisiblespace",'\u2423'],["\\\\cyrchar\\\\cyrndsc",'\u04A3'],["\\\\APLrightarrowbox",'\u2348'],["\\\\cyrchar\\\\CYRTSHE",'\u040B'],["\\\\textquestiondown",'\xBF'],["\\\\diamondleftarrow",'\u291D'],["\\\\cyrchar\\\\CYRDZHE",'\u040F'],["\\\\LeftRightVector",'\u294E'],["\\\\acwoverarcarrow",'\u293A'],["\\\\acwleftarcarrow",'\u2939'],["\\\\cwrightarcarrow",'\u2938'],["\\\\cyrchar\\\\CYRPHK",'\u04A6'],["\\\\cyrchar\\\\cyrphk",'\u04A7'],['\\\\upslopeellipsis','\u22F0'],["\\\\downarrowbarred",'\u2908'],["\\\\cyrchar\\\\CYRKHK",'\u04C3'],["\\\\cyrchar\\\\cyrkhk",'\u04C4'],["\\\\mathbit\\{\\\\Pi\\}",'\uD835\uDF2B'],["\\\\mathbit\\{\\\\Xi\\}",'\uD835\uDF29'],["\\\\mathsl\\{\\\\phi\\}",'\uD835\uDF19'],["\\\\mathsl\\{\\\\Psi\\}",'\uD835\uDEF9'],["\\\\mathsl\\{\\\\Phi\\}",'\uD835\uDEF7'],["\\\\cyrchar\\\\CYRNHK",'\u04C7'],["\\\\cyrchar\\\\cyrnhk",'\u04C8'],["\\\\perspcorrespond",'\u2306'],["\\\\APLleftarrowbox",'\u2347'],["\\\\APLdownarrowbox",'\u2357'],["\\\\circledrightdot",'\u2686'],["\\\\textperthousand",'\u2030'],["\\\\enclosetriangle",'\u20E4'],["\\\\widebridgeabove",'\u20E9'],["\\\\blockhalfshaded",'\u2592'],['\\\\underrightarrow','\u20EF'],['\\\\urblacktriangle','\u25E5'],['\\\\ulblacktriangle','\u25E4'],["\\\\llblacktriangle",'\u25E3'],["\\\\lrblacktriangle",'\u25E2'],["\\\\bigtriangledown",'\u25BD'],["\\\\mathbf\\{\\\\phi\\}",'\uD835\uDEDF'],["\\\\vrectangleblack",'\u25AE'],["\\\\hrectangleblack",'\u25AC'],["\\\\squarecrossfill",'\u25A9'],["\\\\mathbf\\{\\\\Psi\\}",'\uD835\uDEBF'],["\\\\mathbf\\{\\\\Phi\\}",'\uD835\uDEBD'],["\\\\rightsquigarrow",'\u21DD'],["\\\\vartriangleleft",'\u22B2'],["\\\\trianglerighteq",'\u22B5'],["\\\\nLeftrightarrow",'\u21CE'],["\\\\greaterequivlnt",'\u2273'],["\\\\rightwhitearrow",'\u21E8'],["\\\\mathsfbfsl\\{z\\}",'\uD835\uDE6F'],["\\\\mathsfbfsl\\{y\\}",'\uD835\uDE6E'],["\\\\mathsfbfsl\\{x\\}",'\uD835\uDE6D'],["\\\\mathsfbfsl\\{w\\}",'\uD835\uDE6C'],["\\\\mathsfbfsl\\{v\\}",'\uD835\uDE6B'],["\\\\mathsfbfsl\\{u\\}",'\uD835\uDE6A'],["\\\\mathsfbfsl\\{t\\}",'\uD835\uDE69'],["\\\\mathsfbfsl\\{s\\}",'\uD835\uDE68'],["\\\\mathsfbfsl\\{r\\}",'\uD835\uDE67'],["\\\\mathsfbfsl\\{q\\}",'\uD835\uDE66'],["\\\\mathsfbfsl\\{p\\}",'\uD835\uDE65'],["\\\\mathsfbfsl\\{o\\}",'\uD835\uDE64'],["\\\\mathsfbfsl\\{n\\}",'\uD835\uDE63'],["\\\\mathsfbfsl\\{m\\}",'\uD835\uDE62'],["\\\\mathsfbfsl\\{l\\}",'\uD835\uDE61'],["\\\\mathsfbfsl\\{k\\}",'\uD835\uDE60'],["\\\\mathsfbfsl\\{j\\}",'\uD835\uDE5F'],["\\\\mathsfbfsl\\{i\\}",'\uD835\uDE5E'],["\\\\mathsfbfsl\\{h\\}",'\uD835\uDE5D'],["\\\\mathsfbfsl\\{g\\}",'\uD835\uDE5C'],["\\\\mathsfbfsl\\{f\\}",'\uD835\uDE5B'],["\\\\mathsfbfsl\\{e\\}",'\uD835\uDE5A'],["\\\\mathsfbfsl\\{d\\}",'\uD835\uDE59'],["\\\\mathsfbfsl\\{c\\}",'\uD835\uDE58'],["\\\\mathsfbfsl\\{b\\}",'\uD835\uDE57'],["\\\\mathsfbfsl\\{a\\}",'\uD835\uDE56'],["\\\\mathsfbfsl\\{Z\\}",'\uD835\uDE55'],["\\\\mathsfbfsl\\{Y\\}",'\uD835\uDE54'],["\\\\mathsfbfsl\\{X\\}",'\uD835\uDE53'],["\\\\mathsfbfsl\\{W\\}",'\uD835\uDE52'],["\\\\mathsfbfsl\\{V\\}",'\uD835\uDE51'],["\\\\mathsfbfsl\\{U\\}",'\uD835\uDE50'],["\\\\mathsfbfsl\\{T\\}",'\uD835\uDE4F'],["\\\\mathsfbfsl\\{S\\}",'\uD835\uDE4E'],["\\\\mathsfbfsl\\{R\\}",'\uD835\uDE4D'],["\\\\mathsfbfsl\\{Q\\}",'\uD835\uDE4C'],["\\\\mathsfbfsl\\{P\\}",'\uD835\uDE4B'],["\\\\mathsfbfsl\\{O\\}",'\uD835\uDE4A'],["\\\\mathsfbfsl\\{N\\}",'\uD835\uDE49'],["\\\\mathsfbfsl\\{M\\}",'\uD835\uDE48'],["\\\\mathsfbfsl\\{L\\}",'\uD835\uDE47'],["\\\\mathsfbfsl\\{K\\}",'\uD835\uDE46'],["\\\\mathsfbfsl\\{J\\}",'\uD835\uDE45'],["\\\\mathsfbfsl\\{I\\}",'\uD835\uDE44'],["\\\\mathsfbfsl\\{H\\}",'\uD835\uDE43'],["\\\\mathsfbfsl\\{G\\}",'\uD835\uDE42'],["\\\\mathsfbfsl\\{F\\}",'\uD835\uDE41'],["\\\\mathsfbfsl\\{E\\}",'\uD835\uDE40'],["\\\\mathsfbfsl\\{D\\}",'\uD835\uDE3F'],["\\\\mathsfbfsl\\{C\\}",'\uD835\uDE3E'],["\\\\mathsfbfsl\\{B\\}",'\uD835\uDE3D'],["\\\\mathsfbfsl\\{A\\}",'\uD835\uDE3C'],["\\\\textquotesingle","'"],["\\\\openbracketleft",'\u301A'],["\\\\leftarrowapprox",'\u2B4A'],["\\\\leftcurvedarrow",'\u2B3F'],["\\\\nVleftarrowtail",'\u2B3A'],["\\\\nvleftarrowtail",'\u2B39'],["\\\\twoheadmapsfrom",'\u2B36'],["\\\\leftthreearrows",'\u2B31'],["\\\\varhexagonblack",'\u2B22'],["\\\\diamondbotblack",'\u2B19'],["\\\\diamondtopblack",'\u2B18'],["\\\\leftrightarrows",'\u21C6'],["\\\\textordfeminine",'\xAA'],["\\\\textasciimacron",'\xAF'],["\\\\rightleftarrows",'\u21C4'],["\\\\downharpoonleft",'\u21C3'],["\\\\rightthreetimes",'\u22CC'],["\\\\leftharpoondown",'\u21BD'],["\\\\acute\\{\\\\iota\\}",'\u03AF'],["\\\\circlearrowleft",'\u21BA'],["\\\\cyrchar\\\\CYRDJE",'\u0402'],["\\\\cyrchar\\\\CYRDZE",'\u0405'],["\\\\verymuchgreater",'\u22D9'],["\\\\cyrchar\\\\CYRLJE",'\u0409'],["\\\\cyrchar\\\\CYRNJE",'\u040A'],["\\\\cyrchar\\\\CYRERY",'\u042B'],["\\\\curvearrowright",'\u21B7'],["\\\\not\\\\sqsubseteq",'\u22E2'],["\\\\not\\\\sqsupseteq",'\u22E3'],["\\\\bigtriangleleft",'\u2A1E'],["\\\\cyrchar\\\\cyrery",'\u044B'],["\\\\cyrchar\\\\cyrdje",'\u0452'],["\\\\cyrchar\\\\cyrdze",'\u0455'],["\\\\cyrchar\\\\cyrlje",'\u0459'],["\\\\cyrchar\\\\cyrnje",'\u045A'],["\\\\nleftrightarrow",'\u21AE'],["\\\\cyrchar\\\\CYRYAT",'\u0462'],["\\\\circledownarrow",'\u29EC'],["\\\\cyrchar\\\\CYRKSI",'\u046E'],["\\\\cyrchar\\\\cyrksi",'\u046F'],["\\\\cyrchar\\\\CYRPSI",'\u0470'],["\\\\cyrchar\\\\cyrpsi",'\u0471'],["\\\\cyrchar\\\\CYRIZH",'\u0474'],["\\\\LeftTriangleBar",'\u29CF'],['\\\\uparrowoncircle','\u29BD'],["\\\\circledparallel",'\u29B7'],["\\\\measangledltosw",'\u29AF'],["\\\\measangledrtose",'\u29AE'],["\\\\measangleultonw",'\u29AD'],["\\\\measangleurtone",'\u29AC'],["\\\\measangleldtosw",'\u29AB'],["\\\\measanglerdtose",'\u29AA'],["\\\\measanglelutonw",'\u29A9'],["\\\\measanglerutone",'\u29A8'],["\\\\cyrchar\\\\CYRGUP",'\u0490'],["\\\\cyrchar\\\\cyrgup",'\u0491'],["\\\\ntrianglelefteq",'\u22EC'],["\\\\cyrchar\\\\CYRGHK",'\u0494'],["\\\\cyrchar\\\\cyrghk",'\u0495'],["\\\\leftarrowsubset",'\u297A'],["\\\\equalrightarrow",'\u2971'],["\\\\barrightharpoon",'\u296D'],["\\\\rightbarharpoon",'\u296C'],["\\\\LeftUpTeeVector",'\u2960'],["\\\\LeftUpVectorBar",'\u2958'],["\\\\notgreaterless",'\u2279'],["\\\\rightouterjoin",'\u27D6'],["\\\\mathbf\\{\\\\Pi\\}",'\uD835\uDEB7'],["\\\\rightarrowtail",'\u21A3'],["\\\\cyrchar\\\\cyrot",'\u047F'],["\\\\cyrchar\\\\CYRUK",'\u0478'],["\\\\cyrchar\\\\CYROT",'\u047E'],['\\\\underleftarrow','\u20EE'],["\\\\triangleserifs",'\u29CD'],["\\\\blackhourglass",'\u29D7'],["\\\\downdownarrows",'\u21CA'],["\\\\approxnotequal",'\u2246'],["\\\\leftsquigarrow",'\u21DC'],["\\\\mathsl\\{\\\\Pi\\}",'\uD835\uDEF1'],["\\\\mathsl\\{\\\\Xi\\}",'\uD835\uDEEF'],["\\\\cyrchar\\\\cyrje",'\u0458'],["\\\\cyrchar\\\\cyryi",'\u0457'],["\\\\cyrchar\\\\cyrii",'\u0456'],["\\\\cyrchar\\\\cyrie",'\u0454'],["\\\\cyrchar\\\\cyryo",'\u0451'],["\\\\cyrchar\\\\cyrya",'\u044F'],["\\\\cyrchar\\\\cyryu",'\u044E'],["\\\\cyrchar\\\\cyrsh",'\u0448'],["\\\\cyrchar\\\\cyrch",'\u0447'],["\\\\carriagereturn",'\u21B5'],["\\\\cyrchar\\\\cyrzh",'\u0436'],["\\\\cyrchar\\\\CYRYA",'\u042F'],["\\\\cyrchar\\\\CYRYU",'\u042E'],["\\\\curvearrowleft",'\u21B6'],["\\\\cyrchar\\\\CYRSH",'\u0428'],["\\\\cyrchar\\\\CYRCH",'\u0427'],["\\\\bigslopedwedge",'\u2A58'],["\\\\wedgedoublebar",'\u2A60'],["\\\\twoheaduparrow",'\u219F'],["\\\\arrowwaveleft|\\\\arrowwaveright",'\u219C'],["\\\\cyrchar\\\\CYRZH",'\u0416'],["\\\\leftrightarrow",'\u2194'],["\\\\cyrchar\\\\CYRJE",'\u0408'],["\\\\cyrchar\\\\CYRYI",'\u0407'],["\\\\cyrchar\\\\CYRII",'\u0406'],["\\\\cyrchar\\\\CYRIE",'\u0404'],["\\\\mathbb\\{\\\\Pi\\}",'\u213F'],["\\\\cyrchar\\\\CYRYO",'\u0401'],["\\\\APLboxquestion",'\u2370'],["\\\\ddot\\{\\\\iota\\}",'\u03CA'],["\\\\mathbb\\{\\\\pi\\}",'\u213C'],["\\\\hookrightarrow",'\u21AA'],["\\\\lparenextender",'\u239C'],["\\\\rparenextender",'\u239F'],["\\\\acute\\{\\\\eta\\}",'\u03AE'],["\\\\lbrackextender",'\u23A2'],["\\\\NestedLessLess",'\u2AA1'],["\\\\rbrackextender",'\u23A5'],["\\\\vbraceextender",'\u23AA'],["\\\\harrowextender",'\u23AF'],["\\\\cyrchar\\\\CYRAE",'\u04D4'],["\\\\cyrchar\\\\cyrae",'\u04D5'],["\\\\circledtwodots",'\u2687'],['\\\\upharpoonright','\u21BE'],["\\\\ocommatopright",'\u0315'],["\\\\rightharpoonup",'\u21C0'],["\\\\leftthreetimes",'\u22CB'],["\\\\rightarrowplus",'\u2945'],["\\\\textasciibreve",'\u02D8'],["\\\\textasciicaron",'\u02C7'],["\\\\textdoublepipe",'\u01C2'],["\\\\textonequarter",'\xBC'],["\\\\guillemotright",'\xBB'],["\\\\mathrm\\{\\\\mu\\}",'\xB5'],["\\\\textasciiacute",'\xB4'],["\\\\guilsinglright",'\u203A'],["\\\\cyrchar\\\\CYRNG",'\u04A4'],["\\\\looparrowright",'\u21AC'],["\\\\textregistered",'\xAE'],["\\\\dblarrowupdown",'\u21C5'],["\\\\textexclamdown",'\xA1'],["\\\\squaretopblack",'\u2B12'],["\\\\squarebotblack",'\u2B13'],["\\\\textasciigrave",'`'],["\\\\leftleftarrows",'\u21C7'],["\\\\enclosediamond",'\u20DF'],["\\\\Longrightarrow",'\u27F9'],["\\\\equalleftarrow",'\u2B40'],["\\\\blockrighthalf",'\u2590'],["\\\\blockqtrshaded",'\u2591'],["\\\\RightVectorBar",'\u2953'],["\\\\ntriangleright",'\u22EB'],["\\\\longrightarrow",'\u27F6'],['\\\\updownarrowbar','\u21A8'],["\\\\cyrchar\\\\cyrng",'\u04A5'],["\\\\rightanglemdot",'\u299D'],["\\\\concavediamond",'\u27E1'],["\\\\rdiagovsearrow",'\u2930'],["\\\\fdiagovnearrow",'\u292F'],["\\\\leftbarharpoon",'\u296A'],["\\\\trianglelefteq",'\u22B4'],["\\\\circlevertfill",'\u25CD'],["\\\\barleftharpoon",'\u296B'],["\\\\dashrightarrow",'\u21E2'],["\\\\RightTeeVector",'\u295B'],["\\\\cyrchar\\\\cyruk",'\u0479'],["\\\\downwhitearrow",'\u21E9'],["\\\\squarenwsefill",'\u25A7'],["\\\\Leftrightarrow",'\u21D4'],["\\\\squareneswfill",'\u25A8'],["\\\\leftwhitearrow",'\u21E6'],["\\\\mathbf\\{\\\\Xi\\}",'\uD835\uDEB5'],["\\\\sphericalangle",'\u2222'],["\\\\notlessgreater",'\u2278'],["\\\\downdasharrow",'\u21E3'],["\\\\mathsfbf\\{R\\}",'\uD835\uDDE5'],["\\\\mathslbb\\{D\\}",'\uD835\uDD6F'],["\\\\mathfrak\\{H\\}",'\u210C'],["\\\\mathslbb\\{E\\}",'\uD835\uDD70'],["\\\\RightArrowBar",'\u21E5'],["\\\\measuredangle",'\u2221'],["\\\\mathslbb\\{F\\}",'\uD835\uDD71'],["\\\\mathsfbf\\{S\\}",'\uD835\uDDE6'],["\\\\mathslbb\\{O\\}",'\uD835\uDD7A'],["\\\\biginterleave",'\u2AFC'],["\\\\mathsfsl\\{Y\\}",'\uD835\uDE20'],["\\\\mathsfsl\\{X\\}",'\uD835\uDE1F'],["\\\\textbrokenbar",'\xA6'],["\\\\mathsfsl\\{W\\}",'\uD835\uDE1E'],["\\\\textcopyright",'\xA9'],["\\\\guillemotleft",'\xAB'],["\\\\textparagraph",'\xB6'],["\\\\guilsinglleft",'\u2039'],["\\\\mathsfsl\\{V\\}",'\uD835\uDE1D'],["\\\\mathslbb\\{P\\}",'\uD835\uDD7B'],["\\\\mathslbb\\{Q\\}",'\uD835\uDD7C'],["\\\\mathfrak\\{Z\\}",'\u2128'],["\\\\mathsfsl\\{U\\}",'\uD835\uDE1C'],["\\\\shortdowntack",'\u2ADF'],["\\\\shortlefttack",'\u2ADE'],["\\\\textdaggerdbl",'\u2021'],["\\\\mathfrak\\{C\\}",'\u212D'],["\\\\mathslbb\\{R\\}",'\uD835\uDD7D'],["\\\\mathslbb\\{S\\}",'\uD835\uDD7E'],["\\\\mathslbb\\{T\\}",'\uD835\uDD7F'],["\\\\divideontimes",'\u22C7'],["\\\\mathslbb\\{U\\}",'\uD835\uDD80'],["\\\\mathslbb\\{V\\}",'\uD835\uDD81'],["\\\\mathslbb\\{W\\}",'\uD835\uDD82'],["\\\\hookleftarrow",'\u21A9'],["\\\\mathslbb\\{X\\}",'\uD835\uDD83'],["\\\\mathsfsl\\{T\\}",'\uD835\uDE1B'],["\\\\mathsfsl\\{S\\}",'\uD835\uDE1A'],['\\\\upharpoonleft','\u21BF'],["\\\\mathslbb\\{Y\\}",'\uD835\uDD84'],["\\\\mathsfsl\\{R\\}",'\uD835\uDE19'],["\\\\mathsfsl\\{Q\\}",'\uD835\uDE18'],["\\\\mathslbb\\{Z\\}",'\uD835\uDD85'],["\\\\hphantom\\{,\\}",'\u2008'],["\\\\mathsfsl\\{P\\}",'\uD835\uDE17'],["\\\\mathsfsl\\{O\\}",'\uD835\uDE16'],["\\\\sixteenthnote",'\u266C'],["\\\\hphantom\\{0\\}",'\u2007'],["\\\\hspace\\{1em\\}",'\u2003'],["\\\\Hermaphrodite",'\u26A5'],["\\\\mathslbb\\{a\\}",'\uD835\uDD86'],["\\\\mdsmwhtcircle",'\u26AC'],["\\\\leftharpoonup",'\u21BC'],["\\\\mathsfsl\\{N\\}",'\uD835\uDE15'],["\\\\mathsfsl\\{M\\}",'\uD835\uDE14'],["\\\\cyrchar\\\\cyry",'\u04AF'],["\\\\mathsfsl\\{L\\}",'\uD835\uDE13'],["\\\\APLboxupcaret",'\u2353'],["\\\\APLuparrowbox",'\u2350'],["\\\\mathsfsl\\{K\\}",'\uD835\uDE12'],["\\\\mathsfbf\\{b\\}",'\uD835\uDDEF'],["\\\\sansLmirrored",'\u2143'],["\\\\mathsfsl\\{J\\}",'\uD835\uDE11'],["\\\\mathsfbf\\{l\\}",'\uD835\uDDF9'],["\\\\cyrchar\\\\CYRY",'\u04AE'],['\\\\uparrowbarred','\u2909'],["\\\\DifferentialD",'\u2146'],["\\\\mathchar\"2208",'\u2316'],["\\\\cyrchar\\\\CYRA",'\u0410'],["\\\\cyrchar\\\\CYRB",'\u0411'],["\\\\cyrchar\\\\CYRV",'\u0412'],["\\\\cyrchar\\\\CYRG",'\u0413'],["\\\\cyrchar\\\\CYRD",'\u0414'],["\\\\cyrchar\\\\CYRE",'\u0415'],["\\\\cyrchar\\\\CYRZ",'\u0417'],["\\\\cyrchar\\\\CYRI",'\u0418'],["\\\\cyrchar\\\\CYRK",'\u041A'],["\\\\cyrchar\\\\CYRL",'\u041B'],["\\\\cyrchar\\\\CYRM",'\u041C'],["\\\\mathsfsl\\{I\\}",'\uD835\uDE10'],["\\\\mathsfsl\\{H\\}",'\uD835\uDE0F'],["\\\\cyrchar\\\\CYRN",'\u041D'],["\\\\mathsfsl\\{G\\}",'\uD835\uDE0E'],["\\\\cyrchar\\\\CYRO",'\u041E'],["\\\\cyrchar\\\\CYRP",'\u041F'],["\\\\mathslbb\\{b\\}",'\uD835\uDD87'],["\\\\mathsfbf\\{9\\}",'\uD835\uDFF5'],["\\\\cyrchar\\\\CYRR",'\u0420'],["\\\\cyrchar\\\\CYRS",'\u0421'],["\\\\cyrchar\\\\CYRT",'\u0422'],["\\\\cyrchar\\\\CYRU",'\u0423'],["\\\\mathsfbf\\{8\\}",'\uD835\uDFF4'],["\\\\mathsfbf\\{7\\}",'\uD835\uDFF3'],["\\\\mathsfbf\\{6\\}",'\uD835\uDFF2'],["\\\\mathslbb\\{c\\}",'\uD835\uDD88'],["\\\\mathslbb\\{d\\}",'\uD835\uDD89'],["\\\\cyrchar\\\\CYRF",'\u0424'],["\\\\mathslbb\\{e\\}",'\uD835\uDD8A'],["\\\\cyrchar\\\\CYRH",'\u0425'],["\\\\cyrchar\\\\CYRC",'\u0426'],["\\\\mathsfbf\\{5\\}",'\uD835\uDFF1'],["\\\\mathslbb\\{f\\}",'\uD835\uDD8B'],["\\\\mathslbb\\{g\\}",'\uD835\uDD8C'],["\\\\mathslbb\\{h\\}",'\uD835\uDD8D'],["\\\\mathsfbf\\{4\\}",'\uD835\uDFF0'],["\\\\mathsfbf\\{3\\}",'\uD835\uDFEF'],["\\\\looparrowleft",'\u21AB'],["\\\\mathslbb\\{i\\}",'\uD835\uDD8E'],["\\\\mathslbb\\{j\\}",'\uD835\uDD8F'],["\\\\cyrchar\\\\cyra",'\u0430'],["\\\\cyrchar\\\\cyrb",'\u0431'],["\\\\cyrchar\\\\cyrv",'\u0432'],["\\\\cyrchar\\\\cyrg",'\u0433'],["\\\\cyrchar\\\\cyrd",'\u0434'],["\\\\mathslbb\\{k\\}",'\uD835\uDD90'],["\\\\triangletimes",'\u2A3B'],["\\\\triangleminus",'\u2A3A'],["\\\\cyrchar\\\\cyre",'\u0435'],["\\\\mathsfbf\\{2\\}",'\uD835\uDFEE'],["\\\\mathslbb\\{l\\}",'\uD835\uDD91'],["\\\\cyrchar\\\\cyrz",'\u0437'],["\\\\cyrchar\\\\cyri",'\u0438'],["\\\\mathslbb\\{m\\}",'\uD835\uDD92'],["\\\\cyrchar\\\\cyrk",'\u043A'],["\\\\mathslbb\\{n\\}",'\uD835\uDD93'],["\\\\mathslbb\\{o\\}",'\uD835\uDD94'],["\\\\mathsfbf\\{c\\}",'\uD835\uDDF0'],["\\\\mathslbb\\{p\\}",'\uD835\uDD95'],["\\\\mathslbb\\{q\\}",'\uD835\uDD96'],["\\\\cyrchar\\\\cyrl",'\u043B'],["\\\\mathslbb\\{r\\}",'\uD835\uDD97'],["\\\\cyrchar\\\\cyrm",'\u043C'],["\\\\mathslbb\\{s\\}",'\uD835\uDD98'],["\\\\cyrchar\\\\cyrn",'\u043D'],["\\\\cyrchar\\\\cyro",'\u043E'],["\\\\cyrchar\\\\cyrp",'\u043F'],["\\\\cyrchar\\\\cyrr",'\u0440'],["\\\\cyrchar\\\\cyrs",'\u0441'],["\\\\cyrchar\\\\cyrt",'\u0442'],["\\\\cyrchar\\\\cyru",'\u0443'],["\\\\cyrchar\\\\cyrf",'\u0444'],["\\\\cyrchar\\\\cyrh",'\u0445'],["\\\\cyrchar\\\\cyrc",'\u0446'],["\\\\mathslbb\\{t\\}",'\uD835\uDD99'],["\\\\mathslbb\\{u\\}",'\uD835\uDD9A'],["\\\\leftarrowplus",'\u2946'],["\\\\mathslbb\\{v\\}",'\uD835\uDD9B'],["\\\\mathslbb\\{w\\}",'\uD835\uDD9C'],["\\\\mathslbb\\{x\\}",'\uD835\uDD9D'],["\\\\mathsfbf\\{1\\}",'\uD835\uDFED'],["\\\\rightdotarrow",'\u2911'],["\\\\mathslbb\\{y\\}",'\uD835\uDD9E'],["\\\\mathsfbf\\{0\\}",'\uD835\uDFEC'],["\\\\leftarrowless",'\u2977'],["\\\\mathsfbf\\{d\\}",'\uD835\uDDF1'],["\\\\mathsfsl\\{E\\}",'\uD835\uDE0C'],["\\\\mathsfsl\\{D\\}",'\uD835\uDE0B'],["\\\\mathslbb\\{z\\}",'\uD835\uDD9F'],["\\\\mathsfsl\\{C\\}",'\uD835\uDE0A'],["\\\\mathsfsl\\{B\\}",'\uD835\uDE09'],["\\\\mathsfbf\\{e\\}",'\uD835\uDDF2'],["\\\\fallingdotseq",'\u2252'],["\\\\mathsfsl\\{A\\}",'\uD835\uDE08'],["\\\\mathsfbf\\{A\\}",'\uD835\uDDD4'],["\\\\errbardiamond",'\u29F0'],["\\\\mathsfbf\\{B\\}",'\uD835\uDDD5'],["\\\\mathsfbf\\{C\\}",'\uD835\uDDD6'],["\\\\mathsfbf\\{f\\}",'\uD835\uDDF3'],["\\\\mathsfbf\\{D\\}",'\uD835\uDDD7'],["\\\\mathsfbf\\{E\\}",'\uD835\uDDD8'],["\\\\mathsfbf\\{F\\}",'\uD835\uDDD9'],["\\\\mathsfbf\\{G\\}",'\uD835\uDDDA'],["\\\\mathsfbf\\{z\\}",'\uD835\uDE07'],["\\\\mathsfbf\\{H\\}",'\uD835\uDDDB'],["\\\\mathsfbf\\{I\\}",'\uD835\uDDDC'],["\\\\mathsfbf\\{J\\}",'\uD835\uDDDD'],["\\\\mathsfbf\\{K\\}",'\uD835\uDDDE'],["\\\\mathsfbf\\{L\\}",'\uD835\uDDDF'],["\\\\mathsfbf\\{M\\}",'\uD835\uDDE0'],["\\\\mathsfbf\\{N\\}",'\uD835\uDDE1'],["\\\\mathsfbf\\{O\\}",'\uD835\uDDE2'],["\\\\mathsfbf\\{g\\}",'\uD835\uDDF4'],["\\\\LeftVectorBar",'\u2952'],["\\\\mathsfbf\\{y\\}",'\uD835\uDE06'],["\\\\mathsfbf\\{P\\}",'\uD835\uDDE3'],['\\\\UpEquilibrium','\u296E'],["\\\\bigtriangleup",'\u25B3'],["\\\\blacktriangle",'\u25B4'],["\\\\rightanglearc",'\u22BE'],["\\\\dashleftarrow",'\u21E0'],["\\\\triangleright",'\u25B9'],["\\\\mathslbb\\{A\\}",'\uD835\uDD6C'],["\\\\mathsfbf\\{Q\\}",'\uD835\uDDE4'],["\\\\mathfrak\\{I\\}",'\u2111'],["\\\\mathslbb\\{B\\}",'\uD835\uDD6D'],["\\\\not\\\\supseteq",'\u2289'],["\\\\not\\\\subseteq",'\u2288'],["\\\\mathslbb\\{C\\}",'\uD835\uDD6E'],["\\\\mathfrak\\{z\\}",'\uD835\uDD37'],["\\\\mathfrak\\{y\\}",'\uD835\uDD36'],["\\\\mathfrak\\{x\\}",'\uD835\uDD35'],["\\\\mathfrak\\{w\\}",'\uD835\uDD34'],["\\\\mathfrak\\{v\\}",'\uD835\uDD33'],["\\\\mathfrak\\{u\\}",'\uD835\uDD32'],["\\\\mathfrak\\{t\\}",'\uD835\uDD31'],["\\\\mathfrak\\{s\\}",'\uD835\uDD30'],["\\\\mathfrak\\{r\\}",'\uD835\uDD2F'],["\\\\mathfrak\\{q\\}",'\uD835\uDD2E'],["\\\\mathfrak\\{p\\}",'\uD835\uDD2D'],["\\\\mathfrak\\{o\\}",'\uD835\uDD2C'],["\\\\mathfrak\\{n\\}",'\uD835\uDD2B'],["\\\\mathfrak\\{m\\}",'\uD835\uDD2A'],["\\\\mathfrak\\{l\\}",'\uD835\uDD29'],["\\\\mathfrak\\{k\\}",'\uD835\uDD28'],["\\\\mathfrak\\{j\\}",'\uD835\uDD27'],["\\\\mathfrak\\{i\\}",'\uD835\uDD26'],["\\\\mathfrak\\{h\\}",'\uD835\uDD25'],["\\\\mathfrak\\{g\\}",'\uD835\uDD24'],["\\\\mathfrak\\{f\\}",'\uD835\uDD23'],["\\\\mathfrak\\{e\\}",'\uD835\uDD22'],["\\\\mathfrak\\{d\\}",'\uD835\uDD21'],["\\\\mathfrak\\{c\\}",'\uD835\uDD20'],["\\\\mathfrak\\{b\\}",'\uD835\uDD1F'],["\\\\mathfrak\\{a\\}",'\uD835\uDD1E'],["\\\\mathfrak\\{Y\\}",'\uD835\uDD1C'],["\\\\mathfrak\\{X\\}",'\uD835\uDD1B'],["\\\\mathfrak\\{W\\}",'\uD835\uDD1A'],["\\\\mathfrak\\{V\\}",'\uD835\uDD19'],["\\\\mathfrak\\{U\\}",'\uD835\uDD18'],["\\\\mathfrak\\{T\\}",'\uD835\uDD17'],["\\\\mathfrak\\{S\\}",'\uD835\uDD16'],["\\\\mathfrak\\{Q\\}",'\uD835\uDD14'],["\\\\mathfrak\\{P\\}",'\uD835\uDD13'],["\\\\mathfrak\\{O\\}",'\uD835\uDD12'],["\\\\mathfrak\\{N\\}",'\uD835\uDD11'],["\\\\mathfrak\\{M\\}",'\uD835\uDD10'],["\\\\mathfrak\\{L\\}",'\uD835\uDD0F'],["\\\\mathfrak\\{K\\}",'\uD835\uDD0E'],["\\\\mathfrak\\{J\\}",'\uD835\uDD0D'],["\\\\mathfrak\\{G\\}",'\uD835\uDD0A'],["\\\\mathfrak\\{F\\}",'\uD835\uDD09'],["\\\\mathfrak\\{E\\}",'\uD835\uDD08'],["\\\\mathfrak\\{D\\}",'\uD835\uDD07'],["\\\\mathfrak\\{B\\}",'\uD835\uDD05'],["\\\\mathfrak\\{A\\}",'\uD835\uDD04'],["\\\\mathsfsl\\{F\\}",'\uD835\uDE0D'],["\\\\mathslbb\\{G\\}",'\uD835\uDD72'],["\\\\mathslbb\\{H\\}",'\uD835\uDD73'],["\\\\topsemicircle",'\u25E0'],["\\\\botsemicircle",'\u25E1'],["\\\\mathslbb\\{I\\}",'\uD835\uDD74'],["\\\\squareulblack",'\u25E9'],["\\\\mathsfbf\\{x\\}",'\uD835\uDE05'],["\\\\mathsfbf\\{T\\}",'\uD835\uDDE7'],["\\\\leftarrowtail",'\u21A2'],["\\\\mathsfbf\\{w\\}",'\uD835\uDE04'],["\\\\mathsfbf\\{v\\}",'\uD835\uDE03'],["\\\\leftouterjoin",'\u27D5'],["\\\\fullouterjoin",'\u27D7'],["\\\\mathsfbf\\{u\\}",'\uD835\uDE02'],["\\\\circledbullet",'\u29BF'],["\\\\mathsfbf\\{U\\}",'\uD835\uDDE8'],["\\\\LeftTeeVector",'\u295A'],["\\\\mathsfbf\\{V\\}",'\uD835\uDDE9'],["\\\\mathsfbf\\{W\\}",'\uD835\uDDEA'],["\\\\mathsfbf\\{X\\}",'\uD835\uDDEB'],["\\\\circledbslash",'\u29B8'],["\\\\mathsfbf\\{Y\\}",'\uD835\uDDEC'],["\\\\emptysetoarrl",'\u29B4'],["\\\\emptysetocirc",'\u29B2'],["\\\\mathsfbf\\{t\\}",'\uD835\uDE01'],["\\\\mathsfbf\\{h\\}",'\uD835\uDDF5'],["\\\\mathsfbf\\{i\\}",'\uD835\uDDF6'],["\\\\mathsfbf\\{j\\}",'\uD835\uDDF7'],["\\\\mathsfbf\\{s\\}",'\uD835\uDE00'],["\\\\wideangledown",'\u29A6'],["\\\\mathsfbf\\{r\\}",'\uD835\uDDFF'],["\\\\mathsfbf\\{q\\}",'\uD835\uDDFE'],["\\\\mathsfbf\\{Z\\}",'\uD835\uDDED'],["\\\\mathsfbf\\{p\\}",'\uD835\uDDFD'],["\\\\mathsfbf\\{a\\}",'\uD835\uDDEE'],["\\\\mathsfbf\\{k\\}",'\uD835\uDDF8'],["\\\\longleftarrow",'\u27F5'],["\\\\mathsfsl\\{z\\}",'\uD835\uDE3B'],["\\\\mathsfsl\\{y\\}",'\uD835\uDE3A'],["\\\\mathsfsl\\{x\\}",'\uD835\uDE39'],["\\\\mathsfsl\\{w\\}",'\uD835\uDE38'],["\\\\mathsfsl\\{v\\}",'\uD835\uDE37'],["\\\\mathsfsl\\{u\\}",'\uD835\uDE36'],["\\\\mathsfsl\\{t\\}",'\uD835\uDE35'],["\\\\mathsfsl\\{s\\}",'\uD835\uDE34'],["\\\\mathsfsl\\{r\\}",'\uD835\uDE33'],["\\\\mathsfsl\\{q\\}",'\uD835\uDE32'],["\\\\mathsfsl\\{p\\}",'\uD835\uDE31'],["\\\\mathsfsl\\{o\\}",'\uD835\uDE30'],["\\\\mathsfsl\\{n\\}",'\uD835\uDE2F'],["\\\\mathsfsl\\{m\\}",'\uD835\uDE2E'],["\\\\mathsfsl\\{l\\}",'\uD835\uDE2D'],["\\\\mathsfsl\\{k\\}",'\uD835\uDE2C'],["\\\\mathsfsl\\{j\\}",'\uD835\uDE2B'],["\\\\mathsfsl\\{i\\}",'\uD835\uDE2A'],["\\\\mathsfsl\\{h\\}",'\uD835\uDE29'],["\\\\mathsfsl\\{g\\}",'\uD835\uDE28'],["\\\\ntriangleleft",'\u22EA'],["\\\\backslash|\\\\textbackslash",'\\'],["\\\\varlrtriangle",'\u22BF'],["\\\\rightpentagon",'\u2B54'],["\\\\mathsfsl\\{f\\}",'\uD835\uDE27'],["\\\\mathfrak\\{R\\}",'\u211C'],["\\\\mathsfsl\\{e\\}",'\uD835\uDE26'],["\\\\mdsmwhtsquare",'\u25FD'],["\\\\mdsmblksquare",'\u25FE'],["\\\\rightarrowgtr",'\u2B43'],["\\\\mathsfbf\\{o\\}",'\uD835\uDDFC'],["\\\\threeunderdot",'\u20E8'],["\\\\blocklefthalf",'\u258C'],["\\\\texttrademark",'\u2122'],["\\\\Longleftarrow",'\u27F8'],["\\\\mathsfbf\\{n\\}",'\uD835\uDDFB'],["\\\\enclosesquare",'\u20DE'],["\\\\mathslbb\\{J\\}",'\uD835\uDD75'],["\\\\mathslbb\\{K\\}",'\uD835\uDD76'],["\\\\enclosecircle",'\u20DD'],["\\\\mathsfbf\\{m\\}",'\uD835\uDDFA'],["\\\\mathslbb\\{L\\}",'\uD835\uDD77'],["\\\\mathsfsl\\{d\\}",'\uD835\uDE25'],["\\\\mathsfsl\\{c\\}",'\uD835\uDE24'],["\\\\mathsfsl\\{b\\}",'\uD835\uDE23'],["\\\\mathsfsl\\{a\\}",'\uD835\uDE22'],["\\\\mathsfsl\\{Z\\}",'\uD835\uDE21'],["\\\\pentagonblack",'\u2B1F'],["\\\\vysmwhtsquare",'\u2B1E'],["\\\\vysmblksquare",'\u2B1D'],["\\\\mathslbb\\{M\\}",'\uD835\uDD78'],["\\\\mathslbb\\{N\\}",'\uD835\uDD79'],["\\\\squarellblack",'\u2B15'],["\\\\squareurblack",'\u2B14'],["\\\\bigtalloblong",'\u2AFF'],["\\\\mathscr\\{c\\}",'\uD835\uDCB8'],["\\\\'\\$\\\\alpha\\$",'\u03AC'],["\\\\mathbit\\{q\\}",'\uD835\uDC92'],["\\\\mathbit\\{r\\}",'\uD835\uDC93'],["\\\\mathbit\\{s\\}",'\uD835\uDC94'],["\\\\surfintegral",'\u222F'],["\\\\mathbit\\{t\\}",'\uD835\uDC95'],["\\\\trianglecdot",'\u25EC'],["\\\\mathbit\\{u\\}",'\uD835\uDC96'],["\\\\mathbit\\{v\\}",'\uD835\uDC97'],["\\\\mathbit\\{w\\}",'\uD835\uDC98'],["\\\\lessequivlnt",'\u2272'],["\\\\mathscr\\{g\\}",'\u210A'],["\\\\mathscr\\{d\\}",'\uD835\uDCB9'],["\\\\longdivision",'\u27CC'],["\\\\eqqslantless",'\u2A9B'],["\\\\mathscr\\{H\\}",'\u210B'],["\\\\mathbit\\{x\\}",'\uD835\uDC99'],['\\\\upwhitearrow','\u21E7'],["\\\\mathbit\\{y\\}",'\uD835\uDC9A'],["\\\\mathbit\\{z\\}",'\uD835\uDC9B'],["\\\\mathscr\\{A\\}",'\uD835\uDC9C'],["\\\\dottedcircle",'\u25CC'],["\\\\mathmit\\{D\\}",'\uD835\uDCD3'],["\\\\odotslashdot",'\u29BC'],["\\\\cupleftarrow",'\u228C'],["\\\\mathscr\\{I\\}",'\u2110'],["\\\\notbackslash",'\u2340'],["\\\\textvartheta",'\u03D1'],["\\\\LeftArrowBar",'\u21E4'],["\\\\mathmit\\{I\\}",'\uD835\uDCD8'],["\\\\lozengeminus",'\u27E0'],["\\\\mathscr\\{C\\}",'\uD835\uDC9E'],["\\\\emptysetoarr",'\u29B3'],["\\\\mathscr\\{f\\}",'\uD835\uDCBB'],["\\\\emptysetobar",'\u29B1'],["\\\\mathscr\\{D\\}",'\uD835\uDC9F'],["\\\\mathbit\\{A\\}",'\uD835\uDC68'],["\\\\fdiagovrdiag",'\u292C'],["\\\\mathscr\\{h\\}",'\uD835\uDCBD'],["\\\\verymuchless",'\u22D8'],["\\\\mathbit\\{B\\}",'\uD835\uDC69'],["\\\\mathbit\\{C\\}",'\uD835\uDC6A'],["\\\\mathscr\\{G\\}",'\uD835\uDCA2'],['\\\\upupharpoons','\u2963'],["\\\\nvRightarrow",'\u2903'],["\\\\mathscr\\{J\\}",'\uD835\uDCA5'],["\\\\revangleubar",'\u29A5'],["\\\\mathscr\\{K\\}",'\uD835\uDCA6'],["\\\\mathbit\\{D\\}",'\uD835\uDC6B'],["\\\\mathmit\\{H\\}",'\uD835\uDCD7'],["\\\\mathmit\\{G\\}",'\uD835\uDCD6'],["\\\\mathscr\\{N\\}",'\uD835\uDCA9'],["\\\\mathscr\\{i\\}",'\uD835\uDCBE'],["\\\\mathmit\\{F\\}",'\uD835\uDCD5'],["\\\\mathbit\\{E\\}",'\uD835\uDC6C'],["\\\\mathbit\\{F\\}",'\uD835\uDC6D'],["\\\\mathbit\\{G\\}",'\uD835\uDC6E'],["\\\\mathmit\\{z\\}",'\uD835\uDD03'],["\\\\mathbit\\{H\\}",'\uD835\uDC6F'],["\\\\PropertyLine",'\u214A'],["\\\\mathscr\\{j\\}",'\uD835\uDCBF'],["\\\\mathscr\\{O\\}",'\uD835\uDCAA'],["\\\\mathmit\\{y\\}",'\uD835\uDD02'],["\\\\DownArrowBar",'\u2913'],["\\\\mathscr\\{k\\}",'\uD835\uDCC0'],["\\\\mathscr\\{m\\}",'\uD835\uDCC2'],["\\\\mathscr\\{n\\}",'\uD835\uDCC3'],["\\\\mathmit\\{x\\}",'\uD835\uDD01'],["\\\\mathscr\\{P\\}",'\uD835\uDCAB'],["\\\\mathmit\\{w\\}",'\uD835\uDD00'],["\\\\mathmit\\{v\\}",'\uD835\uDCFF'],["\\\\mathscr\\{Q\\}",'\uD835\uDCAC'],["\\\\mathmit\\{u\\}",'\uD835\uDCFE'],["\\\\mathmit\\{t\\}",'\uD835\uDCFD'],["\\\\mathscr\\{p\\}",'\uD835\uDCC5'],["\\\\mathscr\\{q\\}",'\uD835\uDCC6'],["\\\\mathscr\\{r\\}",'\uD835\uDCC7'],["\\\\mathscr\\{S\\}",'\uD835\uDCAE'],["\\\\mathmit\\{s\\}",'\uD835\uDCFC'],["\\\\mathmit\\{r\\}",'\uD835\uDCFB'],["\\\\mathmit\\{q\\}",'\uD835\uDCFA'],["\\\\squareulquad",'\u25F0'],["\\\\mathbit\\{I\\}",'\uD835\uDC70'],["\\\\squarellquad",'\u25F1'],["\\\\risingdotseq",'\u2253'],["\\\\squarelrquad",'\u25F2'],["\\\\squareurquad",'\u25F3'],["\\\\mathmit\\{p\\}",'\uD835\uDCF9'],["\\\\circleulquad",'\u25F4'],["\\\\circledequal",'\u229C'],["\\\\medblackstar",'\u2B51'],["\\\\medwhitestar",'\u2B50'],["\\\\circlellquad",'\u25F5'],["\\\\circlelrquad",'\u25F6'],["\\\\mathbit\\{J\\}",'\uD835\uDC71'],["\\\\circleurquad",'\u25F7'],["\\\\squarehvfill",'\u25A6'],["\\\\rightdbltail",'\u291C'],["\\\\mathscr\\{s\\}",'\uD835\uDCC8'],["\\\\mathmit\\{o\\}",'\uD835\uDCF8'],["\\\\mathscr\\{t\\}",'\uD835\uDCC9'],["\\\\doublebarvee",'\u2A62'],["\\\\mathbit\\{K\\}",'\uD835\uDC72'],["\\\\mathbit\\{L\\}",'\uD835\uDC73'],["\\\\mathbit\\{M\\}",'\uD835\uDC74'],["\\\\errbarcircle",'\u29F2'],["\\\\mathscr\\{T\\}",'\uD835\uDCAF'],["\\\\mathmit\\{n\\}",'\uD835\uDCF7'],["\\\\blocklowhalf",'\u2584'],["\\\\mathmit\\{m\\}",'\uD835\uDCF6'],["\\\\mathmit\\{E\\}",'\uD835\uDCD4'],["\\\\mathbit\\{N\\}",'\uD835\uDC75'],["\\\\leftdotarrow",'\u2B38'],["\\\\mathbit\\{O\\}",'\uD835\uDC76'],["\\\\mathmit\\{l\\}",'\uD835\uDCF5'],["\\\\wedgemidvert",'\u2A5A'],["\\\\errbarsquare",'\u29EE'],["\\\\mathscr\\{U\\}",'\uD835\uDCB0'],["\\\\bigslopedvee",'\u2A57'],["\\\\mathmit\\{k\\}",'\uD835\uDCF4'],["\\\\mathmit\\{j\\}",'\uD835\uDCF3'],["\\\\blacklozenge",'\u29EB'],["\\\\mathmit\\{i\\}",'\uD835\uDCF2'],["\\\\mathscr\\{V\\}",'\uD835\uDCB1'],["\\\\mathmit\\{h\\}",'\uD835\uDCF1'],["\\\\smwhtlozenge",'\u2B2B'],["\\\\smblklozenge",'\u2B2A'],["\\\\smblkdiamond",'\u2B29'],["\\\\mdwhtlozenge",'\u2B28'],["\\\\mdblklozenge",'\u2B27'],["\\\\mdwhtdiamond",'\u2B26'],["\\\\mdblkdiamond",'\u2B25'],["\\\\mathmit\\{g\\}",'\uD835\uDCF0'],["\\\\hexagonblack",'\u2B23'],["\\\\rbrackurtick",'\u2990'],["\\\\mathbit\\{P\\}",'\uD835\uDC77'],["\\\\mathbit\\{Q\\}",'\uD835\uDC78'],["\\\\mathscr\\{W\\}",'\uD835\uDCB2'],["\\\\mathmit\\{f\\}",'\uD835\uDCEF'],["\\\\closedvarcap",'\u2A4D'],["\\\\dottedsquare",'\u2B1A'],["\\\\lbracklltick",'\u298F'],["\\\\rbracklrtick",'\u298E'],["\\\\closedvarcup",'\u2A4C'],["\\\\mathmit\\{e\\}",'\uD835\uDCEE'],["\\\\downfishtail",'\u297F'],["\\\\mathmit\\{d\\}",'\uD835\uDCED'],["\\\\mathbit\\{R\\}",'\uD835\uDC79'],["\\\\mathbit\\{S\\}",'\uD835\uDC7A'],["\\\\mathmit\\{c\\}",'\uD835\uDCEC'],["\\\\lbrackultick",'\u298D'],["\\\\mathmit\\{b\\}",'\uD835\uDCEB'],["\\\\mathscr\\{X\\}",'\uD835\uDCB3'],["\\\\mathbit\\{T\\}",'\uD835\uDC7B'],["\\\\mathmit\\{a\\}",'\uD835\uDCEA'],["\\\\lrtriangleeq",'\u29E1'],["\\\\mathbit\\{U\\}",'\uD835\uDC7C'],["\\\\textsterling",'\xA3'],["\\\\textcurrency",'\xA4'],["\\\\mathscr\\{Y\\}",'\uD835\uDCB4'],["\\\\mathbit\\{V\\}",'\uD835\uDC7D'],["\\\\mathscr\\{Z\\}",'\uD835\uDCB5'],["\\\\hyphenbullet",'\u2043'],["\\\\mathmit\\{Z\\}",'\uD835\uDCE9'],["\\\\longmapsfrom",'\u27FB'],["\\\\multimapboth",'\u29DF'],["\\\\mathbit\\{W\\}",'\uD835\uDC7E'],["\\\\mathbit\\{X\\}",'\uD835\uDC7F'],["\\\\mathbit\\{Y\\}",'\uD835\uDC80'],["\\\\mathbit\\{Z\\}",'\uD835\uDC81'],["\\\\mathbit\\{a\\}",'\uD835\uDC82'],["\\\\mathbit\\{b\\}",'\uD835\uDC83'],["\\\\mathmit\\{Y\\}",'\uD835\uDCE8'],["\\\\mathmit\\{X\\}",'\uD835\uDCE7'],["\\\\mathbit\\{c\\}",'\uD835\uDC84'],["\\\\mathbit\\{d\\}",'\uD835\uDC85'],["\\\\mathmit\\{W\\}",'\uD835\uDCE6'],["\\\\mathmit\\{V\\}",'\uD835\uDCE5'],["\\\\mathmit\\{U\\}",'\uD835\uDCE4'],["\\\\RoundImplies",'\u2970'],["\\\\triangleplus",'\u2A39'],["\\\\rdiagovfdiag",'\u292B'],["\\\\mathscr\\{a\\}",'\uD835\uDCB6'],["\\\\mathscr\\{u\\}",'\uD835\uDCCA'],["\\\\mathscr\\{B\\}",'\u212C'],["\\\\mathmit\\{T\\}",'\uD835\uDCE3'],["\\\\mathscr\\{b\\}",'\uD835\uDCB7'],["\\\\mathmit\\{S\\}",'\uD835\uDCE2'],["\\\\mathscr\\{e\\}",'\u212F'],["\\\\mathbit\\{e\\}",'\uD835\uDC86'],["\\\\mathmit\\{R\\}",'\uD835\uDCE1'],["\\\\mathscr\\{v\\}",'\uD835\uDCCB'],["\\\\mathscr\\{w\\}",'\uD835\uDCCC'],["\\\\mathbit\\{f\\}",'\uD835\uDC87'],["\\\\mathbit\\{g\\}",'\uD835\uDC88'],["\\\\mathscr\\{x\\}",'\uD835\uDCCD'],["\\\\texttildelow",'\u02DC'],["\\\\mathbit\\{h\\}",'\uD835\uDC89'],["\\\\varspadesuit",'\u2664'],["\\\\mathscr\\{y\\}",'\uD835\uDCCE'],["\\\\mathbit\\{i\\}",'\uD835\uDC8A'],["\\\\mathmit\\{Q\\}",'\uD835\uDCE0'],["\\\\supsetapprox",'\u2ACA'],["\\\\subsetapprox",'\u2AC9'],["\\\\rightbkarrow",'\u290D'],["\\\\mathbit\\{j\\}",'\uD835\uDC8B'],["\\\\mathmit\\{P\\}",'\uD835\uDCDF'],["\\\\mathscr\\{R\\}",'\u211B'],["\\\\mathmit\\{O\\}",'\uD835\uDCDE'],["\\\\mathscr\\{z\\}",'\uD835\uDCCF'],["\\\\oturnedcomma",'\u0312'],["\\\\mathbit\\{k\\}",'\uD835\uDC8C'],["\\\\mathbit\\{l\\}",'\uD835\uDC8D'],["\\\\Longmapsfrom",'\u27FD'],["\\\\mathmit\\{N\\}",'\uD835\uDCDD'],["\\\\mathmit\\{A\\}",'\uD835\uDCD0'],["\\\\mathmit\\{M\\}",'\uD835\uDCDC'],["\\\\triangledown",'\u25BF'],["\\\\triangleleft",'\u25C3'],["\\\\mathmit\\{L\\}",'\uD835\uDCDB'],["\\\\mathmit\\{B\\}",'\uD835\uDCD1'],["\\\\mathscr\\{l\\}",'\u2113'],["\\\\leftdbkarrow",'\u290E'],["\\\\mathbit\\{m\\}",'\uD835\uDC8E'],["\\\\mathbit\\{n\\}",'\uD835\uDC8F'],["\\\\mathbit\\{o\\}",'\uD835\uDC90'],["\\\\mathmit\\{K\\}",'\uD835\uDCDA'],["\\\\mathscr\\{L\\}",'\u2112'],["\\\\mathmit\\{C\\}",'\uD835\uDCD2'],["\\\\mathmit\\{J\\}",'\uD835\uDCD9'],["\\\\mathscr\\{E\\}",'\u2130'],["\\\\mathrm\\{'Y\\}",'\u038E'],["\\\\mathscr\\{F\\}",'\u2131'],["\\\\mathscr\\{M\\}",'\u2133'],['\\\\underbracket','\u23B5'],["\\\\mathscr\\{o\\}",'\u2134'],["\\\\mathbit\\{p\\}",'\uD835\uDC91'],["\\\\nHdownarrow",'\u21DF'],["\\\\forcesextra",'\u22A8'],['\\\\updasharrow','\u21E1'],["\\\\circleddash",'\u229D'],["\\\\circledcirc",'\u229A'],["\\\\nvleftarrow",'\u21F7'],["\\\\nVleftarrow",'\u21FA'],["\\\\not\\\\supset",'\u2285'],["\\\\not\\\\subset",'\u2284'],["\\\\succcurlyeq",'\u227D'],["\\\\preccurlyeq",'\u227C'],["\\\\int\\\\!\\\\int",'\u222C'],["\\\\volintegral",'\u2230'],["\\\\clwintegral",'\u2231'],["\\\\not\\\\approx",'\u2249'],["\\\\mathtt\\{z\\}",'\uD835\uDEA3'],["\\\\mathtt\\{y\\}",'\uD835\uDEA2'],["\\\\mathtt\\{x\\}",'\uD835\uDEA1'],["\\\\mathtt\\{w\\}",'\uD835\uDEA0'],["\\\\mathtt\\{v\\}",'\uD835\uDE9F'],["\\\\mathtt\\{u\\}",'\uD835\uDE9E'],["\\\\mathtt\\{t\\}",'\uD835\uDE9D'],["\\\\mathtt\\{s\\}",'\uD835\uDE9C'],["\\\\mathtt\\{r\\}",'\uD835\uDE9B'],["\\\\mathtt\\{q\\}",'\uD835\uDE9A'],["\\\\mathtt\\{p\\}",'\uD835\uDE99'],["\\\\mathtt\\{o\\}",'\uD835\uDE98'],["\\\\mathtt\\{n\\}",'\uD835\uDE97'],["\\\\mathtt\\{m\\}",'\uD835\uDE96'],["\\\\mathtt\\{l\\}",'\uD835\uDE95'],["\\\\mathtt\\{k\\}",'\uD835\uDE94'],["\\\\mathtt\\{j\\}",'\uD835\uDE93'],["\\\\mathtt\\{i\\}",'\uD835\uDE92'],["\\\\mathtt\\{h\\}",'\uD835\uDE91'],["\\\\mathtt\\{g\\}",'\uD835\uDE90'],["\\\\mathtt\\{f\\}",'\uD835\uDE8F'],["\\\\mathtt\\{e\\}",'\uD835\uDE8E'],["\\\\mathtt\\{d\\}",'\uD835\uDE8D'],["\\\\mathtt\\{c\\}",'\uD835\uDE8C'],["\\\\mathtt\\{b\\}",'\uD835\uDE8B'],["\\\\mathtt\\{a\\}",'\uD835\uDE8A'],["\\\\mathtt\\{Z\\}",'\uD835\uDE89'],["\\\\mathtt\\{Y\\}",'\uD835\uDE88'],["\\\\mathtt\\{X\\}",'\uD835\uDE87'],["\\\\mathtt\\{W\\}",'\uD835\uDE86'],["\\\\mathtt\\{V\\}",'\uD835\uDE85'],["\\\\mathtt\\{U\\}",'\uD835\uDE84'],["\\\\mathtt\\{T\\}",'\uD835\uDE83'],["\\\\mathtt\\{S\\}",'\uD835\uDE82'],["\\\\mathtt\\{R\\}",'\uD835\uDE81'],["\\\\mathtt\\{Q\\}",'\uD835\uDE80'],["\\\\mathtt\\{P\\}",'\uD835\uDE7F'],["\\\\mathtt\\{O\\}",'\uD835\uDE7E'],["\\\\mathtt\\{N\\}",'\uD835\uDE7D'],["\\\\mathtt\\{M\\}",'\uD835\uDE7C'],["\\\\mathtt\\{L\\}",'\uD835\uDE7B'],["\\\\mathtt\\{K\\}",'\uD835\uDE7A'],["\\\\mathtt\\{J\\}",'\uD835\uDE79'],["\\\\mathtt\\{I\\}",'\uD835\uDE78'],["\\\\mathtt\\{H\\}",'\uD835\uDE77'],["\\\\mathtt\\{G\\}",'\uD835\uDE76'],["\\\\mathtt\\{F\\}",'\uD835\uDE75'],["\\\\mathtt\\{E\\}",'\uD835\uDE74'],["\\\\mathtt\\{D\\}",'\uD835\uDE73'],["\\\\mathtt\\{C\\}",'\uD835\uDE72'],["\\\\mathtt\\{B\\}",'\uD835\uDE71'],["\\\\mathtt\\{A\\}",'\uD835\uDE70'],["\\\\mathsf\\{z\\}",'\uD835\uDDD3'],["\\\\mathsf\\{y\\}",'\uD835\uDDD2'],["\\\\mathsf\\{x\\}",'\uD835\uDDD1'],["\\\\mathsf\\{w\\}",'\uD835\uDDD0'],["\\\\mathsf\\{v\\}",'\uD835\uDDCF'],["\\\\mathsf\\{u\\}",'\uD835\uDDCE'],["\\\\mathsf\\{t\\}",'\uD835\uDDCD'],["\\\\mathsf\\{s\\}",'\uD835\uDDCC'],["\\\\mathsf\\{r\\}",'\uD835\uDDCB'],["\\\\mathsf\\{q\\}",'\uD835\uDDCA'],["\\\\mathsf\\{p\\}",'\uD835\uDDC9'],["\\\\mathsf\\{o\\}",'\uD835\uDDC8'],["\\\\mathsf\\{n\\}",'\uD835\uDDC7'],["\\\\mathsf\\{m\\}",'\uD835\uDDC6'],["\\\\mathsf\\{l\\}",'\uD835\uDDC5'],["\\\\mathsf\\{k\\}",'\uD835\uDDC4'],["\\\\mathsf\\{j\\}",'\uD835\uDDC3'],["\\\\mathsf\\{i\\}",'\uD835\uDDC2'],["\\\\mathsf\\{h\\}",'\uD835\uDDC1'],["\\\\mathsf\\{g\\}",'\uD835\uDDC0'],["\\\\mathsf\\{f\\}",'\uD835\uDDBF'],["\\\\mathsf\\{e\\}",'\uD835\uDDBE'],["\\\\mathsf\\{d\\}",'\uD835\uDDBD'],["\\\\mathsf\\{c\\}",'\uD835\uDDBC'],["\\\\mathsf\\{b\\}",'\uD835\uDDBB'],["\\\\mathsf\\{a\\}",'\uD835\uDDBA'],["\\\\mathsf\\{Z\\}",'\uD835\uDDB9'],["\\\\mathsf\\{Y\\}",'\uD835\uDDB8'],["\\\\mathsf\\{X\\}",'\uD835\uDDB7'],["\\\\mathsf\\{W\\}",'\uD835\uDDB6'],["\\\\mathsf\\{V\\}",'\uD835\uDDB5'],["\\\\mathsf\\{U\\}",'\uD835\uDDB4'],["\\\\mathsf\\{T\\}",'\uD835\uDDB3'],["\\\\mathsf\\{S\\}",'\uD835\uDDB2'],["\\\\mathsf\\{R\\}",'\uD835\uDDB1'],["\\\\mathsf\\{Q\\}",'\uD835\uDDB0'],["\\\\mathsf\\{P\\}",'\uD835\uDDAF'],["\\\\mathsf\\{O\\}",'\uD835\uDDAE'],["\\\\mathsf\\{N\\}",'\uD835\uDDAD'],["\\\\mathsf\\{M\\}",'\uD835\uDDAC'],["\\\\mathsf\\{L\\}",'\uD835\uDDAB'],["\\\\mathsf\\{K\\}",'\uD835\uDDAA'],["\\\\mathsf\\{J\\}",'\uD835\uDDA9'],["\\\\mathsf\\{I\\}",'\uD835\uDDA8'],["\\\\mathsf\\{H\\}",'\uD835\uDDA7'],["\\\\mathsf\\{G\\}",'\uD835\uDDA6'],["\\\\mathsf\\{F\\}",'\uD835\uDDA5'],["\\\\mathsf\\{E\\}",'\uD835\uDDA4'],["\\\\mathsf\\{D\\}",'\uD835\uDDA3'],["\\\\mathsf\\{C\\}",'\uD835\uDDA2'],["\\\\mathsf\\{B\\}",'\uD835\uDDA1'],["\\\\mathsf\\{A\\}",'\uD835\uDDA0'],["\\\\mathbb\\{z\\}",'\uD835\uDD6B'],["\\\\mathbb\\{y\\}",'\uD835\uDD6A'],["\\\\mathbb\\{x\\}",'\uD835\uDD69'],["\\\\mathbb\\{w\\}",'\uD835\uDD68'],["\\\\mathbb\\{v\\}",'\uD835\uDD67'],["\\\\mathbb\\{u\\}",'\uD835\uDD66'],["\\\\mathbb\\{t\\}",'\uD835\uDD65'],["\\\\mathbb\\{s\\}",'\uD835\uDD64'],["\\\\mathbb\\{r\\}",'\uD835\uDD63'],["\\\\mathbb\\{q\\}",'\uD835\uDD62'],["\\\\mathbb\\{p\\}",'\uD835\uDD61'],["\\\\mathbb\\{o\\}",'\uD835\uDD60'],["\\\\mathbb\\{n\\}",'\uD835\uDD5F'],["\\\\mathbb\\{m\\}",'\uD835\uDD5E'],["\\\\mathbb\\{l\\}",'\uD835\uDD5D'],["\\\\mathbb\\{k\\}",'\uD835\uDD5C'],["\\\\mathbb\\{j\\}",'\uD835\uDD5B'],["\\\\mathbb\\{i\\}",'\uD835\uDD5A'],["\\\\mathbb\\{h\\}",'\uD835\uDD59'],["\\\\mathbb\\{g\\}",'\uD835\uDD58'],["\\\\mathbb\\{f\\}",'\uD835\uDD57'],["\\\\mathbb\\{e\\}",'\uD835\uDD56'],["\\\\mathbb\\{d\\}",'\uD835\uDD55'],["\\\\mathbb\\{c\\}",'\uD835\uDD54'],["\\\\mathbb\\{b\\}",'\uD835\uDD53'],["\\\\mathbb\\{a\\}",'\uD835\uDD52'],["\\\\mathbb\\{Y\\}",'\uD835\uDD50'],["\\\\mathbb\\{X\\}",'\uD835\uDD4F'],["\\\\mathbb\\{W\\}",'\uD835\uDD4E'],["\\\\mathbb\\{V\\}",'\uD835\uDD4D'],["\\\\mathbb\\{U\\}",'\uD835\uDD4C'],["\\\\mathbb\\{T\\}",'\uD835\uDD4B'],["\\\\mathbb\\{S\\}",'\uD835\uDD4A'],["\\\\mathbb\\{O\\}",'\uD835\uDD46'],["\\\\mathbb\\{M\\}",'\uD835\uDD44'],["\\\\mathbb\\{L\\}",'\uD835\uDD43'],["\\\\mathbb\\{K\\}",'\uD835\uDD42'],["\\\\mathbb\\{J\\}",'\uD835\uDD41'],["\\\\mathbb\\{I\\}",'\uD835\uDD40'],["\\\\mathbb\\{G\\}",'\uD835\uDD3E'],["\\\\mathbb\\{F\\}",'\uD835\uDD3D'],["\\\\mathbb\\{E\\}",'\uD835\uDD3C'],["\\\\mathbb\\{D\\}",'\uD835\uDD3B'],["\\\\mathbb\\{B\\}",'\uD835\uDD39'],["\\\\mathbb\\{A\\}",'\uD835\uDD38'],["\\\\mathsl\\{z\\}",'\uD835\uDC67'],["\\\\mathsl\\{y\\}",'\uD835\uDC66'],["\\\\mathsl\\{x\\}",'\uD835\uDC65'],["\\\\mathsl\\{w\\}",'\uD835\uDC64'],["\\\\mathsl\\{v\\}",'\uD835\uDC63'],["\\\\mathsl\\{u\\}",'\uD835\uDC62'],["\\\\mathsl\\{t\\}",'\uD835\uDC61'],["\\\\mathsl\\{s\\}",'\uD835\uDC60'],["\\\\mathsl\\{r\\}",'\uD835\uDC5F'],["\\\\mathsl\\{q\\}",'\uD835\uDC5E'],["\\\\mathsl\\{p\\}",'\uD835\uDC5D'],["\\\\mathsl\\{o\\}",'\uD835\uDC5C'],["\\\\mathsl\\{n\\}",'\uD835\uDC5B'],["\\\\mathsl\\{m\\}",'\uD835\uDC5A'],["\\\\mathsl\\{l\\}",'\uD835\uDC59'],["\\\\mathsl\\{k\\}",'\uD835\uDC58'],["\\\\mathsl\\{j\\}",'\uD835\uDC57'],["\\\\mathsl\\{i\\}",'\uD835\uDC56'],["\\\\mathsl\\{g\\}",'\uD835\uDC54'],["\\\\mathsl\\{f\\}",'\uD835\uDC53'],["\\\\mathsl\\{e\\}",'\uD835\uDC52'],["\\\\mathsl\\{d\\}",'\uD835\uDC51'],["\\\\mathsl\\{c\\}",'\uD835\uDC50'],["\\\\mathsl\\{b\\}",'\uD835\uDC4F'],["\\\\mathsl\\{a\\}",'\uD835\uDC4E'],["\\\\mathsl\\{Z\\}",'\uD835\uDC4D'],["\\\\mathsl\\{Y\\}",'\uD835\uDC4C'],["\\\\mathsl\\{X\\}",'\uD835\uDC4B'],["\\\\mathsl\\{W\\}",'\uD835\uDC4A'],["\\\\mathsl\\{V\\}",'\uD835\uDC49'],["\\\\mathsl\\{U\\}",'\uD835\uDC48'],["\\\\mathsl\\{T\\}",'\uD835\uDC47'],["\\\\mathsl\\{S\\}",'\uD835\uDC46'],["\\\\mathsl\\{R\\}",'\uD835\uDC45'],["\\\\mathsl\\{Q\\}",'\uD835\uDC44'],["\\\\mathsl\\{P\\}",'\uD835\uDC43'],["\\\\mathsl\\{O\\}",'\uD835\uDC42'],["\\\\mathsl\\{N\\}",'\uD835\uDC41'],["\\\\mathsl\\{M\\}",'\uD835\uDC40'],["\\\\mathsl\\{L\\}",'\uD835\uDC3F'],["\\\\mathsl\\{K\\}",'\uD835\uDC3E'],["\\\\mathsl\\{J\\}",'\uD835\uDC3D'],["\\\\mathsl\\{I\\}",'\uD835\uDC3C'],["\\\\mathsl\\{H\\}",'\uD835\uDC3B'],["\\\\mathsl\\{G\\}",'\uD835\uDC3A'],["\\\\mathsl\\{F\\}",'\uD835\uDC39'],["\\\\mathsl\\{E\\}",'\uD835\uDC38'],["\\\\mathsl\\{D\\}",'\uD835\uDC37'],["\\\\mathsl\\{C\\}",'\uD835\uDC36'],["\\\\mathsl\\{B\\}",'\uD835\uDC35'],["\\\\mathsl\\{A\\}",'\uD835\uDC34'],["\\\\mathbf\\{z\\}",'\uD835\uDC33'],["\\\\mathbf\\{y\\}",'\uD835\uDC32'],["\\\\mathbf\\{x\\}",'\uD835\uDC31'],["\\\\mathbf\\{w\\}",'\uD835\uDC30'],["\\\\mathbf\\{v\\}",'\uD835\uDC2F'],["\\\\mathbf\\{u\\}",'\uD835\uDC2E'],["\\\\mathbf\\{t\\}",'\uD835\uDC2D'],["\\\\mathbf\\{s\\}",'\uD835\uDC2C'],["\\\\mathbf\\{r\\}",'\uD835\uDC2B'],["\\\\mathbf\\{q\\}",'\uD835\uDC2A'],["\\\\mathbf\\{p\\}",'\uD835\uDC29'],["\\\\mathbf\\{o\\}",'\uD835\uDC28'],["\\\\mathbf\\{n\\}",'\uD835\uDC27'],["\\\\mathbf\\{m\\}",'\uD835\uDC26'],["\\\\mathbf\\{l\\}",'\uD835\uDC25'],["\\\\mathbf\\{k\\}",'\uD835\uDC24'],["\\\\mathbf\\{j\\}",'\uD835\uDC23'],["\\\\mathbf\\{i\\}",'\uD835\uDC22'],["\\\\mathbf\\{h\\}",'\uD835\uDC21'],["\\\\mathbf\\{g\\}",'\uD835\uDC20'],["\\\\mathbf\\{f\\}",'\uD835\uDC1F'],["\\\\mathbf\\{e\\}",'\uD835\uDC1E'],["\\\\mathbf\\{d\\}",'\uD835\uDC1D'],["\\\\mathbf\\{c\\}",'\uD835\uDC1C'],["\\\\mathbf\\{b\\}",'\uD835\uDC1B'],["\\\\mathbf\\{a\\}",'\uD835\uDC1A'],["\\\\mathbf\\{Z\\}",'\uD835\uDC19'],["\\\\mathbf\\{Y\\}",'\uD835\uDC18'],["\\\\mathbf\\{X\\}",'\uD835\uDC17'],["\\\\mathbf\\{W\\}",'\uD835\uDC16'],["\\\\mathbf\\{V\\}",'\uD835\uDC15'],["\\\\mathbf\\{U\\}",'\uD835\uDC14'],["\\\\mathbf\\{T\\}",'\uD835\uDC13'],["\\\\mathbf\\{S\\}",'\uD835\uDC12'],["\\\\mathbf\\{R\\}",'\uD835\uDC11'],["\\\\mathbf\\{Q\\}",'\uD835\uDC10'],["\\\\mathbf\\{P\\}",'\uD835\uDC0F'],["\\\\mathbf\\{O\\}",'\uD835\uDC0E'],["\\\\mathbf\\{N\\}",'\uD835\uDC0D'],["\\\\mathbf\\{M\\}",'\uD835\uDC0C'],["\\\\mathbf\\{L\\}",'\uD835\uDC0B'],["\\\\mathbf\\{K\\}",'\uD835\uDC0A'],["\\\\mathbf\\{J\\}",'\uD835\uDC09'],["\\\\mathbf\\{I\\}",'\uD835\uDC08'],["\\\\mathbf\\{H\\}",'\uD835\uDC07'],["\\\\mathbf\\{G\\}",'\uD835\uDC06'],["\\\\mathbf\\{F\\}",'\uD835\uDC05'],["\\\\mathbf\\{E\\}",'\uD835\uDC04'],["\\\\mathbf\\{D\\}",'\uD835\uDC03'],["\\\\mathbf\\{C\\}",'\uD835\uDC02'],["\\\\mathbf\\{B\\}",'\uD835\uDC01'],["\\\\mathbf\\{A\\}",'\uD835\uDC00'],["\\\\smwhitestar",'\u2B52'],["\\\\RRightarrow",'\u2B46'],["\\\\whtvertoval",'\u2B2F'],["\\\\blkvertoval",'\u2B2E'],["\\\\whthorzoval",'\u2B2D'],["\\\\blkhorzoval",'\u2B2C'],["\\\\lgblkcircle",'\u2B24'],["\\\\mathtt\\{9\\}",'\uD835\uDFFF'],["\\\\mathtt\\{8\\}",'\uD835\uDFFE'],["\\\\textsection",'\xA7'],["\\\\textonehalf",'\xBD'],["\\\\shortuptack",'\u2AE0'],["\\\\mathtt\\{7\\}",'\uD835\uDFFD'],["\\\\mathtt\\{6\\}",'\uD835\uDFFC'],["\\\\mathtt\\{5\\}",'\uD835\uDFFB'],["\\\\mathtt\\{4\\}",'\uD835\uDFFA'],["\\\\succnapprox",'\u2ABA'],["\\\\precnapprox",'\u2AB9'],["\\\\mathtt\\{3\\}",'\uD835\uDFF9'],["\\\\eqqslantgtr",'\u2A9C'],["\\\\eqslantless",'\u2A95'],["\\\\backepsilon",'\u03F6'],["\\\\mathtt\\{2\\}",'\uD835\uDFF8'],["\\\\mathtt\\{1\\}",'\uD835\uDFF7'],["\\\\mathtt\\{0\\}",'\uD835\uDFF6'],["\\\\simminussim",'\u2A6C'],["\\\\midbarwedge",'\u2A5C'],["\\\\mathsf\\{9\\}",'\uD835\uDFEB'],["\\\\mathsf\\{8\\}",'\uD835\uDFEA'],["\\\\rcurvyangle",'\u29FD'],["\\\\lcurvyangle",'\u29FC'],["\\\\RuleDelayed",'\u29F4'],["\\\\gleichstark",'\u29E6'],["\\\\mathsf\\{7\\}",'\uD835\uDFE9'],["\\\\mathsf\\{6\\}",'\uD835\uDFE8'],["\\\\mathsf\\{5\\}",'\uD835\uDFE7'],["\\\\mathsf\\{4\\}",'\uD835\uDFE6'],["\\\\circledless",'\u29C0'],["\\\\revemptyset",'\u29B0'],["\\\\wideangleup",'\u29A7'],["\\\\mathsf\\{3\\}",'\uD835\uDFE5'],["\\\\mathsf\\{2\\}",'\uD835\uDFE4'],["\\\\mathsf\\{1\\}",'\uD835\uDFE3'],["\\\\mathsf\\{0\\}",'\uD835\uDFE2'],["\\\\mathbb\\{9\\}",'\uD835\uDFE1'],["\\\\mathbb\\{8\\}",'\uD835\uDFE0'],["\\\\mathbb\\{7\\}",'\uD835\uDFDF'],["\\\\nwovnearrow",'\u2932'],["\\\\neovnwarrow",'\u2931'],["\\\\neovsearrow",'\u292E'],["\\\\seovnearrow",'\u292D'],["\\\\mathbb\\{6\\}",'\uD835\uDFDE'],["\\\\mathbb\\{5\\}",'\uD835\uDFDD'],["\\\\leftdbltail",'\u291B'],["\\\\mathbb\\{4\\}",'\uD835\uDFDC'],["\\\\leftbkarrow",'\u290C'],["\\\\nvLeftarrow",'\u2902'],["\\\\mathbb\\{3\\}",'\uD835\uDFDB'],["\\\\mathbb\\{2\\}",'\uD835\uDFDA'],["\\\\mathbb\\{1\\}",'\uD835\uDFD9'],["\\\\mathbb\\{0\\}",'\uD835\uDFD8'],["\\\\multimapinv",'\u27DC'],["\\\\mathbf\\{9\\}",'\uD835\uDFD7'],["\\\\mathbf\\{8\\}",'\uD835\uDFD6'],["\\\\threedangle",'\u27C0'],["\\\\ding\\{254\\}",'\u27BE'],["\\\\ding\\{253\\}",'\u27BD'],["\\\\ding\\{252\\}",'\u27BC'],["\\\\ding\\{251\\}",'\u27BB'],["\\\\ding\\{250\\}",'\u27BA'],["\\\\ding\\{249\\}",'\u27B9'],["\\\\ding\\{248\\}",'\u27B8'],["\\\\ding\\{247\\}",'\u27B7'],["\\\\ding\\{246\\}",'\u27B6'],["\\\\ding\\{245\\}",'\u27B5'],["\\\\ding\\{244\\}",'\u27B4'],["\\\\ding\\{243\\}",'\u27B3'],["\\\\ding\\{242\\}",'\u27B2'],["\\\\ding\\{241\\}",'\u27B1'],["\\\\ding\\{239\\}",'\u27AF'],["\\\\ding\\{238\\}",'\u27AE'],["\\\\ding\\{237\\}",'\u27AD'],["\\\\ding\\{236\\}",'\u27AC'],["\\\\ding\\{235\\}",'\u27AB'],["\\\\ding\\{234\\}",'\u27AA'],["\\\\ding\\{233\\}",'\u27A9'],["\\\\ding\\{232\\}",'\u27A8'],["\\\\ding\\{231\\}",'\u27A7'],["\\\\ding\\{230\\}",'\u27A6'],["\\\\ding\\{229\\}",'\u27A5'],["\\\\ding\\{228\\}",'\u27A4'],["\\\\ding\\{227\\}",'\u27A3'],["\\\\ding\\{226\\}",'\u27A2'],["\\\\ding\\{225\\}",'\u27A1'],["\\\\ding\\{224\\}",'\u27A0'],["\\\\ding\\{223\\}",'\u279F'],["\\\\ding\\{222\\}",'\u279E'],["\\\\ding\\{221\\}",'\u279D'],["\\\\ding\\{220\\}",'\u279C'],["\\\\ding\\{219\\}",'\u279B'],["\\\\ding\\{218\\}",'\u279A'],["\\\\ding\\{216\\}",'\u2798'],["\\\\ding\\{212\\}",'\u2794'],["\\\\ding\\{211\\}",'\u2793'],["\\\\ding\\{210\\}",'\u2792'],["\\\\ding\\{209\\}",'\u2791'],["\\\\ding\\{208\\}",'\u2790'],["\\\\ding\\{207\\}",'\u278F'],["\\\\ding\\{206\\}",'\u278E'],["\\\\ding\\{205\\}",'\u278D'],["\\\\ding\\{204\\}",'\u278C'],["\\\\ding\\{203\\}",'\u278B'],["\\\\ding\\{202\\}",'\u278A'],["\\\\ding\\{201\\}",'\u2789'],["\\\\ding\\{200\\}",'\u2788'],["\\\\ding\\{199\\}",'\u2787'],["\\\\ding\\{198\\}",'\u2786'],["\\\\ding\\{197\\}",'\u2785'],["\\\\ding\\{196\\}",'\u2784'],["\\\\ding\\{195\\}",'\u2783'],["\\\\ding\\{194\\}",'\u2782'],["\\\\ding\\{193\\}",'\u2781'],["\\\\ding\\{192\\}",'\u2780'],["\\\\ding\\{191\\}",'\u277F'],["\\\\ding\\{190\\}",'\u277E'],["\\\\ding\\{189\\}",'\u277D'],["\\\\ding\\{188\\}",'\u277C'],["\\\\ding\\{187\\}",'\u277B'],["\\\\ding\\{186\\}",'\u277A'],["\\\\ding\\{185\\}",'\u2779'],["\\\\ding\\{184\\}",'\u2778'],["\\\\ding\\{183\\}",'\u2777'],["\\\\ding\\{182\\}",'\u2776'],["\\\\ding\\{167\\}",'\u2767'],["\\\\ding\\{166\\}",'\u2766'],["\\\\ding\\{165\\}",'\u2765'],["\\\\ding\\{164\\}",'\u2764'],["\\\\ding\\{163\\}",'\u2763'],["\\\\ding\\{162\\}",'\u2762'],["\\\\ding\\{161\\}",'\u2761'],["\\\\ding\\{126\\}",'\u275E'],["\\\\ding\\{125\\}",'\u275D'],["\\\\ding\\{124\\}",'\u275C'],["\\\\ding\\{123\\}",'\u275B'],["\\\\ding\\{122\\}",'\u275A'],["\\\\ding\\{121\\}",'\u2759'],["\\\\ding\\{120\\}",'\u2758'],["\\\\ding\\{118\\}",'\u2756'],["\\\\ding\\{114\\}",'\u2752'],["\\\\ding\\{113\\}",'\u2751'],["\\\\ding\\{112\\}",'\u2750'],["\\\\ding\\{111\\}",'\u274F'],["\\\\ding\\{109\\}",'\u274D'],["\\\\ding\\{107\\}",'\u274B'],["\\\\ding\\{106\\}",'\u274A'],["\\\\ding\\{105\\}",'\u2749'],["\\\\ding\\{104\\}",'\u2748'],["\\\\ding\\{103\\}",'\u2747'],["\\\\ding\\{102\\}",'\u2746'],["\\\\ding\\{101\\}",'\u2745'],["\\\\ding\\{100\\}",'\u2744'],["\\\\mathbf\\{7\\}",'\uD835\uDFD5'],["\\\\quarternote",'\u2669'],["\\\\varclubsuit",'\u2667'],["\\\\ding\\{169\\}",'\u2666'],["\\\\ding\\{170\\}",'\u2665'],["\\\\ding\\{168\\}",'\u2663'],["\\\\mathbf\\{6\\}",'\uD835\uDFD4'],["\\\\ding\\{171\\}",'\u2660'],["\\\\capricornus",'\u2651'],["\\\\sagittarius",'\u2650'],["\\\\backtrprime",'\u2037'],["\\\\caretinsert",'\u2038'],["\\\\nolinebreak",'\u2060'],["\\\\mathbf\\{5\\}",'\uD835\uDFD3'],["\\\\blacksmiley",'\u263B'],["\\\\vertoverlay",'\u20D2'],["\\\\mathbf\\{4\\}",'\uD835\uDFD2'],["\\\\mathbf\\{3\\}",'\uD835\uDFD1'],["\\\\smwhtcircle",'\u25E6'],["\\\\asteraccent",'\u20F0'],["\\\\mathbb\\{C\\}",'\u2102'],["\\\\mathbf\\{2\\}",'\uD835\uDFD0'],["\\\\ding\\{119\\}",'\u25D7'],["\\\\mathbb\\{H\\}",'\u210D'],["\\\\Planckconst",'\u210E'],["\\\\ding\\{108\\}",'\u25CF'],["\\\\mathbb\\{N\\}",'\u2115'],["\\\\ding\\{117\\}",'\u25C6'],["\\\\mathbb\\{P\\}",'\u2119'],["\\\\ding\\{116\\}",'\u25BC'],["\\\\mathbb\\{Q\\}",'\u211A'],["\\\\vartriangle",'\u25B5'],["\\\\ding\\{115\\}",'\u25B2'],["\\\\mathbf\\{1\\}",'\uD835\uDFCF'],["\\\\smwhtsquare",'\u25AB'],["\\\\blacksquare",'\u25AA'],["\\\\squarevfill",'\u25A5'],["\\\\squarehfill",'\u25A4'],["\\\\mathbb\\{R\\}",'\u211D'],["\\\\ding\\{110\\}",'\u25A0'],["\\\\mathbf\\{0\\}",'\uD835\uDFCE'],["\\\\blockuphalf",'\u2580'],["\\\\mathbb\\{Z\\}",'\u2124'],["\\\\ding\\{181\\}",'\u2469'],["\\\\ding\\{180\\}",'\u2468'],["\\\\ding\\{179\\}",'\u2467'],["\\\\ding\\{178\\}",'\u2466'],["\\\\ding\\{177\\}",'\u2465'],["\\\\ding\\{176\\}",'\u2464'],["\\\\ding\\{175\\}",'\u2463'],["\\\\ding\\{174\\}",'\u2462'],["\\\\ding\\{173\\}",'\u2461'],["\\\\ding\\{172\\}",'\u2460'],["\\\\overbracket",'\u23B4'],["\\\\intextender",'\u23AE'],["\\\\sansLturned",'\u2142'],["\\\\ExponetialE",'\u2147'],["\\\\wasylozenge",'\u2311'],['\\\\updownarrow','\u2195'],["\\\\nrightarrow",'\u219B'],["\\\\sqsubsetneq",'\u22E4'],["\\\\curlyeqsucc",'\u22DF'],["\\\\curlyeqprec",'\u22DE'],["\\\\nRightarrow",'\u21CF'],['\\\\Updownarrow','\u21D5'],["\\\\Rrightarrow",'\u21DB'],["\\\\ding\\{217\\}",'\u2799'],["\\\\precapprox",'\u227E'],["\\\\textdagger",'\u2020'],["\\\\mbfDigamma",'\uD835\uDFCA'],["\\\\twolowline",'\u2017'],["\\\\textemdash",'\u2014'],["\\\\textendash",'\u2013'],["\\\\eighthnote",'\u266A'],["\\\\ding\\{33\\}",'\u2701'],["\\\\ding\\{34\\}",'\u2702'],['\\\\underbrace','\u23DF'],["\\\\ding\\{35\\}",'\u2703'],['\\\\underparen','\u23DD'],["\\\\ding\\{36\\}",'\u2704'],["\\\\ding\\{38\\}",'\u2706'],["\\\\ding\\{39\\}",'\u2707'],["\\\\ding\\{40\\}",'\u2708'],["\\\\sqrtbottom",'\u23B7'],["\\\\ding\\{41\\}",'\u2709'],["\\\\ding\\{44\\}",'\u270C'],["\\\\succapprox",'\u227F'],["\\\\ding\\{45\\}",'\u270D'],["\\\\ding\\{46\\}",'\u270E'],["\\\\rmoustache",'\u23B1'],["\\\\lmoustache",'\u23B0'],["\\\\ding\\{47\\}",'\u270F'],["\\\\nLeftarrow",'\u21CD'],["\\\\rbracelend",'\u23AD'],["\\\\ding\\{48\\}",'\u2710'],["\\\\rbraceuend",'\u23AB'],["\\\\ding\\{49\\}",'\u2711'],["\\\\lbracelend",'\u23A9'],["\\\\ding\\{50\\}",'\u2712'],["\\\\lbraceuend",'\u23A7'],["\\\\rbracklend",'\u23A6'],["\\\\ding\\{51\\}",'\u2713'],["\\\\rbrackuend",'\u23A4'],["\\\\ding\\{52\\}",'\u2714'],["\\\\ding\\{53\\}",'\u2715'],["\\\\lbrackuend",'\u23A1'],["\\\\rparenlend",'\u23A0'],["\\\\ding\\{54\\}",'\u2716'],["\\\\rparenuend",'\u239E'],["\\\\lparenlend",'\u239D'],["\\\\ding\\{55\\}",'\u2717'],["\\\\lparenuend",'\u239B'],["\\\\ding\\{56\\}",'\u2718'],["\\\\ding\\{57\\}",'\u2719'],["\\\\ding\\{58\\}",'\u271A'],["\\\\ding\\{59\\}",'\u271B'],["\\\\ding\\{60\\}",'\u271C'],["\\\\APLcomment",'\u235D'],["\\\\ding\\{61\\}",'\u271D'],["\\\\ding\\{62\\}",'\u271E'],["\\\\ding\\{63\\}",'\u271F'],["\\\\ding\\{64\\}",'\u2720'],["\\\\ding\\{65\\}",'\u2721'],["\\\\ding\\{66\\}",'\u2722'],["\\\\ding\\{67\\}",'\u2723'],["\\\\ding\\{68\\}",'\u2724'],["\\\\ding\\{69\\}",'\u2725'],["\\\\rightangle",'\u221F'],["\\\\conictaper",'\u2332'],["\\\\ding\\{70\\}",'\u2726'],["\\\\ding\\{71\\}",'\u2727'],["\\\\ding\\{74\\}",'\u272A'],["\\\\ding\\{75\\}",'\u272B'],["\\\\varnothing",'\u2205'],["\\\\ding\\{76\\}",'\u272C'],["\\\\ding\\{77\\}",'\u272D'],["\\\\ding\\{78\\}",'\u272E'],["\\\\ding\\{79\\}",'\u272F'],["\\\\ding\\{80\\}",'\u2730'],["\\\\ding\\{81\\}",'\u2731'],["\\\\ding\\{82\\}",'\u2732'],["\\\\ding\\{83\\}",'\u2733'],["\\\\ding\\{84\\}",'\u2734'],["\\\\ding\\{85\\}",'\u2735'],["\\\\ding\\{86\\}",'\u2736'],["\\\\ding\\{87\\}",'\u2737'],["\\\\complement",'\u2201'],["\\\\ding\\{88\\}",'\u2738'],["\\\\ding\\{89\\}",'\u2739'],["\\\\ding\\{90\\}",'\u273A'],["\\\\ding\\{91\\}",'\u273B'],["\\\\rightarrow",'\u2192'],["\\\\ding\\{92\\}",'\u273C'],["\\\\ding\\{93\\}",'\u273D'],["\\\\sqsubseteq",'\u2291'],["\\\\ding\\{94\\}",'\u273E'],["\\\\nleftarrow",'\u219A'],["\\\\ding\\{95\\}",'\u273F'],["\\\\sqsupseteq",'\u2292'],["\\\\ding\\{96\\}",'\u2740'],["\\\\ding\\{97\\}",'\u2741'],["\\\\ding\\{98\\}",'\u2742'],["\\\\ding\\{99\\}",'\u2743'],["\\\\subsetcirc",'\u27C3'],["\\\\supsetcirc",'\u27C4'],["\\\\Diamonddot",'\u27D0'],["\\\\DDownarrow",'\u27F1'],["\\\\longmapsto",'\u27FC'],["\\\\Longmapsto",'\u27FE'],["\\\\Ddownarrow",'\u290B'],['\\\\UpArrowBar','\u2912'],['\\\\upfishtail','\u297E'],["\\\\lbrackubar",'\u298B'],["\\\\rbrackubar",'\u298C'],["\\\\Rparenless",'\u2996'],["\\\\lblkbrbrak",'\u2997'],["\\\\rblkbrbrak",'\u2998'],["\\\\circledgtr",'\u29C1'],["\\\\doubleplus",'\u29FA'],["\\\\tripleplus",'\u29FB'],["\\\\plussubtwo",'\u2A27'],["\\\\commaminus",'\u2A29'],["\\\\Lleftarrow",'\u21DA'],["\\\\minusfdots",'\u2A2B'],["\\\\minusrdots",'\u2A2C'],["\\\\smashtimes",'\u2A33'],["\\\\cupovercap",'\u2A46'],["\\\\Rightarrow",'\u21D2'],["\\\\circledast",'\u229B'],["\\\\capovercup",'\u2A47'],["\\\\veeonwedge",'\u2A59'],["\\\\veemidvert",'\u2A5B'],["\\\\equivVvert",'\u2A69'],["\\\\lessapprox",'\u2A85'],["\\\\lesseqqgtr",'\u2A8B'],["\\\\gtreqqless",'\u2A8C'],["\\\\eqslantgtr",'\u2A96'],["\\\\rightslice",'\u2AA7'],["\\{\\\\'\\{\\}O\\}|\\\\'\\{\\}O",'\u038C'],["\\\\'\\{\\}\\{I\\}",'\u038A'],["\\\\subsetplus",'\u2ABF'],["\\\\supsetplus",'\u2AC0'],["\\\\cyrchar\\\\C",'\u030F'],["\\\\curlywedge",'\u22CF'],["\\\\tone\\{11\\}",'\u02E9'],["\\\\tone\\{22\\}",'\u02E8'],["\\\\subsetneqq",'\u2ACB'],["\\\\supsetneqq",'\u2ACC'],["\\\\fbox\\{~~\\}",'\u25AD'],["\\\\LEFTCIRCLE",'\u25D6'],['\\\\ultriangle','\u25F8'],["\\\\tone\\{33\\}",'\u02E7'],["\\\\tone\\{44\\}",'\u02E6'],['\\\\urtriangle','\u25F9'],["\\\\lltriangle",'\u25FA'],["\\\\tone\\{55\\}",'\u02E5'],["\\\\varepsilon",'\u025B'],["\\\\lrtriangle",'\u25FF'],["\\\\ding\\{72\\}",'\u2605'],["\\\\ding\\{73\\}",'\u2606'],["\\\\ding\\{37\\}",'\u260E'],["\\\\CheckedBox",'\u2611'],["\\^\\\\circ|\\\\textdegree",'\xB0'],["\\\\ding\\{42\\}",'\u261B'],["\\\\interleave",'\u2AF4'],["\\\\ding\\{43\\}",'\u261E'],["\\\\talloblong",'\u2AFE'],["\\\\mbfdigamma",'\uD835\uDFCB'],["\\\\backdprime",'\u2036'],["\\\\varhexagon",'\u2B21'],["\\\\leftarrowx",'\u2B3E'],["\\\\LLeftarrow",'\u2B45'],["\\\\postalmark",'\u3012'],["\\\\textdollar",'\\$'],['\\\\upuparrows','\u21C8'],["\\\\not\\\\equiv",'\u2262'],["\\\\not\\\\simeq",'\u2244'],["\\\\homothetic",'\u223B'],["\\\\textbullet",'\u2022'],["\\\\geqqslant",'\u2AFA'],["\\\\leqqslant",'\u2AF9'],["\\\\supseteqq",'\u2AC6'],["\\\\subseteqq",'\u2AC5'],["\\\\supsetdot",'\u2ABE'],["\\\\subsetdot",'\u2ABD'],["\\\\leftslice",'\u2AA6'],["\\\\gtrapprox",'\u2A86'],["\\\\approxeqq",'\u2A70'],["\\\\hatapprox",'\u2A6F'],["\\\\equivVert",'\u2A68'],["\\\\varveebar",'\u2A61'],["\\\\Elzminhat",'\u2A5F'],["\\\\midbarvee",'\u2A5D'],["\\\\wedgeodot",'\u2A51'],["\\\\capbarcup",'\u2A49'],["\\\\cupbarcap",'\u2A48'],["\\\\otimeshat",'\u2A36'],["\\\\clockoint",'\u2A0F'],["\\\\modtwosum",'\u2A0A'],["\\\\bigcupdot",'\u2A03'],["\\\\bigotimes",'\u2A02'],["\\\\hourglass",'\u29D6'],["\\\\triangles",'\u29CC'],["\\\\boxcircle",'\u29C7'],["\\\\boxbslash",'\u29C5'],["\\\\angleubar",'\u29A4'],["\\\\turnangle",'\u29A2'],["\\\\Elzlpargt",'\u29A0'],["\\\\Lparengtr",'\u2995'],["\\\\rangledot",'\u2992'],["\\\\langledot",'\u2991'],["\\\\typecolon",'\u2982'],["\\\\neswarrow",'\u2922'],["\\\\nwsearrow",'\u2921'],["\\\\righttail",'\u291A'],["\\\\rrbracket",'\u27E7'],["\\\\llbracket",'\u27E6'],["\\\\longdashv",'\u27DE'],["\\\\vlongdash",'\u27DD'],["\\\\dashVdash",'\u27DB'],["\\\\DashVDash",'\u27DA'],["\\\\medbullet",'\u26AB'],["\\\\heartsuit",'\u2661'],["\\\\rightmoon",'\u263D'],["\\\\biohazard",'\u2623'],["\\\\radiation",'\u2622'],["\\\\Elzrvbull",'\u25D8'],["\\\\Elzvrecto",'\u25AF'],["\\\\blockfull",'\u2588'],["\\\\Elzdshfnc",'\u2506'],["\\\\accurrent",'\u23E6'],["\\\\trapezium",'\u23E2'],["\\\\overbrace",'\u23DE'],["\\\\overparen",'\u23DC'],["\\\\rvboxline",'\u23B9'],["\\\\lvboxline",'\u23B8'],["\\\\sumbottom",'\u23B3'],["\\\\rbracemid",'\u23AC'],["\\\\lbracemid",'\u23A8'],["\\\\Elzdlcorn",'\u23A3'],["\\\\intbottom",'\u2321'],["\\\\turnednot",'\u2319'],["\\\\bagmember",'\u22FF'],["\\\\varniobar",'\u22FD'],["\\\\Elzsqspne",'\u22E5'],["\\\\gtreqless",'\u22DB'],["\\\\lesseqgtr",'\u22DA'],["\\\\pitchfork",'\u22D4'],["\\\\backsimeq",'\u22CD'],["\\\\truestate",'\u22A7'],["\\\\supsetneq",'\u228B'],["\\\\subsetneq",'\u228A'],["\\\\not\\\\succ",'\u2281'],["\\\\not\\\\prec",'\u2280'],["\\\\triangleq",'\u225C'],["\\\\starequal",'\u225B'],["\\\\estimates",'\u2259'],["\\\\tildetrpl",'\u224B'],["\\\\not\\\\cong",'\u2247'],["\\\\therefore",'\u2234'],["\\\\nparallel",'\u2226'],["\\\\sqrt\\[4\\]",'\u221C'],["\\\\sqrt\\[3\\]",'\u221B'],["\\\\increment",'\u2206'],["\\\\nHuparrow",'\u21DE'],["\\\\Downarrow",'\u21D3'],["\\\\Leftarrow",'\u21D0'],["\\\\lightning",'\u21AF'],["\\\\downarrow",'\u2193'],["\\\\leftarrow",'\u2190'],["\\\\fracslash",'\u2044'],["\\\\backprime",'\u2035'],["\\\\Elzreapos",'\u201B'],["\\\\textTheta",'\u03F4'],['\\\\underline','\u0332'],["\\\\textturnk",'\u029E'],["\\\\Elzinglst",'\u0296'],["\\\\Elzreglst",'\u0295'],["\\\\Elzpupsil",'\u028A'],["\\\\Elzrttrnr",'\u027B'],["\\\\Elzclomeg",'\u0277'],["\\\\Elztrnmlr",'\u0270'],["\\\\Elzpgamma",'\u0263'],["\\\\textnrleg",'\u019E'],["\\\\texthvlig",'\u0195'],["\\\\texttimes",'\xD7'],["\\\\texttheta",'\u03B8'],["\\\\Elzpscrv",'\u028B'],["\\\\succnsim",'\u22E9'],["\\\\Elzsqfnw",'\u2519'],["\\\\circledS",'\u24C8'],["\\\\elinters",'\u23E7'],["\\\\varisins",'\u22F3'],["\\\\bbrktbrk",'\u23B6'],["\\\\MapsDown",'\u21A7'],["\\\\APLinput",'\u235E'],["\\\\notslash",'\u233F'],["\\\\mapsfrom",'\u21A4'],["\\\\pentagon",'\u2B20'],["\\\\ComplexI",'\u2148'],["\\\\isinobar",'\u22F7'],["\\\\ComplexJ",'\u2149'],["\\\\lrcorner",'\u231F'],["\\\\llcorner",'\u231E'],['\\\\urcorner','\u231D'],['\\\\ulcorner','\u231C'],["\\\\viewdata",'\u2317'],["\\\\Elzdyogh",'\u02A4'],["\\\\Elzverts",'\u02C8'],["\\\\Elzverti",'\u02CC'],["\\\\Elzhlmrk",'\u02D1'],["\\\\diameter",'\u2300'],["\\\\recorder",'\u2315'],["\\\\Elzsbrhr",'\u02D2'],["\\\\profsurf",'\u2313'],["\\\\Elzsblhr",'\u02D3'],["\\\\Elztdcol",'\u2AF6'],["\\\\profline",'\u2312'],["\\\\overline",'\u0305'],["\\\\Elzsbbrg",'\u032A'],["\\\\succneqq",'\u2AB6'],["\\\\precneqq",'\u2AB5'],['\\\\underbar','\u0331'],["\\\\varsigma",'\u03C2'],["\\\\setminus",'\u2216'],["\\\\varkappa",'\u03F0'],["\\\\not\\\\sim",'\u2241'],["\\\\gnapprox",'\u2A8A'],["\\\\lnapprox",'\u2A89'],["\\\\gesdotol",'\u2A84'],["\\\\lesdotor",'\u2A83'],["\\\\geqslant",'\u2A7E'],["\\\\approxeq",'\u224A'],["\\\\lazysinv",'\u223E'],["\\\\leqslant",'\u2A7D'],["\\\\varVdash",'\u2AE6'],["\\\\=\\{\\\\i\\}",'\u012B'],["\\\\Coloneqq",'\u2A74'],["\\\\simrdots",'\u2A6B'],["\\\\dotequiv",'\u2A67'],["\\\\capwedge",'\u2A44'],["\\\\not\\\\leq",'\u2270'],["\\\\intprodr",'\u2A3D'],["\\\\not\\\\geq",'\u2271'],["\\\\subseteq",'\u2286'],["\\\\timesbar",'\u2A31'],["\\\\supseteq",'\u2287'],["\\\\dottimes",'\u2A30'],["\\\\ElzTimes",'\u2A2F'],["\\\\sqsubset",'\u228F'],["\\\\plustrif",'\u2A28'],["\\\\sqsupset",'\u2290'],["\\\\ringplus",'\u2A22'],["\\\\zproject",'\u2A21'],["\\\\intlarhk",'\u2A17'],["\\\\pointint",'\u2A15'],["\\\\scpolint",'\u2A13'],["\\\\rppolint",'\u2A12'],["\\\\Elxsqcup",'\u2A06'],["\\\\Elxuplus",'\u2A04'],["\\\\forksnot",'\u2ADD'],["\\\\boxminus",'\u229F'],["\\\\boxtimes",'\u22A0'],["\\\\bigoplus",'\u2A01'],["\\\\eqvparsl",'\u29E5'],["\\\\smeparsl",'\u29E4'],["\\\\tieinfty",'\u29DD'],["\\\\Rvzigzag",'\u29DB'],["\\\\Lvzigzag",'\u29DA'],["\\\\rvzigzag",'\u29D9'],["\\\\lvzigzag",'\u29D8'],["\\\\rfbowtie",'\u29D2'],["\\\\lfbowtie",'\u29D1'],["\\\\rtriltri",'\u29CE'],["\\\\Elzdefas",'\u29CB'],["\\\\allequal",'\u224C'],["\\\\doteqdot",'\u2251'],["\\\\Elztrnsa",'\u0252'],["\\\\Elzopeno",'\u0254'],["\\\\boxonbox",'\u29C9'],["\\\\boxslash",'\u29C4'],["\\\\revangle",'\u29A3'],["\\\\Elzddfnc",'\u2999'],["\\\\Elzschwa",'\u0259'],["\\\\Elzrarrx",'\u2947'],["\\\\ElzrLarr",'\u2944'],["\\\\original",'\u22B6'],["\\\\ElzRlarr",'\u2942'],["\\\\multimap",'\u22B8'],["\\\\intercal",'\u22BA'],["\\\\lefttail",'\u2919'],["\\\\barwedge",'\u22BC'],["\\\\drbkarow",'\u2910'],['\\\\Uuparrow','\u290A'],["\\\\Mapsfrom",'\u2906'],["\\\\Elzpbgam",'\u0264'],['\\\\UUparrow','\u27F0'],["\\\\pullback",'\u27D3'],["\\\\wedgedot",'\u27D1'],["\\\\bsolhsub",'\u27C8'],["\\\\curlyvee",'\u22CE'],["\\\\acidfree",'\u267E'],["\\\\twonotes",'\u266B'],["\\\\mkern1mu",'\u200A'],["\\\\aquarius",'\u2652'],["\\\\textcent",'\xA2'],["\\\\Elzltlmr",'\u0271'],["\\\\Question",'\u2047'],["\\\\:|\\\\mkern4mu",'\u205F'],["\\\\steaming",'\u2615'],["\\\\Elztrnrl",'\u027A'],["\\\\parallel",'\u2225'],["\\\\linefeed",'\u21B4'],["\\\\Elzsqfse",'\u25EA'],["\\\\Elzcirfb",'\u25D2'],["\\\\Elzcirfr",'\u25D1'],["\\\\Elzcirfl",'\u25D0'],["\\\\bullseye",'\u25CE'],["\\\\vphantom\\\\{",''],["\\\\eqcolon",'\u2239'],["\\\\because",'\u2235'],["\\\\revnmid",'\u2AEE'],["\\\\between",'\u226C'],["\\\\lessgtr",'\u2276'],["\\\\gtrless",'\u2277'],["\\\\dotplus",'\u2214'],["\\\\smallni",'\u220D'],["\\\\not\\\\ni",'\u220C'],["\\\\smallin",'\u220A'],["\\\\not\\\\in",'\u2209'],["\\\\nexists",'\u2204'],["\\\\partial",'\u2202'],["\\\\boxplus",'\u229E'],["\\\\Swarrow",'\u21D9'],["\\\\Searrow",'\u21D8'],["\\\\Nearrow",'\u21D7'],["\\\\Nwarrow",'\u21D6'],['\\\\Uparrow','\u21D1'],["\\\\diamond",'\u22C4'],["\\\\lessdot",'\u22D6'],["\\\\npreceq",'\u22E0'],["\\\\nsucceq",'\u22E1'],["\\\\nhVvert",'\u2AF5'],["\\\\isindot",'\u22F5'],["\\\\swarrow",'\u2199'],["\\\\searrow",'\u2198'],["\\\\nearrow",'\u2197'],["\\\\nwarrow",'\u2196'],["\\\\textyen",'\xA5'],['\\\\uparrow','\u2191'],["\\\\hexagon",'\u2394'],["\\\\obrbrak",'\u23E0'],['\\\\ubrbrak','\u23E1'],["\\\\benzenr",'\u23E3'],["\\\\Elzxrat",'\u211E'],["\\\\squoval",'\u25A2'],["\\\\Diamond",'\u25C7'],["\\\\fisheye",'\u25C9'],["\\\\lozenge",'\u25CA'],["\\\\bigcirc",'\u25CB'],["\\\\Elzsqfl",'\u25E7'],["\\\\Elzsqfr",'\u25E8'],["\\\\annuity",'\u20E7'],["\\\\yinyang",'\u262F'],["\\\\frownie",'\u2639'],["\\\\mercury",'\u263F'],["\\\\closure",'\u2050'],["\\\\lllnest",'\u2AF7'],["\\\\jupiter",'\u2643'],["\\\\neptune",'\u2646'],["\\\\gggnest",'\u2AF8'],["\\\\scorpio",'\u264F'],["\\\\natural",'\u266E'],["\\\\recycle",'\u267B'],["\\\\diceiii",'\u2682'],["\\\\warning",'\u26A0'],["\\\\medcirc",'\u26AA'],["\\\\lbrbrak",'\u2772'],["\\\\rbrbrak",'\u2773'],["\\\\suphsol",'\u27C9'],["\\\\pushout",'\u27D4'],["\\\\Lbrbrak",'\u27EC'],["\\\\Rbrbrak",'\u27ED'],["\\\\dbkarow",'\u290F'],["\\\\Elolarr",'\u2940'],["\\\\Elorarr",'\u2941'],["\\\\subrarr",'\u2979'],["\\\\suplarr",'\u297B'],["\\\\Elztfnc",'\u2980'],["\\\\Elroang",'\u2986'],["\\\\vzigzag",'\u299A'],["\\\\olcross",'\u29BB'],["\\\\cirscir",'\u29C2'],["\\\\fbowtie",'\u29D3'],["\\\\lftimes",'\u29D4'],["\\\\rftimes",'\u29D5'],["\\\\nvinfty",'\u29DE'],["\\\\shuffle",'\u29E2'],["\\\\thermod",'\u29E7'],["\\\\rsolbar",'\u29F7'],["\\\\bigodot",'\u2A00'],["\\\\varprod",'\u2A09'],["\\\\ElzCint",'\u2A0D'],["\\\\npolint",'\u2A14'],["\\\\plushat",'\u2A23'],["\\\\simplus",'\u2A24'],["\\\\plussim",'\u2A26'],["\\\\twocups",'\u2A4A'],["\\\\twocaps",'\u2A4B'],["\\\\veeodot",'\u2A52'],["\\\\congdot",'\u2A6D'],["\\\\eqqplus",'\u2A71'],["\\\\pluseqq",'\u2A72'],["\\\\ddotseq",'\u2A77'],["\\\\equivDD",'\u2A78'],["\\\\ltquest",'\u2A7B'],["\\\\gtquest",'\u2A7C'],["\\\\lesdoto",'\u2A81'],["\\\\gesdoto",'\u2A82'],["\\\\digamma",'\u03DD'],["\\\\Digamma",'\u03DC'],['\\\\upsilon','\u03C5'],["\\\\epsilon",'\u03B5'],["\\\\eqqless",'\u2A99'],['\\\\Upsilon','\u03A5'],["\\\\bumpeqq",'\u2AAE'],["\\\\backsim",'\u223D'],["\\\\succneq",'\u2AB2'],["\\\\preceqq",'\u2AB3'],["\\\\succeqq",'\u2AB4'],["\\\\trslash",'\u2AFB'],["\\\\Elzpalh",'\u0321'],["\\\\llcurly",'\u2ABB'],["\\\\ggcurly",'\u2ABC'],["\\\\submult",'\u2AC1'],["\\\\supmult",'\u2AC2'],["\\\\subedot",'\u2AC3'],["\\\\supedot",'\u2AC4'],["\\\\lsqhook",'\u2ACD'],["\\\\rsqhook",'\u2ACE'],["\\\\Elzrais",'\u02D4'],["\\\\Elzlmrk",'\u02D0'],["\\\\Elztesh",'\u02A7'],["\\\\Elzglst",'\u0294'],["\\\\Elzyogh",'\u0292'],["\\\\Elzrtlz",'\u0290'],["\\\\Elztrny",'\u028E'],["\\\\Elzinvw",'\u028D'],["\\\\Elzinvv",'\u028C'],["\\\\Elzrtlt",'\u0288'],["\\\\Elztrnt",'\u0287'],["\\\\Elzrtls",'\u0282'],["\\\\Elzrtlr",'\u027D'],["\\\\Elztrnr",'\u0279'],["\\\\textphi",'\u0278'],["\\\\hzigzag",'\u3030'],["\\\\Elzrtln",'\u0273'],["\\\\Elzltln",'\u0272'],["\\\\Elztrnm",'\u026F'],["\\\\Elzrtll",'\u026D'],["\\\\Elzbtdl",'\u026C'],["\\\\Elztrnh",'\u0265'],["\\\\Elzrtld",'\u0256'],["\\\\Elztrna",'\u0250'],["\\\\suphsub",'\u2AD7'],["\\\\supdsub",'\u2AD8'],["\\\\\\.z|\\\\\\.\\{z\\}",'\u017C'],["\\\\\\.Z|\\\\\\.\\{Z\\}",'\u017B'],["\\\\\\^y|\\\\\\^\\{y\\}",'\u0177'],["\\\\\\^Y|\\\\\\^\\{Y\\}",'\u0176'],["\\\\\\^w|\\\\\\^\\{w\\}",'\u0175'],["\\\\\\^W|\\\\\\^\\{W\\}",'\u0174'],["\\\\topfork",'\u2ADA'],["\\\\\\^s|\\\\\\^\\{s\\}",'\u015D'],["\\\\\\^S|\\\\\\^\\{S\\}",'\u015C'],["\\\\\\^J|\\\\\\^\\{J\\}",'\u0134'],["\\\\\\.I|\\\\\\.\\{I\\}",'\u0130'],["\\\\\\^h|\\\\\\^\\{h\\}",'\u0125'],["\\\\\\^H|\\\\\\^\\{H\\}",'\u0124'],["\\\\\\.g|\\\\\\.\\{g\\}",'\u0121'],["\\\\\\.G|\\\\\\.\\{G\\}",'\u0120'],["\\\\\\^g|\\\\\\^\\{g\\}",'\u011D'],["\\\\\\^G|\\\\\\^\\{G\\}",'\u011C'],["\\\\\\.e|\\\\\\.\\{e\\}",'\u0117'],["\\\\\\.E|\\\\\\.\\{E\\}",'\u0116'],["\\\\\\.c|\\\\\\.\\{c\\}",'\u010B'],["\\\\\\.C|\\\\\\.\\{C\\}",'\u010A'],["\\\\\\^c|\\\\\\^\\{c\\}",'\u0109'],["\\\\\\^C|\\\\\\^\\{C\\}",'\u0108'],["\\\\\\^u|\\\\\\^\\{u\\}",'\xFB'],["\\\\\\^o|\\\\\\^\\{o\\}",'\xF4'],["\\\\\\^e|\\\\\\^\\{e\\}",'\xEA'],["\\\\\\^a|\\\\\\^\\{a\\}",'\xE2'],["\\\\\\^U|\\\\\\^\\{U\\}",'\xDB'],["\\\\\\^O|\\\\\\^\\{O\\}",'\xD4'],["\\\\\\^I|\\\\\\^\\{I\\}",'\xCE'],["\\\\\\^E|\\\\\\^\\{E\\}",'\xCA'],["\\\\\\^A|\\\\\\^\\{A\\}",'\xC2'],["\\\\precneq",'\u2AB1'],["\\\\bigtop",'\u27D9'],["\\\\lgroup",'\u27EE'],["\\\\rgroup",'\u27EF'],["\\\\bigcup",'\u22C3'],["\\\\Mapsto",'\u2907'],["\\\\bigcap",'\u22C2'],["\\\\approx",'\u2248'],["\\\\barvee",'\u22BD'],["\\\\veebar",'\u22BB'],["\\\\'c|\\\\'\\{c\\}",'\u0107'],["\\\\scurel",'\u22B1'],["\\\\parsim",'\u2AF3'],["\\\\ltlarr",'\u2976'],["\\\\gtrarr",'\u2978'],["\\\\'C|\\\\'\\{C\\}",'\u0106'],["\\\\k\\{a\\}",'\u0105'],["\\\\k\\{A\\}",'\u0104'],["\\\\lBrace",'\u2983'],["\\\\rBrace",'\u2984'],["\\\\prurel",'\u22B0'],["\\\\angles",'\u299E'],["\\\\angdnr",'\u299F'],["\\\\=a|\\\\=\\{a\\}",'\u0101'],["\\\\=A|\\\\=\\{A\\}",'\u0100'],["\\\\nVDash",'\u22AF'],["\\\\boxast",'\u29C6'],["\\\\boxbox",'\u29C8'],["\\\\nVdash",'\u22AE'],["\\\\ElzLap",'\u29CA'],["\\\\nvDash",'\u22AD'],["\\\\nvdash",'\u22AC'],["\\\\Vvdash",'\u22AA'],["\\\\\"y|\\\\\"\\{y\\}",'\xFF'],["\\\\'y|\\\\'\\{y\\}",'\xFD'],["\\\\topcir",'\u2AF1'],["\\\\assert",'\u22A6'],["\\\\\"u|\\\\\"\\{u\\}",'\xFC'],["\\\\laplac",'\u29E0'],["\\\\eparsl",'\u29E3'],["\\\\'u|\\\\'\\{u\\}",'\xFA'],["\\\\`u|\\\\`\\{u\\}",'\xF9'],["\\\\tminus",'\u29FF'],["\\\\boxdot",'\u22A1'],["\\\\ElzThr",'\u2A05'],["\\\\oslash",'\u2298'],["\\\\ElzInf",'\u2A07'],["\\\\ElzSup",'\u2A08'],["\\\\sumint",'\u2A0B'],["\\\\iiiint",'\u2A0C'],["\\\\\"o|\\\\\"\\{o\\}",'\xF6'],["\\\\intBar",'\u2A0E'],["\\\\otimes",'\u2297'],["\\\\ominus",'\u2296'],["\\\\~o|\\\\~\\{o\\}",'\xF5'],["\\\\sqrint",'\u2A16'],["\\\\intcap",'\u2A19'],["\\\\intcup",'\u2A1A'],["\\\\lowint",'\u2A1C'],["\\\\'o|\\\\'\\{o\\}",'\xF3'],["\\\\`o|\\\\`\\{o\\}",'\xF2'],["\\\\cupdot",'\u228D'],["\\\\forall",'\u2200'],["\\\\btimes",'\u2A32'],["\\\\Otimes",'\u2A37'],["\\\\exists",'\u2203'],["\\\\capdot",'\u2A40'],['\\\\uminus','\u2A41'],["\\\\barcup",'\u2A42'],["\\\\barcap",'\u2A43'],["\\\\supset",'\u2283'],["\\\\cupvee",'\u2A45'],["\\\\~n|\\\\~\\{n\\}",'\xF1'],["\\\\ElzAnd",'\u2A53'],["\\\\midcir",'\u2AF0'],["\\\\dotsim",'\u2A6A'],["\\\\eqqsim",'\u2A73'],["\\\\\"e|\\\\\"\\{e\\}",'\xEB'],["\\\\'e|\\\\'\\{e\\}",'\xE9'],["\\\\`e|\\\\`\\{e\\}",'\xE8'],["\\\\lesdot",'\u2A7F'],["\\\\gesdot",'\u2A80'],["\\\\coprod",'\u2210'],["\\\\varrho",'\u03F1'],["\\\\\"a|\\\\\"\\{a\\}",'\xE4'],["\\\\stigma",'\u03DB'],["\\\\Stigma",'\u03DA'],["\\\\lesges",'\u2A93'],["\\\\gesles",'\u2A94'],["\\\\elsdot",'\u2A97'],["\\\\egsdot",'\u2A98'],["\\\\varphi",'\u03C6'],["\\\\~a|\\\\~\\{a\\}",'\xE3'],["\\\\lambda",'\u03BB'],["\\\\'a|\\\\'\\{a\\}",'\xE1'],["\\\\eqqgtr",'\u2A9A'],["\\\\`a|\\\\`\\{a\\}",'\xE0'],["\\\\Pi|\\\\P\\{i\\}",'\u03A0'],["\\\\Xi|\\\\X\\{i\\}",'\u039E'],["\\\\Lambda",'\u039B'],["\\\\'H|\\\\'\\{H\\}",'\u0389'],["\\\\preceq",'\u2AAF'],["\\\\succeq",'\u2AB0'],["\\\\TH|\\\\T\\{H\\}",'\xDE'],["\\\\'Y|\\\\'\\{Y\\}",'\xDD'],["\\\\\"U|\\\\\"\\{U\\}",'\xDC'],["\\\\Elzbar",'\u0336'],["\\\\'U|\\\\'\\{U\\}",'\xDA'],['\\\\utilde','\u0330'],["\\\\bullet",'\u2219'],["\\\\cirmid",'\u2AEF'],["\\\\`U|\\\\`\\{U\\}",'\xD9'],["\\\\droang",'\u031A'],["\\\\\"O|\\\\\"\\{O\\}",'\xD6'],["\\\\~O|\\\\~\\{O\\}",'\xD5'],["\\\\candra",'\u0310'],["\\\\'O|\\\\'\\{O\\}",'\xD3'],["\\\\ovhook",'\u0309'],["\\\\subsim",'\u2AC7'],["\\\\supsim",'\u2AC8'],["\\\\`O|\\\\`\\{O\\}",'\xD2'],["\\\\~N|\\\\~\\{N\\}",'\xD1'],["\\\\Elzlow",'\u02D5'],["\\\\DH|\\\\D\\{H\\}",'\xD0'],["\\\\propto",'\u221D'],["\\\\subset",'\u2282'],["\\\\\"I|\\\\\"\\{I\\}",'\xCF'],["\\\\subsup",'\u2AD3'],["\\\\rbrace",'\\}'],["\\\\lbrace",'\\{'],["\\\\'I|\\\\'\\{I\\}",'\xCD'],["\\\\`I|\\\\`\\{I\\}",'\xCC'],["\\\\\"E|\\\\\"\\{E\\}",'\xCB'],["\\\\AC|\\\\A\\{C\\}",'\u223F'],["\\\\'E|\\\\'\\{E\\}",'\xC9'],["\\\\`E|\\\\`\\{E\\}",'\xC8'],["\\\\AE|\\\\A\\{E\\}",'\xC6'],["\\\\Elzesh",'\u0283'],["\\\\AA|\\\\A\\{A\\}",'\xC5'],["\\\\supsub",'\u2AD4'],["\\\\Elzfhr",'\u027E'],["\\\\\"A|\\\\\"\\{A\\}",'\xC4'],["\\\\~A|\\\\~\\{A\\}",'\xC3'],["\\\\'A|\\\\'\\{A\\}",'\xC1'],["\\\\`A|\\\\`\\{A\\}",'\xC0'],["\\\\vDdash",'\u2AE2'],["\\\\subsub",'\u2AD5'],["\\\\supsup",'\u2AD6'],["\\\\'g|\\\\'\\{g\\}",'\u01F5'],["\\\\not\\ =",'\u2260'],["\\\\measeq",'\u225E'],["\\\\'z|\\\\'\\{z\\}",'\u017A'],["\\\\'Z|\\\\'\\{Z\\}",'\u0179'],["\\\\\"Y|\\\\\"\\{Y\\}",'\u0178'],["\\\\k\\{u\\}",'\u0173'],["\\\\k\\{U\\}",'\u0172'],["\\\\r\\{u\\}",'\u016F'],["\\\\r\\{U\\}",'\u016E'],["\\\\=u|\\\\=\\{u\\}",'\u016B'],["\\\\=U|\\\\=\\{U\\}",'\u016A'],["\\\\~u|\\\\~\\{u\\}",'\u0169'],["\\\\~U|\\\\~\\{U\\}",'\u0168'],["\\\\circeq",'\u2257'],["\\\\'s|\\\\'\\{s\\}",'\u015B'],["\\\\'S|\\\\'\\{S\\}",'\u015A'],["\\\\'r|\\\\'\\{r\\}",'\u0155'],["\\\\'R|\\\\'\\{R\\}",'\u0154'],["\\\\OE|\\\\O\\{E\\}",'\u0152'],["\\\\=o|\\\\=\\{o\\}",'\u014D'],["\\\\=O|\\\\=\\{O\\}",'\u014C'],["\\\\NG|\\\\N\\{G\\}",'\u014A'],["\\\\'n|\\\\'\\{n\\}",'\u0144'],["\\\\'N|\\\\'\\{N\\}",'\u0143'],["\\\\'l|\\\\'\\{l\\}",'\u013A'],["\\\\'L|\\\\'\\{L\\}",'\u0139'],["\\\\eqcirc",'\u2256'],["\\\\k\\{i\\}",'\u012F'],["\\\\k\\{I\\}",'\u012E'],['\\\\u\\ \\\\i','\u012D'],["\\\\lfloor",'\u230A'],["\\\\rfloor",'\u230B'],["\\\\invneg",'\u2310'],["\\\\niobar",'\u22FE'],["\\\\varnis",'\u22FB'],["\\\\invamp",'\u214B'],["\\\\inttop",'\u2320'],["\\\\isinvb",'\u22F8'],["\\\\langle",'\u2329'],["\\\\rangle",'\u232A'],["\\\\topbot",'\u2336'],["\\\\APLinv",'\u2339'],["\\\\MapsUp",'\u21A5'],["\\\\mapsto",'\u21A6'],["\\\\APLlog",'\u235F'],["\\\\=I|\\\\=\\{I\\}",'\u012A'],["\\\\daleth",'\u2138'],["\\\\sumtop",'\u23B2'],["\\\\~I|\\\\~\\{I\\}",'\u0128'],["\\\\diagup",'\u2571'],["\\\\square",'\u25A1'],["\\\\hslash",'\u210F'],["\\\\bumpeq",'\u224F'],["\\\\boxbar",'\u25EB'],["\\\\Square",'\u2610'],["\\\\danger",'\u2621'],["\\\\Bumpeq",'\u224E'],["\\\\ddddot",'\u20DC'],["\\\\smiley",'\u263A'],["\\\\eqless",'\u22DC'],["\\\\gtrdot",'\u22D7'],["\\\\k\\{e\\}",'\u0119'],["\\\\Exclam",'\u203C'],["\\\\k\\{E\\}",'\u0118'],["\\\\saturn",'\u2644'],['\\\\uranus','\u2645'],["\\\\taurus",'\u2649'],["\\\\gemini",'\u264A'],["\\\\cancer",'\u264B'],["\\\\pisces",'\u2653'],["\\\\Supset",'\u22D1'],["\\\\=e|\\\\=\\{e\\}",'\u0113'],["\\\\Subset",'\u22D0'],["\\\\diceii",'\u2681'],["\\\\=E|\\\\=\\{E\\}",'\u0112'],["\\\\diceiv",'\u2683'],["\\\\dicevi",'\u2685'],["\\\\anchor",'\u2693'],["\\\\swords",'\u2694'],["\\\\DJ|\\\\D\\{J\\}",'\u0110'],["\\\\neuter",'\u26B2'],["\\\\veedot",'\u27C7'],["\\\\rtimes",'\u22CA'],["\\\\ltimes",'\u22C9'],["\\\\bowtie",'\u22C8'],["\\\\bigbot",'\u27D8'],["\\\\cirbot",'\u27DF'],["\\\\LaTeX",'L$^A$T$_E$X'],["\\\\delta",'\u03B4'],["\\\\image",'\u22B7'],["\\\\llarc",'\u25DF'],["\\\\simeq",'\u2243'],["\\\\eqdef",'\u225D'],["\\\\vBarv",'\u2AE9'],["\\\\ElzOr",'\u2A54'],["\\\\equiv",'\u2261'],["\\\\space",' '],["\\\\isins",'\u22F4'],["\\\\lnsim",'\u22E6'],["\\\\Elzxl",'\u0335'],["\\\\Theta",'\u0398'],["\\\\barin",'\u22F6'],["\\\\kappa",'\u03BA'],["\\\\lblot",'\u2989'],["\\\\rblot",'\u298A'],["\\\\frown",'\u2322'],["\\\\earth",'\u2641'],["\\\\Angle",'\u299C'],["\\\\Sqcup",'\u2A4F'],["\\\\Sqcap",'\u2A4E'],["\\\\nhpar",'\u2AF2'],["\\\\operp",'\u29B9'],["\\\\sigma",'\u03C3'],["\\\\csube",'\u2AD1'],["\\\\csupe",'\u2AD2'],["\\\\house",'\u2302'],["\\\\forks",'\u2ADC'],["\\\\Elzxh",'\u0127'],["\\\\strns",'\u23E4'],["\\\\eqgtr",'\u22DD'],["\\\\forkv",'\u2AD9'],["\\\\amalg",'\u2A3F'],["\\\\infty",'\u221E'],["\\\\VDash",'\u22AB'],["\\\\fltns",'\u23E5'],["\\\\disin",'\u22F2'],['\\\\uplus','\u228E'],["\\\\angle",'\u2220'],["\\\\pluto",'\u2647'],["\\\\Vdash",'\u22A9'],["\\\\cdots",'\u22EF'],["\\\\lceil",'\u2308'],["\\\\sqcap",'\u2293'],["\\\\smile",'\u2323'],["\\\\omega",'\u03C9'],["\\\\vdots",'\u22EE'],["\\\\arceq",'\u2258'],["\\\\dashv",'\u22A3'],["\\\\vdash",'\u22A2'],["\\\\skull",'\u2620'],["\\\\rceil",'\u2309'],["\\\\virgo",'\u264D'],["\\\\perps",'\u2AE1'],["\\\\zhide",'\u29F9'],["\\\\tplus",'\u29FE'],["\\\\ldots",'\u2026'],["\\\\zpipe",'\u2A20'],["\\\\dicei",'\u2680'],["\\\\venus",'\u2640'],["\\\\varpi",'\u03D6'],["\\\\Elzrh",'\u0322'],["\\\\Qoppa",'\u03D8'],["\\\\aries",'\u2648'],['\\\\upint','\u2A1B'],["\\\\dddot",'\u20DB'],["\\\\sqcup",'\u2294'],["\\\\qoppa",'\u03D9'],["\\\\Koppa",'\u03DE'],["\\\\awint",'\u2A11'],["\\\\koppa",'\u03DF'],["\\\\Colon",'\u2237'],["\\\\gescc",'\u2AA9'],["\\\\oplus",'\u2295'],["\\\\asymp",'\u224D'],["\\\\isinE",'\u22F9'],["\\\\Elzrl",'\u027C'],["\\\\Sampi",'\u03E0'],["\\\\sampi",'\u03E1'],["\\\\doteq",'\u2250'],["\\\\slash",'\u2215'],["\\\\gnsim",'\u22E7'],["\\\\libra",'\u264E'],["\\\\gsiml",'\u2A90'],["\\\\wedge",'\u2227'],["\\\\dbend",'\uFFFD'],["\\\\dashV",'\u2AE3'],["\\\\Dashv",'\u2AE4'],["\\\\DashV",'\u2AE5'],["\\\\Sigma",'\u03A3'],["\\\\lsimg",'\u2A8F'],["\\\\gsime",'\u2A8E'],["\\\\lsime",'\u2A8D'],["\\\\Equiv",'\u2263'],["\\\\dicev",'\u2684'],["\\\\Gamma",'\u0393'],["\\\\\\^\\\\j",'\u0135'],["\\\\gtcir",'\u2A7A'],["\\\\ltcir",'\u2A79'],["\\\\jmath",'\u0237'],['\\\\ularc','\u25DC'],["\\\\gneqq",'\u2269'],["\\\\gimel",'\u2137'],["\\\\lneqq",'\u2268'],["\\\\Omega",'\u03A9'],["\\\\Equal",'\u2A75'],["\\\\\\^\\\\i",'\xEE'],["\\\\aleph",'\u2135'],["\\\\nabla",'\u2207'],["\\\\lescc",'\u2AA8'],["\\\\simgE",'\u2AA0'],["\\\\sharp",'\u266F'],["\\\\imath",'\uD835\uDEA4'],["\\\\simlE",'\u2A9F'],["\\\\Delta",'\u0394'],['\\\\urarc','\u25DD'],["\\\\alpha",'\u03B1'],["\\\\gamma",'\u03B3'],["\\\\eqdot",'\u2A66'],["\\\\Euler",'\u2107'],["\\\\lrarc",'\u25DE'],["\\\\late",'\u2AAD'],["\\\\v\\ d",'\u010F'],["\\\\hash",'\u22D5'],["\\\\circ",'\u2218'],["\\\\Game",'\u2141'],["\\\\surd",'\u221A'],["\\\\v\\ D",'\u010E'],["\\\\Lbag",'\u27C5'],["\\\\beth",'\u2136'],["\\\\lnot",'\xAC'],["\\\\Finv",'\u2132'],["\\\\~\\\\i",'\u0129'],["\\\\csub",'\u2ACF'],["\\\\csup",'\u2AD0'],["\\\\succ",'\u227B'],["\\\\prec",'\u227A'],["\\\\Vert",'\u2016'],["\\\\nmid",'\u2224'],["\\\\c\\ C",'\xC7'],["\\\\c\\ g",'\u0123'],["\\\\c\\ G",'\u0122'],["\\\\not<",'\u226E'],["\\\\dlsh",'\u21B2'],["\\\\Barv",'\u2AE7'],["\\\\cdot",'\xB7'],["\\\\vBar",'\u2AE8'],["\\\\lang",'\u27EA'],["\\\\rang",'\u27EB'],["\\\\Zbar",'\u01B5'],["\\\\star",'\u22C6'],["\\\\psur",'\u2900'],["\\\\v\\ z",'\u017E'],["\\\\v\\ Z",'\u017D'],["\\\\pinj",'\u2914'],["\\\\finj",'\u2915'],["\\\\bNot",'\u2AED'],['\\\\u\\ e','\u0115'],['\\\\u\\ g','\u011F'],["\\\\spot",'\u2981'],["\\\\H\\ u",'\u0171'],['\\\\u\\ a','\u0103'],["\\\\limg",'\u2987'],["\\\\rimg",'\u2988'],["\\\\H\\ U",'\u0170'],['\\\\u\\ A','\u0102'],["\\\\obot",'\u29BA'],['\\\\u\\ u','\u016D'],['\\\\u\\ U','\u016C'],["\\\\cirE",'\u29C3'],['\\\\u\\ G','\u011E'],["\\\\XBox",'\u2612'],["\\\\v\\ t",'\u0165'],["\\\\v\\ T",'\u0164'],["\\\\c\\ t",'\u0163'],["\\\\c\\ T",'\u0162'],["\\\\v\\ s",'\u0161'],["\\\\v\\ S",'\u0160'],["\\\\perp",'\u22A5'],["\\\\c\\ s",'\u015F'],["\\\\c\\ S",'\u015E'],["\\\\leqq",'\u2266'],["\\\\dsol",'\u29F6'],["\\\\Rbag",'\u27C6'],["\\\\xsol",'\u29F8'],["\\\\v\\ C",'\u010C'],["\\\\v\\ r",'\u0159'],["\\\\odot",'\u2299'],["\\\\v\\ R",'\u0158'],["\\\\c\\ r",'\u0157'],["\\\\c\\ R",'\u0156'],["\\\\flat",'\u266D'],["\\\\LVec",'\u20D6'],["\\\\H\\ o",'\u0151'],["\\\\H\\ O",'\u0150'],['\\\\u\\ o','\u014F'],['\\\\u\\ O','\u014E'],["\\\\intx",'\u2A18'],["\\\\lvec",'\u20D0'],["\\\\Join",'\u2A1D'],["\\\\zcmp",'\u2A1F'],["\\\\pfun",'\u21F8'],["\\\\cong",'\u2245'],["\\\\smte",'\u2AAC'],["\\\\v\\ N",'\u0147'],["\\\\ffun",'\u21FB'],["\\\\c\\ n",'\u0146'],["\\\\c\\ N",'\u0145'],['\\\\u\\ E','\u0114'],["\\\\odiv",'\u2A38'],["\\\\fcmp",'\u2A3E'],["\\\\mlcp",'\u2ADB'],["\\\\v\\ l",'\u013E'],["\\\\v\\ L",'\u013D'],["\\\\c\\ l",'\u013C'],["\\\\c\\ L",'\u013B'],["\\\\\"\\\\i",'\xEF'],["\\\\v\\ e",'\u011B'],["\\\\ElOr",'\u2A56'],["\\\\dsub",'\u2A64'],["\\\\rsub",'\u2A65'],["\\\\oint",'\u222E'],["\\\\'\\\\i",'\xED'],["\\\\`\\\\i",'\xEC'],["\\\\c\\ k",'\u0137'],["\\\\Same",'\u2A76'],["\\\\c\\ K",'\u0136'],["\\\\geqq",'\u2267'],["\\\\c\\ c",'\xE7'],["\\\\prod",'\u220F'],["\\\\v\\ E",'\u011A'],["\\\\lneq",'\u2A87'],["\\\\gneq",'\u2A88'],['\\\\upin','\u27D2'],['\\\\u\\ I','\u012C'],["\\\\not>",'\u226F'],["_\\\\ast",'\u2217'],["\\\\iota",'\u03B9'],["\\\\zeta",'\u03B6'],["\\\\beta",'\u03B2'],["\\\\male",'\u2642'],["\\\\nisd",'\u22FA'],["\\\\quad",'\u2001'],["\\\\v\\ c",'\u010D'],["\\\\v\\ n",'\u0148'],["\\\\glj",'\u2AA4'],["\\\\int",'\u222B'],["\\\\cup",'\u222A'],["\\\\QED",'\u220E'],["\\\\cap",'\u2229'],["\\\\gla",'\u2AA5'],["\\\\Psi",'\u03A8'],["\\\\Phi",'\u03A6'],["\\\\sum",'\u2211'],["\\\\Rsh",'\u21B1'],["\\\\vee",'\u2228'],["\\\\Lsh",'\u21B0'],["\\\\sim",'\u223C'],["\\\\lhd",'\u25C1'],["\\\\LHD",'\u25C0'],["\\\\rhd",'\u25B7'],["\\\\phi",'\u03D5'],["\\\\lgE",'\u2A91'],["\\\\glE",'\u2A92'],["\\\\RHD",'\u25B6'],["\\\\cat",'\u2040'],["\\\\Yup",'\u2144'],["\\\\vec",'\u20D1'],["\\\\div",'\xF7'],["\\\\mid",'\u2223'],["\\\\mho",'\u2127'],["\\\\psi",'\u03C8'],["\\\\chi",'\u03C7'],["\\\\top",'\u22A4'],["\\\\Not",'\u2AEC'],["\\\\tau",'\u03C4'],["\\\\smt",'\u2AAA'],["\\\\rho",'\u03C1'],["\\\\sun",'\u263C'],["\\\\Cap",'\u22D2'],["\\\\lat",'\u2AAB'],["\\\\leo",'\u264C'],["\\\\Sun",'\u2609'],["\\\\Cup",'\u22D3'],["\\\\eta",'\u03B7'],["\\\\Top",'\u2AEA'],["\\\\bij",'\u2916'],["\\\\eth",'\u01AA'],["\\\\geq",'\u2265'],["\\\\nis",'\u22FC'],["\\\\leq",'\u2264'],["\\\\ll",'\u226A'],["\\\\dj",'\u0111'],["\\\\in",'\u2208'],["\\\\\\-",'\xAD'],["\\\\th",'\xFE'],["\\\\wp",'\u2118'],["\\\\aa",'\xE5'],["\\\\ss",'\xDF'],["\\\\ae",'\xE6'],["\\\\ng",'\u014B'],["\\\\mu",'\u03BC'],["''''",'\u2057'],["\\\\pi",'\u03C0'],["\\\\gg",'\u226B'],["\\\\xi",'\u03BE'],["\\\\ni",'\u220B'],["\\\\nu",'\u03BD'],["\\\\pm",'\xB1'],["\\\\mp",'\u2213'],["\\\\wr",'\u2240'],["\\\\\\.",'\u0307'],["\\\\dh",'\xF0'],["\\\\oe",'\u0153'],['\\\\url','\\XXurl'],['\\\\u','\u0306'],["\\\\XXurl",'\\url'],["\\\\L",'\u0141'],["\\\\c",'\xB8'],["\\\\i",'\u0131'],["\\\\k",'\u02DB'],["\\\\H",'\u02DD'],["\\\\\"",'\u0308'],["\\\\v",'\u030C'],["\\\\o",'\xF8'],["\\\\`",'\u0300'],["\\\\'",'\u0301'],["\\\\~",'\u0303'],["\\\\r",'\u02DA'],["\\\\O",'\xD8'],["\\\\=",'\u0304'],["\\\\l",'\u0142'],["'''",'\u2034'],["\\\\textasciitilde",'\\~']]);

},{}],131:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BibLatexLiteralParser = undefined;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var cov_1nxm1be8cv = function () {
    var path = '/home/travis/build/fiduswriter/biblatex-csl-converter/src/import/literal-parser.js',
        hash = 'e1362e7f543327cdbea8a4fcf08c21ceceb3914d',
        global = new Function('return this')(),
        gcv = '__coverage__',
        coverageData = {
        path: '/home/travis/build/fiduswriter/biblatex-csl-converter/src/import/literal-parser.js',
        statementMap: {
            '0': {
                start: {
                    line: 1,
                    column: 23
                },
                end: {
                    line: 12,
                    column: 1
                }
            },
            '1': {
                start: {
                    line: 14,
                    column: 32
                },
                end: {
                    line: 16,
                    column: 1
                }
            },
            '2': {
                start: {
                    line: 18,
                    column: 28
                },
                end: {
                    line: 31,
                    column: 1
                }
            },
            '3': {
                start: {
                    line: 35,
                    column: 8
                },
                end: {
                    line: 35,
                    column: 28
                }
            },
            '4': {
                start: {
                    line: 36,
                    column: 8
                },
                end: {
                    line: 36,
                    column: 28
                }
            },
            '5': {
                start: {
                    line: 37,
                    column: 8
                },
                end: {
                    line: 37,
                    column: 27
                }
            },
            '6': {
                start: {
                    line: 38,
                    column: 8
                },
                end: {
                    line: 38,
                    column: 33
                }
            },
            '7': {
                start: {
                    line: 39,
                    column: 8
                },
                end: {
                    line: 39,
                    column: 19
                }
            },
            '8': {
                start: {
                    line: 40,
                    column: 8
                },
                end: {
                    line: 40,
                    column: 22
                }
            },
            '9': {
                start: {
                    line: 41,
                    column: 8
                },
                end: {
                    line: 41,
                    column: 31
                }
            },
            '10': {
                start: {
                    line: 42,
                    column: 8
                },
                end: {
                    line: 42,
                    column: 30
                }
            },
            '11': {
                start: {
                    line: 43,
                    column: 8
                },
                end: {
                    line: 43,
                    column: 35
                }
            },
            '12': {
                start: {
                    line: 44,
                    column: 8
                },
                end: {
                    line: 44,
                    column: 29
                }
            },
            '13': {
                start: {
                    line: 49,
                    column: 8
                },
                end: {
                    line: 51,
                    column: 9
                }
            },
            '14': {
                start: {
                    line: 50,
                    column: 12
                },
                end: {
                    line: 50,
                    column: 27
                }
            },
            '15': {
                start: {
                    line: 55,
                    column: 8
                },
                end: {
                    line: 59,
                    column: 9
                }
            },
            '16': {
                start: {
                    line: 58,
                    column: 12
                },
                end: {
                    line: 58,
                    column: 33
                }
            },
            '17': {
                start: {
                    line: 63,
                    column: 8
                },
                end: {
                    line: 63,
                    column: 48
                }
            },
            '18': {
                start: {
                    line: 64,
                    column: 8
                },
                end: {
                    line: 64,
                    column: 37
                }
            },
            '19': {
                start: {
                    line: 68,
                    column: 8
                },
                end: {
                    line: 68,
                    column: 29
                }
            },
            '20': {
                start: {
                    line: 70,
                    column: 8
                },
                end: {
                    line: 278,
                    column: 9
                }
            },
            '21': {
                start: {
                    line: 70,
                    column: 21
                },
                end: {
                    line: 278,
                    column: 9
                }
            },
            '22': {
                start: {
                    line: 71,
                    column: 12
                },
                end: {
                    line: 277,
                    column: 13
                }
            },
            '23': {
                start: {
                    line: 73,
                    column: 20
                },
                end: {
                    line: 100,
                    column: 21
                }
            },
            '24': {
                start: {
                    line: 74,
                    column: 24
                },
                end: {
                    line: 99,
                    column: 25
                }
            },
            '25': {
                start: {
                    line: 75,
                    column: 28
                },
                end: {
                    line: 75,
                    column: 45
                }
            },
            '26': {
                start: {
                    line: 76,
                    column: 28
                },
                end: {
                    line: 76,
                    column: 56
                }
            },
            '27': {
                start: {
                    line: 77,
                    column: 28
                },
                end: {
                    line: 77,
                    column: 57
                }
            },
            '28': {
                start: {
                    line: 78,
                    column: 28
                },
                end: {
                    line: 94,
                    column: 29
                }
            },
            '29': {
                start: {
                    line: 81,
                    column: 32
                },
                end: {
                    line: 93,
                    column: 33
                }
            },
            '30': {
                start: {
                    line: 86,
                    column: 36
                },
                end: {
                    line: 86,
                    column: 59
                }
            },
            '31': {
                start: {
                    line: 87,
                    column: 36
                },
                end: {
                    line: 87,
                    column: 63
                }
            },
            '32': {
                start: {
                    line: 91,
                    column: 36
                },
                end: {
                    line: 91,
                    column: 75
                }
            },
            '33': {
                start: {
                    line: 92,
                    column: 36
                },
                end: {
                    line: 92,
                    column: 73
                }
            },
            '34': {
                start: {
                    line: 95,
                    column: 28
                },
                end: {
                    line: 95,
                    column: 69
                }
            },
            '35': {
                start: {
                    line: 96,
                    column: 28
                },
                end: {
                    line: 96,
                    column: 75
                }
            },
            '36': {
                start: {
                    line: 97,
                    column: 28
                },
                end: {
                    line: 97,
                    column: 57
                }
            },
            '37': {
                start: {
                    line: 98,
                    column: 28
                },
                end: {
                    line: 98,
                    column: 48
                }
            },
            '38': {
                start: {
                    line: 101,
                    column: 20
                },
                end: {
                    line: 131,
                    column: 21
                }
            },
            '39': {
                start: {
                    line: 102,
                    column: 24
                },
                end: {
                    line: 130,
                    column: 25
                }
            },
            '40': {
                start: {
                    line: 103,
                    column: 28
                },
                end: {
                    line: 103,
                    column: 57
                }
            },
            '41': {
                start: {
                    line: 104,
                    column: 28
                },
                end: {
                    line: 104,
                    column: 75
                }
            },
            '42': {
                start: {
                    line: 105,
                    column: 28
                },
                end: {
                    line: 105,
                    column: 71
                }
            },
            '43': {
                start: {
                    line: 106,
                    column: 28
                },
                end: {
                    line: 106,
                    column: 56
                }
            },
            '44': {
                start: {
                    line: 107,
                    column: 37
                },
                end: {
                    line: 107,
                    column: 44
                }
            },
            '45': {
                start: {
                    line: 108,
                    column: 53
                },
                end: {
                    line: 108,
                    column: 54
                }
            },
            '46': {
                start: {
                    line: 109,
                    column: 28
                },
                end: {
                    line: 125,
                    column: 29
                }
            },
            '47': {
                start: {
                    line: 116,
                    column: 32
                },
                end: {
                    line: 123,
                    column: 33
                }
            },
            '48': {
                start: {
                    line: 118,
                    column: 40
                },
                end: {
                    line: 118,
                    column: 60
                }
            },
            '49': {
                start: {
                    line: 119,
                    column: 40
                },
                end: {
                    line: 119,
                    column: 45
                }
            },
            '50': {
                start: {
                    line: 121,
                    column: 40
                },
                end: {
                    line: 121,
                    column: 60
                }
            },
            '51': {
                start: {
                    line: 122,
                    column: 40
                },
                end: {
                    line: 122,
                    column: 45
                }
            },
            '52': {
                start: {
                    line: 124,
                    column: 32
                },
                end: {
                    line: 124,
                    column: 36
                }
            },
            '53': {
                start: {
                    line: 126,
                    column: 28
                },
                end: {
                    line: 126,
                    column: 82
                }
            },
            '54': {
                start: {
                    line: 127,
                    column: 28
                },
                end: {
                    line: 127,
                    column: 49
                }
            },
            '55': {
                start: {
                    line: 128,
                    column: 28
                },
                end: {
                    line: 128,
                    column: 44
                }
            },
            '56': {
                start: {
                    line: 129,
                    column: 28
                },
                end: {
                    line: 129,
                    column: 48
                }
            },
            '57': {
                start: {
                    line: 132,
                    column: 20
                },
                end: {
                    line: 148,
                    column: 21
                }
            },
            '58': {
                start: {
                    line: 133,
                    column: 24
                },
                end: {
                    line: 133,
                    column: 89
                }
            },
            '59': {
                start: {
                    line: 134,
                    column: 24
                },
                end: {
                    line: 134,
                    column: 36
                }
            },
            '60': {
                start: {
                    line: 137,
                    column: 24
                },
                end: {
                    line: 137,
                    column: 33
                }
            },
            '61': {
                start: {
                    line: 138,
                    column: 24
                },
                end: {
                    line: 140,
                    column: 25
                }
            },
            '62': {
                start: {
                    line: 139,
                    column: 28
                },
                end: {
                    line: 139,
                    column: 37
                }
            },
            '63': {
                start: {
                    line: 143,
                    column: 24
                },
                end: {
                    line: 147,
                    column: 25
                }
            },
            '64': {
                start: {
                    line: 144,
                    column: 28
                },
                end: {
                    line: 144,
                    column: 45
                }
            },
            '65': {
                start: {
                    line: 145,
                    column: 28
                },
                end: {
                    line: 145,
                    column: 58
                }
            },
            '66': {
                start: {
                    line: 146,
                    column: 28
                },
                end: {
                    line: 146,
                    column: 37
                }
            },
            '67': {
                start: {
                    line: 149,
                    column: 20
                },
                end: {
                    line: 149,
                    column: 25
                }
            },
            '68': {
                start: {
                    line: 151,
                    column: 20
                },
                end: {
                    line: 172,
                    column: 21
                }
            },
            '69': {
                start: {
                    line: 153,
                    column: 28
                },
                end: {
                    line: 153,
                    column: 57
                }
            },
            '70': {
                start: {
                    line: 154,
                    column: 28
                },
                end: {
                    line: 154,
                    column: 45
                }
            },
            '71': {
                start: {
                    line: 155,
                    column: 28
                },
                end: {
                    line: 155,
                    column: 40
                }
            },
            '72': {
                start: {
                    line: 156,
                    column: 28
                },
                end: {
                    line: 156,
                    column: 64
                }
            },
            '73': {
                start: {
                    line: 157,
                    column: 28
                },
                end: {
                    line: 157,
                    column: 75
                }
            },
            '74': {
                start: {
                    line: 158,
                    column: 28
                },
                end: {
                    line: 158,
                    column: 57
                }
            },
            '75': {
                start: {
                    line: 159,
                    column: 28
                },
                end: {
                    line: 159,
                    column: 33
                }
            },
            '76': {
                start: {
                    line: 162,
                    column: 28
                },
                end: {
                    line: 162,
                    column: 37
                }
            },
            '77': {
                start: {
                    line: 163,
                    column: 28
                },
                end: {
                    line: 163,
                    column: 33
                }
            },
            '78': {
                start: {
                    line: 166,
                    column: 28
                },
                end: {
                    line: 166,
                    column: 57
                }
            },
            '79': {
                start: {
                    line: 167,
                    column: 28
                },
                end: {
                    line: 167,
                    column: 75
                }
            },
            '80': {
                start: {
                    line: 168,
                    column: 28
                },
                end: {
                    line: 168,
                    column: 66
                }
            },
            '81': {
                start: {
                    line: 169,
                    column: 28
                },
                end: {
                    line: 169,
                    column: 71
                }
            },
            '82': {
                start: {
                    line: 170,
                    column: 28
                },
                end: {
                    line: 170,
                    column: 49
                }
            },
            '83': {
                start: {
                    line: 171,
                    column: 28
                },
                end: {
                    line: 171,
                    column: 40
                }
            },
            '84': {
                start: {
                    line: 173,
                    column: 20
                },
                end: {
                    line: 173,
                    column: 25
                }
            },
            '85': {
                start: {
                    line: 175,
                    column: 20
                },
                end: {
                    line: 196,
                    column: 21
                }
            },
            '86': {
                start: {
                    line: 177,
                    column: 28
                },
                end: {
                    line: 177,
                    column: 57
                }
            },
            '87': {
                start: {
                    line: 178,
                    column: 28
                },
                end: {
                    line: 178,
                    column: 45
                }
            },
            '88': {
                start: {
                    line: 179,
                    column: 28
                },
                end: {
                    line: 179,
                    column: 40
                }
            },
            '89': {
                start: {
                    line: 180,
                    column: 28
                },
                end: {
                    line: 180,
                    column: 64
                }
            },
            '90': {
                start: {
                    line: 181,
                    column: 28
                },
                end: {
                    line: 181,
                    column: 75
                }
            },
            '91': {
                start: {
                    line: 182,
                    column: 28
                },
                end: {
                    line: 182,
                    column: 57
                }
            },
            '92': {
                start: {
                    line: 183,
                    column: 28
                },
                end: {
                    line: 183,
                    column: 33
                }
            },
            '93': {
                start: {
                    line: 186,
                    column: 28
                },
                end: {
                    line: 186,
                    column: 37
                }
            },
            '94': {
                start: {
                    line: 187,
                    column: 28
                },
                end: {
                    line: 187,
                    column: 33
                }
            },
            '95': {
                start: {
                    line: 190,
                    column: 28
                },
                end: {
                    line: 190,
                    column: 57
                }
            },
            '96': {
                start: {
                    line: 191,
                    column: 28
                },
                end: {
                    line: 191,
                    column: 75
                }
            },
            '97': {
                start: {
                    line: 192,
                    column: 28
                },
                end: {
                    line: 192,
                    column: 66
                }
            },
            '98': {
                start: {
                    line: 193,
                    column: 28
                },
                end: {
                    line: 193,
                    column: 71
                }
            },
            '99': {
                start: {
                    line: 194,
                    column: 28
                },
                end: {
                    line: 194,
                    column: 49
                }
            },
            '100': {
                start: {
                    line: 195,
                    column: 28
                },
                end: {
                    line: 195,
                    column: 40
                }
            },
            '101': {
                start: {
                    line: 197,
                    column: 20
                },
                end: {
                    line: 197,
                    column: 25
                }
            },
            '102': {
                start: {
                    line: 199,
                    column: 20
                },
                end: {
                    line: 199,
                    column: 37
                }
            },
            '103': {
                start: {
                    line: 200,
                    column: 20
                },
                end: {
                    line: 209,
                    column: 21
                }
            },
            '104': {
                start: {
                    line: 202,
                    column: 24
                },
                end: {
                    line: 202,
                    column: 54
                }
            },
            '105': {
                start: {
                    line: 204,
                    column: 24
                },
                end: {
                    line: 204,
                    column: 61
                }
            },
            '106': {
                start: {
                    line: 205,
                    column: 24
                },
                end: {
                    line: 205,
                    column: 53
                }
            },
            '107': {
                start: {
                    line: 206,
                    column: 24
                },
                end: {
                    line: 206,
                    column: 63
                }
            },
            '108': {
                start: {
                    line: 207,
                    column: 24
                },
                end: {
                    line: 207,
                    column: 71
                }
            },
            '109': {
                start: {
                    line: 208,
                    column: 24
                },
                end: {
                    line: 208,
                    column: 53
                }
            },
            '110': {
                start: {
                    line: 210,
                    column: 20
                },
                end: {
                    line: 210,
                    column: 29
                }
            },
            '111': {
                start: {
                    line: 211,
                    column: 20
                },
                end: {
                    line: 211,
                    column: 25
                }
            },
            '112': {
                start: {
                    line: 213,
                    column: 20
                },
                end: {
                    line: 213,
                    column: 37
                }
            },
            '113': {
                start: {
                    line: 214,
                    column: 20
                },
                end: {
                    line: 236,
                    column: 21
                }
            },
            '114': {
                start: {
                    line: 215,
                    column: 41
                },
                end: {
                    line: 215,
                    column: 65
                }
            },
            '115': {
                start: {
                    line: 216,
                    column: 24
                },
                end: {
                    line: 230,
                    column: 25
                }
            },
            '116': {
                start: {
                    line: 217,
                    column: 28
                },
                end: {
                    line: 217,
                    column: 57
                }
            },
            '117': {
                start: {
                    line: 218,
                    column: 43
                },
                end: {
                    line: 218,
                    column: 66
                }
            },
            '118': {
                start: {
                    line: 219,
                    column: 28
                },
                end: {
                    line: 226,
                    column: 29
                }
            },
            '119': {
                start: {
                    line: 220,
                    column: 32
                },
                end: {
                    line: 220,
                    column: 59
                }
            },
            '120': {
                start: {
                    line: 223,
                    column: 32
                },
                end: {
                    line: 225,
                    column: 33
                }
            },
            '121': {
                start: {
                    line: 224,
                    column: 36
                },
                end: {
                    line: 224,
                    column: 70
                }
            },
            '122': {
                start: {
                    line: 227,
                    column: 28
                },
                end: {
                    line: 229,
                    column: 29
                }
            },
            '123': {
                start: {
                    line: 228,
                    column: 32
                },
                end: {
                    line: 228,
                    column: 79
                }
            },
            '124': {
                start: {
                    line: 231,
                    column: 24
                },
                end: {
                    line: 231,
                    column: 33
                }
            },
            '125': {
                start: {
                    line: 232,
                    column: 24
                },
                end: {
                    line: 232,
                    column: 44
                }
            },
            '126': {
                start: {
                    line: 235,
                    column: 24
                },
                end: {
                    line: 235,
                    column: 66
                }
            },
            '127': {
                start: {
                    line: 237,
                    column: 20
                },
                end: {
                    line: 237,
                    column: 25
                }
            },
            '128': {
                start: {
                    line: 240,
                    column: 20
                },
                end: {
                    line: 240,
                    column: 29
                }
            },
            '129': {
                start: {
                    line: 241,
                    column: 20
                },
                end: {
                    line: 241,
                    column: 25
                }
            },
            '130': {
                start: {
                    line: 244,
                    column: 20
                },
                end: {
                    line: 244,
                    column: 50
                }
            },
            '131': {
                start: {
                    line: 245,
                    column: 20
                },
                end: {
                    line: 245,
                    column: 29
                }
            },
            '132': {
                start: {
                    line: 246,
                    column: 20
                },
                end: {
                    line: 246,
                    column: 25
                }
            },
            '133': {
                start: {
                    line: 249,
                    column: 20
                },
                end: {
                    line: 249,
                    column: 48
                }
            },
            '134': {
                start: {
                    line: 250,
                    column: 29
                },
                end: {
                    line: 250,
                    column: 40
                }
            },
            '135': {
                start: {
                    line: 251,
                    column: 20
                },
                end: {
                    line: 253,
                    column: 21
                }
            },
            '136': {
                start: {
                    line: 252,
                    column: 24
                },
                end: {
                    line: 252,
                    column: 28
                }
            },
            '137': {
                start: {
                    line: 254,
                    column: 35
                },
                end: {
                    line: 254,
                    column: 71
                }
            },
            '138': {
                start: {
                    line: 255,
                    column: 20
                },
                end: {
                    line: 255,
                    column: 71
                }
            },
            '139': {
                start: {
                    line: 256,
                    column: 20
                },
                end: {
                    line: 256,
                    column: 41
                }
            },
            '140': {
                start: {
                    line: 257,
                    column: 20
                },
                end: {
                    line: 257,
                    column: 36
                }
            },
            '141': {
                start: {
                    line: 258,
                    column: 20
                },
                end: {
                    line: 258,
                    column: 25
                }
            },
            '142': {
                start: {
                    line: 260,
                    column: 20
                },
                end: {
                    line: 260,
                    column: 29
                }
            },
            '143': {
                start: {
                    line: 261,
                    column: 20
                },
                end: {
                    line: 261,
                    column: 25
                }
            },
            '144': {
                start: {
                    line: 263,
                    column: 20
                },
                end: {
                    line: 271,
                    column: 21
                }
            },
            '145': {
                start: {
                    line: 268,
                    column: 24
                },
                end: {
                    line: 268,
                    column: 50
                }
            },
            '146': {
                start: {
                    line: 270,
                    column: 24
                },
                end: {
                    line: 270,
                    column: 49
                }
            },
            '147': {
                start: {
                    line: 272,
                    column: 20
                },
                end: {
                    line: 272,
                    column: 29
                }
            },
            '148': {
                start: {
                    line: 273,
                    column: 20
                },
                end: {
                    line: 273,
                    column: 25
                }
            },
            '149': {
                start: {
                    line: 275,
                    column: 20
                },
                end: {
                    line: 275,
                    column: 62
                }
            },
            '150': {
                start: {
                    line: 276,
                    column: 20
                },
                end: {
                    line: 276,
                    column: 29
                }
            },
            '151': {
                start: {
                    line: 280,
                    column: 8
                },
                end: {
                    line: 283,
                    column: 9
                }
            },
            '152': {
                start: {
                    line: 282,
                    column: 12
                },
                end: {
                    line: 282,
                    column: 54
                }
            },
            '153': {
                start: {
                    line: 285,
                    column: 8
                },
                end: {
                    line: 285,
                    column: 36
                }
            },
            '154': {
                start: {
                    line: 288,
                    column: 8
                },
                end: {
                    line: 288,
                    column: 24
                }
            },
            '155': {
                start: {
                    line: 292,
                    column: 8
                },
                end: {
                    line: 292,
                    column: 34
                }
            }
        },
        fnMap: {
            '0': {
                name: '(anonymous_0)',
                decl: {
                    start: {
                        line: 34,
                        column: 4
                    },
                    end: {
                        line: 34,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 34,
                        column: 40
                    },
                    end: {
                        line: 45,
                        column: 5
                    }
                }
            },
            '1': {
                name: '(anonymous_1)',
                decl: {
                    start: {
                        line: 48,
                        column: 4
                    },
                    end: {
                        line: 48,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 48,
                        column: 28
                    },
                    end: {
                        line: 52,
                        column: 5
                    }
                }
            },
            '2': {
                name: '(anonymous_2)',
                decl: {
                    start: {
                        line: 54,
                        column: 4
                    },
                    end: {
                        line: 54,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 54,
                        column: 29
                    },
                    end: {
                        line: 60,
                        column: 5
                    }
                }
            },
            '3': {
                name: '(anonymous_3)',
                decl: {
                    start: {
                        line: 62,
                        column: 4
                    },
                    end: {
                        line: 62,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 62,
                        column: 21
                    },
                    end: {
                        line: 65,
                        column: 5
                    }
                }
            },
            '4': {
                name: '(anonymous_4)',
                decl: {
                    start: {
                        line: 67,
                        column: 4
                    },
                    end: {
                        line: 67,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 67,
                        column: 19
                    },
                    end: {
                        line: 289,
                        column: 5
                    }
                }
            },
            '5': {
                name: '(anonymous_5)',
                decl: {
                    start: {
                        line: 291,
                        column: 4
                    },
                    end: {
                        line: 291,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 291,
                        column: 17
                    },
                    end: {
                        line: 293,
                        column: 5
                    }
                }
            }
        },
        branchMap: {
            '0': {
                loc: {
                    start: {
                        line: 34,
                        column: 24
                    },
                    end: {
                        line: 34,
                        column: 38
                    }
                },
                type: 'default-arg',
                locations: [{
                    start: {
                        line: 34,
                        column: 33
                    },
                    end: {
                        line: 34,
                        column: 38
                    }
                }]
            },
            '1': {
                loc: {
                    start: {
                        line: 49,
                        column: 8
                    },
                    end: {
                        line: 51,
                        column: 9
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 49,
                        column: 8
                    },
                    end: {
                        line: 51,
                        column: 9
                    }
                }, {
                    start: {
                        line: 49,
                        column: 8
                    },
                    end: {
                        line: 51,
                        column: 9
                    }
                }]
            },
            '2': {
                loc: {
                    start: {
                        line: 55,
                        column: 8
                    },
                    end: {
                        line: 59,
                        column: 9
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 55,
                        column: 8
                    },
                    end: {
                        line: 59,
                        column: 9
                    }
                }, {
                    start: {
                        line: 55,
                        column: 8
                    },
                    end: {
                        line: 59,
                        column: 9
                    }
                }]
            },
            '3': {
                loc: {
                    start: {
                        line: 71,
                        column: 12
                    },
                    end: {
                        line: 277,
                        column: 13
                    }
                },
                type: 'switch',
                locations: [{
                    start: {
                        line: 72,
                        column: 16
                    },
                    end: {
                        line: 149,
                        column: 25
                    }
                }, {
                    start: {
                        line: 150,
                        column: 16
                    },
                    end: {
                        line: 173,
                        column: 25
                    }
                }, {
                    start: {
                        line: 174,
                        column: 16
                    },
                    end: {
                        line: 197,
                        column: 25
                    }
                }, {
                    start: {
                        line: 198,
                        column: 16
                    },
                    end: {
                        line: 211,
                        column: 25
                    }
                }, {
                    start: {
                        line: 212,
                        column: 16
                    },
                    end: {
                        line: 237,
                        column: 25
                    }
                }, {
                    start: {
                        line: 238,
                        column: 16
                    },
                    end: {
                        line: 241,
                        column: 25
                    }
                }, {
                    start: {
                        line: 242,
                        column: 16
                    },
                    end: {
                        line: 246,
                        column: 25
                    }
                }, {
                    start: {
                        line: 247,
                        column: 16
                    },
                    end: {
                        line: 258,
                        column: 25
                    }
                }, {
                    start: {
                        line: 259,
                        column: 16
                    },
                    end: {
                        line: 261,
                        column: 25
                    }
                }, {
                    start: {
                        line: 262,
                        column: 16
                    },
                    end: {
                        line: 273,
                        column: 25
                    }
                }, {
                    start: {
                        line: 274,
                        column: 16
                    },
                    end: {
                        line: 276,
                        column: 29
                    }
                }]
            },
            '4': {
                loc: {
                    start: {
                        line: 74,
                        column: 24
                    },
                    end: {
                        line: 99,
                        column: 25
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 74,
                        column: 24
                    },
                    end: {
                        line: 99,
                        column: 25
                    }
                }, {
                    start: {
                        line: 74,
                        column: 24
                    },
                    end: {
                        line: 99,
                        column: 25
                    }
                }]
            },
            '5': {
                loc: {
                    start: {
                        line: 78,
                        column: 28
                    },
                    end: {
                        line: 94,
                        column: 29
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 78,
                        column: 28
                    },
                    end: {
                        line: 94,
                        column: 29
                    }
                }, {
                    start: {
                        line: 78,
                        column: 28
                    },
                    end: {
                        line: 94,
                        column: 29
                    }
                }]
            },
            '6': {
                loc: {
                    start: {
                        line: 81,
                        column: 32
                    },
                    end: {
                        line: 93,
                        column: 33
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 81,
                        column: 32
                    },
                    end: {
                        line: 93,
                        column: 33
                    }
                }, {
                    start: {
                        line: 81,
                        column: 32
                    },
                    end: {
                        line: 93,
                        column: 33
                    }
                }]
            },
            '7': {
                loc: {
                    start: {
                        line: 82,
                        column: 36
                    },
                    end: {
                        line: 84,
                        column: 99
                    }
                },
                type: 'binary-expr',
                locations: [{
                    start: {
                        line: 82,
                        column: 36
                    },
                    end: {
                        line: 82,
                        column: 77
                    }
                }, {
                    start: {
                        line: 83,
                        column: 36
                    },
                    end: {
                        line: 83,
                        column: 66
                    }
                }, {
                    start: {
                        line: 84,
                        column: 36
                    },
                    end: {
                        line: 84,
                        column: 99
                    }
                }]
            },
            '8': {
                loc: {
                    start: {
                        line: 102,
                        column: 24
                    },
                    end: {
                        line: 130,
                        column: 25
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 102,
                        column: 24
                    },
                    end: {
                        line: 130,
                        column: 25
                    }
                }, {
                    start: {
                        line: 102,
                        column: 24
                    },
                    end: {
                        line: 130,
                        column: 25
                    }
                }]
            },
            '9': {
                loc: {
                    start: {
                        line: 110,
                        column: 32
                    },
                    end: {
                        line: 114,
                        column: 33
                    }
                },
                type: 'binary-expr',
                locations: [{
                    start: {
                        line: 110,
                        column: 32
                    },
                    end: {
                        line: 110,
                        column: 46
                    }
                }, {
                    start: {
                        line: 112,
                        column: 36
                    },
                    end: {
                        line: 112,
                        column: 59
                    }
                }, {
                    start: {
                        line: 113,
                        column: 36
                    },
                    end: {
                        line: 113,
                        column: 58
                    }
                }]
            },
            '10': {
                loc: {
                    start: {
                        line: 116,
                        column: 32
                    },
                    end: {
                        line: 123,
                        column: 33
                    }
                },
                type: 'switch',
                locations: [{
                    start: {
                        line: 117,
                        column: 36
                    },
                    end: {
                        line: 119,
                        column: 45
                    }
                }, {
                    start: {
                        line: 120,
                        column: 36
                    },
                    end: {
                        line: 122,
                        column: 45
                    }
                }]
            },
            '11': {
                loc: {
                    start: {
                        line: 132,
                        column: 20
                    },
                    end: {
                        line: 148,
                        column: 21
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 132,
                        column: 20
                    },
                    end: {
                        line: 148,
                        column: 21
                    }
                }, {
                    start: {
                        line: 132,
                        column: 20
                    },
                    end: {
                        line: 148,
                        column: 21
                    }
                }]
            },
            '12': {
                loc: {
                    start: {
                        line: 138,
                        column: 30
                    },
                    end: {
                        line: 138,
                        column: 92
                    }
                },
                type: 'binary-expr',
                locations: [{
                    start: {
                        line: 138,
                        column: 30
                    },
                    end: {
                        line: 138,
                        column: 47
                    }
                }, {
                    start: {
                        line: 138,
                        column: 51
                    },
                    end: {
                        line: 138,
                        column: 92
                    }
                }]
            },
            '13': {
                loc: {
                    start: {
                        line: 143,
                        column: 24
                    },
                    end: {
                        line: 147,
                        column: 25
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 143,
                        column: 24
                    },
                    end: {
                        line: 147,
                        column: 25
                    }
                }, {
                    start: {
                        line: 143,
                        column: 24
                    },
                    end: {
                        line: 147,
                        column: 25
                    }
                }]
            },
            '14': {
                loc: {
                    start: {
                        line: 151,
                        column: 20
                    },
                    end: {
                        line: 172,
                        column: 21
                    }
                },
                type: 'switch',
                locations: [{
                    start: {
                        line: 152,
                        column: 24
                    },
                    end: {
                        line: 159,
                        column: 33
                    }
                }, {
                    start: {
                        line: 160,
                        column: 24
                    },
                    end: {
                        line: 163,
                        column: 33
                    }
                }, {
                    start: {
                        line: 164,
                        column: 24
                    },
                    end: {
                        line: 171,
                        column: 40
                    }
                }]
            },
            '15': {
                loc: {
                    start: {
                        line: 175,
                        column: 20
                    },
                    end: {
                        line: 196,
                        column: 21
                    }
                },
                type: 'switch',
                locations: [{
                    start: {
                        line: 176,
                        column: 24
                    },
                    end: {
                        line: 183,
                        column: 33
                    }
                }, {
                    start: {
                        line: 184,
                        column: 24
                    },
                    end: {
                        line: 187,
                        column: 33
                    }
                }, {
                    start: {
                        line: 188,
                        column: 24
                    },
                    end: {
                        line: 195,
                        column: 40
                    }
                }]
            },
            '16': {
                loc: {
                    start: {
                        line: 200,
                        column: 20
                    },
                    end: {
                        line: 209,
                        column: 21
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 200,
                        column: 20
                    },
                    end: {
                        line: 209,
                        column: 21
                    }
                }, {
                    start: {
                        line: 200,
                        column: 20
                    },
                    end: {
                        line: 209,
                        column: 21
                    }
                }]
            },
            '17': {
                loc: {
                    start: {
                        line: 200,
                        column: 24
                    },
                    end: {
                        line: 200,
                        column: 59
                    }
                },
                type: 'binary-expr',
                locations: [{
                    start: {
                        line: 200,
                        column: 24
                    },
                    end: {
                        line: 200,
                        column: 43
                    }
                }, {
                    start: {
                        line: 200,
                        column: 47
                    },
                    end: {
                        line: 200,
                        column: 59
                    }
                }]
            },
            '18': {
                loc: {
                    start: {
                        line: 214,
                        column: 20
                    },
                    end: {
                        line: 236,
                        column: 21
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 214,
                        column: 20
                    },
                    end: {
                        line: 236,
                        column: 21
                    }
                }, {
                    start: {
                        line: 214,
                        column: 20
                    },
                    end: {
                        line: 236,
                        column: 21
                    }
                }]
            },
            '19': {
                loc: {
                    start: {
                        line: 216,
                        column: 24
                    },
                    end: {
                        line: 230,
                        column: 25
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 216,
                        column: 24
                    },
                    end: {
                        line: 230,
                        column: 25
                    }
                }, {
                    start: {
                        line: 216,
                        column: 24
                    },
                    end: {
                        line: 230,
                        column: 25
                    }
                }]
            },
            '20': {
                loc: {
                    start: {
                        line: 219,
                        column: 28
                    },
                    end: {
                        line: 226,
                        column: 29
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 219,
                        column: 28
                    },
                    end: {
                        line: 226,
                        column: 29
                    }
                }, {
                    start: {
                        line: 219,
                        column: 28
                    },
                    end: {
                        line: 226,
                        column: 29
                    }
                }]
            },
            '21': {
                loc: {
                    start: {
                        line: 223,
                        column: 38
                    },
                    end: {
                        line: 223,
                        column: 92
                    }
                },
                type: 'binary-expr',
                locations: [{
                    start: {
                        line: 223,
                        column: 38
                    },
                    end: {
                        line: 223,
                        column: 64
                    }
                }, {
                    start: {
                        line: 223,
                        column: 68
                    },
                    end: {
                        line: 223,
                        column: 92
                    }
                }]
            },
            '22': {
                loc: {
                    start: {
                        line: 227,
                        column: 28
                    },
                    end: {
                        line: 229,
                        column: 29
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 227,
                        column: 28
                    },
                    end: {
                        line: 229,
                        column: 29
                    }
                }, {
                    start: {
                        line: 227,
                        column: 28
                    },
                    end: {
                        line: 229,
                        column: 29
                    }
                }]
            },
            '23': {
                loc: {
                    start: {
                        line: 251,
                        column: 27
                    },
                    end: {
                        line: 251,
                        column: 68
                    }
                },
                type: 'binary-expr',
                locations: [{
                    start: {
                        line: 251,
                        column: 27
                    },
                    end: {
                        line: 251,
                        column: 41
                    }
                }, {
                    start: {
                        line: 251,
                        column: 45
                    },
                    end: {
                        line: 251,
                        column: 68
                    }
                }]
            },
            '24': {
                loc: {
                    start: {
                        line: 263,
                        column: 20
                    },
                    end: {
                        line: 271,
                        column: 21
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 263,
                        column: 20
                    },
                    end: {
                        line: 271,
                        column: 21
                    }
                }, {
                    start: {
                        line: 263,
                        column: 20
                    },
                    end: {
                        line: 271,
                        column: 21
                    }
                }]
            },
            '25': {
                loc: {
                    start: {
                        line: 263,
                        column: 24
                    },
                    end: {
                        line: 266,
                        column: 25
                    }
                },
                type: 'binary-expr',
                locations: [{
                    start: {
                        line: 263,
                        column: 24
                    },
                    end: {
                        line: 263,
                        column: 68
                    }
                }, {
                    start: {
                        line: 264,
                        column: 28
                    },
                    end: {
                        line: 264,
                        column: 53
                    }
                }, {
                    start: {
                        line: 265,
                        column: 28
                    },
                    end: {
                        line: 265,
                        column: 84
                    }
                }]
            },
            '26': {
                loc: {
                    start: {
                        line: 280,
                        column: 8
                    },
                    end: {
                        line: 283,
                        column: 9
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 280,
                        column: 8
                    },
                    end: {
                        line: 283,
                        column: 9
                    }
                }, {
                    start: {
                        line: 280,
                        column: 8
                    },
                    end: {
                        line: 283,
                        column: 9
                    }
                }]
            }
        },
        s: {
            '0': 0,
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0,
            '6': 0,
            '7': 0,
            '8': 0,
            '9': 0,
            '10': 0,
            '11': 0,
            '12': 0,
            '13': 0,
            '14': 0,
            '15': 0,
            '16': 0,
            '17': 0,
            '18': 0,
            '19': 0,
            '20': 0,
            '21': 0,
            '22': 0,
            '23': 0,
            '24': 0,
            '25': 0,
            '26': 0,
            '27': 0,
            '28': 0,
            '29': 0,
            '30': 0,
            '31': 0,
            '32': 0,
            '33': 0,
            '34': 0,
            '35': 0,
            '36': 0,
            '37': 0,
            '38': 0,
            '39': 0,
            '40': 0,
            '41': 0,
            '42': 0,
            '43': 0,
            '44': 0,
            '45': 0,
            '46': 0,
            '47': 0,
            '48': 0,
            '49': 0,
            '50': 0,
            '51': 0,
            '52': 0,
            '53': 0,
            '54': 0,
            '55': 0,
            '56': 0,
            '57': 0,
            '58': 0,
            '59': 0,
            '60': 0,
            '61': 0,
            '62': 0,
            '63': 0,
            '64': 0,
            '65': 0,
            '66': 0,
            '67': 0,
            '68': 0,
            '69': 0,
            '70': 0,
            '71': 0,
            '72': 0,
            '73': 0,
            '74': 0,
            '75': 0,
            '76': 0,
            '77': 0,
            '78': 0,
            '79': 0,
            '80': 0,
            '81': 0,
            '82': 0,
            '83': 0,
            '84': 0,
            '85': 0,
            '86': 0,
            '87': 0,
            '88': 0,
            '89': 0,
            '90': 0,
            '91': 0,
            '92': 0,
            '93': 0,
            '94': 0,
            '95': 0,
            '96': 0,
            '97': 0,
            '98': 0,
            '99': 0,
            '100': 0,
            '101': 0,
            '102': 0,
            '103': 0,
            '104': 0,
            '105': 0,
            '106': 0,
            '107': 0,
            '108': 0,
            '109': 0,
            '110': 0,
            '111': 0,
            '112': 0,
            '113': 0,
            '114': 0,
            '115': 0,
            '116': 0,
            '117': 0,
            '118': 0,
            '119': 0,
            '120': 0,
            '121': 0,
            '122': 0,
            '123': 0,
            '124': 0,
            '125': 0,
            '126': 0,
            '127': 0,
            '128': 0,
            '129': 0,
            '130': 0,
            '131': 0,
            '132': 0,
            '133': 0,
            '134': 0,
            '135': 0,
            '136': 0,
            '137': 0,
            '138': 0,
            '139': 0,
            '140': 0,
            '141': 0,
            '142': 0,
            '143': 0,
            '144': 0,
            '145': 0,
            '146': 0,
            '147': 0,
            '148': 0,
            '149': 0,
            '150': 0,
            '151': 0,
            '152': 0,
            '153': 0,
            '154': 0,
            '155': 0
        },
        f: {
            '0': 0,
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0
        },
        b: {
            '0': [0],
            '1': [0, 0],
            '2': [0, 0],
            '3': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            '4': [0, 0],
            '5': [0, 0],
            '6': [0, 0],
            '7': [0, 0, 0],
            '8': [0, 0],
            '9': [0, 0, 0],
            '10': [0, 0],
            '11': [0, 0],
            '12': [0, 0],
            '13': [0, 0],
            '14': [0, 0, 0],
            '15': [0, 0, 0],
            '16': [0, 0],
            '17': [0, 0],
            '18': [0, 0],
            '19': [0, 0],
            '20': [0, 0],
            '21': [0, 0],
            '22': [0, 0],
            '23': [0, 0],
            '24': [0, 0],
            '25': [0, 0, 0],
            '26': [0, 0]
        },
        _coverageSchema: '332fd63041d2c1bcb487cc26dd0d5f7d97098a6c'
    },
        coverage = global[gcv] || (global[gcv] = {});

    if (coverage[path] && coverage[path].hash === hash) {
        return coverage[path];
    }

    coverageData.hash = hash;
    return coverage[path] = coverageData;
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LATEX_COMMANDS = (++cov_1nxm1be8cv.s[0], [// commands that can can contain richtext.
['\\textbf{', 'strong'], ['\\mkbibbold{', 'strong'], ['\\mkbibitalic{', 'em'], ['\\mkbibemph{', 'em'], ['\\textit{', 'em'], ['\\emph{', 'em'], ['\\textsc{', 'smallcaps'], ['\\enquote{', 'enquote'], ['\\textsubscript{', 'sub'], ['\\textsuperscript{', 'sup']]);

var LATEX_VERBATIM_COMMANDS = (++cov_1nxm1be8cv.s[1], [// commands that can only contain plaintext.
['\\url{', 'url']]);

var LATEX_SPECIAL_CHARS = (++cov_1nxm1be8cv.s[2], {
    '&': '&',
    '%': '%',
    '$': '$',
    '#': '#',
    '_': '_',
    '{': '{',
    '}': '}',
    ',': ',',
    '~': '~',
    '^': '^',
    '\'': '\'',
    ';': '\u2004'
});

var BibLatexLiteralParser = exports.BibLatexLiteralParser = function () {
    function BibLatexLiteralParser(string) {
        var cpMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (++cov_1nxm1be8cv.b[0][0], false);
        (0, _classCallCheck3.default)(this, BibLatexLiteralParser);
        ++cov_1nxm1be8cv.f[0];
        ++cov_1nxm1be8cv.s[3];

        this.string = string;
        ++cov_1nxm1be8cv.s[4];
        this.cpMode = cpMode; // Whether to consider case preservation.
        ++cov_1nxm1be8cv.s[5];
        this.braceLevel = 0;
        ++cov_1nxm1be8cv.s[6];
        this.slen = string.length;
        ++cov_1nxm1be8cv.s[7];
        this.si = 0; // string index
        ++cov_1nxm1be8cv.s[8];
        this.json = [];
        ++cov_1nxm1be8cv.s[9];
        this.braceClosings = [];
        ++cov_1nxm1be8cv.s[10];
        this.currentMarks = [];
        ++cov_1nxm1be8cv.s[11];
        this.inCasePreserve = false;
        ++cov_1nxm1be8cv.s[12];
        this.textNode = false;
    }

    // If the last text node has no content, remove it.


    (0, _createClass3.default)(BibLatexLiteralParser, [{
        key: 'removeIfEmptyTextNode',
        value: function removeIfEmptyTextNode() {
            ++cov_1nxm1be8cv.f[1];
            ++cov_1nxm1be8cv.s[13];

            if (this.textNode.text.length === 0) {
                ++cov_1nxm1be8cv.b[1][0];
                ++cov_1nxm1be8cv.s[14];

                this.json.pop();
            } else {
                ++cov_1nxm1be8cv.b[1][1];
            }
        }
    }, {
        key: 'checkAndAddNewTextNode',
        value: function checkAndAddNewTextNode() {
            ++cov_1nxm1be8cv.f[2];
            ++cov_1nxm1be8cv.s[15];

            if (this.textNode.text.length > 0) {
                ++cov_1nxm1be8cv.b[2][0];
                ++cov_1nxm1be8cv.s[16];

                // We have text in the last node already,
                // so we need to start a new text node.
                this.addNewTextNode();
            } else {
                ++cov_1nxm1be8cv.b[2][1];
            }
        }
    }, {
        key: 'addNewTextNode',
        value: function addNewTextNode() {
            ++cov_1nxm1be8cv.f[3];
            ++cov_1nxm1be8cv.s[17];

            this.textNode = { type: 'text', text: '' };
            ++cov_1nxm1be8cv.s[18];
            this.json.push(this.textNode);
        }
    }, {
        key: 'stringParser',
        value: function stringParser() {
            ++cov_1nxm1be8cv.f[4];
            ++cov_1nxm1be8cv.s[19];

            this.addNewTextNode();

            ++cov_1nxm1be8cv.s[20];
            ++cov_1nxm1be8cv.s[21];
            parseString: while (this.si < this.slen) {
                ++cov_1nxm1be8cv.s[22];

                switch (this.string[this.si]) {
                    case '\\':
                        ++cov_1nxm1be8cv.b[3][0];
                        ++cov_1nxm1be8cv.s[23];
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = (0, _getIterator3.default)(LATEX_COMMANDS), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var command = _step.value;
                                ++cov_1nxm1be8cv.s[24];

                                if (this.string.substring(this.si, this.si + command[0].length) === command[0]) {
                                    ++cov_1nxm1be8cv.b[4][0];
                                    ++cov_1nxm1be8cv.s[25];

                                    this.braceLevel++;
                                    ++cov_1nxm1be8cv.s[26];
                                    this.si += command[0].length;
                                    ++cov_1nxm1be8cv.s[27];
                                    this.checkAndAddNewTextNode();
                                    ++cov_1nxm1be8cv.s[28];
                                    if (this.cpMode) {
                                        ++cov_1nxm1be8cv.b[5][0];
                                        ++cov_1nxm1be8cv.s[29];

                                        // If immediately inside a brace that added case protection, remove case protection. See
                                        // http://tex.stackexchange.com/questions/276943/biblatex-how-to-emphasize-but-not-caps-protect
                                        if ((++cov_1nxm1be8cv.b[7][0], this.inCasePreserve === this.braceLevel - 1) && (++cov_1nxm1be8cv.b[7][1], this.string[this.si - 1] === '{') && (++cov_1nxm1be8cv.b[7][2], this.currentMarks[this.currentMarks.length - 1].type === 'nocase')) {
                                            ++cov_1nxm1be8cv.b[6][0];
                                            ++cov_1nxm1be8cv.s[30];

                                            this.currentMarks.pop();
                                            ++cov_1nxm1be8cv.s[31];
                                            this.inCasePreserve = false;
                                        } else {
                                            ++cov_1nxm1be8cv.b[6][1];
                                            ++cov_1nxm1be8cv.s[32];

                                            // Of not immediately inside a brace, any styling also
                                            // adds case protection.
                                            this.currentMarks.push({ type: 'nocase' });
                                            ++cov_1nxm1be8cv.s[33];
                                            this.inCasePreserve = this.braceLevel;
                                        }
                                    } else {
                                        ++cov_1nxm1be8cv.b[5][1];
                                    }
                                    ++cov_1nxm1be8cv.s[34];
                                    this.currentMarks.push({ type: command[1] });
                                    ++cov_1nxm1be8cv.s[35];
                                    this.textNode.marks = this.currentMarks.slice();
                                    ++cov_1nxm1be8cv.s[36];
                                    this.braceClosings.push(true);
                                    ++cov_1nxm1be8cv.s[37];
                                    continue parseString;
                                } else {
                                    ++cov_1nxm1be8cv.b[4][1];
                                }
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }

                        ++cov_1nxm1be8cv.s[38];
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = (0, _getIterator3.default)(LATEX_VERBATIM_COMMANDS), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var _command = _step2.value;
                                ++cov_1nxm1be8cv.s[39];

                                if (this.string.substring(this.si, this.si + _command[0].length) === _command[0]) {
                                    ++cov_1nxm1be8cv.b[8][0];
                                    ++cov_1nxm1be8cv.s[40];

                                    this.checkAndAddNewTextNode();
                                    ++cov_1nxm1be8cv.s[41];
                                    this.textNode.marks = this.currentMarks.slice();
                                    ++cov_1nxm1be8cv.s[42];
                                    this.textNode.marks.push({ type: _command[1] });
                                    ++cov_1nxm1be8cv.s[43];
                                    this.si += _command[0].length;
                                    var _sj = (++cov_1nxm1be8cv.s[44], this.si);
                                    var internalBraceLevel = (++cov_1nxm1be8cv.s[45], 0);
                                    ++cov_1nxm1be8cv.s[46];
                                    while ((++cov_1nxm1be8cv.b[9][0], _sj < this.slen) && ((++cov_1nxm1be8cv.b[9][1], this.string[_sj] !== '}') || (++cov_1nxm1be8cv.b[9][2], internalBraceLevel > 0))) {
                                        ++cov_1nxm1be8cv.s[47];

                                        switch (this.string[_sj]) {
                                            case '{':
                                                ++cov_1nxm1be8cv.b[10][0];
                                                ++cov_1nxm1be8cv.s[48];

                                                internalBraceLevel++;
                                                ++cov_1nxm1be8cv.s[49];
                                                break;
                                            case '}':
                                                ++cov_1nxm1be8cv.b[10][1];
                                                ++cov_1nxm1be8cv.s[50];

                                                internalBraceLevel--;
                                                ++cov_1nxm1be8cv.s[51];
                                                break;
                                        }
                                        ++cov_1nxm1be8cv.s[52];
                                        _sj++;
                                    }
                                    ++cov_1nxm1be8cv.s[53];
                                    this.textNode.text = this.string.substring(this.si, _sj);
                                    ++cov_1nxm1be8cv.s[54];
                                    this.addNewTextNode();
                                    ++cov_1nxm1be8cv.s[55];
                                    this.si = _sj + 1;
                                    ++cov_1nxm1be8cv.s[56];
                                    continue parseString;
                                } else {
                                    ++cov_1nxm1be8cv.b[8][1];
                                }
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }

                        ++cov_1nxm1be8cv.s[57];
                        if (LATEX_SPECIAL_CHARS[this.string[this.si + 1]]) {
                            ++cov_1nxm1be8cv.b[11][0];
                            ++cov_1nxm1be8cv.s[58];

                            this.textNode.text += LATEX_SPECIAL_CHARS[this.string[this.si + 1]];
                            ++cov_1nxm1be8cv.s[59];
                            this.si += 2;
                        } else {
                            ++cov_1nxm1be8cv.b[11][1];
                            ++cov_1nxm1be8cv.s[60];

                            // We don't know the command and skip it.
                            this.si++;
                            ++cov_1nxm1be8cv.s[61];
                            while ((++cov_1nxm1be8cv.b[12][0], this.si < this.slen) && (++cov_1nxm1be8cv.b[12][1], this.string[this.si].match("[a-zA-Z0-9]"))) {
                                ++cov_1nxm1be8cv.s[62];

                                this.si++;
                            }
                            // If there is a brace at the end of the command,
                            // increase brace level but ignore brace.
                            ++cov_1nxm1be8cv.s[63];
                            if (this.string[this.si] === "{") {
                                ++cov_1nxm1be8cv.b[13][0];
                                ++cov_1nxm1be8cv.s[64];

                                this.braceLevel++;
                                ++cov_1nxm1be8cv.s[65];
                                this.braceClosings.push(false);
                                ++cov_1nxm1be8cv.s[66];
                                this.si++;
                            } else {
                                ++cov_1nxm1be8cv.b[13][1];
                            }
                        }
                        ++cov_1nxm1be8cv.s[67];
                        break;
                    case '_':
                        ++cov_1nxm1be8cv.b[3][1];
                        ++cov_1nxm1be8cv.s[68];

                        switch (this.string[this.si + 1]) {
                            case '{':
                                ++cov_1nxm1be8cv.b[14][0];
                                ++cov_1nxm1be8cv.s[69];

                                this.checkAndAddNewTextNode();
                                ++cov_1nxm1be8cv.s[70];
                                this.braceLevel++;
                                ++cov_1nxm1be8cv.s[71];
                                this.si += 2;
                                ++cov_1nxm1be8cv.s[72];
                                this.currentMarks.push({ type: 'sub' });
                                ++cov_1nxm1be8cv.s[73];
                                this.textNode.marks = this.currentMarks.slice();
                                ++cov_1nxm1be8cv.s[74];
                                this.braceClosings.push(true);
                                ++cov_1nxm1be8cv.s[75];
                                break;
                            case '\\':
                                ++cov_1nxm1be8cv.b[14][1];
                                ++cov_1nxm1be8cv.s[76];

                                // There is a command following directly. Ignore the sub symbol.
                                this.si++;
                                ++cov_1nxm1be8cv.s[77];
                                break;
                            default:
                                ++cov_1nxm1be8cv.b[14][2];
                                ++cov_1nxm1be8cv.s[78];

                                // We only add the next character to a sub node.
                                this.checkAndAddNewTextNode();
                                ++cov_1nxm1be8cv.s[79];
                                this.textNode.marks = this.currentMarks.slice();
                                ++cov_1nxm1be8cv.s[80];
                                this.textNode.marks.push({ type: 'sub' });
                                ++cov_1nxm1be8cv.s[81];
                                this.textNode.text = this.string[this.si + 1];
                                ++cov_1nxm1be8cv.s[82];
                                this.addNewTextNode();
                                ++cov_1nxm1be8cv.s[83];
                                this.si += 2;
                        }
                        ++cov_1nxm1be8cv.s[84];
                        break;
                    case '^':
                        ++cov_1nxm1be8cv.b[3][2];
                        ++cov_1nxm1be8cv.s[85];

                        switch (this.string[this.si + 1]) {
                            case '{':
                                ++cov_1nxm1be8cv.b[15][0];
                                ++cov_1nxm1be8cv.s[86];

                                this.checkAndAddNewTextNode();
                                ++cov_1nxm1be8cv.s[87];
                                this.braceLevel++;
                                ++cov_1nxm1be8cv.s[88];
                                this.si += 2;
                                ++cov_1nxm1be8cv.s[89];
                                this.currentMarks.push({ type: 'sup' });
                                ++cov_1nxm1be8cv.s[90];
                                this.textNode.marks = this.currentMarks.slice();
                                ++cov_1nxm1be8cv.s[91];
                                this.braceClosings.push(true);
                                ++cov_1nxm1be8cv.s[92];
                                break;
                            case '\\':
                                ++cov_1nxm1be8cv.b[15][1];
                                ++cov_1nxm1be8cv.s[93];

                                // There is a command following directly. Ignore the sup symbol.
                                this.si++;
                                ++cov_1nxm1be8cv.s[94];
                                break;
                            default:
                                ++cov_1nxm1be8cv.b[15][2];
                                ++cov_1nxm1be8cv.s[95];

                                // We only add the next character to a sup node.
                                this.checkAndAddNewTextNode();
                                ++cov_1nxm1be8cv.s[96];
                                this.textNode.marks = this.currentMarks.slice();
                                ++cov_1nxm1be8cv.s[97];
                                this.textNode.marks.push({ type: 'sup' });
                                ++cov_1nxm1be8cv.s[98];
                                this.textNode.text = this.string[this.si + 1];
                                ++cov_1nxm1be8cv.s[99];
                                this.addNewTextNode();
                                ++cov_1nxm1be8cv.s[100];
                                this.si += 2;
                        }
                        ++cov_1nxm1be8cv.s[101];
                        break;
                    case '{':
                        ++cov_1nxm1be8cv.b[3][3];
                        ++cov_1nxm1be8cv.s[102];

                        this.braceLevel++;
                        ++cov_1nxm1be8cv.s[103];
                        if ((++cov_1nxm1be8cv.b[17][0], this.inCasePreserve) || (++cov_1nxm1be8cv.b[17][1], !this.cpMode)) {
                            ++cov_1nxm1be8cv.b[16][0];
                            ++cov_1nxm1be8cv.s[104];

                            // If already inside case preservation, do not add a second
                            this.braceClosings.push(false);
                        } else {
                            ++cov_1nxm1be8cv.b[16][1];
                            ++cov_1nxm1be8cv.s[105];

                            this.inCasePreserve = this.braceLevel;
                            ++cov_1nxm1be8cv.s[106];
                            this.checkAndAddNewTextNode();
                            ++cov_1nxm1be8cv.s[107];
                            this.currentMarks.push({ type: 'nocase' });
                            ++cov_1nxm1be8cv.s[108];
                            this.textNode.marks = this.currentMarks.slice();
                            ++cov_1nxm1be8cv.s[109];
                            this.braceClosings.push(true);
                        }
                        ++cov_1nxm1be8cv.s[110];
                        this.si++;
                        ++cov_1nxm1be8cv.s[111];
                        break;
                    case '}':
                        ++cov_1nxm1be8cv.b[3][4];
                        ++cov_1nxm1be8cv.s[112];

                        this.braceLevel--;
                        ++cov_1nxm1be8cv.s[113];
                        if (this.braceLevel > -1) {
                            ++cov_1nxm1be8cv.b[18][0];

                            var closeBrace = (++cov_1nxm1be8cv.s[114], this.braceClosings.pop());
                            ++cov_1nxm1be8cv.s[115];
                            if (closeBrace) {
                                ++cov_1nxm1be8cv.b[19][0];
                                ++cov_1nxm1be8cv.s[116];

                                this.checkAndAddNewTextNode();
                                var lastMark = (++cov_1nxm1be8cv.s[117], this.currentMarks.pop());
                                ++cov_1nxm1be8cv.s[118];
                                if (this.inCasePreserve === this.braceLevel + 1) {
                                    ++cov_1nxm1be8cv.b[20][0];
                                    ++cov_1nxm1be8cv.s[119];

                                    this.inCasePreserve = false;
                                    // The last tag may have added more tags. The
                                    // lowest level will be the case preserving one.
                                    ++cov_1nxm1be8cv.s[120];
                                    while ((++cov_1nxm1be8cv.b[21][0], lastMark.type !== 'nocase') && (++cov_1nxm1be8cv.b[21][1], this.currentMarks.length)) {
                                        ++cov_1nxm1be8cv.s[121];

                                        lastMark = this.currentMarks.pop();
                                    }
                                } else {
                                    ++cov_1nxm1be8cv.b[20][1];
                                }
                                ++cov_1nxm1be8cv.s[122];
                                if (this.currentMarks.length) {
                                    ++cov_1nxm1be8cv.b[22][0];
                                    ++cov_1nxm1be8cv.s[123];

                                    this.textNode.marks = this.currentMarks.slice();
                                } else {
                                    ++cov_1nxm1be8cv.b[22][1];
                                }
                            } else {
                                ++cov_1nxm1be8cv.b[19][1];
                            }
                            ++cov_1nxm1be8cv.s[124];
                            this.si++;
                            ++cov_1nxm1be8cv.s[125];
                            continue parseString;
                        } else {
                            ++cov_1nxm1be8cv.b[18][1];
                            ++cov_1nxm1be8cv.s[126];

                            // A brace was closed before it was opened. Abort and return the original string.
                            return [{ type: 'text', text: this.string }];
                        }
                        ++cov_1nxm1be8cv.s[127];
                        break;
                    case '$':
                        ++cov_1nxm1be8cv.b[3][5];
                        ++cov_1nxm1be8cv.s[128];

                        // math env, just remove
                        this.si++;
                        ++cov_1nxm1be8cv.s[129];
                        break;
                    case '~':
                        ++cov_1nxm1be8cv.b[3][6];
                        ++cov_1nxm1be8cv.s[130];

                        // a non-breakable space
                        this.textNode.text += '\xA0';
                        ++cov_1nxm1be8cv.s[131];
                        this.si++;
                        ++cov_1nxm1be8cv.s[132];
                        break;
                    case '%':
                        ++cov_1nxm1be8cv.b[3][7];
                        ++cov_1nxm1be8cv.s[133];

                        // An undefined variable.
                        this.removeIfEmptyTextNode();
                        var sj = (++cov_1nxm1be8cv.s[134], this.si + 1);
                        ++cov_1nxm1be8cv.s[135];
                        while ((++cov_1nxm1be8cv.b[23][0], sj < this.slen) && (++cov_1nxm1be8cv.b[23][1], this.string[sj] !== '%')) {
                            ++cov_1nxm1be8cv.s[136];

                            sj++;
                        }
                        var variable = (++cov_1nxm1be8cv.s[137], this.string.substring(this.si + 1, sj));
                        ++cov_1nxm1be8cv.s[138];
                        this.json.push({ type: 'variable', attrs: { variable: variable } });
                        ++cov_1nxm1be8cv.s[139];
                        this.addNewTextNode();
                        ++cov_1nxm1be8cv.s[140];
                        this.si = sj + 1;
                        ++cov_1nxm1be8cv.s[141];
                        break;
                    case '\r':
                        ++cov_1nxm1be8cv.b[3][8];
                        ++cov_1nxm1be8cv.s[142];

                        this.si++;
                        ++cov_1nxm1be8cv.s[143];
                        break;
                    case '\n':
                        ++cov_1nxm1be8cv.b[3][9];
                        ++cov_1nxm1be8cv.s[144];

                        if ((++cov_1nxm1be8cv.b[25][0], ['\r', '\n'].includes(this.string[this.si + 1])) || (++cov_1nxm1be8cv.b[25][1], this.textNode.text.length) && (++cov_1nxm1be8cv.b[25][2], this.textNode.text[this.textNode.text.length - 1] === '\n')) {
                            ++cov_1nxm1be8cv.b[24][0];
                            ++cov_1nxm1be8cv.s[145];

                            this.textNode.text += '\n';
                        } else {
                            ++cov_1nxm1be8cv.b[24][1];
                            ++cov_1nxm1be8cv.s[146];

                            this.textNode.text += ' ';
                        }
                        ++cov_1nxm1be8cv.s[147];
                        this.si++;
                        ++cov_1nxm1be8cv.s[148];
                        break;
                    default:
                        ++cov_1nxm1be8cv.b[3][10];
                        ++cov_1nxm1be8cv.s[149];

                        this.textNode.text += this.string[this.si];
                        ++cov_1nxm1be8cv.s[150];
                        this.si++;
                }
            }

            ++cov_1nxm1be8cv.s[151];
            if (this.braceLevel > 0) {
                ++cov_1nxm1be8cv.b[26][0];
                ++cov_1nxm1be8cv.s[152];

                // Too many opening braces, we return the original string.
                return [{ type: 'text', text: this.string }];
            } else {
                ++cov_1nxm1be8cv.b[26][1];
            }

            ++cov_1nxm1be8cv.s[153];
            this.removeIfEmptyTextNode();

            // Braces were accurate.
            ++cov_1nxm1be8cv.s[154];
            return this.json;
        }
    }, {
        key: 'output',
        get: function get() {
            ++cov_1nxm1be8cv.f[5];
            ++cov_1nxm1be8cv.s[155];

            return this.stringParser();
        }
    }]);
    return BibLatexLiteralParser;
}();

},{"babel-runtime/core-js/get-iterator":7,"babel-runtime/helpers/classCallCheck":15,"babel-runtime/helpers/createClass":16}],132:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BibLatexNameParser = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var cov_wwcio7ipy = function () {
    var path = '/home/travis/build/fiduswriter/biblatex-csl-converter/src/import/name-parser.js',
        hash = '96a62f62b4bb7b4194863423314656917f8aff55',
        global = new Function('return this')(),
        gcv = '__coverage__',
        coverageData = {
        path: '/home/travis/build/fiduswriter/biblatex-csl-converter/src/import/name-parser.js',
        statementMap: {
            '0': {
                start: {
                    line: 6,
                    column: 8
                },
                end: {
                    line: 6,
                    column: 36
                }
            },
            '1': {
                start: {
                    line: 7,
                    column: 8
                },
                end: {
                    line: 7,
                    column: 26
                }
            },
            '2': {
                start: {
                    line: 8,
                    column: 8
                },
                end: {
                    line: 8,
                    column: 27
                }
            },
            '3': {
                start: {
                    line: 9,
                    column: 8
                },
                end: {
                    line: 9,
                    column: 25
                }
            },
            '4': {
                start: {
                    line: 13,
                    column: 20
                },
                end: {
                    line: 13,
                    column: 61
                }
            },
            '5': {
                start: {
                    line: 14,
                    column: 8
                },
                end: {
                    line: 44,
                    column: 9
                }
            },
            '6': {
                start: {
                    line: 16,
                    column: 12
                },
                end: {
                    line: 16,
                    column: 41
                }
            },
            '7': {
                start: {
                    line: 17,
                    column: 15
                },
                end: {
                    line: 44,
                    column: 9
                }
            },
            '8': {
                start: {
                    line: 18,
                    column: 12
                },
                end: {
                    line: 21,
                    column: 13
                }
            },
            '9': {
                start: {
                    line: 22,
                    column: 12
                },
                end: {
                    line: 22,
                    column: 66
                }
            },
            '10': {
                start: {
                    line: 23,
                    column: 15
                },
                end: {
                    line: 44,
                    column: 9
                }
            },
            '11': {
                start: {
                    line: 24,
                    column: 12
                },
                end: {
                    line: 24,
                    column: 62
                }
            },
            '12': {
                start: {
                    line: 25,
                    column: 12
                },
                end: {
                    line: 25,
                    column: 66
                }
            },
            '13': {
                start: {
                    line: 26,
                    column: 15
                },
                end: {
                    line: 44,
                    column: 9
                }
            },
            '14': {
                start: {
                    line: 27,
                    column: 30
                },
                end: {
                    line: 27,
                    column: 66
                }
            },
            '15': {
                start: {
                    line: 28,
                    column: 12
                },
                end: {
                    line: 40,
                    column: 13
                }
            },
            '16': {
                start: {
                    line: 29,
                    column: 16
                },
                end: {
                    line: 29,
                    column: 85
                }
            },
            '17': {
                start: {
                    line: 31,
                    column: 28
                },
                end: {
                    line: 31,
                    column: 53
                }
            },
            '18': {
                start: {
                    line: 32,
                    column: 34
                },
                end: {
                    line: 32,
                    column: 42
                }
            },
            '19': {
                start: {
                    line: 33,
                    column: 30
                },
                end: {
                    line: 33,
                    column: 38
                }
            },
            '20': {
                start: {
                    line: 34,
                    column: 16
                },
                end: {
                    line: 37,
                    column: 17
                }
            },
            '21': {
                start: {
                    line: 35,
                    column: 31
                },
                end: {
                    line: 35,
                    column: 48
                }
            },
            '22': {
                start: {
                    line: 36,
                    column: 20
                },
                end: {
                    line: 36,
                    column: 38
                }
            },
            '23': {
                start: {
                    line: 38,
                    column: 16
                },
                end: {
                    line: 38,
                    column: 52
                }
            },
            '24': {
                start: {
                    line: 39,
                    column: 16
                },
                end: {
                    line: 39,
                    column: 44
                }
            },
            '25': {
                start: {
                    line: 43,
                    column: 12
                },
                end: {
                    line: 43,
                    column: 82
                }
            },
            '26': {
                start: {
                    line: 48,
                    column: 19
                },
                end: {
                    line: 48,
                    column: 23
                }
            },
            '27': {
                start: {
                    line: 49,
                    column: 8
                },
                end: {
                    line: 61,
                    column: 10
                }
            },
            '28': {
                start: {
                    line: 50,
                    column: 28
                },
                end: {
                    line: 50,
                    column: 73
                }
            },
            '29': {
                start: {
                    line: 51,
                    column: 27
                },
                end: {
                    line: 51,
                    column: 65
                }
            },
            '30': {
                start: {
                    line: 52,
                    column: 12
                },
                end: {
                    line: 60,
                    column: 13
                }
            },
            '31': {
                start: {
                    line: 53,
                    column: 16
                },
                end: {
                    line: 53,
                    column: 89
                }
            },
            '32': {
                start: {
                    line: 54,
                    column: 19
                },
                end: {
                    line: 60,
                    column: 13
                }
            },
            '33': {
                start: {
                    line: 55,
                    column: 16
                },
                end: {
                    line: 59,
                    column: 17
                }
            },
            '34': {
                start: {
                    line: 56,
                    column: 20
                },
                end: {
                    line: 56,
                    column: 53
                }
            },
            '35': {
                start: {
                    line: 58,
                    column: 20
                },
                end: {
                    line: 58,
                    column: 54
                }
            },
            '36': {
                start: {
                    line: 65,
                    column: 8
                },
                end: {
                    line: 65,
                    column: 24
                }
            },
            '37': {
                start: {
                    line: 66,
                    column: 8
                },
                end: {
                    line: 66,
                    column: 28
                }
            },
            '38': {
                start: {
                    line: 70,
                    column: 25
                },
                end: {
                    line: 70,
                    column: 26
                }
            },
            '39': {
                start: {
                    line: 71,
                    column: 23
                },
                end: {
                    line: 71,
                    column: 28
                }
            },
            '40': {
                start: {
                    line: 72,
                    column: 24
                },
                end: {
                    line: 72,
                    column: 25
                }
            },
            '41': {
                start: {
                    line: 73,
                    column: 21
                },
                end: {
                    line: 73,
                    column: 23
                }
            },
            '42': {
                start: {
                    line: 74,
                    column: 24
                },
                end: {
                    line: 74,
                    column: 37
                }
            },
            '43': {
                start: {
                    line: 75,
                    column: 18
                },
                end: {
                    line: 75,
                    column: 19
                }
            },
            '44': {
                start: {
                    line: 76,
                    column: 8
                },
                end: {
                    line: 106,
                    column: 9
                }
            },
            '45': {
                start: {
                    line: 77,
                    column: 23
                },
                end: {
                    line: 77,
                    column: 41
                }
            },
            '46': {
                start: {
                    line: 78,
                    column: 12
                },
                end: {
                    line: 103,
                    column: 13
                }
            },
            '47': {
                start: {
                    line: 80,
                    column: 20
                },
                end: {
                    line: 80,
                    column: 35
                }
            },
            '48': {
                start: {
                    line: 81,
                    column: 20
                },
                end: {
                    line: 81,
                    column: 25
                }
            },
            '49': {
                start: {
                    line: 83,
                    column: 20
                },
                end: {
                    line: 83,
                    column: 35
                }
            },
            '50': {
                start: {
                    line: 84,
                    column: 20
                },
                end: {
                    line: 84,
                    column: 25
                }
            },
            '51': {
                start: {
                    line: 86,
                    column: 20
                },
                end: {
                    line: 86,
                    column: 40
                }
            },
            '52': {
                start: {
                    line: 87,
                    column: 20
                },
                end: {
                    line: 87,
                    column: 25
                }
            },
            '53': {
                start: {
                    line: 90,
                    column: 20
                },
                end: {
                    line: 90,
                    column: 25
                }
            },
            '54': {
                start: {
                    line: 91,
                    column: 20
                },
                end: {
                    line: 91,
                    column: 25
                }
            },
            '55': {
                start: {
                    line: 93,
                    column: 20
                },
                end: {
                    line: 102,
                    column: 21
                }
            },
            '56': {
                start: {
                    line: 94,
                    column: 36
                },
                end: {
                    line: 94,
                    column: 78
                }
            },
            '57': {
                start: {
                    line: 95,
                    column: 24
                },
                end: {
                    line: 101,
                    column: 25
                }
            },
            '58': {
                start: {
                    line: 96,
                    column: 41
                },
                end: {
                    line: 96,
                    column: 56
                }
            },
            '59': {
                start: {
                    line: 97,
                    column: 28
                },
                end: {
                    line: 100,
                    column: 29
                }
            },
            '60': {
                start: {
                    line: 98,
                    column: 32
                },
                end: {
                    line: 98,
                    column: 73
                }
            },
            '61': {
                start: {
                    line: 99,
                    column: 32
                },
                end: {
                    line: 99,
                    column: 56
                }
            },
            '62': {
                start: {
                    line: 105,
                    column: 12
                },
                end: {
                    line: 105,
                    column: 17
                }
            },
            '63': {
                start: {
                    line: 107,
                    column: 8
                },
                end: {
                    line: 109,
                    column: 9
                }
            },
            '64': {
                start: {
                    line: 108,
                    column: 12
                },
                end: {
                    line: 108,
                    column: 48
                }
            },
            '65': {
                start: {
                    line: 110,
                    column: 8
                },
                end: {
                    line: 110,
                    column: 21
                }
            },
            '66': {
                start: {
                    line: 114,
                    column: 8
                },
                end: {
                    line: 114,
                    column: 76
                }
            },
            '67': {
                start: {
                    line: 118,
                    column: 21
                },
                end: {
                    line: 118,
                    column: 41
                }
            },
            '68': {
                start: {
                    line: 119,
                    column: 18
                },
                end: {
                    line: 119,
                    column: 27
                }
            },
            '69': {
                start: {
                    line: 120,
                    column: 19
                },
                end: {
                    line: 120,
                    column: 28
                }
            },
            '70': {
                start: {
                    line: 121,
                    column: 8
                },
                end: {
                    line: 123,
                    column: 9
                }
            },
            '71': {
                start: {
                    line: 122,
                    column: 12
                },
                end: {
                    line: 122,
                    column: 32
                }
            },
            '72': {
                start: {
                    line: 124,
                    column: 8
                },
                end: {
                    line: 127,
                    column: 9
                }
            },
            '73': {
                start: {
                    line: 125,
                    column: 12
                },
                end: {
                    line: 125,
                    column: 79
                }
            },
            '74': {
                start: {
                    line: 126,
                    column: 12
                },
                end: {
                    line: 126,
                    column: 45
                }
            },
            '75': {
                start: {
                    line: 128,
                    column: 8
                },
                end: {
                    line: 130,
                    column: 9
                }
            },
            '76': {
                start: {
                    line: 129,
                    column: 12
                },
                end: {
                    line: 129,
                    column: 83
                }
            },
            '77': {
                start: {
                    line: 131,
                    column: 8
                },
                end: {
                    line: 131,
                    column: 76
                }
            },
            '78': {
                start: {
                    line: 136,
                    column: 8
                },
                end: {
                    line: 141,
                    column: 9
                }
            },
            '79': {
                start: {
                    line: 137,
                    column: 23
                },
                end: {
                    line: 137,
                    column: 29
                }
            },
            '80': {
                start: {
                    line: 138,
                    column: 12
                },
                end: {
                    line: 140,
                    column: 13
                }
            },
            '81': {
                start: {
                    line: 139,
                    column: 16
                },
                end: {
                    line: 139,
                    column: 24
                }
            },
            '82': {
                start: {
                    line: 142,
                    column: 8
                },
                end: {
                    line: 142,
                    column: 25
                }
            },
            '83': {
                start: {
                    line: 148,
                    column: 18
                },
                end: {
                    line: 148,
                    column: 50
                }
            },
            '84': {
                start: {
                    line: 149,
                    column: 8
                },
                end: {
                    line: 149,
                    column: 50
                }
            },
            '85': {
                start: {
                    line: 153,
                    column: 19
                },
                end: {
                    line: 153,
                    column: 69
                }
            },
            '86': {
                start: {
                    line: 154,
                    column: 18
                },
                end: {
                    line: 154,
                    column: 35
                }
            },
            '87': {
                start: {
                    line: 155,
                    column: 8
                },
                end: {
                    line: 155,
                    column: 50
                }
            },
            '88': {
                start: {
                    line: 159,
                    column: 21
                },
                end: {
                    line: 159,
                    column: 57
                }
            },
            '89': {
                start: {
                    line: 160,
                    column: 8
                },
                end: {
                    line: 160,
                    column: 28
                }
            }
        },
        fnMap: {
            '0': {
                name: '(anonymous_0)',
                decl: {
                    start: {
                        line: 5,
                        column: 4
                    },
                    end: {
                        line: 5,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 5,
                        column: 28
                    },
                    end: {
                        line: 10,
                        column: 5
                    }
                }
            },
            '1': {
                name: '(anonymous_1)',
                decl: {
                    start: {
                        line: 12,
                        column: 4
                    },
                    end: {
                        line: 12,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 12,
                        column: 16
                    },
                    end: {
                        line: 45,
                        column: 5
                    }
                }
            },
            '2': {
                name: '(anonymous_2)',
                decl: {
                    start: {
                        line: 47,
                        column: 4
                    },
                    end: {
                        line: 47,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 47,
                        column: 29
                    },
                    end: {
                        line: 62,
                        column: 5
                    }
                }
            },
            '3': {
                name: '(anonymous_3)',
                decl: {
                    start: {
                        line: 49,
                        column: 22
                    },
                    end: {
                        line: 49,
                        column: 23
                    }
                },
                loc: {
                    start: {
                        line: 49,
                        column: 30
                    },
                    end: {
                        line: 61,
                        column: 9
                    }
                }
            },
            '4': {
                name: '(anonymous_4)',
                decl: {
                    start: {
                        line: 64,
                        column: 4
                    },
                    end: {
                        line: 64,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 64,
                        column: 17
                    },
                    end: {
                        line: 67,
                        column: 5
                    }
                }
            },
            '5': {
                name: '(anonymous_5)',
                decl: {
                    start: {
                        line: 69,
                        column: 4
                    },
                    end: {
                        line: 69,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 69,
                        column: 42
                    },
                    end: {
                        line: 111,
                        column: 5
                    }
                }
            },
            '6': {
                name: '(anonymous_6)',
                decl: {
                    start: {
                        line: 113,
                        column: 4
                    },
                    end: {
                        line: 113,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 113,
                        column: 30
                    },
                    end: {
                        line: 115,
                        column: 5
                    }
                }
            },
            '7': {
                name: '(anonymous_7)',
                decl: {
                    start: {
                        line: 117,
                        column: 4
                    },
                    end: {
                        line: 117,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 117,
                        column: 38
                    },
                    end: {
                        line: 132,
                        column: 5
                    }
                }
            },
            '8': {
                name: '(anonymous_8)',
                decl: {
                    start: {
                        line: 134,
                        column: 4
                    },
                    end: {
                        line: 134,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 134,
                        column: 32
                    },
                    end: {
                        line: 143,
                        column: 5
                    }
                }
            },
            '9': {
                name: '(anonymous_9)',
                decl: {
                    start: {
                        line: 145,
                        column: 4
                    },
                    end: {
                        line: 145,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 145,
                        column: 17
                    },
                    end: {
                        line: 150,
                        column: 5
                    }
                }
            },
            '10': {
                name: '(anonymous_10)',
                decl: {
                    start: {
                        line: 152,
                        column: 4
                    },
                    end: {
                        line: 152,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 152,
                        column: 18
                    },
                    end: {
                        line: 156,
                        column: 5
                    }
                }
            },
            '11': {
                name: '(anonymous_11)',
                decl: {
                    start: {
                        line: 158,
                        column: 4
                    },
                    end: {
                        line: 158,
                        column: 5
                    }
                },
                loc: {
                    start: {
                        line: 158,
                        column: 30
                    },
                    end: {
                        line: 161,
                        column: 5
                    }
                }
            }
        },
        branchMap: {
            '0': {
                loc: {
                    start: {
                        line: 14,
                        column: 8
                    },
                    end: {
                        line: 44,
                        column: 9
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 14,
                        column: 8
                    },
                    end: {
                        line: 44,
                        column: 9
                    }
                }, {
                    start: {
                        line: 14,
                        column: 8
                    },
                    end: {
                        line: 44,
                        column: 9
                    }
                }]
            },
            '1': {
                loc: {
                    start: {
                        line: 14,
                        column: 12
                    },
                    end: {
                        line: 14,
                        column: 61
                    }
                },
                type: 'binary-expr',
                locations: [{
                    start: {
                        line: 14,
                        column: 12
                    },
                    end: {
                        line: 14,
                        column: 28
                    }
                }, {
                    start: {
                        line: 14,
                        column: 32
                    },
                    end: {
                        line: 14,
                        column: 61
                    }
                }]
            },
            '2': {
                loc: {
                    start: {
                        line: 17,
                        column: 15
                    },
                    end: {
                        line: 44,
                        column: 9
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 17,
                        column: 15
                    },
                    end: {
                        line: 44,
                        column: 9
                    }
                }, {
                    start: {
                        line: 17,
                        column: 15
                    },
                    end: {
                        line: 44,
                        column: 9
                    }
                }]
            },
            '3': {
                loc: {
                    start: {
                        line: 23,
                        column: 15
                    },
                    end: {
                        line: 44,
                        column: 9
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 23,
                        column: 15
                    },
                    end: {
                        line: 44,
                        column: 9
                    }
                }, {
                    start: {
                        line: 23,
                        column: 15
                    },
                    end: {
                        line: 44,
                        column: 9
                    }
                }]
            },
            '4': {
                loc: {
                    start: {
                        line: 26,
                        column: 15
                    },
                    end: {
                        line: 44,
                        column: 9
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 26,
                        column: 15
                    },
                    end: {
                        line: 44,
                        column: 9
                    }
                }, {
                    start: {
                        line: 26,
                        column: 15
                    },
                    end: {
                        line: 44,
                        column: 9
                    }
                }]
            },
            '5': {
                loc: {
                    start: {
                        line: 28,
                        column: 12
                    },
                    end: {
                        line: 40,
                        column: 13
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 28,
                        column: 12
                    },
                    end: {
                        line: 40,
                        column: 13
                    }
                }, {
                    start: {
                        line: 28,
                        column: 12
                    },
                    end: {
                        line: 40,
                        column: 13
                    }
                }]
            },
            '6': {
                loc: {
                    start: {
                        line: 34,
                        column: 16
                    },
                    end: {
                        line: 37,
                        column: 17
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 34,
                        column: 16
                    },
                    end: {
                        line: 37,
                        column: 17
                    }
                }, {
                    start: {
                        line: 34,
                        column: 16
                    },
                    end: {
                        line: 37,
                        column: 17
                    }
                }]
            },
            '7': {
                loc: {
                    start: {
                        line: 34,
                        column: 20
                    },
                    end: {
                        line: 34,
                        column: 66
                    }
                },
                type: 'binary-expr',
                locations: [{
                    start: {
                        line: 34,
                        column: 20
                    },
                    end: {
                        line: 34,
                        column: 40
                    }
                }, {
                    start: {
                        line: 34,
                        column: 44
                    },
                    end: {
                        line: 34,
                        column: 66
                    }
                }]
            },
            '8': {
                loc: {
                    start: {
                        line: 52,
                        column: 12
                    },
                    end: {
                        line: 60,
                        column: 13
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 52,
                        column: 12
                    },
                    end: {
                        line: 60,
                        column: 13
                    }
                }, {
                    start: {
                        line: 52,
                        column: 12
                    },
                    end: {
                        line: 60,
                        column: 13
                    }
                }]
            },
            '9': {
                loc: {
                    start: {
                        line: 54,
                        column: 19
                    },
                    end: {
                        line: 60,
                        column: 13
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 54,
                        column: 19
                    },
                    end: {
                        line: 60,
                        column: 13
                    }
                }, {
                    start: {
                        line: 54,
                        column: 19
                    },
                    end: {
                        line: 60,
                        column: 13
                    }
                }]
            },
            '10': {
                loc: {
                    start: {
                        line: 55,
                        column: 16
                    },
                    end: {
                        line: 59,
                        column: 17
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 55,
                        column: 16
                    },
                    end: {
                        line: 59,
                        column: 17
                    }
                }, {
                    start: {
                        line: 55,
                        column: 16
                    },
                    end: {
                        line: 59,
                        column: 17
                    }
                }]
            },
            '11': {
                loc: {
                    start: {
                        line: 69,
                        column: 27
                    },
                    end: {
                        line: 69,
                        column: 40
                    }
                },
                type: 'default-arg',
                locations: [{
                    start: {
                        line: 69,
                        column: 31
                    },
                    end: {
                        line: 69,
                        column: 40
                    }
                }]
            },
            '12': {
                loc: {
                    start: {
                        line: 78,
                        column: 12
                    },
                    end: {
                        line: 103,
                        column: 13
                    }
                },
                type: 'switch',
                locations: [{
                    start: {
                        line: 79,
                        column: 16
                    },
                    end: {
                        line: 81,
                        column: 25
                    }
                }, {
                    start: {
                        line: 82,
                        column: 16
                    },
                    end: {
                        line: 84,
                        column: 25
                    }
                }, {
                    start: {
                        line: 85,
                        column: 16
                    },
                    end: {
                        line: 87,
                        column: 25
                    }
                }, {
                    start: {
                        line: 88,
                        column: 16
                    },
                    end: {
                        line: 91,
                        column: 25
                    }
                }, {
                    start: {
                        line: 92,
                        column: 16
                    },
                    end: {
                        line: 102,
                        column: 21
                    }
                }]
            },
            '13': {
                loc: {
                    start: {
                        line: 93,
                        column: 20
                    },
                    end: {
                        line: 102,
                        column: 21
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 93,
                        column: 20
                    },
                    end: {
                        line: 102,
                        column: 21
                    }
                }, {
                    start: {
                        line: 93,
                        column: 20
                    },
                    end: {
                        line: 102,
                        column: 21
                    }
                }]
            },
            '14': {
                loc: {
                    start: {
                        line: 93,
                        column: 24
                    },
                    end: {
                        line: 93,
                        column: 73
                    }
                },
                type: 'binary-expr',
                locations: [{
                    start: {
                        line: 93,
                        column: 24
                    },
                    end: {
                        line: 93,
                        column: 40
                    }
                }, {
                    start: {
                        line: 93,
                        column: 44
                    },
                    end: {
                        line: 93,
                        column: 62
                    }
                }, {
                    start: {
                        line: 93,
                        column: 66
                    },
                    end: {
                        line: 93,
                        column: 73
                    }
                }]
            },
            '15': {
                loc: {
                    start: {
                        line: 95,
                        column: 24
                    },
                    end: {
                        line: 101,
                        column: 25
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 95,
                        column: 24
                    },
                    end: {
                        line: 101,
                        column: 25
                    }
                }, {
                    start: {
                        line: 95,
                        column: 24
                    },
                    end: {
                        line: 101,
                        column: 25
                    }
                }]
            },
            '16': {
                loc: {
                    start: {
                        line: 97,
                        column: 28
                    },
                    end: {
                        line: 100,
                        column: 29
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 97,
                        column: 28
                    },
                    end: {
                        line: 100,
                        column: 29
                    }
                }, {
                    start: {
                        line: 97,
                        column: 28
                    },
                    end: {
                        line: 100,
                        column: 29
                    }
                }]
            },
            '17': {
                loc: {
                    start: {
                        line: 107,
                        column: 8
                    },
                    end: {
                        line: 109,
                        column: 9
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 107,
                        column: 8
                    },
                    end: {
                        line: 109,
                        column: 9
                    }
                }, {
                    start: {
                        line: 107,
                        column: 8
                    },
                    end: {
                        line: 109,
                        column: 9
                    }
                }]
            },
            '18': {
                loc: {
                    start: {
                        line: 117,
                        column: 26
                    },
                    end: {
                        line: 117,
                        column: 36
                    }
                },
                type: 'default-arg',
                locations: [{
                    start: {
                        line: 117,
                        column: 34
                    },
                    end: {
                        line: 117,
                        column: 36
                    }
                }]
            },
            '19': {
                loc: {
                    start: {
                        line: 121,
                        column: 8
                    },
                    end: {
                        line: 123,
                        column: 9
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 121,
                        column: 8
                    },
                    end: {
                        line: 123,
                        column: 9
                    }
                }, {
                    start: {
                        line: 121,
                        column: 8
                    },
                    end: {
                        line: 123,
                        column: 9
                    }
                }]
            },
            '20': {
                loc: {
                    start: {
                        line: 121,
                        column: 12
                    },
                    end: {
                        line: 121,
                        column: 24
                    }
                },
                type: 'binary-expr',
                locations: [{
                    start: {
                        line: 121,
                        column: 12
                    },
                    end: {
                        line: 121,
                        column: 15
                    }
                }, {
                    start: {
                        line: 121,
                        column: 19
                    },
                    end: {
                        line: 121,
                        column: 24
                    }
                }]
            },
            '21': {
                loc: {
                    start: {
                        line: 124,
                        column: 8
                    },
                    end: {
                        line: 127,
                        column: 9
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 124,
                        column: 8
                    },
                    end: {
                        line: 127,
                        column: 9
                    }
                }, {
                    start: {
                        line: 124,
                        column: 8
                    },
                    end: {
                        line: 127,
                        column: 9
                    }
                }]
            },
            '22': {
                loc: {
                    start: {
                        line: 128,
                        column: 8
                    },
                    end: {
                        line: 130,
                        column: 9
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 128,
                        column: 8
                    },
                    end: {
                        line: 130,
                        column: 9
                    }
                }, {
                    start: {
                        line: 128,
                        column: 8
                    },
                    end: {
                        line: 130,
                        column: 9
                    }
                }]
            },
            '23': {
                loc: {
                    start: {
                        line: 138,
                        column: 12
                    },
                    end: {
                        line: 140,
                        column: 13
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 138,
                        column: 12
                    },
                    end: {
                        line: 140,
                        column: 13
                    }
                }, {
                    start: {
                        line: 138,
                        column: 12
                    },
                    end: {
                        line: 140,
                        column: 13
                    }
                }]
            }
        },
        s: {
            '0': 0,
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0,
            '6': 0,
            '7': 0,
            '8': 0,
            '9': 0,
            '10': 0,
            '11': 0,
            '12': 0,
            '13': 0,
            '14': 0,
            '15': 0,
            '16': 0,
            '17': 0,
            '18': 0,
            '19': 0,
            '20': 0,
            '21': 0,
            '22': 0,
            '23': 0,
            '24': 0,
            '25': 0,
            '26': 0,
            '27': 0,
            '28': 0,
            '29': 0,
            '30': 0,
            '31': 0,
            '32': 0,
            '33': 0,
            '34': 0,
            '35': 0,
            '36': 0,
            '37': 0,
            '38': 0,
            '39': 0,
            '40': 0,
            '41': 0,
            '42': 0,
            '43': 0,
            '44': 0,
            '45': 0,
            '46': 0,
            '47': 0,
            '48': 0,
            '49': 0,
            '50': 0,
            '51': 0,
            '52': 0,
            '53': 0,
            '54': 0,
            '55': 0,
            '56': 0,
            '57': 0,
            '58': 0,
            '59': 0,
            '60': 0,
            '61': 0,
            '62': 0,
            '63': 0,
            '64': 0,
            '65': 0,
            '66': 0,
            '67': 0,
            '68': 0,
            '69': 0,
            '70': 0,
            '71': 0,
            '72': 0,
            '73': 0,
            '74': 0,
            '75': 0,
            '76': 0,
            '77': 0,
            '78': 0,
            '79': 0,
            '80': 0,
            '81': 0,
            '82': 0,
            '83': 0,
            '84': 0,
            '85': 0,
            '86': 0,
            '87': 0,
            '88': 0,
            '89': 0
        },
        f: {
            '0': 0,
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0,
            '6': 0,
            '7': 0,
            '8': 0,
            '9': 0,
            '10': 0,
            '11': 0
        },
        b: {
            '0': [0, 0],
            '1': [0, 0],
            '2': [0, 0],
            '3': [0, 0],
            '4': [0, 0],
            '5': [0, 0],
            '6': [0, 0],
            '7': [0, 0],
            '8': [0, 0],
            '9': [0, 0],
            '10': [0, 0],
            '11': [0],
            '12': [0, 0, 0, 0, 0],
            '13': [0, 0],
            '14': [0, 0, 0],
            '15': [0, 0],
            '16': [0, 0],
            '17': [0, 0],
            '18': [0],
            '19': [0, 0],
            '20': [0, 0],
            '21': [0, 0],
            '22': [0, 0],
            '23': [0, 0]
        },
        _coverageSchema: '332fd63041d2c1bcb487cc26dd0d5f7d97098a6c'
    },
        coverage = global[gcv] || (global[gcv] = {});

    if (coverage[path] && coverage[path].hash === hash) {
        return coverage[path];
    }

    coverageData.hash = hash;
    return coverage[path] = coverageData;
}();

var _literalParser = require('./literal-parser');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BibLatexNameParser = exports.BibLatexNameParser = function () {
    function BibLatexNameParser(nameString) {
        (0, _classCallCheck3.default)(this, BibLatexNameParser);
        ++cov_wwcio7ipy.f[0];
        ++cov_wwcio7ipy.s[0];

        this.nameString = nameString;
        ++cov_wwcio7ipy.s[1];
        this.nameDict = {};
        ++cov_wwcio7ipy.s[2];
        this._particle = [];
        ++cov_wwcio7ipy.s[3];
        this._suffix = [];
    }

    (0, _createClass3.default)(BibLatexNameParser, [{
        key: 'parseName',
        value: function parseName() {
            ++cov_wwcio7ipy.f[1];

            var parts = (++cov_wwcio7ipy.s[4], this.splitTexString(this.nameString, ','));
            ++cov_wwcio7ipy.s[5];
            if ((++cov_wwcio7ipy.b[1][0], parts.length > 1) && (++cov_wwcio7ipy.b[1][1], this.nameString.includes('='))) {
                ++cov_wwcio7ipy.b[0][0];
                ++cov_wwcio7ipy.s[6];

                // extended name detected.
                this.parseExtendedName(parts);
            } else {
                    ++cov_wwcio7ipy.b[0][1];
                    ++cov_wwcio7ipy.s[7];
                    if (parts.length === 3) {
                        ++cov_wwcio7ipy.b[2][0];
                        ++cov_wwcio7ipy.s[8];
                        // von Last, Jr, First
                        this.processVonLast(this.splitTexString(parts[0]), this.splitTexString(parts[1]));
                        ++cov_wwcio7ipy.s[9];
                        this.processFirstMiddle(this.splitTexString(parts[2]));
                    } else {
                            ++cov_wwcio7ipy.b[2][1];
                            ++cov_wwcio7ipy.s[10];
                            if (parts.length === 2) {
                                ++cov_wwcio7ipy.b[3][0];
                                ++cov_wwcio7ipy.s[11];
                                // von Last, First
                                this.processVonLast(this.splitTexString(parts[0]));
                                ++cov_wwcio7ipy.s[12];
                                this.processFirstMiddle(this.splitTexString(parts[1]));
                            } else {
                                    ++cov_wwcio7ipy.b[3][1];
                                    ++cov_wwcio7ipy.s[13];
                                    if (parts.length === 1) {
                                        ++cov_wwcio7ipy.b[4][0];
                                        // First von Last
                                        var spacedParts = (++cov_wwcio7ipy.s[14], this.splitTexString(this.nameString));
                                        ++cov_wwcio7ipy.s[15];
                                        if (spacedParts.length === 1) {
                                            ++cov_wwcio7ipy.b[5][0];
                                            ++cov_wwcio7ipy.s[16];

                                            this.nameDict['literal'] = this._reformLiteral(spacedParts[0].trim());
                                        } else {
                                            ++cov_wwcio7ipy.b[5][1];

                                            var split = (++cov_wwcio7ipy.s[17], this.splitAt(spacedParts));
                                            var firstMiddle = (++cov_wwcio7ipy.s[18], split[0]);
                                            var vonLast = (++cov_wwcio7ipy.s[19], split[1]);
                                            ++cov_wwcio7ipy.s[20];
                                            if ((++cov_wwcio7ipy.b[7][0], vonLast.length === 0) && (++cov_wwcio7ipy.b[7][1], firstMiddle.length > 1)) {
                                                ++cov_wwcio7ipy.b[6][0];

                                                var last = (++cov_wwcio7ipy.s[21], firstMiddle.pop());
                                                ++cov_wwcio7ipy.s[22];
                                                vonLast.push(last);
                                            } else {
                                                ++cov_wwcio7ipy.b[6][1];
                                            }
                                            ++cov_wwcio7ipy.s[23];
                                            this.processFirstMiddle(firstMiddle);
                                            ++cov_wwcio7ipy.s[24];
                                            this.processVonLast(vonLast);
                                        }
                                    } else {
                                        ++cov_wwcio7ipy.b[4][1];
                                        ++cov_wwcio7ipy.s[25];

                                        this.nameDict['literal'] = this._reformLiteral(this.nameString.trim());
                                    }
                                }
                        }
                }
        }
    }, {
        key: 'parseExtendedName',
        value: function parseExtendedName(parts) {
            var _this = this;

            ++cov_wwcio7ipy.f[2];

            var that = (++cov_wwcio7ipy.s[26], this);
            ++cov_wwcio7ipy.s[27];
            parts.forEach(function (part) {
                ++cov_wwcio7ipy.f[3];

                var attrParts = (++cov_wwcio7ipy.s[28], part.trim().replace(/^\"|\"$/g, '').split('='));
                var attrName = (++cov_wwcio7ipy.s[29], attrParts.shift().trim().toLowerCase());
                ++cov_wwcio7ipy.s[30];
                if (['family', 'given', 'prefix', 'suffix'].includes(attrName)) {
                    ++cov_wwcio7ipy.b[8][0];
                    ++cov_wwcio7ipy.s[31];

                    _this.nameDict[attrName] = that._reformLiteral(attrParts.join('=').trim());
                } else {
                        ++cov_wwcio7ipy.b[8][1];
                        ++cov_wwcio7ipy.s[32];
                        if (attrName === 'useprefix') {
                            ++cov_wwcio7ipy.b[9][0];
                            ++cov_wwcio7ipy.s[33];

                            if (attrParts.join('').trim().toLowerCase() === 'true') {
                                ++cov_wwcio7ipy.b[10][0];
                                ++cov_wwcio7ipy.s[34];

                                _this.nameDict['useprefix'] = true;
                            } else {
                                ++cov_wwcio7ipy.b[10][1];
                                ++cov_wwcio7ipy.s[35];

                                _this.nameDict['useprefix'] = false;
                            }
                        } else {
                            ++cov_wwcio7ipy.b[9][1];
                        }
                    }
            });
        }
    }, {
        key: 'splitTexString',
        value: function splitTexString(string) {
            var sep = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (++cov_wwcio7ipy.b[11][0], '[\\s~]+');
            ++cov_wwcio7ipy.f[5];

            var braceLevel = (++cov_wwcio7ipy.s[38], 0);
            var inQuotes = (++cov_wwcio7ipy.s[39], false);
            var nameStart = (++cov_wwcio7ipy.s[40], 0);
            var result = (++cov_wwcio7ipy.s[41], []);
            var stringLen = (++cov_wwcio7ipy.s[42], string.length);
            var pos = (++cov_wwcio7ipy.s[43], 0);
            ++cov_wwcio7ipy.s[44];
            while (pos < stringLen) {
                var char = (++cov_wwcio7ipy.s[45], string.charAt(pos));
                ++cov_wwcio7ipy.s[46];
                switch (char) {
                    case '{':
                        ++cov_wwcio7ipy.b[12][0];
                        ++cov_wwcio7ipy.s[47];

                        braceLevel += 1;
                        ++cov_wwcio7ipy.s[48];
                        break;
                    case '}':
                        ++cov_wwcio7ipy.b[12][1];
                        ++cov_wwcio7ipy.s[49];

                        braceLevel -= 1;
                        ++cov_wwcio7ipy.s[50];
                        break;
                    case '"':
                        ++cov_wwcio7ipy.b[12][2];
                        ++cov_wwcio7ipy.s[51];

                        inQuotes = !inQuotes;
                        ++cov_wwcio7ipy.s[52];
                        break;
                    case '\\':
                        ++cov_wwcio7ipy.b[12][3];
                        ++cov_wwcio7ipy.s[53];

                        // skip next
                        pos++;
                        ++cov_wwcio7ipy.s[54];
                        break;
                    default:
                        ++cov_wwcio7ipy.b[12][4];
                        ++cov_wwcio7ipy.s[55];

                        if ((++cov_wwcio7ipy.b[14][0], braceLevel === 0) && (++cov_wwcio7ipy.b[14][1], inQuotes === false) && (++cov_wwcio7ipy.b[14][2], pos > 0)) {
                            ++cov_wwcio7ipy.b[13][0];

                            var match = (++cov_wwcio7ipy.s[56], string.slice(pos).match(RegExp('^' + sep)));
                            ++cov_wwcio7ipy.s[57];
                            if (match) {
                                ++cov_wwcio7ipy.b[15][0];

                                var sepLen = (++cov_wwcio7ipy.s[58], match[0].length);
                                ++cov_wwcio7ipy.s[59];
                                if (pos + sepLen < stringLen) {
                                    ++cov_wwcio7ipy.b[16][0];
                                    ++cov_wwcio7ipy.s[60];

                                    result.push(string.slice(nameStart, pos));
                                    ++cov_wwcio7ipy.s[61];
                                    nameStart = pos + sepLen;
                                } else {
                                    ++cov_wwcio7ipy.b[16][1];
                                }
                            } else {
                                ++cov_wwcio7ipy.b[15][1];
                            }
                        } else {
                            ++cov_wwcio7ipy.b[13][1];
                        }
                }

                ++cov_wwcio7ipy.s[62];
                pos++;
            }
            ++cov_wwcio7ipy.s[63];
            if (nameStart < stringLen) {
                ++cov_wwcio7ipy.b[17][0];
                ++cov_wwcio7ipy.s[64];

                result.push(string.slice(nameStart));
            } else {
                ++cov_wwcio7ipy.b[17][1];
            }
            ++cov_wwcio7ipy.s[65];
            return result;
        }
    }, {
        key: 'processFirstMiddle',
        value: function processFirstMiddle(parts) {
            ++cov_wwcio7ipy.f[6];
            ++cov_wwcio7ipy.s[66];

            this.nameDict['given'] = this._reformLiteral(parts.join(' ').trim());
        }
    }, {
        key: 'processVonLast',
        value: function processVonLast(parts) {
            var lineage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (++cov_wwcio7ipy.b[18][0], []);
            ++cov_wwcio7ipy.f[7];

            var rSplit = (++cov_wwcio7ipy.s[67], this.rsplitAt(parts));
            var von = (++cov_wwcio7ipy.s[68], rSplit[0]);
            var last = (++cov_wwcio7ipy.s[69], rSplit[1]);
            ++cov_wwcio7ipy.s[70];
            if ((++cov_wwcio7ipy.b[20][0], von) && (++cov_wwcio7ipy.b[20][1], !last)) {
                ++cov_wwcio7ipy.b[19][0];
                ++cov_wwcio7ipy.s[71];

                last.push(von.pop());
            } else {
                ++cov_wwcio7ipy.b[19][1];
            }
            ++cov_wwcio7ipy.s[72];
            if (von.length) {
                ++cov_wwcio7ipy.b[21][0];
                ++cov_wwcio7ipy.s[73];

                this.nameDict['prefix'] = this._reformLiteral(von.join(' ').trim());
                ++cov_wwcio7ipy.s[74];
                this.nameDict['useprefix'] = true; // The info at hand is not clear, so we guess.
            } else {
                ++cov_wwcio7ipy.b[21][1];
            }
            ++cov_wwcio7ipy.s[75];
            if (lineage.length) {
                ++cov_wwcio7ipy.b[22][0];
                ++cov_wwcio7ipy.s[76];

                this.nameDict['suffix'] = this._reformLiteral(lineage.join(' ').trim());
            } else {
                ++cov_wwcio7ipy.b[22][1];
            }
            ++cov_wwcio7ipy.s[77];
            this.nameDict['family'] = this._reformLiteral(last.join(' ').trim());
        }
    }, {
        key: 'findFirstLowerCaseWord',
        value: function findFirstLowerCaseWord(lst) {
            ++cov_wwcio7ipy.f[8];
            ++cov_wwcio7ipy.s[78];

            // return index of first lowercase word in lst. Else return length of lst.
            for (var i = 0; i < lst.length; i++) {
                var word = (++cov_wwcio7ipy.s[79], lst[i]);
                ++cov_wwcio7ipy.s[80];
                if (word === word.toLowerCase()) {
                    ++cov_wwcio7ipy.b[23][0];
                    ++cov_wwcio7ipy.s[81];

                    return i;
                } else {
                    ++cov_wwcio7ipy.b[23][1];
                }
            }
            ++cov_wwcio7ipy.s[82];
            return lst.length;
        }
    }, {
        key: 'splitAt',
        value: function splitAt(lst) {
            ++cov_wwcio7ipy.f[9];

            // Split the given list into two parts.
            // The second part starts with the first lowercase word.
            var pos = (++cov_wwcio7ipy.s[83], this.findFirstLowerCaseWord(lst));
            ++cov_wwcio7ipy.s[84];
            return [lst.slice(0, pos), lst.slice(pos)];
        }
    }, {
        key: 'rsplitAt',
        value: function rsplitAt(lst) {
            ++cov_wwcio7ipy.f[10];

            var rpos = (++cov_wwcio7ipy.s[85], this.findFirstLowerCaseWord(lst.slice().reverse()));
            var pos = (++cov_wwcio7ipy.s[86], lst.length - rpos);
            ++cov_wwcio7ipy.s[87];
            return [lst.slice(0, pos), lst.slice(pos)];
        }
    }, {
        key: '_reformLiteral',
        value: function _reformLiteral(litString) {
            ++cov_wwcio7ipy.f[11];

            var parser = (++cov_wwcio7ipy.s[88], new _literalParser.BibLatexLiteralParser(litString));
            ++cov_wwcio7ipy.s[89];
            return parser.output;
        }
    }, {
        key: 'output',
        get: function get() {
            ++cov_wwcio7ipy.f[4];
            ++cov_wwcio7ipy.s[36];

            this.parseName();
            ++cov_wwcio7ipy.s[37];
            return this.nameDict;
        }
    }]);
    return BibLatexNameParser;
}();

},{"./literal-parser":131,"babel-runtime/helpers/classCallCheck":15,"babel-runtime/helpers/createClass":16}],133:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var cov_20ypcm9kfp = function () {
    var path = '/home/travis/build/fiduswriter/biblatex-csl-converter/src/import/tools.js',
        hash = '9a5f618b83a96f9adac8ac55c11c54aa808fbef0',
        global = new Function('return this')(),
        gcv = '__coverage__',
        coverageData = {
        path: '/home/travis/build/fiduswriter/biblatex-csl-converter/src/import/tools.js',
        statementMap: {
            '0': {
                start: {
                    line: 3,
                    column: 17
                },
                end: {
                    line: 3,
                    column: 19
                }
            },
            '1': {
                start: {
                    line: 4,
                    column: 18
                },
                end: {
                    line: 4,
                    column: 38
                }
            },
            '2': {
                start: {
                    line: 5,
                    column: 12
                },
                end: {
                    line: 5,
                    column: 13
                }
            },
            '3': {
                start: {
                    line: 6,
                    column: 12
                },
                end: {
                    line: 6,
                    column: 13
                }
            },
            '4': {
                start: {
                    line: 8,
                    column: 4
                },
                end: {
                    line: 30,
                    column: 5
                }
            },
            '5': {
                start: {
                    line: 9,
                    column: 20
                },
                end: {
                    line: 9,
                    column: 27
                }
            },
            '6': {
                start: {
                    line: 10,
                    column: 8
                },
                end: {
                    line: 12,
                    column: 9
                }
            },
            '7': {
                start: {
                    line: 11,
                    column: 12
                },
                end: {
                    line: 11,
                    column: 27
                }
            },
            '8': {
                start: {
                    line: 13,
                    column: 8
                },
                end: {
                    line: 29,
                    column: 9
                }
            },
            '9': {
                start: {
                    line: 15,
                    column: 16
                },
                end: {
                    line: 15,
                    column: 22
                }
            },
            '10': {
                start: {
                    line: 16,
                    column: 16
                },
                end: {
                    line: 16,
                    column: 21
                }
            },
            '11': {
                start: {
                    line: 18,
                    column: 16
                },
                end: {
                    line: 18,
                    column: 22
                }
            },
            '12': {
                start: {
                    line: 19,
                    column: 16
                },
                end: {
                    line: 19,
                    column: 21
                }
            },
            '13': {
                start: {
                    line: 21,
                    column: 16
                },
                end: {
                    line: 25,
                    column: 17
                }
            },
            '14': {
                start: {
                    line: 22,
                    column: 20
                },
                end: {
                    line: 22,
                    column: 23
                }
            },
            '15': {
                start: {
                    line: 24,
                    column: 20
                },
                end: {
                    line: 24,
                    column: 38
                }
            },
            '16': {
                start: {
                    line: 26,
                    column: 16
                },
                end: {
                    line: 26,
                    column: 21
                }
            },
            '17': {
                start: {
                    line: 28,
                    column: 16
                },
                end: {
                    line: 28,
                    column: 34
                }
            },
            '18': {
                start: {
                    line: 31,
                    column: 4
                },
                end: {
                    line: 31,
                    column: 17
                }
            }
        },
        fnMap: {
            '0': {
                name: 'splitTeXString',
                decl: {
                    start: {
                        line: 2,
                        column: 16
                    },
                    end: {
                        line: 2,
                        column: 30
                    }
                },
                loc: {
                    start: {
                        line: 2,
                        column: 60
                    },
                    end: {
                        line: 32,
                        column: 1
                    }
                }
            }
        },
        branchMap: {
            '0': {
                loc: {
                    start: {
                        line: 2,
                        column: 42
                    },
                    end: {
                        line: 2,
                        column: 58
                    }
                },
                type: 'default-arg',
                locations: [{
                    start: {
                        line: 2,
                        column: 53
                    },
                    end: {
                        line: 2,
                        column: 58
                    }
                }]
            },
            '1': {
                loc: {
                    start: {
                        line: 10,
                        column: 8
                    },
                    end: {
                        line: 12,
                        column: 9
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 10,
                        column: 8
                    },
                    end: {
                        line: 12,
                        column: 9
                    }
                }, {
                    start: {
                        line: 10,
                        column: 8
                    },
                    end: {
                        line: 12,
                        column: 9
                    }
                }]
            },
            '2': {
                loc: {
                    start: {
                        line: 13,
                        column: 8
                    },
                    end: {
                        line: 29,
                        column: 9
                    }
                },
                type: 'switch',
                locations: [{
                    start: {
                        line: 14,
                        column: 12
                    },
                    end: {
                        line: 16,
                        column: 21
                    }
                }, {
                    start: {
                        line: 17,
                        column: 12
                    },
                    end: {
                        line: 19,
                        column: 21
                    }
                }, {
                    start: {
                        line: 20,
                        column: 12
                    },
                    end: {
                        line: 26,
                        column: 21
                    }
                }, {
                    start: {
                        line: 27,
                        column: 12
                    },
                    end: {
                        line: 28,
                        column: 34
                    }
                }]
            },
            '3': {
                loc: {
                    start: {
                        line: 21,
                        column: 16
                    },
                    end: {
                        line: 25,
                        column: 17
                    }
                },
                type: 'if',
                locations: [{
                    start: {
                        line: 21,
                        column: 16
                    },
                    end: {
                        line: 25,
                        column: 17
                    }
                }, {
                    start: {
                        line: 21,
                        column: 16
                    },
                    end: {
                        line: 25,
                        column: 17
                    }
                }]
            }
        },
        s: {
            '0': 0,
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0,
            '6': 0,
            '7': 0,
            '8': 0,
            '9': 0,
            '10': 0,
            '11': 0,
            '12': 0,
            '13': 0,
            '14': 0,
            '15': 0,
            '16': 0,
            '17': 0,
            '18': 0
        },
        f: {
            '0': 0
        },
        b: {
            '0': [0],
            '1': [0, 0],
            '2': [0, 0, 0, 0],
            '3': [0, 0]
        },
        _coverageSchema: '332fd63041d2c1bcb487cc26dd0d5f7d97098a6c'
    },
        coverage = global[gcv] || (global[gcv] = {});

    if (coverage[path] && coverage[path].hash === hash) {
        return coverage[path];
    }

    coverageData.hash = hash;
    return coverage[path] = coverageData;
}();

exports.splitTeXString = splitTeXString;
// split at each occurence of splitToken, but only if no braces are currently open.
function splitTeXString(texString) {
    var splitToken = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (++cov_20ypcm9kfp.b[0][0], 'and');
    ++cov_20ypcm9kfp.f[0];

    var output = (++cov_20ypcm9kfp.s[0], []);
    var tokenRe = (++cov_20ypcm9kfp.s[1], /([^\s{}]+|\s|{|})/g);
    var j = (++cov_20ypcm9kfp.s[2], 0);
    var k = (++cov_20ypcm9kfp.s[3], 0);
    var item = void 0;
    ++cov_20ypcm9kfp.s[4];
    while ((item = tokenRe.exec(texString)) !== null) {
        var token = (++cov_20ypcm9kfp.s[5], item[0]);
        ++cov_20ypcm9kfp.s[6];
        if (k === output.length) {
            ++cov_20ypcm9kfp.b[1][0];
            ++cov_20ypcm9kfp.s[7];

            output.push('');
        } else {
            ++cov_20ypcm9kfp.b[1][1];
        }
        ++cov_20ypcm9kfp.s[8];
        switch (token) {
            case '{':
                ++cov_20ypcm9kfp.b[2][0];
                ++cov_20ypcm9kfp.s[9];

                j += 1;
                ++cov_20ypcm9kfp.s[10];
                break;
            case '}':
                ++cov_20ypcm9kfp.b[2][1];
                ++cov_20ypcm9kfp.s[11];

                j -= 1;
                ++cov_20ypcm9kfp.s[12];
                break;
            case splitToken:
                ++cov_20ypcm9kfp.b[2][2];
                ++cov_20ypcm9kfp.s[13];

                if (0 === j) {
                    ++cov_20ypcm9kfp.b[3][0];
                    ++cov_20ypcm9kfp.s[14];

                    k++;
                } else {
                    ++cov_20ypcm9kfp.b[3][1];
                    ++cov_20ypcm9kfp.s[15];

                    output[k] += token;
                }
                ++cov_20ypcm9kfp.s[16];
                break;
            default:
                ++cov_20ypcm9kfp.b[2][3];
                ++cov_20ypcm9kfp.s[17];

                output[k] += token;
        }
    }
    ++cov_20ypcm9kfp.s[18];
    return output;
}

},{}],134:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var cov_182xz8g0e6 = function () {
  var path = "/home/travis/build/fiduswriter/biblatex-csl-converter/src/index.js",
      hash = "fa8d6ccf1063da7c91ce1eee30be8e1050fde576",
      global = new Function('return this')(),
      gcv = "__coverage__",
      coverageData = {
    path: "/home/travis/build/fiduswriter/biblatex-csl-converter/src/index.js",
    statementMap: {},
    fnMap: {},
    branchMap: {},
    s: {},
    f: {},
    b: {},
    _coverageSchema: "332fd63041d2c1bcb487cc26dd0d5f7d97098a6c"
  },
      coverage = global[gcv] || (global[gcv] = {});

  if (coverage[path] && coverage[path].hash === hash) {
    return coverage[path];
  }

  coverageData.hash = hash;
  return coverage[path] = coverageData;
}();

var _biblatex = require("./import/biblatex");

Object.defineProperty(exports, "BibLatexParser", {
  enumerable: true,
  get: function get() {
    return _biblatex.BibLatexParser;
  }
});

var _biblatex2 = require("./export/biblatex");

Object.defineProperty(exports, "BibLatexExporter", {
  enumerable: true,
  get: function get() {
    return _biblatex2.BibLatexExporter;
  }
});

var _csl = require("./export/csl");

Object.defineProperty(exports, "CSLExporter", {
  enumerable: true,
  get: function get() {
    return _csl.CSLExporter;
  }
});

var _const = require("./const");

Object.defineProperty(exports, "BibFieldTypes", {
  enumerable: true,
  get: function get() {
    return _const.BibFieldTypes;
  }
});
Object.defineProperty(exports, "BibTypes", {
  enumerable: true,
  get: function get() {
    return _const.BibTypes;
  }
});

},{"./const":125,"./export/biblatex":126,"./export/csl":128,"./import/biblatex":129}]},{},[1]);
