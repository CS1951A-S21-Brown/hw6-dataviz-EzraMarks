// Colors
const colors = {}
colors.red = "#E50914";
colors.darkRed = "#B20710";
colors.darkGray = "#292929";

const WIDTH = Math.min(960, window.innerWidth * 0.8);
const HEIGHT = 540;
const margin = {top: 40, right: 100, bottom: 40, left: 175};

// GRAPH 1
const graph1Width = WIDTH;
const graph1Height = HEIGHT;
const graph1NumExamples = 15;

// GRAPH 2
const graph2 = {};
graph2.width = WIDTH;
graph2.height = HEIGHT;
graph2.margin = margin;
graph2.maxNumTicks = 5; // NOTE: Must be multiple of 2 or 5

// GRAPH 3
const graph3 = {};
graph3.width = WIDTH
graph3.height = HEIGHT;
graph3.margin = margin;


let startYear = parseInt(document.getElementById("start-year").value);
function updateStartYear() {
    startYear = parseInt(document.getElementById("start-year").value);
    graph2.render(startYear, endYear);
}

let endYear = parseInt(document.getElementById("end-year").value);
function updateEndYear() {
    endYear = parseInt(document.getElementById("end-year").value);
    graph2.render(startYear, endYear);
}

// Reload the page when resizing the window to allow for dynamic graph sizes
window.onresize = () => location.reload();