/* GRAPH 2: AVERAGE RUNTIME OF MOVIES BY RELEASE YEAR */
graph2.innerWidth = graph2.width - graph2.margin.left - graph2.margin.right;
graph2.innerHeight = graph2.height - graph2.margin.top - graph2.margin.bottom;

graph2.svg = d3.select("#graph2")
    .append("svg")
    .attr("width", graph2.width)
    .attr("height", graph2.height)
    .append("g")
    .attr("transform", `translate(${graph2.margin.left}, ${graph2.margin.top})`);

// Creates reference to an SVG group which will be used for the plotted points
graph2.circlesRef = graph2.svg.append("g");
graph2.xTicksRef = graph2.svg.append("g");
graph2.yTicksRef = graph2.svg.append("g");
graph2.xLabel = graph2.svg.append("text");
graph2.yLabel = graph2.svg.append("text");
graph2.titleLabel = graph2.svg.append("text");
graph2.regressionRef = graph2.svg.append("path");

graph2.cleanData = (data, startYear, endYear) => {
    let durationCounter = {};

    data.forEach(show => {
        if (show["type"] !== "Movie") return;
        const releaseYear = parseInt(show["release_year"]);
        if ((releaseYear < startYear) || (releaseYear > endYear)) return;
        const duration = parseInt(show["duration"].split(" ")[0]);
        if (durationCounter[releaseYear]) {
            durationCounter[releaseYear]["durationSum"] += duration;
            durationCounter[releaseYear]["movieCount"] += 1;
        } else {
            durationCounter[releaseYear] = {"durationSum": duration, "movieCount": 1};
        }
    });

    const avgDurationList = Object.keys(durationCounter).map(year => {
        let avgDuration = durationCounter[year]["durationSum"] / durationCounter[year]["movieCount"];
        avgDuration = Math.round(avgDuration);
        return {"year": year, "avgDuration": avgDuration};
    });
    
    return avgDurationList;
}

graph2.render = (startYear, endYear) => {
    d3.csv("./data/netflix.csv").then(data => {
        data = graph2.cleanData(data, startYear, endYear);

        // Creates a linear scale for the x axis (release year)
        const numTicks = Math.min(graph2.maxNumTicks, endYear - startYear + 1);
        const x = d3.scaleLinear()
            .domain([startYear, endYear + 0.5])
            .range([0, graph2.innerWidth]);
        graph2.xTicksRef
            .attr("transform", `translate(0, ${graph2.innerHeight})`)
            .call(d3.axisBottom(x).ticks(numTicks, "d"))
            .classed("data-label", true);

        // Creates a linear scale for the y-axis (average runtime in minutes)
        const yMax = d3.max(data, d => d["avgDuration"]);
        const y = d3.scaleLinear()
            .domain([0, yMax + 10])
            .range([graph2.innerHeight, 0]);
        graph2.yTicksRef
            .call(d3.axisLeft(y))
            .classed("data-label", true);

        const circles = graph2.circlesRef.selectAll("circle").data(data);
        circles.enter()
            .append("circle")
            .merge(circles)
            .attr("cx", d => x(d["year"]))
            .attr("cy", d => y(d["avgDuration"]))
            .attr("r", 3.5)
            .attr("fill", colors.red);
        circles.exit().remove();
            
        // Adds x-axis label
        graph2.xLabel
            .text("Release Year")
            .classed("axis-label", true)
            .style("text-anchor", "middle")
            .attr("transform", `translate(${graph2.innerWidth / 2}, ${graph2.innerHeight + graph2.margin.bottom})`);
            
        // Adds y-axis label
        graph2.yLabel
            .text("Average Movie Runtime (minutes)")
            .classed("axis-label", true)
            .style("text-anchor", "middle")
            .attr("transform", `translate(${-60}, ${graph2.innerHeight / 2}) rotate(-90)`);
            
        // Adds chart title
        graph2.titleLabel
            .text(`Average Runtime of Movies on Netflix by Release Year (${releaseYearRange.start} - ${releaseYearRange.end})`)
            .classed("chart-title", true)
            .attr("transform", `translate(${graph2.innerWidth / 2}, ${-30})`);

        
        /* Draws regression line */

        const quadraticRegressionGenerator = d3.regressionQuad()
            .x(d => d["year"])
            .y(d => d["avgDuration"])
            .domain([startYear, endYear + 0.5]);

        const lineGenerator = d3.line()
            .x(d => x(d[0]))
            .y(d => y(d[1]));

        graph2.regressionRef
            .datum(quadraticRegressionGenerator(data))
            .attr("d", lineGenerator)
            .attr("stroke", colors.pink)
            .attr("stroke-width", "2px")
            .attr("fill", "none");











        
    });
}

graph2.render(releaseYearRange.start, releaseYearRange.end);