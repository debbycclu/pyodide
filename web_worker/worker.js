// Load Pyodide from the CDN inside the worker
self.importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js");

async function initPyodide() {
  self.pyodide = await loadPyodide();
  // Inform the main thread that Pyodide has been loaded
  self.postMessage("Pyodide loaded in Worker");
}

initPyodide();

// Listen for messages from the main thread
self.onmessage = async (event) => {
  if (event.data === 'start') {
    // Execute a heavy computation in Python within the worker.
    // The compute function now pauses for 0.5 seconds every 1,000,000 iterations.
    let result = await self.pyodide.runPythonAsync(`
import time
def compute():
    total = 0
    for i in range(1, 10000001):  # Loop from 1 to 10,000,000
        total += i
        if i % 1000000 == 0:
            time.sleep(0.5)  # Pause for 0.5 seconds every 1,000,000 iterations
    return total
compute()
    `);
    // Send the computed result back to the main thread
    self.postMessage("Computed result: " + result);
  }
};