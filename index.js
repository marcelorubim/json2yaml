import trimWhitespace from 'remove-trailing-spaces';
var typeOf = require('remedial').typeOf;
var maxText = 120;
var wrap = require('wordwrap')(maxText);
export function stringify(data) {
    var handlers, indentLevel = '';

    handlers = {
        "undefined": function() {
            // objects will not have `undefined` converted to `null`
            // as this may have unintended consequences
            // For arrays, however, this behavior seems appropriate
            return 'null';
        },
        "null": function() {
            return 'null';
        },
        "number": function(x) {
            return x;
        },
        "boolean": function(x) {
            return x ? 'true' : 'false';
        },
        "string": function(x) {
          var output = '|';
          if (x.length <= maxText && x.indexOf('\n') === -1) {
            return JSON.stringify(x);
          }
          var text = wrap(x).split(/\\n|\n/);
          indentLevel = indentLevel.replace(/$/, '  ');
          text.forEach(function (y) {
            output += '\n' + indentLevel + y;
  
          });
          indentLevel = indentLevel.replace(/  /, '');
  
          return output;
        },
        "array": function(x) {
            var output = '';

            if (0 === x.length) {
                output += '[]';
                return output;
            }

            indentLevel = indentLevel.replace(/$/, '  ');
            x.forEach(function(y, i) {
                // TODO how should `undefined` be handled?
                var handler = handlers[typeOf(y)];

                if (!handler) {
                    throw new Error('what the crap: ' + typeOf(y));
                }

                output += '\n' + indentLevel + '- ' + handler(y, true);

            });
            indentLevel = indentLevel.replace(/  /, '');

            return output;
        },
        "object": function(x, inArray, rootNode) {
            var output = '';

            if (0 === Object.keys(x).length) {
                output += '{}';
                return output;
            }

            if (!rootNode) {
                indentLevel = indentLevel.replace(/$/, '  ');
            }

            Object.keys(x).forEach(function(k, i) {
                var val = x[k],
                    handler = handlers[typeOf(val)];

                if ('undefined' === typeof val) {
                    // the user should do
                    // delete obj.key
                    // and not
                    // obj.key = undefined
                    // but we'll error on the side of caution
                    return;
                }

                if (!handler) {
                    throw new Error('what the crap: ' + typeOf(val));
                }

                if (!(inArray && i === 0)) {
                    output += '\n' + indentLevel;
                }

                output += k + ': ' + handler(val);
            });
            indentLevel = indentLevel.replace(/  /, '');

            return output;
        },
        "function": function() {
            // TODO this should throw or otherwise be ignored
            return '[object Function]';
        }
    };

    return trimWhitespace(handlers[typeOf(data)](data, true, true) + '\n');
}
