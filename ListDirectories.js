
    fetch('http://127.0.0.1:5000/api/directories')
      .then(response => response.json())
      .then(data => {
	  
		// log the results
		console.log(data.name);
		
        
        const listContainer = document.getElementById('list-container');

        
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
