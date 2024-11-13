"use strict";

// Print all entries, across all of the *async* sources, in chronological order.

const { pop, addLogToEntries } = require("./heap-sort");
const { Readable } = require('stream');

// create readable stream for log source
const createReadableStream = (logSource) => {
  return new Readable({
    objectMode: true,
    highWaterMark: 20,
    async read() {
      try {
        const entry = await logSource.popAsync();
        if (!this.push(entry)) {
          this.pause();
        }
      } 
      catch (error) {
        console.log('Readable Error: ', error);
        this.destroy(error);
      }
    }
  });
};

// waits for a stream to become readable and returns the next entry
const waitReadableLog = async (sourceStream) => {
  await new Promise((resolve) => sourceStream.once("readable", resolve));
  return sourceStream.read();
};

// retrieves the next log entry from a stream
const processNextLog = async (sourceStream) => {
  let nextEntry = sourceStream.read();

  if (nextEntry === null) {
    nextEntry = await waitReadableLog(sourceStream);
  }

  if (nextEntry === false) {
    sourceStream.destroy();
    return null;
  }

  return nextEntry;
};

module.exports = async (logSources, printer) => {
    
  return new Promise(async (resolve, reject) => {
    let sortedEntries = [];
    let sourceStreams = new Map();
  
    // create a readable stream for each source and load first log entries
    const logStreamPromises = logSources.map(async (logSource, index) => {
  
      const stream = createReadableStream(logSource);
  
      // read first entry from stream
      let firstEntry = await waitReadableLog(stream);
  
      // if entry is false, destroy stream and don't add to map
      if (firstEntry === false) {
        stream.destroy();
        return null;
      }
  
      // add source stream to map and push first entry
      sourceStreams.set(index, stream);
      addLogToEntries(sortedEntries, index, firstEntry);
    });
  
    await Promise.all(logStreamPromises);
  
    // sort and print entries
    while (sortedEntries.length > 0) {
  
      // pop and print next item
      const [_, sourceIndex, entry] = pop(sortedEntries);
      printer.print(entry);
  
      if (!sourceStreams.has(sourceIndex)) continue;
      
      // get next log
      const stream = sourceStreams.get(sourceIndex);
      const nextEntry = await processNextLog(stream);
  
      // if null is returned from processNextLog, then the source is drained
      if (!nextEntry || nextEntry === null) {
        stream.destroy();
        sourceStreams.delete(sourceIndex);
      }
      else {
        addLogToEntries(sortedEntries, sourceIndex,  nextEntry);
      }
    }
  
    printer.done();
    resolve("Async sort complete.");
  });
};