# Running Python in the Browser with Pyodide

This project demonstrates how to run Python code directly in web browsers using Pyodide, a Python distribution for the browser and Node.js based on WebAssembly.

## What is Pyodide?

Pyodide is a port of CPython compiled to WebAssembly, allowing you to run Python code directly in your browser. It brings the scientific Python stack (NumPy, Pandas, Matplotlib, etc.) to the browser, enabling data science and machine learning applications to run entirely in the frontend.


## Installation

1. Clone this repository:
```bash
git clone [your-repository-url]
cd [repository-name]
```

2. Start a local server:
```bash
python -m http.server 8000
```

3. Open your browser and navigate to:
```
http://localhost:8000
```


## Acknowledgments

- [Pyodide](https://pyodide.org/) - The Python distribution for the browser
- [Towards Data Science](https://towardsdatascience.com/running-python-programs-in-your-browser/) - Original tutorial source