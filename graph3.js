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

graph3.cleanData = (data) => { // TODO
    data = {
        nodes: [
            {actor: "Myriel"},
            {actor: "Napoleon"},
            {actor: "Mlle.Baptistine"},
            {actor: "Mme.Magloire"},
            {actor: "CountessdeLo"}
        ],
        edges: [
            {source: "Napoleon", target: "Myriel", movie: "New Republic"},
            {source: "Mme.Magloire", target: "Myriel", movie: "New Republic"},
            {source: "CountessdeLo", target: "Myriel", movie: "New Republic"},
            {source: "Mlle.Baptistine", target: "CountessdeLo", movie: "New Republic"}
        ]
    }

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

graph3.render = (startYear, endYear) => {
    d3.csv("./data/netflix.csv").then(data => {
        data = graph3.cleanData(data, startYear, endYear);

        const nodeObjects = data["nodes"].map(d => Object.create(d));
        const edgeObjects = data["edges"].map(d => Object.create(d));

        // Links together nodes and edges in the simulation
        const d3Simulation = d3.forceSimulation(nodeObjects)
            .force("link", d3.forceLink(edgeObjects).id(d => d["actor"]))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(graph3.innerWidth / 2, graph3.innerHeight / 2));
        
        // Renders the edges
        const edges = graph3.edgesRef.selectAll("line").data(edgeObjects);
        edges.enter()
            .append("line")
            .merge(edges)
            .text(d => d["movie"])
            .attr("stroke", "red")
            .attr("stroke-opacity", 1)
            .attr("stroke-width", 4);
        edges.exit().remove();

        // Renders the nodes
        const nodes = graph3.nodesRef.selectAll("circle").data(nodeObjects);
        nodes.enter()
            .append("circle")
            .merge(nodes)
            .text(d => d["actor"])
            .attr("r", 10)
            .attr("fill", "blue")
            .call(graph3.drag(d3Simulation));
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
            .text("Average Runtime of Movies on Netflix by Release Year")
            .classed("chart-title", true)
            .attr("transform", `translate(${graph3.innerWidth / 2}, ${-20})`);
    });
}

graph3.render(startYear, endYear);