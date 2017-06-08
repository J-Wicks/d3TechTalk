const d3 = require('d3')
const Promise = require('bluebird')
const $ = require('jquery')

const promiseCSV = Promise.promisify(d3.csv);

//set height and width of chart
const h = 250
const w = 720

//helper function reducing objects to just x and y properties

const reduceXY = function(object, labelProp, xProp, yProp){
	let newObj = {}
	newObj.label = object[labelProp]
	newObj.x = Number(object[xProp])
	newObj.y = Number(object[yProp])
	return newObj
} 

//calculate correlation coefficient

const correlation = function(data) {
	let sumXY =0,
	sumX = 0,
	sumY = 0,
	sumXX = 0,
	sumYY = 0,
	n = data.length
	delete data.columns


	// capture sums for formula
	data.forEach(object => {
		sumXY += object.x * object.y
		sumX += object.x
		sumY += object.y
		sumXX += object.x*object.x
		sumYY += object.y*object.y


	})

	//execute correlation coefficient formula
	var r = ((n*sumXY) - (sumX*sumY))/Math.sqrt(((n*sumXX)-(sumX*sumX)) * ((n*sumYY)-(sumY*sumY)))

	return r
}

promiseCSV('stats.csv')

.then((stats) => {

	//scrub data using helper function
	stats = stats.map(object => {
		return reduceXY(object, 'Team', 'bullpenPercent', 'winPercent')
	})

	//Using d3 methods min and max, get the maximum and minimum from the data set
	const xRange= [
	d3.min(stats, function(data){
		return data.x
	}),
	d3.max(stats, function(data){
		return data.x
	})
	]

	const yRange= [
	d3.min(stats, function(data){
		return data.y
	}),
	d3.max(stats, function(data){
		return data.y
	})
	]
	//set x and y scales to normalize data into chart space
	var xScale = d3.scaleLinear()
		.domain([xRange[0], xRange[1]]) //range of possible input data values
		.range([0, w]) //range of possible output data values

	var yScale = d3.scaleLinear()
		.domain([yRange[0], yRange[1]])
		.range([h, 0]) // invert y axis

	var svg = d3.select('body')

		.append('svg')
		.attr("width", w)
		.attr('height', h) //assigning to variable allows us to capture a reference to the svg we've created to hold our data

	var circles = svg.selectAll('circle') //create empty references. Set reference variable for later use
		.data(stats) //bind data
		.enter() //return placeholder reference to new element
		.append('circle') //appends a circle to the DOM, at the end of the SVG element


	//Create Circles. Each circle will become an element on the DOM within the SVG 'canvas'
	circles.attr('cx', (stats) => {
		return (xScale(stats.x))
	})
	.attr('cy', (stats) =>{
		return (yScale(stats.y))
	} )
	.attr('r', 5+'px')
	.attr('class', 'dataDot')
	.attr('id', (stats) => {
		return stats.label
	})
	.attr('x', (stats) =>{
		return stats.x
	})
	.attr('y', (stats) =>{
		return stats.y
	})

	return correlation(stats)
})
.then(correlation => {
	$('svg').on('click', '.dataDot', function(event){
		var rawVals = [$(this).attr('x'), $(this).attr('y')]
		var team = event.target.id
		$('#rowName').text(team)
		$('#valX').text(rawVals[0])
		$('#valY').text(rawVals[1])
	})
	$('body').prepend(`<div>Correlation Coefficient: ${correlation}</div>`)
})