/***
 * Author: Tushar.Gupta
 */

/*** Global variables */
let globalAdjList = new Map();
const visitedTracker = new Map();

/*** Functions */
function main() {
    fetch('http://127.0.0.1:5000/api/directories')
        .then(response => response.json())
        .then(data => {
            console.log(data.name);

            const listContainer = document.getElementById('list-container');
            listContainer.addEventListener("click", renderGraph);

            const ul = document.createElement('ul');

            data.name.forEach(item => {
                console.log(item)
                const li = document.createElement('li');
                li.textContent = item;
                ul.appendChild(li);
            });

            listContainer.appendChild(ul);
        })
        .catch(error => {
            console.error('Error:', error);
        });

    const textbox1 = document.getElementById("filter-input");
    const submitBtn = document.getElementById("filter-button");

    submitBtn.addEventListener("click", function() {
        const value1 = textbox1.value;
        console.log("Text Box 1 value: ", value1);

        depthFirstSearchFilteredBroker(value1);
    });
}


/***
 * render graph reaches out to the python control server for a given folder.
 * the python in turn calls a go utility which returns a json string representing adjacency list of the module dependencies.
 * The adjacency list is then rendered as a graph on the webpage as vis.js network.
 */
function renderGraph(event) {
    globalAdjList = new Map();
    const clickedElement = event.target;

    const apiUrl = 'http://127.0.0.1:5000/api/adjacency-list?folder=' + clickedElement.textContent;

    console.log(apiUrl)

    fetch(apiUrl)
        .then(response => response.json())
        .then(adjacencyList => {
            console.log(adjacencyList)
            const nodes = new vis.DataSet();
            const edges = [];
            //const nodesInteract = new vis.DataSet();

            Object.keys(adjacencyList).forEach(source => {
                nodes.add({ id: source, label: source });


                adjacencyList[source].forEach(target => {
                    edges.push({ from: source, to: target, arrows: 'to' });
                });

                globalAdjList.set(source, adjacencyList[source])
            });

            const data = {
                nodes: nodes,
                edges: edges
            };

            const options = getOptions(nodes, edges)

            const container = document.getElementById("graph");
            const network = new vis.Network(container, data, options);

            network.on('click', function(properties) {
                var ids = properties.nodes;
                var clickedNodes = nodes.get(ids);
                console.log('clicked nodes:', clickedNodes);
                depthFirstSearchBroker(clickedNodes[0].label)
            });

            printAdjacencyList(globalAdjList);
        })
        .catch(error => {
            console.error('Error fetching adjacency list:', error);
        })
}

function printAdjacencyList(adjacencyList) {
    const json = JSON.stringify(Array.from(adjacencyList), null, 2)
    console.log(json)
    const div = document.getElementById('adjlist');
    div.textContent = "";
    div.textContent = json;
    console.log("VHVzaGFyRw==")
}

/**
 * depthFirstSearchBroker facilitates traversal the graph from given node in a dfs manner.
 * it does the traversal on global adjacency list, which is populated when an item on left navigation menu is clicked.
 * the initating process requires setting up a tracker map that initialises every node as having a value of false.
 * once traversal is done we have a new adj list representing the vertices which can be traversed from the source node.
 * this list is then rendered.
 */
function depthFirstSearchBroker(node) {
    for (let [key, value] of globalAdjList) {
        visitedTracker.set(key, false)
    }

    let spAdjList = new Map();
    depthFirstSearchFiltered(node, spAdjList, "")

    const nodes = new vis.DataSet();
    const edges = [];

    for (let [key, value] of spAdjList) {
        nodes.add({ id: key, label: key });

        spAdjList.get(key).forEach(target => {
            edges.push({ from: key, to: target, arrows: 'to' });
        });

    }

    const data = {
        nodes: nodes,
        edges: edges
    };

    const options = getOptions(nodes, edges)

    const container = document.getElementById("graph");
    const network = new vis.Network(container, data, options);
    printAdjacencyList(spAdjList)

}


/***
 * depthFirstSearchFilteredBroker facilitates traversal of the globalAdjList in a dfs manner however it is different in some aspects from depthFirstSearchBroker.
 * this is because it does not traverse from a given node, instead it traverses all nodes in graph exactly once.
 * if the vertex content has a specific content included it is then included in a new adjacency list, which is then rendered.
 */
function depthFirstSearchFilteredBroker(includeText) {
    for (let [key, value] of globalAdjList) {
        visitedTracker.set(key, false)
    }

    let spAdjList = new Map();

    for (let [key, value] of globalAdjList) {
        if (visitedTracker.get(key))
            continue;
        depthFirstSearchFiltered(key, spAdjList, includeText)
    }

    const nodes = new vis.DataSet();
    const edges = [];

    for (let [key, value] of spAdjList) {
        nodes.add({ id: key, label: key });

        spAdjList.get(key).forEach(target => {
            edges.push({ from: key, to: target, arrows: 'to' });
        });

    }

    const data = {
        nodes: nodes,
        edges: edges
    };

    const options = getOptions(nodes, edges)

    const container = document.getElementById("graph");
    const network = new vis.Network(container, data, options);

}

/***
 * traverse a node in a depth first order.
 * if includeText is not null, capture both the node which points to any node which has the included text , and the node with included text.
 * else capture all nodes reachable from source node and continue recursively on all adjacent node.
 * Once visited we mark the node visited tracker as true so the recursion ends eventually.
 */
function depthFirstSearchFiltered(node, spAdjList, includeText) {

    console.log(" node: " + node)
    if (visitedTracker.get(node)) {
        return;
    }

    visitedTracker.set(node, true);

    let listElements = globalAdjList.get(node);

    if (node == "nil")
        return

    if (includeText == "")
        spAdjList.set(node, listElements)

    listElements.forEach(item => {
        console.log("connected node: " + item)

        if (includeText != "" && item.includes(includeText)) {
            console.log(node + " - " + item)
            if (spAdjList.get(node) == null)
                spAdjList.set(node, [item])
            else
                spAdjList.set(node, spAdjList.get(node).concat(item));

            if (spAdjList.get(item) == null)
                spAdjList.set(item, ["nil"])
        }

        depthFirstSearchFiltered(item, spAdjList, includeText);
    });
}


// get options gives a way of dcorating the nodes and edges rendered by vis.js.
function getOptions(nodes, edges) {

    return {
        layout: {
            hierarchical: false
        },
        edges: {
            color: "#000000"
        },
        nodes: {
            color: {
                border: "#2B7CE9",
                background: "#97C2FC"
            }
        }
    };

}

/*** This starts the whole thing */
main()