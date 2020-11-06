function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// Create the buildCharts function.
function buildCharts(sample) {
  // Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // Create a variable that holds the samples array. 
    var samples = data.samples;
    // Create a variable that filters the samples for the object with the desired sample number.
    var samplesArray = samples.filter(samplesObj => samplesObj.id == sample);
    // Create a variable that filters the metadata array for the object with the desired sample number.
    var meta = data.metadata;
    var metaArray = meta.filter(samplesObj => samplesObj.id == sample);
    // Create a variable that holds the first sample in the array.
    var samplesResult = samplesArray[0];
    // Create a variable that holds the first sample in the metadata array.
    var metaResult = metaArray[0];
    // Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otuIds = samplesResult.otu_ids;
    var otuLabels = samplesResult.otu_labels;
    var sampleValues = samplesResult.sample_values;
    // Create a variable that holds the washing frequency.
    var washFrequency = parseFloat(metaResult.wfreq)
    // Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    // so the otu_ids with the most bacteria are last.
    var yticks = otuIds.slice(0,10).reverse().map(samplesObj => "OTU "+samplesObj.toString());
    var xticks = sampleValues.slice(0,10).reverse();
    // Create the trace for the bar chart. 
    var barData = [{
      x: xticks,
      y: yticks,
      text: otuLabels,
      type: "bar",
      orientation: "h"
    }];
    // Create the layout for the bar chart. 
    var barLayout = {
      title: "<b>Top 10 Bacteria Cultures Found<b>",
      margin: true
    };
    // Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout);
    // Create the trace for the bubble chart.
    var bubbleData = [{
      x: otuIds,
      y: sampleValues,
      text: otuLabels,
      mode: "markers",
      marker: {
        color: otuIds,
        size: sampleValues
      }
    }];
    // Create the layout for the bubble chart.
    var bubbleLayout = {
      title: "<b>Bacteria Cultures per Sample<b>",
      hovermode: true,
      xaxis: {
        title: "OTU ID"
      },
      margin: true
    };
    // Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);
    // Create the trace for the gauge chart.
    var gaugeData = [{
      domain : {
        x: [0,1],
        y: [0,1]
      },
      value: washFrequency,
      type: "indicator",
      mode: "gauge+number",
      gauge: {
        bar: {color: "black"},
        axis: {range: [0,10]},
        steps: [
          {range: [0,2], color: "red"},
          {range: [2,4], color :"orange"},
          {range: [4,6], color: "yellow"},
          {range: [6,8], color: "limegreen"},
          {range: [8,10], color: "darkgreen"}
        ],
      margin: true
      }
    }];
    // Create the layout for the gauge chart.
    var gaugeLayout = {
      title: "<b>Belly Washing Frequency</b><br>Scrubs per Week",
    };
    // Use Plotly to plot the data with the layout.
    Plotly.newPlot("gauge", gaugeData, gaugeLayout);
  });
}