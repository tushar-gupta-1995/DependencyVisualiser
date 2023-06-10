
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
	  
	  
	  function renderGraph(event)
	{
		const clickedElement = event.target;
		
		const apiUrl = 'http://127.0.0.1:5000/api/adjacency-list?folder='+clickedElement.textContent;
		
		console.log(apiUrl)

		fetch(apiUrl)
		  .then(response => response.json())
		  .then(adjacencyList => {
			console.log(adjacencyList)
			const nodes = [];
			const edges = [];

			Object.keys(adjacencyList).forEach(source => {
			  nodes.push({ id: source, label: source });
			  

			  adjacencyList[source].forEach(target => {
				edges.push({ from: source, to: target, arrows: 'to' });
			  });
			});

			const data = {
			  nodes: nodes,
			  edges: edges
			};

			const options = {
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

			const container = document.getElementById("graph");
			new vis.Network(container, data, options);
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
  
  fetch('http://127.0.0.1:5000/api/set_test_directories?test_dir='+clickedElement.textContent)
  contextMenu.onclick=redirectToTestCasePage
}

function redirectToTestCasePage() {
	window.location.href="test_documentaion_generator.html"
}



function hideContextMenu() {
  contextMenu.style.display = 'none';
  contextMenu.onclick=""
}
 
 

