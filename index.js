const d3 = require('d3')
const Promise = require('bluebird')
const $ = require('jquery')

const promiseCSV = Promise.promisify(d3.csv);

//set height and width of chart
const h = 255
const w = 480
const padding =20
let dataset = ''
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

//Submit ajax query to pull file names
$.get({
	url: '/data'
})
.done((data) =>{
	let dataSets = $(data).children()
	Array.prototype.forEach.call(dataSets, (dataset) =>{
		let data = $(dataset).first().text()
		$('#data-set').append(`<option value=${data}> ${data.split('.')[0]} </option>`)
	})

})

$('#data-set').on('change', (e)=>{
	dataset = e.target.value
	console.log(dataset)
})

$('#graph').on('click', (e) =>{

$('svg').remove()
$('#correlation').remove()

promiseCSV(`/data/${dataset}`)

.then((stats) => {
	console.log(stats.columns)
	//scrub data using helper function
	stats = stats.map(object => {
		return reduceXY(object, stats.columns[0], stats.columns[1], stats.columns[2])
	})

	//Using d3 methods min and max, get the maximum and minimum from the data set
	let xRange= [
	d3.min(stats, function(data){
		return data.x
	}),
	d3.max(stats, function(data){
		return data.x
	})
	]

	let yRange= [
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
		.range([padding, w-padding]) //range of possible output data values

	var yScale = d3.scaleLinear()
		.domain([yRange[0], yRange[1]])
		.range([h - padding, padding]) // reverse variables to invert y

	var svg = d3.select('#chart-space')

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

	return {
		correlation: correlation(stats),
		bestFit: 'notworking'
	}

})
.then(measures => {
	$('svg').on('click', '.dataDot', function(event){
		var rawVals = [$(this).attr('x'), $(this).attr('y')]
		var team = event.target.id
		$('.selected').removeClass('selected')
		$(this).addClass('selected')
		$('#rowName').text(team)
		$('#valX').text(rawVals[0])
		$('#valY').text(rawVals[1])
	})

	$('#stat-space').append(`<div id='correlation'>Correlation Coefficient: ${Math.round(measures.correlation*100)/100}</div>`)
})

})

