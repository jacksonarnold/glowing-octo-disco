"use strict";

// Print all entries, across all of the sources, in chronological order.

const { pop, addLogToEntries } = require("./heap-sort");

module.exports = (logSources, printer) => {
  let sortedEntries = [];

  logSources.forEach((source, index)=> {
    let sourceEntry = source.pop();
    if (sourceEntry === false) return;

    // push entry to sortedEntries, push calls heapifyUp to sort the array into a min heap
    addLogToEntries(sortedEntries, index, sourceEntry);
  });

  // loop through sortedEntries, pop the min entry and print it
  // (guaranteed to be larger than the previous entry from the same source)
  while (sortedEntries.length > 0) {
    const [_, sourceIndex, entry] = pop(sortedEntries);

    printer.print(entry);
    
    // get the next entry from the source that the min entry came from
    // guaranteed to be larger than the previous entry from the same source
    const nextEntry = logSources[sourceIndex].pop();
    
    // check if source is drained, if not push the next entry to sortedEntries
    if (nextEntry !== false) {
      addLogToEntries(sortedEntries, sourceIndex, nextEntry);
    }
  }

  printer.done();
};