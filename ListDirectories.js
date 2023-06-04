    // Fetch JSON data from the API endpoint
    fetch('http://127.0.0.1:5000/api/directories')
      .then(response => response.json())
      .then(data => {
	  
		// log the results
		console.log(data.name);
		
        // Get the element where you want to add the unordered list
        const listContainer = document.getElementById('list-container');

        // Create an unordered list element
        const ul = document.createElement('ul');

        // Iterate over the JSON data and create list items
        data.name.forEach(item => {
		  console.log(item)
          const li = document.createElement('li');
          li.textContent = item; // Assuming the JSON has a 'name' property
          ul.appendChild(li);
        });

        // Add the unordered list to the container element
        listContainer.appendChild(ul);
      })
      .catch(error => {
        console.error('Error:', error);
      });