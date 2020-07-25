import trimWhitespace from 'remove-trailing-spaces';
import wordwrap from 'wordwrap';

export interface Handlers {
    [key: string]: (value?:any, inArray?: boolean, rootNode?: boolean) => string | number | boolean;
}

export function stringify(data: any, maxText: number = 120) {
    const wrap = wordwrap(maxText);
    let indentLevel = '';
    const handlers: Handlers = {
        "undefined": function() {
            // objects will not have `undefined` converted to `null`
            // as this may have unintended consequences
            // For arrays, however, this behavior seems appropriate
            return 'null';
        },
        "null": function() {
            return 'null';
        },
        "number": function(x: number) {
            return x;
        },
        "boolean": function(x: boolean) {
            return x ? true : false;
        },
        "string": function(x: string) {
          let output = '|';
          if (x.length <= maxText && x.indexOf('\n') === -1) {
            return JSON.stringify(x);
          }
          const text = wrap(x).split(/\\n|\n/);
          indentLevel = indentLevel.replace(/$/, '  ');
          text.forEach((y: string) => {
            output += '\n' + indentLevel + y;
  
          });
          indentLevel = indentLevel.replace(/  /, '');
  
          return output;
        },
        "array": function(x: any[]) {
            let output = '';

            if (0 === x.length) {
                output += '[]';
                return output;
            }

            indentLevel = indentLevel.replace(/$/, '  ');
            x.forEach(function(y, i) {
                // TODO how should `undefined` be handled?
                let handler = handlers[typeof y];

                if (!handler) {
                    throw new Error('what the crap: ' + typeof y);
                }

                output += '\n' + indentLevel + '- ' + handler(y, true);

            });
            indentLevel = indentLevel.replace(/  /, '');

            return output;
        },
        "object": function(x, inArray, rootNode) {
            let output = '';

            if(x === null) {
                return "null"
            }

            if(Array.isArray(x)){
                return handlers["array"](x)
            }
            
            if (0 === Object.keys(x).length) {
                output += '{}';
                return output;
            }
            if (!rootNode) {
                indentLevel = indentLevel.replace(/$/, '  ');
            }

            Object.keys(x).forEach(function(k, i) {
                const val = x[k];
                const handler = handlers[typeof val];

                if ('undefined' === typeof val) {
                    // the user should do
                    // delete obj.key
                    // and not
                    // obj.key = undefined
                    // but we'll error on the side of caution
                    return;
                }

                if (!handler) {
                    throw new Error('what the crap: ' + typeof val);
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

    return trimWhitespace(handlers[typeof data](data, true, true) + '\n');
}
