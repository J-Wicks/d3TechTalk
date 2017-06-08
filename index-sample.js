const d3 = require('d3')
const Promise = require('bluebird')

let dataset = []

// d3.select("body") //select the body as our target
// 	.append("p") // 'append' to the target (body) a paragraph element
// 	.text("New paragraph!") //set the text of the new element


//d3 will access data as an array. You can create an array on the fly and use d3 to visualize it
//or you can use JSON:

// d3.json("waterfallVelocities.json", function(json) {
//     console.log(json);  //Log output to console
// });

//We can also use the ".csv" method to pull in the csv rows as a javascript data array. 
//this makes it easier to use outside data sources, such as our stats.csv file
//This array will have as many objects as there are rows in the CSV, as well as a "columns" array with the header info.

d3.csv("stats.csv", function(data) {
    console.log('from async',data);
}); 

//IMPORTANT: d3.csv is ASYNC. We can use the bluebird library to promisify

const promiseCSV = Promise.promisify(d3.csv);

promiseCSV('stats.csv')
.then( data => {
	dataset = data;
	// console.log('from promise',data)
	return data
})

//both will work the same! Thanks Bluebird!

//Rendering Data

.then((stats) => {
	console.log('stats',stats)
	d3.select("body")
	.selectAll("p") //But none yet exist?? Hmm..
	.data(stats) //what data do we want to use?
	.enter() //looks at current DOM Selection (selectAll) and then creates new placeholder element for each item in dataset without a matching selected element
	.append("svg") //fills empty placeholder element with a new element
	
	.text(function(statRow){return statRow.Team}) 
	//sets text of new element
	//how does text get the data? the .data method provides a reference to the data element being rendered, which can only be accessed in the context of a function

	.attr("class", "dataDot")
	.attr('id', statRow => {
		return statRow.shortName
	}) //We can set attributes using the attr tag. This will help us style data in our CSS
	.style('height', (statRow) =>{
		return statRow.winPercent * 1000 + "px"
	}) //We can also set style. While inline style is typically not utilized, this will allow us to easily set the dimensions of our DOM elements
})

	








