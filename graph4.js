/* GRAPH 4: MAP OF TOTAL NUMBER OF FILMS ON NETFLIX BY COUNTRY */
graph4.innerWidth = graph4.width - graph4.margin.left - graph4.margin.right;
graph4.innerHeight = graph4.height - graph4.margin.top - graph4.margin.bottom;

graph4.svg = d3.select("#graph4")
    .append("svg")
    .attr("width", graph4.width)
    .attr("height", graph4.height)
    .append("g")
    .attr("transform", `translate(${graph4.margin.left}, ${graph4.margin.top})`);

// Creates references to SVG groups
graph4.mapRef = graph4.svg.append("g");
graph4.tooltip = d3.select("#graph4")
    .append("div")
    .classed("tooltip", true)
    .style("opacity", 0);

graph4.cleanData = (data) => {
    const countryShowCount = {}

    data.forEach(show => {
        const countryString = show["country"];
        const countryList = countryString.split(",").map(str => str.trim());

        countryList.forEach(country => {
            if (countryShowCount[country]) {
                countryShowCount[country] += 1;
            } else {
                countryShowCount[country] = 1;
            }
        });
    });

    // Manually renames countries which are not consistent across datasets
    countryShowCount["USA"] = countryShowCount["United States"];
    delete countryShowCount["United States"];
    countryShowCount["England"] = countryShowCount["United Kingdom"];
    delete countryShowCount["United Kingdom"];
    // Not meant to be a political statement
    countryShowCount["China"] += countryShowCount["Hong Kong"];
    delete countryShowCount["Hong Kong"];

    return countryShowCount;
}


// On-hover behavior for graph nodes (displays tooltip)
graph4.mouseover = e => {
    graph4.tooltip
        .html(e.target.textContent)
        .style("left", `${e.offsetX}px`)
        .style("top", `${e.offsetY + 20}px`)
        .classed("unselectable", true)
        .classed("data-label", true)
        .style("background-color", "white")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("box-shadow", `2px 2px 5px black`)
        .transition()
        .duration(200)
        .style("opacity", 0.95)
}

graph4.mouseout = e => {
    // Hides the tooltip
    graph4.tooltip.transition()
    .duration(200)
    .style("opacity", 0);
}

graph4.render = () => {
    d3.csv("./data/netflix.csv").then(data => {
        data = graph4.cleanData(data);

        const mapProjection = d3.geoMercator()
            .scale(100)
            .center([0, 25])
            .translate([graph4.innerWidth / 2, graph4.innerHeight / 2]);
        
        const color = d3.scaleThreshold()
        .domain([1, 10, 50, 100, 500, 1000])
        .range(d3.schemeReds[7]);

        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(world => {
            graph4.mapRef
                .selectAll("path")
                .data(world.features)
                .enter()
                .append("path")
                // Draws each country
                .attr("d", d3.geoPath().projection(mapProjection))
                // Sets the color of each country
                .attr("fill", d => {
                    num = data[d.properties.name] || 0;
                    return color(num);
                })
                .text(d => `${d.properties.name}: ${data[d.properties.name] || 0} titles`)
                .on("mouseover", graph4.mouseover)
                .on("mouseout", graph4.mouseout);
        });
    });
}

graph4.render();
