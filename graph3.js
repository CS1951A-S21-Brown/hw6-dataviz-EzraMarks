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
    .style("opacity", 0);

graph3.cleanData = (data, startYear, endYear) => {
    const coworkersDict = {};

    data.forEach(show => {
        // Only includes movies
        if (show["type"] != "Movie") return;
        // Only includes movies in the correct date range
        const releaseYear = parseInt(show["release_year"]);
        if ((releaseYear < startYear) || (releaseYear > endYear)) return;

        const coworkersString = show["cast"];
        const coworkersList = coworkersString.split(", ");
        coworkersList.forEach(actor => {
            if (!coworkersDict[actor]) {
                coworkersDict[actor] = {};
            }
            coworkersList.forEach(coworker => {
                // Skips adding the actor to their own list of coworkers
                if (actor == coworker) return;
                // Counts the number of occurences of this actor-coworker pairing
                if (!coworkersDict[actor][coworker]) {
                    coworkersDict[actor][coworker] = 1;
                } else {
                    coworkersDict[actor][coworker] += 1;
                }
            });
        });
    });

    const edgesList = []
    Object.keys(coworkersDict).forEach(actor => {
        coworkers = coworkersDict[actor];
        Object.keys(coworkers).forEach(coworker => {
            const collaborationCount = coworkers[coworker];
            // Only includes actor-coworker pairs who have collaborated on at least 2 films
            if (collaborationCount >= 2) {
                edgesList.push({"source": actor, "target": coworker})
            }
        })
    })

    const nodesSet = new Set();
    edgesList.forEach(edge => {
        nodesSet.add(edge.source);
        nodesSet.add(edge.target);
    })
    
    const nodesList = Array.from(nodesSet).map(actor => {
        return {"actor": actor};
    });

    data = {"nodes": nodesList, "edges": edgesList};
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
        .classed("data-label", true)
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
            // Pushes nodes toward the center of the screen
            .force("x", d3.forceX().strength(0.15))
            .force("y", d3.forceY().strength(0.15));
        
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
    });
}

graph3.render(actorYearRange.start, actorYearRange.end);