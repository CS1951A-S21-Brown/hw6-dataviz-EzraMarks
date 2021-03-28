/* GRAPH 3: NETWORK GRAPH OF CO-WORKING ACTORS */
graph3.innerWidth = graph3.width - graph3.margin.left - graph3.margin.right;
graph3.innerHeight = graph3.height - graph3.margin.top - graph3.margin.bottom;

graph3.svg = d3.select("#graph3")
    .append("svg")
    .attr("width", graph3.width)
    .attr("height", graph3.height)
    .append("g")
    .attr("transform", `translate(${graph3.margin.left}, ${graph3.margin.top})`);

// Creates references to SVG groups
graph3.titleLabel = graph3.svg.append("text");
graph3.edgesRef = graph3.svg.append("g");
graph3.nodesRef = graph3.svg.append("g");
graph3.tooltip = d3.select("#graph3")
    .append("div")
    .classed("tooltip", true)
    .style("opactity", 0);

graph3.cleanData = (data) => {
    const coworkersDict = {};
    const year = 1994; // TODO Make variable

    data.forEach(show => {
        if (show["type"] != "Movie") return;
        if (show["release_year"] != year) return;
        const coworkersString = show["cast"];
        const coworkersList = coworkersString.split(", ");
        coworkersList.forEach(actor => {
            if (!coworkersDict[actor]) {
                coworkersDict[actor] = new Set()
            }
            coworkersList.forEach(coworker => coworkersDict[actor].add(coworker));
        });
    });

    const nodesList = Object.keys(coworkersDict).map(actor => {
        return {"actor": actor};
    });

    const edgesList = []
    Object.keys(coworkersDict).forEach(actor => {
        coworkers = coworkersDict[actor];
        coworkers.forEach(coworker => {
            edgesList.push({"source": actor, "target": coworker})
        })
    })

    data = {"nodes": nodesList, "edges": edgesList};
    console.log(data);

    return data;
}

// Functions to simulate click-and-drag behavior for graph nodes
graph3.drag = d3simulation => {
    const startDrag = e => {
        if (!e.active) {
            d3simulation.alphaTarget(0.3).restart();
        }
        e.subject.fx = e.subject.x;
        e.subject.fy = e.subject.y;
    }

    const drag = e => {
        e.subject.fx = e.x;
        e.subject.fy = e.y;
    }

    const endDrag = e => {
        if (!e.active) {
            d3simulation.alphaTarget(0);
        }
        e.subject.fx = null;
        e.subject.fy = null;
    }
    
    return d3.drag()
        .on("start", startDrag)
        .on("drag", drag)
        .on("end", endDrag);
}

// On-hover behavior for graph nodes (displays tooltip)
graph3.mouseover = e => {
    // Increases size of node when hovering
    e.target.attributes.r.nodeValue *= 2;
    
    graph3.tooltip
        .html(e.target.textContent)
        .style("left", `${e.offsetX}px`)
        .style("top", `${e.offsetY + 20}px`)
        .classed("unselectable", true)
        .style("background-color", "white")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("box-shadow", `2px 2px 5px black`)
        .transition()
        .duration(200)
        .style("opacity", 0.95)
}

graph3.mouseout = e => {
    // Reduces size of node after hovering
    e.target.attributes.r.nodeValue /= 2;
    // Hides the tooltip
    graph3.tooltip.transition()
    .duration(200)
    .style("opacity", 0);
}

graph3.render = (startYear, endYear) => {
    d3.csv("./data/netflix.csv").then(data => {
        data = graph3.cleanData(data, startYear, endYear);

        const nodeObjects = data["nodes"].map(d => Object.create(d));
        const edgeObjects = data["edges"].map(d => Object.create(d));

        // Links together nodes and edges in the simulation
        const d3Simulation = d3.forceSimulation(nodeObjects)
            .force("link", d3.forceLink(edgeObjects).id(d => d["actor"]))
            .force("charge", d3.forceManyBody().strength(-50))
            .force("center", d3.forceCenter(graph3.innerWidth / 2, graph3.innerHeight / 2))
            .force("x", d3.forceX().strength(0.1))
            .force("y", d3.forceY().strength(0.1));
        
        // Renders the edges
        const edges = graph3.edgesRef.selectAll("line").data(edgeObjects);
        edges.enter()
            .append("line")
            .merge(edges)
            .text(d => d["movie"])
            .attr("stroke", colors.darkGray)
            .attr("stroke-opacity", 1)
            .attr("stroke-width", 1);
        edges.exit().remove();

        // Renders the node circles
        const nodes = graph3.nodesRef.selectAll("circle").data(nodeObjects);
        nodes.enter()
            .append("circle")
            .merge(nodes)
            .attr("r", 5)
            .attr("fill", colors.red)
            .call(graph3.drag(d3Simulation))
            .text(d => d["actor"])
            .on("mouseover", graph3.mouseover)
            .on("mouseout", graph3.mouseout)
            .attr("cursor", "grab");
        nodes.exit().remove();

        // Updates the position of the nodes and edges on every tick of the simulation
        d3Simulation.on("tick", () => {
            graph3.edgesRef.selectAll("line").data(edgeObjects)
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
            
            graph3.nodesRef.selectAll("circle").data(nodeObjects)
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        })

        // Adds chart title
        graph3.titleLabel
            .text("Actors Connected by Shared Film Appearances on Netflix")
            .classed("chart-title", true)
            .attr("transform", `translate(${graph3.innerWidth / 2}, ${-20})`);
    });
}

graph3.render(startYear, endYear);