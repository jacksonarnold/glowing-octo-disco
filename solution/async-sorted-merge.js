"use strict";

// Print all entries, across all of the *async* sources, in chronological order.

const { pop, push } = require("./heap-sort");


// the same solution as sync-sorted-merge.js, but with async pop
// found that this solution wasn't suitable for higher work loads
// tried to add items to a heap and then sort, but ran into memory issues

module.exports = (logSources, printer) => {
  
  // found that this wasn't suitable for higher work loads
  async function finishSort(sortedEntries) {
    while (sortedEntries.length > 0) {
      const [_, sourceIndex, entry] = pop(sortedEntries);
      printer.print(entry);
      
      const nextEntry = await logSources[sourceIndex].popAsync();
      
      if (nextEntry !== false) {
        push(sortedEntries, [nextEntry.date.getTime(), sourceIndex, nextEntry]);
      }
    }
  }
  
  return new Promise((resolve, reject) => {
    let sortedEntries = [];
    let logSourceCount = logSources.length;

    Promise.all(logSources.map(async (source, index) => {
      return source.popAsync().then(sourceEntry => {
        if (sourceEntry !== false) {
          push(sortedEntries, [sourceEntry.date.getTime(), index, sourceEntry]);
        }
        else {
          logSourceCount--;
        }
      });
    }))
    .then(() => {
      finishSort(sortedEntries).then(() => {
        printer.done();
        resolve();
      });
    });
  })
};
