import * as d3 from 'd3'
import * as data from './data/ux-words.json'
import Controller from './controller'

const canvasWidth = 960,
    canvasHeight = 500,
    padding = { top: 20, right: 20, bottom: 20, left: 20 },
    maxRadius = 70

const width = canvasWidth - padding.left - padding.right;
const height = canvasHeight - padding.top - padding.bottom;

var rScale = d3.scaleSqrt().range([0, maxRadius])

const count = (word) => +word.count
const wordId = (word) => word.word
const textContent = (word) => word.word.charAt(0).toUpperCase() + word.word.slice(1)

const collisionPadding = 4
const minCollisionRadius = 12
const jitter = 0.5

var label,
    countLabel,
    container,
    words,
    node

var excludeWords = ['the','to','a','of','and','you','is','in','your','not',
    'that','be','with','as','we','i','this','are','don’t','when','them',
    'their','was','if','my','one','has','so','because','these','our','by',
    'things','get','way','up','us','do','can','than','an','new','some','but',
    'there','at','even','other','who','or','they','what','about','out','it’s',
    'also','many','should','where','all','have','any','first','would',
    'better','use','you’re','its','now','more','something','will','how',
    'want','which','those','take','me','might','why','good','being','much',
    'every','for','it','go','well','really','too','been','only','each','had',
    'that’s','from','before','could','two','through','may','find','lot',
    'while','were','then','here','often','start','thing','back','on','into',
    'designers','users','like','they’re']

words = Object.keys(data.wordCount)
words = words.map((word) => {
    return {
        word: word,
        count: +data.wordCount[word]
    }
})
words.sort((a,b) => b.count - a.count)

var xMax = d3.max(words.filter(({word}) => excludeWords.indexOf(word) == -1).map(word => word.count))

var chartData = words.filter(({word}) => excludeWords.indexOf(word) == -1).slice(0,50);

var force = d3.forceSimulation()
    .force('y', d3.forceY(0))
    .force('gravity', d3.forceManyBody()
        // .strength(function(d) {
        //     return 10 * xMax/d.count
        // })
        .strength(80)
    )
    // .force('gravity', d3.forceManyBody().strength(1000))
    .force('charge', d3.forceManyBody())//.strength(0))
    .force('center', d3.forceCenter(canvasWidth / 2, canvasHeight / 2))
    .force('collide', d3.forceCollide(function(d) {
            return rScale(count(d)) + 3
        })
        .iterations(16)
        .strength(1)
    )
    .alphaTarget(0)
    // .size([width, height])
    .on('tick', tick)

init()
draw()

function init() {
    d3.select('#word-button')
        .on('click', function() {
            parseWord()
        })

    d3.select('#word-input')
        .on('keypress', function() {
            if(d3.event.keyCode !== 13) return
            parseWord()
        })

    function parseWord() {
        var word = document.getElementById('word-input').value
        document.getElementById('word-input').value = ''
        word = word.toLowerCase()
        if(word) addWord(word)
    }
}

function draw() {

    rScale.domain([0, xMax])

    d3.select('#chart')
            .selectAll('g.container')
            .data([chartData])
            .enter().append('g')
            .attr('class', 'container')
            .attr('transform', `translate( ${padding.left} , ${padding.top} )`)

    container = d3.select('.container')

    // label = container.selectAll('')
    redraw()

}

function redraw() {

    force.nodes(chartData)

    node = container.selectAll('.node')
        .data(chartData, wordId)

    node.exit().remove()

    var nodeEnter = node.enter()
        .append('a')
        .attr('class', 'node')
        // .attr('xlink:href', (d) => `${ encodeURIComponent(wordId(d)) }`)
        .on('click', click)
        .on('mouseover', mouseover)
        .on('mouseout', mouseout)
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

    node = container.selectAll('.node')

    nodeEnter
        .append('circle')
        .attr('r', (d) => rScale(count(d)))

    nodeEnter.append('text')
        .attr('class', 'label')
        .text(textContent)

    label = container.selectAll('text.label')

    label
        .style('font-size', (d) => Math.max(8, rScale(count(d) / 2)))
        .attr('transform', function(d) { return `translate( ${ -this.getBBox().width/2 } , ${ rScale(count(d)) - Math.max(8, rScale(count(d)))/1.25 } )` })
        .style('width', (d) => 2.5 * rScale(count(d)))

    nodeEnter.append('text', 'count')
        .attr('class', 'count')
        .text(count)

    countLabel = container.selectAll('text.count')

    countLabel
        .style('font-size', 10)
        .attr('transform', function(d) { return `translate( ${ -this.getBBox().width/2 } , ${ Math.max(8, rScale(count(d)))/1.25 } )` })

}

function dragstarted(d) {
    if (!d3.event.active) force.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) force.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

function click(d) {
    node.classed('active', (n) => wordId(n) == wordId(d) )
    Controller.displayData(d, data)
}

function mouseover(d) {
    node.classed('hover', (n) => wordId(n) == wordId(d))
}

function mouseout(d) {
    node.classed('hover', false)
}

function tick(e) {
    container.selectAll('.node')
        .attr('transform', (d) => `translate( ${ d.x }, ${ d.y } )`)
}

function addWord(word) {

    var check = chartData.find(function(w) {
        return w.word == word
    })
    if(check) return click(check)

    var newWord = words.find(function(w) {
        return w.word == word
    })

    if(!newWord) {
        newWord = {
            word: word,
            count: 0
        }
    }

    newWord.x = width + 20
    newWord.y = -20

    chartData.push(newWord)

    force.stop()
    redraw()
    force.restart()
    force.alphaTarget(1)
}
