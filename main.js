// Colors
const colors = {}
colors.red = "#E50914";
colors.darkRed = "#B20710";
colors.darkGray = "#292929";
colors.blue = "#44465F";
colors.darkBlue = "#131835"

const WIDTH = Math.min(960, window.innerWidth * 0.8);
const HEIGHT = 540;
const MARGIN = {top: 60, right: 100, bottom: 60, left: 175};

// GRAPH 1
const graph1Width = WIDTH;
const graph1Height = HEIGHT;
const graph1Margin = {top: 60, right: 100, bottom: 40, left: 200};
const graph1NumExamples = 15;

// GRAPH 2
const graph2 = {};
graph2.width = WIDTH;
graph2.height = HEIGHT;
graph2.margin = MARGIN;
graph2.maxNumTicks = 5; // NOTE: Must be multiple of 2 or 5

// GRAPH 3
const graph3 = {};
graph3.width = WIDTH
graph3.height = HEIGHT;
graph3.margin = MARGIN;


const releaseYearRange = {}
releaseYearRange.start = parseInt(document.getElementById("release-year-start").value);
releaseYearRange.end = parseInt(document.getElementById("release-year-end").value);
function updateReleaseYearRange() {
    releaseYearRange.start = parseInt(document.getElementById("release-year-start").value);
    releaseYearRange.end = parseInt(document.getElementById("release-year-end").value);
    graph2.render(releaseYearRange.start, releaseYearRange.end);
}

const actorYearRange = {}
actorYearRange.start = parseInt(document.getElementById("actor-year-start").value);
actorYearRange.end = parseInt(document.getElementById("actor-year-end").value);
document.getElementById("graph3-title").textContent =
    `Actors Connected by Shared Film Appearances* on Netflix (${actorYearRange.start} - ${actorYearRange.end})`
function updateActorYearRange() {
    actorYearRange.start = parseInt(document.getElementById("actor-year-start").value);
    actorYearRange.end = parseInt(document.getElementById("actor-year-end").value);
    document.getElementById("graph3-title").textContent =
        `Actors Connected by Shared Film Appearances* on Netflix (${actorYearRange.start} - ${actorYearRange.end})`
    graph3.render(actorYearRange.start, actorYearRange.end);
}

// Reload the page when resizing the window to allow for dynamic graph sizes
window.onresize = () => location.reload();
