"use strict";

// Print all entries, across all of the *async* sources, in chronological order.

const { pop, push } = require("./heap-sort");


// the same solution as sync-sorted-merge.js, but with async pop
// found that this solution wasn't suitable for higher work loads
// tried to add items to a heap and then sort, but ran into memory issues

module.exports = (logSources, printer) => {

  
  return new Promise(async (resolve, reject) => {
    let sortedEntries = [];
    const bufferSize = logSources.length - 1;
    const entryPromises = new Array(bufferSize);

    for (let i = 0; i < bufferSize; i++) {
      entryPromises[i] = logSources[i].popAsync()
        .then(entry => ({ entry, sourceIndex: i  }));
    }

    // Process entries as they become available
    while (entryPromises.length > 0 || sortedEntries.length > 0) {
      // Wait for all current promises to resolve
      const results = await Promise.all(entryPromises);
      
      if (results.length === 0) break;
      
      entryPromises.length = 0;

      // Filter out false results (ended sources)
      results.forEach(element => {
        if (!element || element.entry === false) return;
        const i = element.sourceIndex;
        push(sortedEntries, [element.entry.date.getTime(), i, element.entry]);

        entryPromises[i] = logSources[i].popAsync()
          .then(entry => ({ entry, sourceIndex: i  }));
      });
      
      const earliest = pop(sortedEntries);
      
      printer.print(earliest[2]);
    }

    printer.done("async-sorted-merge-stats.txt");
    resolve();
  })
};
