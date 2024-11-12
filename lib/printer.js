"use strict";

const _ = require("lodash");
const fs = require("fs");

module.exports = class Printer {
  constructor() {
    this.last = new Date(0);
    this.logsPrinted = 0;
  }

  print(log) {
    if (!_.isDate(log.date)) {
      throw new Error(log.date + " is not a date");
    }
    if (log.date >= this.last) {
      console.log(log.date, log.msg);
    } else {
      throw new Error(log.date + " is not greater than " + this.last);
    }
    this.last = log.date;
    this.logsPrinted++;
    if (this.logsPrinted === 1) {
      this.startTime = new Date();
    }
  }

  done(filename = "print-stats.txt") {
    var timeTaken = (new Date() - this.startTime) / 1000;
    const stats = [
      "\n***********************************",
      `Logs printed:\t\t ${this.logsPrinted}`,
      `Time taken (s):\t\t ${timeTaken}`,
      `Logs/s:\t\t\t ${this.logsPrinted / timeTaken}`,
      "***********************************\n"
    ].join("\n");

    console.log(stats);
    fs.writeFileSync(filename, stats);
  }
};
