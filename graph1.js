/* GRAPH 1: NUMBER OF TITLES PER GENRE ON NETFLIX */
(() => {
    const width = graph1Width;
    const height = graph1Height;
    const numExamples = graph1NumExamples
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const svg = d3.select("#graph1")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    function cleanData(data, numExamples) {
        let genreCounts = {};
    
        // Counts the number of occurrences of each genre
        data.forEach(show => {
            const genreString = show["listed_in"];
            const genreList = genreString.split(", ");
            genreList.forEach(genre => {
                if (genreCounts[genre]) {
                    genreCounts[genre] += 1;
                } else {
                    genreCounts[genre] = 1
                }
            });
        });
    
        // Sorts the genre counts from highest to lowest and extract the desired number of examples
        let genreCountsList = Object.keys(genreCounts).map(genre => {
            return {"genre": genre, "count": genreCounts[genre]};
        });
        genreCountsList = genreCountsList.sort((a, b) => b.count - a.count);
        genreCountsList = genreCountsList.slice(0, numExamples);
        
        return genreCountsList;
    }
    
    d3.csv("./data/netflix.csv").then(data => {
        data = cleanData(data, numExamples);
    
        // Creates a linear scale for the x axis (number of occurrences)
        const max = d3.max(data, d => d["count"]);
        let x = d3.scaleLinear()
            .domain([0, max])
            .range([0, innerWidth]);
    
        // Creates a scale band for the y axis (genre)
        yDomain = data.map(d => d["genre"])
        let y = d3.scaleBand()
            .domain(yDomain)
            .range([0, innerHeight])
            .padding(0.1); // Improves readability
    
        // Adds genre labels to the y-axis
        svg.append("g")
            .call(d3.axisLeft(y).tickSize(0).tickPadding(10))
            .classed("data-label", true);
    
        // Defines color scale
        const color = d3.scaleOrdinal()
            .domain(data.map(d => d["genre"]))
            // TODO: Choose my own colors
            .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), data.length));
    
        const bars = svg.selectAll("rect").data(data);
        bars.enter()
            .append("rect")
            .merge(bars)
            .attr("fill", d => color(d["genre"]))
            .attr("x", x(0))
            .attr("y", d => y(d["genre"]))
            .attr("width", d => x(d["count"]))
            .attr("height", y.bandwidth());
        
        // Renders the bar number labels on the DOM
        const counts = svg.append("g").selectAll("text").data(data);
        counts.enter()
            .append("text")
            .merge(counts)
            .text(d => d.count)
            .attr("x", d => x(d.count) + 10) // Adds a small offset to the right edge of the bar
            .attr("y", d => y(d["genre"]) + 12) // Adds a small offset to the top edge of the bar
            .classed("data-label", true)
            .style("text-anchor", "start")
            
        // Adds x-axis label
        svg.append("text")
            .text("Number of Titles")
            .classed("axis-label", true)
            .style("text-anchor", "middle")
            .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + margin.bottom})`);
            
        // Adds y-axis label
        svg.append("text")
            .text("Genre")
            .classed("axis-label", true)
            .style("text-anchor", "left")
            .attr("transform", `translate(${-margin.left}, ${innerHeight / 2})`);
    
        // Adds chart title
        svg.append("text")
            .text("Number of Titles Per Genre on Netflix")
            .classed("chart-title", true)
            .attr("transform", `translate(${innerWidth / 2}, ${-20})`);
    });
})()