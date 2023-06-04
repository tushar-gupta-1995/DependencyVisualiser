    const apiUrl = 'http://127.0.0.1:5000/api/adjacency-list'; 

    fetch(apiUrl)
      .then(response => response.json())
      .then(adjacencyList => {
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
        const network = new vis.Network(container, data, options);
      })
      .catch(error => {
        console.error('Error fetching adjacency list:', error);
      })
