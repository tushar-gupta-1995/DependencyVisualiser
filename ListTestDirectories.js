function list_test_directories()
{
	// Fetch JSON data from the API endpoint
	fetch('http://127.0.0.1:5000/api/get_test_directories')
	  .then(response => response.json())
	  .then(data => {
	  
		// log the results
		console.log(data.structure);
		
		// Get the element where you want to add the unordered list
		const listContainer = document.getElementById('list-container');
		listContainer.addEventListener("click", renderTestCode);

		// Create an unordered list element
		const ul = document.createElement('ul');

		// Iterate over the JSON data and create list items
		data.structure.forEach(item => {
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
  }
  
function renderTestCode(event)
{
	const clickedElement = event.target;
	console.log(clickedElement.textContent);

	const apiUrl = 'http://127.0.0.1:5000//api/get_content?test_file='+clickedElement.textContent;

	console.log(apiUrl);

	fetch(apiUrl)
	  .then(response => response.json())
	  .then(data => {
		  test_code = data.content;
		  const formattedText = test_code.replace(/\n/g, '<br>');
		  document.getElementById("test_code").innerHTML = formattedText;
	  })
	  .catch(error => {
		console.error('Error fetching adjacency list:', error);
	  })
}

function extract_comments()
{
	console.log("hello");
	test_Code = document.getElementById("test_code").innerHTML;
	test_Code = test_code.replace('<br>',/\n/g);
	window.location.href = 'http://127.0.0.1:5000/api/extract_comments?test_code='+test_Code;
	//fetch(apiUrl)
}
	  
list_test_directories()