async function loadPyodideAndRun() {
    const pyodide = await loadPyodide();
    await pyodide.loadPackage(["numpy", "pandas", "matplotlib"]);
    
    document.getElementById("analyzeData").addEventListener("click", async () => {
      const fileInput = document.getElementById("csvUpload");
      const selectedMetric = document.getElementById("metricSelect").value;
      const chartImage = document.getElementById("chartImage");
      const tableOutput = document.getElementById("tableOutput");
      
      if (fileInput.files.length === 0) {
        alert("Please upload a CSV file first.");
        return;
      }
  
      // Read the CSV file
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.readAsText(file);
      
      reader.onload = async function (event) {
        const csvData = event.target.result;
        
        await pyodide.globals.set('csv_data', csvData);
        await pyodide.globals.set('selected_metric', selectedMetric);
        
        const pythonCode = 
          'import sys\n' +
          'import io\n' +
          'import numpy as np\n' +
          'import pandas as pd\n' +
          'import matplotlib\n' +
          'matplotlib.use("Agg")\n' +
          'import matplotlib.pyplot as plt\n' +
          'import base64\n' +
          '\n' +
          '# Capture output\n' +
          'output_buffer = io.StringIO()\n' +
          'sys.stdout = output_buffer\n' +
          '\n' +
          '# Read CSV directly using csv_data from JavaScript\n' +
          'df = pd.read_csv(io.StringIO(csv_data))\n' +
          '\n' +
          '# Ensure required columns exist\n' +
          'expected_cols = {"Date", "Category", "Region", "Sales"}\n' +
          'if not expected_cols.issubset(set(df.columns)):\n' +
          '    print("❌ CSV must contain \'Date\', \'Category\', \'Region\', and \'Sales\' columns.")\n' +
          '    sys.stdout = sys.__stdout__\n' +
          '    exit()\n' +
          '\n' +
          '# Convert Date column to datetime\n' +
          'df["Date"] = pd.to_datetime(df["Date"])\n' +
          '\n' +
          'plt.figure(figsize=(12, 6))\n' +
          '\n' +
          'if selected_metric == "total_sales":\n' +
          '    total_sales = df["Sales"].sum()\n' +
          '    print(f"💰 Total Sales: ${total_sales:,.2f}")\n' +
          '    # Add daily sales trend for total sales view\n' +
          '    daily_sales = df.groupby("Date")["Sales"].sum().reset_index()\n' +
          '    plt.plot(daily_sales["Date"], daily_sales["Sales"], marker="o")\n' +
          '    plt.title("Daily Sales Trend")\n' +
          '    plt.ylabel("Sales ($)")\n' +
          '    plt.xlabel("Date")\n' +
          '    plt.xticks(rotation=45)\n' +
          '    plt.grid(True, linestyle="--", alpha=0.7)\n' +
          '    # Show top sales days in table\n' +
          '    table_data = daily_sales.sort_values("Sales", ascending=False).head(10)\n' +
          '    table_data["Sales"] = table_data["Sales"].apply(lambda x: f"${x:,.2f}")\n' +
          '    print("<h3>Top 10 Sales Days</h3>")\n' +
          '    print(table_data.to_html(index=False))\n' +
          'elif selected_metric == "category_sales":\n' +
          '    category_sales = df.groupby("Category")["Sales"].agg([\n' +
          '        ("Total Sales", "sum"),\n' +
          '        ("Average Sale", "mean"),\n' +
          '        ("Number of Sales", "count")\n' +
          '    ]).sort_values("Total Sales", ascending=True)\n' +
          '    category_sales["Total Sales"].plot(kind="bar", title="Sales by Category")\n' +
          '    plt.ylabel("Sales ($)")\n' +
          '    plt.xlabel("Category")\n' +
          '    plt.grid(True, linestyle="--", alpha=0.7)\n' +
          '    # Format table data\n' +
          '    table_data = category_sales.copy()\n' +
          '    table_data["Total Sales"] = table_data["Total Sales"].apply(lambda x: f"${x:,.2f}")\n' +
          '    table_data["Average Sale"] = table_data["Average Sale"].apply(lambda x: f"${x:,.2f}")\n' +
          '    print("<h3>Sales by Category</h3>")\n' +
          '    print(table_data.to_html())\n' +
          'elif selected_metric == "region_sales":\n' +
          '    region_sales = df.groupby("Region")["Sales"].agg([\n' +
          '        ("Total Sales", "sum"),\n' +
          '        ("Average Sale", "mean"),\n' +
          '        ("Number of Sales", "count")\n' +
          '    ]).sort_values("Total Sales", ascending=True)\n' +
          '    region_sales["Total Sales"].plot(kind="barh", title="Sales by Region")\n' +
          '    plt.xlabel("Sales ($)")\n' +
          '    plt.ylabel("Region")\n' +
          '    plt.grid(True, linestyle="--", alpha=0.7)\n' +
          '    # Format table data\n' +
          '    table_data = region_sales.copy()\n' +
          '    table_data["Total Sales"] = table_data["Total Sales"].apply(lambda x: f"${x:,.2f}")\n' +
          '    table_data["Average Sale"] = table_data["Average Sale"].apply(lambda x: f"${x:,.2f}")\n' +
          '    print("<h3>Sales by Region</h3>")\n' +
          '    print(table_data.to_html())\n' +
          'elif selected_metric == "monthly_trends":\n' +
          '    df["Month"] = df["Date"].dt.to_period("M")\n' +
          '    monthly_sales = df.groupby("Month")["Sales"].agg([\n' +
          '        ("Total Sales", "sum"),\n' +
          '        ("Average Sale", "mean"),\n' +
          '        ("Number of Sales", "count")\n' +
          '    ])\n' +
          '    monthly_sales["Total Sales"].plot(kind="line", marker="o", title="Monthly Sales Trends")\n' +
          '    plt.ylabel("Sales ($)")\n' +
          '    plt.xlabel("Month")\n' +
          '    plt.xticks(rotation=45)\n' +
          '    plt.grid(True, linestyle="--", alpha=0.7)\n' +
          '    # Format table data\n' +
          '    table_data = monthly_sales.copy()\n' +
          '    table_data["Total Sales"] = table_data["Total Sales"].apply(lambda x: f"${x:,.2f}")\n' +
          '    table_data["Average Sale"] = table_data["Average Sale"].apply(lambda x: f"${x:,.2f}")\n' +
          '    print("<h3>Monthly Sales Analysis</h3>")\n' +
          '    print(table_data.to_html())\n' +
          '\n' +
          'plt.tight_layout()\n' +
          '\n' +
          'buf = io.BytesIO()\n' +
          'plt.savefig(buf, format="png", dpi=100, bbox_inches="tight")\n' +
          'plt.close()\n' +
          'img_data = base64.b64encode(buf.getvalue()).decode("utf-8")\n' +
          'print(f"IMAGE_START{img_data}IMAGE_END")\n' +
          '\n' +
          'sys.stdout = sys.__stdout__\n' +
          'output_buffer.getvalue()';
  
        const result = await pyodide.runPythonAsync(pythonCode);
        
        // Extract and display output with markers
        const imageMatch = result.match(/IMAGE_START(.+?)IMAGE_END/);
        if (imageMatch) {
          const imageData = imageMatch[1];
          chartImage.src = 'data:image/png;base64,' + imageData;
          chartImage.style.display = 'block';
          // Remove the image data from the result before showing the table
          tableOutput.innerHTML = result.replace(/IMAGE_START(.+?)IMAGE_END/, '').trim();
        } else {
          chartImage.style.display = 'none';
          tableOutput.innerHTML = result.trim();
        }
      };
    });
  }
  
  loadPyodideAndRun();