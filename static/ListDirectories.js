const globalAdjList = new Map();
const visitedTracker = new Map();

fetch('http://127.0.0.1:5000/api/directories')
    .then(response => response.json())
    .then(data => {
        console.log(data.name);

        const listContainer = document.getElementById('list-container');
        listContainer.addEventListener("click", renderGraph);
        listContainer.addEventListener('contextmenu', showContextMenu);
        listContainer.addEventListener('click', hideContextMenu);

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


function renderGraph(event) {
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


        })
        .catch(error => {
            console.error('Error fetching adjacency list:', error);
        })
}

const contextMenu = document.getElementById('contextMenu');

function showContextMenu(event) {
    const clickedElement = event.target;
    console.log(clickedElement.textContent);
    event.preventDefault();
    contextMenu.style.display = 'block';
    contextMenu.style.left = event.pageX + 'px';
    contextMenu.style.top = event.pageY + 'px';

    //   fetch('http://127.0.0.1:5000/api/set_test_directories?test_dir='+clickedElement.textContent)
    contextMenu.onclick = printAdjacencyList
}

function redirectToTestCasePage() {
    // window.location.href="{{ url_for('test_documentation_generator') }}"
    window.location.href = "http://localhost:5000/test_documentation_generator";
}



function hideContextMenu() {
    contextMenu.style.display = 'none';
    contextMenu.onclick = ""
}


function printAdjacencyList() {
    const json = JSON.stringify(Array.from(globalAdjList), null, 2)
    console.log(json)
    const div = document.getElementById('adjlist');
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