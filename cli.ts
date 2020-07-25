#!/usr/bin/env node
import fs from "fs"
import * as YAML from "./index"

export type CallBackFunction = (err: Error |  null, text: string) => void

(function () {
  "use strict";

  const filename = process.argv[2];

  /*
   *
   * Begin real handler
   *
   */

  function printUsage() {
    console.warn("Usages:");
    console.warn("json2yaml example.json");
    console.warn("cat example.json | json2yaml");
  }

  function handleInput(err: Error | null, text: string) {
    var data
      ;

    if (err) {
      printUsage();
      return;
    }

    data = JSON.parse(text);
    console.info(YAML.stringify(data));
  }

  /*
   *
   * End real handler
   *
   */

  readInput(handleInput, filename);

  //
  // this could (and probably should) be its own module
  //
  function readInput(cb: CallBackFunction, filename: string) {

    function readFile() {
      fs.readFile(filename, 'utf8', function (err, text) {
        if (err) {
          console.error("[ERROR] couldn't read from '" + filename + "':");
          console.error(err.message);
          return;
        }

        cb(err, text);
      });
    }

    function readStdin() {
      var text = ''
        , stdin = process.stdin
        ;

      stdin.resume();

      stdin.on('data', function (chunk) {
        text += chunk;
      });

      stdin.on('end', function () {
        cb(null, text);
      });
    }

    if (filename) {
      readFile();
    }
    else {
      readStdin();
    }

  }

}());
