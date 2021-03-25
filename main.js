const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 175};

// GRAPH 1
const graph1Width = (MAX_WIDTH / 2) - 10;
const graph1Height = 250;
const graph1NumExamples = 10;

// GRAPH 2
const graph2 = {};
graph2.width = (MAX_WIDTH / 2) - 10;
graph2.height = 275;
graph2.margin = margin;
graph2.maxNumTicks = 5; // NOTE: Must be multiple of 2 or 5

// GRAPH 3
const graph3 = {};
graph3.width = MAX_WIDTH / 2;
graph3.height = 575;


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