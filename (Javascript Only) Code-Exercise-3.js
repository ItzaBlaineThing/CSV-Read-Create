// Create an empty array that will hold the raw data after upload
var rawData = [];

// Create an emtpy array that will hold the filtered data after we sort it
var filteredData = [];

// Assuming that we require the first row to be headers
var headers = "";

// Create variables for each of our headers, we will use a function to find which column is which header
var userIdCol = 0;
var nameCol = 0;
var versionCol = 0;
var payerCol = 0;

// Create an empty array that will hold the various payers on the form, this will be used 
var payers = [];

// Function to read the CSV file that is uploaded
function readCSV(files) {
	console.log("Function readCSV() executed");
	// If a file is provided
	if (window.FileReader) {

		// Creates a new FileReader object and set it to reader
		let reader = new FileReader();
		// Read the first file uploaded
		reader.readAsText(files[0]);

		// If the readers contents are successfully loaded
		reader.onload = function(event) {
			// Raw content of the file
			let csv = event.target.result;
			// Separate the contents of csv for each newline
			let lines = csv.split(/\r\n|\n/);

			// Iterate through the lines array to separate the data for each column
			lines.forEach(function (line, index) {
				let row = lines[index].split(';');

				let col = [];

				for (let x = 0; x < row.length; x++) {
					col.push(row[x]);
				}

				rawData.push(col);
			})

			// Set the headers to be Row 1
			headers = rawData[0][0];
			// Separate the headers into seperate strings
			headers = headers.split(",");

			// Assign each header to its own variable so we can keep track of this header's column for dynamic filtering
			userIdCol = getItemCol("User ID", headers);
			nameCol = getItemCol("First and Last Name", headers);
			versionCol = getItemCol("Version", headers);
			payerCol = getItemCol("Insurance Company", headers);

			// Call filterPayers() function to see how many payers there are in the csv uploaded
			filterPayers();
			// Call filterData() function to separate the various payers contents into its own array which will be used for individual file creation
			filterData();

		}
	}

}

// Function to search through the headers(Row 1) to see which column the provided item is in
// Takes in item(String), Ex. "Insurance Company" and items(Array), Ex. the headers in row 1
function getItemCol(item, items) {
	var itemCol = "";
	for (let x = 0; x < items.length; x++) {
		if (items[x] === item) {
			itemCol = items.indexOf(items[x]);
			return itemCol;
		}
	}
}

function filterPayers() {

	// We're going to go down the column which is for the payers and adding the payer to the payers array
	// During the loop we filter out any duplicates
	rawData.forEach(function (rowString, index) {

		// Logic to skip the first iteration of the loop which is the headers(Row 1)
		if (index === 0) {
			return;
		}

		// Setting the row to a variable
		let rowArray = rowString[0];
		// Turning the various columns into their own string so we can target a specific column
		rowArray = rowArray.split(",");

		// If the payer is not 'undefined', then we can push it to the payers array
		if (rowArray[payerCol] !== undefined) {
			// Add the payer string to the payers array
			payers.push(rowArray[payerCol]);
		}
	})

	// Create a new array and store the values of the payers array with no duplicates
	// Convert the array of duplicates to a Set, the new Set will remove duplicates
	let filteredPayers = [...new Set(payers)];
	// Assign the filtered payers back to the payers array
	payers = filteredPayers;

}

function filterData() {

	// Create as many new arrays as there individual payers, we will use this to filter the data per payer
	for (let x = 0; x < payers.length; x++) {
		filteredData.push([]);
	}

	// Iterate through the whole data array, then for each payer push that to a new dynamic array
	rawData.forEach(function (rowString, index) {

		// Logic to skip the first iteration of the loop which is the headers(Row 1)
		if (index === 0) {
			return;
		}

		// Assign the row(rowString[0]) to the rowArray variable
		let rowArray = rowString[0];

		// Seperate each row indicated by the ','
		rowArray = rowArray.split(",");

		// Iterate through the payers array so we can check to see if this row is for this payer
		payers.forEach(function (payer, index) {
			if (rowArray[payerCol] === payers[index]) {
				filteredData[index].push(rowArray);
			}
		});
		
	});

	// Call filterIds() function which will remove any rows with duplicate User IDs, it will keep the row with the highest version number
	filterIds();
	// Call filterNames() function which will sort the names last and first ascending
	filterNames();
	console.log(filteredData);
}

// Function to sort the contents of each payer array by last and first name (ascending)
function filterNames() {

	// Iterate over each payer in the payers array
	payers.forEach(function (payer, index) {

		// Create an empty array that will be used to store the sorted names for this payers contents
		var names = [];

		// Iterate through filteredData array for this index(individual payers contents)
		filteredData[index].forEach(function (rowArray) {

			// Create an array that will hold the first and last name as two seperate strings
			// rowArray[nameCol].split(" ") is turning the one string with their first and last name into two strings("First", "Last")
			let nameArray = rowArray[nameCol].split(" ");
			// Add the last name to the names array
			names.push(nameArray[1]);
			// Sort the last names which are strings in the names array, this will be used to sort the order of this payers contents
			names = names.sort();

		});

		// Iterate through the names array
		names.forEach(function (name) {
			// Nested For Loop, used to iterate through each item in the filteredData for this payers contents
			filteredData[index].forEach(function (rowArray, rowIndex) {
				// If the name string("First Last") contains the name that comes first in the sorted names array
				// add this row to the end of the array. Adding it to the end as the name that comes first will be at the front
				if (rowArray[nameCol].includes(name)) {
					filteredData[index].push(rowArray);
					
				}
			});

		});

		// Iterate through the names array again, this time to remove the out of order rows
		names.forEach(function (name) {
			// Remove the rows for this payers contents from the beginning of the array, which will be the unsorted ones that we already
			// added to the end of the array in the previous For Loop
			filteredData[index].shift();
		})
	});
	
}

// Function which will remove any rows with duplicate User IDs, it will keep the row with the highest version number
function filterIds() {

	var ids = [];

	// Iterate over each payer in the payers array
	payers.forEach(function (payer, index) {
	
		// Iterate through filteredData array for this index(individual payers contents)
		filteredData[index].forEach(function (rowArray) {

			// Create an array that will hold the first and last name as two seperate strings
			// rowArray[nameCol].split(" ") is turning the one string with their first and last name into two strings("First", "Last")
			let idArray = rowArray[userIdCol];
			// Add the last name to the names array
			ids.push(idArray);

		});

		// Iterate through the ids array to check for any User IDs that are not a duplicate, if there is only one instance, we'll remove it
		// This will leave us with an array of ids that only has the duplicate User IDs
		ids.forEach(function (id, index) {
			// Call Function checkDuplicates, takes an array parameter and the item to be checked for being a duplicate
			var isDuplicate = checkDuplicates(ids, id);
			if (isDuplicate === 1) {
				ids.splice(index, 1);
			}
		});

	});

	// Iterate through the payers array for each payers contents
	payers.forEach(function (payer, index) {

		// Create an empty array that will be used to keep track of the versions
		let versions = [];
		// Create an empty array that will be used to hold the various rows for the duplicates
		let tempArray = [];
		// Create a variable that will be used to keep track of the highest version number
		// Assign it to an empty string, because if we used 0, that could be the first index of the loop
		var highestNumber = "";

		// Iterate through the ids array
		ids.forEach(function (id) {
			// Nested For Loop, used to iterate through each item in the filteredData for this payers contents
			filteredData[index].forEach(function (rowArray, rowIndex) {
				// If the id string("User ID") contains the id that is in the ids array
				// we're going to add the version number to the versions array
				// add the row containing the duplicate to the tempArray
				// finally remove the row containing the duplicate from the filtered data array so we can find the one with the highest version
				// before returning it to the filtered data
				if (rowArray[userIdCol].includes(id)) {
					versions.push(rowArray[versionCol]);
					tempArray.push(rowArray);
					filteredData[index].splice(rowIndex, 1);
					
				}
			});

			// Iterate through the versions array and check logic to find the highest version number
			versions.forEach(function (version, versionIndex) {
				// If the highestNumber variable has not yet been assigned to a version number or highestNumber is less than the current version
				// change the highestNumber value to the value of version
				if (highestNumber === "" || highestNumber <= version) {
					highestNumber = version;

				// Else If, the highestNumber is higher then the current version, then we don't need the current version since
				// its value is less, we can remove that so it won't be added back to the filteredData array that stores the payers contents
				} else if (highestNumber >= version) {
					versions.splice(versionIndex, 1);
					tempArray.splice(versionIndex, 1);
				}
			})

		});

		// Push the tempArray to the filtered data for this index, its ok that its out of order since we'll filter the names after
		filteredData[index].push(tempArray[0]);

	});
	
}

// Function that will be used to see if there are any duplicates in the array provided in the first param
// Takes an array parameter and the item to be checked for being a duplicate
function checkDuplicates(array, item) {
	var count = 0;
	for (let x = 0; x < array.length; x++) {
		if (array[x] === item) {
			count++;
		}
	}
	return count;
}

// Function to create the csv(s), it will create as many files as there are individual payers
function createCSV() {

	// Iterate through the payers array so each individual payers contents gets its own file
	payers.forEach(function (payer, index) {
		// Set the type of file content that is needed for a csv
		let csvContent = "data:text/csv;charset=utf-8,";

		// Iterate through the filteredData for this payer and build each row
		filteredData[index].forEach(function (rowArray) {
			let row = rowArray.join(",");
			csvContent += row + "\r\n";
		});

		// Create an encodeURI object using the csvContent variable
		var encodedUri = encodeURI(csvContent);
		// Create a link and add it to the document, this will be used to automatically download the files
		var link = document.createElement("a");
		// Set the href attribute to the encodedUri variable, which will use the csvContent value
		link.setAttribute("href", encodedUri);
		// Add the download attribute to the link with a variable payer name for the filename
		link.setAttribute("download", `${payer}.csv`);
		// Add the link to the document
		document.body.appendChild(link);

		// This will download the data file named "Payer_NAME.csv".
		link.click(); 
	});
}