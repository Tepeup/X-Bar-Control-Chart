function csvJSON(csv) {
  var lines = csv.split(/\r\n|\n/);

  var result = [];

  // NOTE: If your columns contain commas in their values, you'll need
  // to deal with those before doing the next step
  // (you might convert them to &&& or something, then covert them back later)

  var headers = lines[0].split(",");

  for (var i = 1; i < lines.length; i++) {
    var obj = {};
    var currentline = lines[i].split(",");

    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }

    result.push(obj);
  }

  //return result; //JavaScript object
  let arrayFromCSV = result; //JSON
  drawControlChart(arrayFromCSV);
}

function handleFiles(files) {
  if (window.FileReader) {
    getAsText(files[0]);
  } else {
    alert("FileReader not supporter in this browser.");
  }
}

function getAsText(fileToRead) {
  let reader = new FileReader();
  reader.readAsText(fileToRead);
  reader.onload = loadHandler;
  reader.onerror = errorHandler;
}

function loadHandler(event) {
  let csv = event.target.result;
  csvJSON(csv);
}

function errorHandler(event) {
  if (event.target.error.name == "NotReadableError") {
    alert("Cannot read file");
  }
}

//

function standardDeviation(values) {
  var avg = average(values);

  var squareDiffs = values.map(function (value) {
    var diff = value - avg;
    var sqrDiff = diff * diff;
    return sqrDiff;
  });

  var avgSquareDiff = average(squareDiffs);

  var stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}

function average(data) {
  var sum = data.reduce(function (sum, value) {
    return sum + value;
  }, 0);

  var avg = sum / data.length;
  return avg;
}

//

function drawControlChart(jsonArray) {
  console.log(jsonArray);
  let xAxisArray = jsonArray.map((object) => object.Date);
  let yAxisArray = jsonArray.map((object) => Number(object.Value));

  let xCopy = [...xAxisArray];
  let yCopy = [...yAxisArray];

  let yAxisSum = 0;
  for (let i = 0; i < yAxisArray.length; i++) {
    yAxisSum += yAxisArray[i];
  }
  let yAxisAverage = yAxisSum / yAxisArray.length;

  const bounds = standardDeviation(yAxisArray) * 3;

  let outOfBounds = jsonArray.filter((object) => {
    if (
      (object.Value > yAxisAverage + bounds) |
      (object.Value < yAxisAverage - bounds)
    ) {
      return { Date: object.Date, Value: object.Value };
    }
  });
  xOutofBounds = outOfBounds.map((object) => object.Date);
  yOutofBounds = outOfBounds.map((object) => object.Value);

  let sortedXAxisArray = xCopy.sort((a, b) => {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });
  let sortedYAxisArray = yCopy.sort((a, b) => {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });

  var Data = {
    type: "scatter",
    x: xAxisArray,
    y: yAxisArray,
    mode: "lines+markers",
    name: "Data",
    showlegend: true,
    hoverinfo: "all",
    line: {
      color: "blue",
      width: 2,
    },
    marker: {
      color: "blue",
      size: 8,
      symbol: "circle",
    },
  };

  var Viol = {
    type: "scatter",
    x: xOutofBounds,
    y: yOutofBounds,
    mode: "markers",
    name: "Violation",
    showlegend: true,
    marker: {
      color: "rgb(255,65,54)",
      line: { width: 3 },
      opacity: 0.5,
      size: 12,
      symbol: "circle-open",
    },
  };

  var CL = {
    type: "scatter",
    x: [
      sortedXAxisArray[0],
      sortedXAxisArray[sortedXAxisArray.length - 1],
      null,
      sortedXAxisArray[0],
      sortedXAxisArray[sortedXAxisArray.length - 1],
    ],
    y: [
      yAxisAverage - bounds,
      yAxisAverage - bounds,
      null,
      yAxisAverage + bounds,
      yAxisAverage + bounds,
    ],
    mode: "lines",
    name: "LCL/UCL",
    showlegend: true,
    line: {
      color: "red",
      width: 2,
      dash: "dash",
    },
  };

  var Centre = {
    type: "scatter",
    x: [sortedXAxisArray[0], sortedXAxisArray[sortedXAxisArray.length - 1]],
    y: [yAxisAverage, yAxisAverage],
    mode: "lines",
    name: "Centre",
    showlegend: true,
    line: {
      color: "grey",
      width: 2,
    },
  };

  var data = [Data, Viol, CL, Centre];

  var layout = {
    title: "Basic SPC Chart",
    xaxis: {
      zeroline: false,
    },
    yaxis: {
      range: [
        sortedYAxisArray[0] - bounds * 1.2,
        sortedYAxisArray[sortedYAxisArray.length - 1] + bounds * 1.2,
      ],
      zeroline: false,
    },
  };

  Plotly.newPlot("plot", data, layout);
}
