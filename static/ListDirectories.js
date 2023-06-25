let globalAdjList = new Map();
const visitedTracker = new Map();

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

// Event listener for submit button click
submitBtn.addEventListener("click", function() {
    const value1 = textbox1.value;

    // Perform actions with the textbox values
    console.log("Text Box 1 value: ", value1);

    depthFirstSearchFilteredBroker(value1);
});


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

            printAdjacencyList();
        })
        .catch(error => {
            console.error('Error fetching adjacency list:', error);
        })
}

function printAdjacencyList() {
    const json = JSON.stringify(Array.from(globalAdjList), null, 2)
    console.log(json)
    const div = document.getElementById('adjlist');
    div.textContent = "";
    div.textContent = json;
}

function depthFirstSearchBroker(node) {
    for (let [key, value] of globalAdjList) {
        visitedTracker.set(key, false)
    }

    let spAdjList = new Map();
    depthFirstSearch(node, spAdjList)

    const nodes = new vis.DataSet();
    const edges = [];
    //const nodesInteract = new vis.DataSet();

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
    //const nodesInteract = new vis.DataSet();

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


function depthFirstSearch(node, spAdjList) {
    if (visitedTracker.get(node)) {
        return;
    }

    visitedTracker.set(node, true);

    let listElements = globalAdjList.get(node);

    if (node == "nil")
        return

    console.log(node)

    spAdjList.set(node, listElements)

    listElements.forEach(item => {
        depthFirstSearch(item, spAdjList);
    });
}


function depthFirstSearchFiltered(node, spAdjList, includeText) {

    console.log(" node: " + node)
    if (visitedTracker.get(node)) {
        return;
    }

    visitedTracker.set(node, true);

    let listElements = globalAdjList.get(node);

    if (node == "nil")
        return

    listElements.forEach(item => {
        console.log("connected node: " + item)
        console.log("includes? " + includeText)
        if (item.includes(includeText)) {
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