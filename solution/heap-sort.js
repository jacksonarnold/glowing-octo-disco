
// avoided creating a class for this problem due to the note in the log-source.js file

function swap(arr, i, j) {
  [arr[i], arr[j]] = [arr[j], arr[i]];
}

function pop(arr) {
  if (arr.length === 0) return null;
  if (arr.length === 1) return arr.pop();

  const min = arr[0];
  arr[0] = arr.pop();
  heapifyDown(arr, 0);
  return min;
}

function push(arr, value) {
  arr.push(value);
  heapifyUp(arr, arr.length - 1);
}

function buildHeap(arr) {
  const lastLeaf = Math.floor(arr.length / 2) - 1;
  for (let i = lastLeaf; i >= 0; i--) {
    heapifyDown(arr, i);
  }
}

function heapifyUp(arr, i) {
  const parent = Math.floor((i - 1) / 2);

  if (parent >= 0 && arr[parent][0] > arr[i][0]) {
    swap(arr, i, parent);
    heapifyUp(arr, parent);
  }
}

function heapifyDown(arr, i) {
  let minIndex = i;
  while(true) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < arr.length && arr[left][0] < arr[minIndex][0]) {
      minIndex = left;
    }

    if (right < arr.length && arr[right][0] < arr[minIndex][0]) {
      minIndex = right;
    }

    if (minIndex === i) break;
    swap(arr, i, minIndex);
    i = minIndex;
  }
}

module.exports = {
    buildHeap,
    pop,
    push
}