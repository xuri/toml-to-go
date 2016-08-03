// Source: https://github.com/ricardobeat/toml.js
// Copyright © 2013 Ricardo Tomasi <ricardobeat@gmail.com>
// MIT Licensed. http://ricardo.mit-license.org
(function() {
  var delimiters, ignore, isNumeric, newlines, quotes, toml, unescape, values, whitespace;
  var __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  isNumeric = function(n) {
    return !isNaN(parseInt(n, 10));
  };
  unescape = function(str) {
    return str.replace('\\n', "\n").replace('\\t', "\t").replace(/\\(["'])/, "$1");
  };
  newlines = "\n\r";
  whitespace = "\t ";
  delimiters = "[].=";
  quotes = "\"'";
  ignore = [null, 'newline', 'whitespace'];
  values = ['number', 'string', 'date'];
  toml = function(input) {
    var accum, char, context, eat, group, i, key, list, lists, nesting, part, prev, quote, root, skip, state, token, value, _i, _len, _len2, _ref, _ref2, _ref3;
    root = {};
    context = root;
    state = null;
    skip = 0;
    accum = '';
    token = null;
    key = null;
    value = null;
    list = null;
    lists = {};
    nesting = -1;
    quote = null;
    prev = null;
    eat = function(char, reg, st) {
      if (!reg.test(char)) {
        state = st;
        token = accum;
        accum = '';
        return true;
      } else {
        accum += char;
        return false;
      }
    };
    _ref = input.toString() + "\n";
    for (i = 0, _len = _ref.length; i < _len; i++) {
      char = _ref[i];
      if (--skip > 0) {
        continue;
      }
      if (toml.debug) {
        console.log(char, state);
      }
      if ((state != null ? state.slice(-4) : void 0) === '_end') {
        state = null;
      }
      if (!state && __indexOf.call(newlines, char) >= 0) {
        state = 'newline';
      }
      if (__indexOf.call(ignore, state) >= 0 && char === '#') {
        state = 'comment';
      }
      if (state === 'comment') {
        if (__indexOf.call(newlines, char) < 0) {
          continue;
        } else {
          state = 'newline';
        }
      }
      if ((state === 'whitespace' || state === 'expect_value') && __indexOf.call(whitespace, char) >= 0) {
        continue;
      }
      if (__indexOf.call(newlines, prev) >= 0 && __indexOf.call(whitespace, char) >= 0) {
        state = 'whitespace';
        continue;
      }
      if (__indexOf.call(ignore, state) >= 0 && char === '[') {
        state = 'group';
        continue;
      }
      if (state === 'group' && eat(char, /[^\]]/)) {
        group = token;
      }
      if (group) {
        context = root;
        _ref2 = group.split('.');
        for (_i = 0, _len2 = _ref2.length; _i < _len2; _i++) {
          part = _ref2[_i];
          context = (_ref3 = context[part]) != null ? _ref3 : context[part] = {};
        }
        group = null;
      }
      if (__indexOf.call(ignore, state) >= 0 && /\w/.test(char)) {
        state = 'key';
      }
      if (state === 'key' && eat(char, /[^=]/)) {
        key = token.trim();
      }
      if (key && char === '=') {
        state = 'expect_value';
        continue;
      }
      if (state === 'expect_value') {
        if (__indexOf.call(quotes, char) >= 0) {
          state = 'string';
          quote = char;
          continue;
        }
        if (char === 't' && input.slice(i, (i + 3 + 1) || 9e9) === 'true') {
          value = true;
          skip = 4;
          state = null;
        }
        if (char === 'f' && input.slice(i, (i + 4 + 1) || 9e9) === 'false') {
          value = false;
          skip = 5;
          state = null;
        }
        if (char === '-') {
          state = 'number';
          accum = '-';
          continue;
        }
        if (isNumeric(char)) {
          state = 'number';
        }
        if (char === '[') {
          list = lists[++nesting] = [];
          continue;
        }
      }
      if (state === 'string' && eat(char, /[^"']/, 'string_end')) {
        value = unescape(token);
      }
      if (state === 'number' && eat(char, /[\d.]/, 'number_end')) {
        value = +token;
      }
      if (state === 'date' && eat(char, /[\d-:TZ]/)) {
        value = new Date(token);
      }
      if (state === 'string_end') {
        if (char !== quote || (char === quote && prev === '\\')) {
          state = 'string';
          accum = value + char;
          value = null;
        } else {
          state = null;
          quote = null;
        }
      }
      if (state === 'number_end') {
        if (char === '-') {
          state = 'date';
          accum = token + char;
          value = null;
        } else {
          state = null;
        }
      }
      if (list != null) {
        if (value != null) {
          list.push(value);
          value = null;
          state = 'expect_value';
        }
        if (char === ',') {
          continue;
        }
        if (char === ']' && __indexOf.call(values, state) < 0) {
          if (nesting === 0) {
            value = list;
            list = null;
            nesting = -1;
            state = null;
          }
          if (nesting > 0) {
            lists[--nesting].push(list);
            list = lists[nesting];
          }
        }
      }
      if (key && (value != null)) {
        context[key] = value;
        key = value = null;
      }
      prev = char;
    }
    return root;
  };
  if (typeof exports !== 'undefined') {
    module.exports = toml;
  } else {
    this.toml = toml;
  }
}).call(this);
