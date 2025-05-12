// Create a new worker from worker.js
const worker = new Worker('worker.js');

// DOM elements to update status and output
const statusElement = document.getElementById('status');
const outputElement = document.getElementById('workerOutput');
const startButton = document.getElementById('startWorker');

let timerInterval;
let secondsElapsed = 0;

// Listen for messages from the worker
worker.onmessage = (event) => {
  // Append any message from the worker to the output
  outputElement.textContent += event.data + "\n";

  if (event.data.startsWith("Computed result:")) {
    // When computation is complete, stop the timer and update status
    clearInterval(timerInterval);
    statusElement.textContent = `Status: Completed in ${secondsElapsed} seconds`;
  } else if (event.data === "Pyodide loaded in Worker") {
    // Update status when the worker is ready
    statusElement.textContent = "Status: Worker Ready";
  }
};

// When the start button is clicked, begin the computation
startButton.addEventListener('click', () => {
  // Reset the display and timer
  outputElement.textContent = "";
  secondsElapsed = 0;
  statusElement.textContent = "Status: Running...";
  
  // Start a timer that updates the main page every second
  timerInterval = setInterval(() => {
    secondsElapsed++;
    statusElement.textContent = `Status: Running... ${secondsElapsed} seconds elapsed`;
  }, 1000);
  
  // Tell the worker to start the heavy computation
  worker.postMessage('start');
});