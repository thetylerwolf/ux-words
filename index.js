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

const count = (topic) => +topic.count
const wordId = (topic) => topic.word
const textContent = (topic) => topic.word.charAt(0).toUpperCase() + topic.word.slice(1)

var label,
    countLabel,
    container,
    words,
    node

var chartData = [
    "Design",
    "People",
    "Product",
    "Time",
    "User",
    "Make",
    "Work",
    "Just",
    "Experience",
    "Need",
    "Most",
    "Material Design",
    "Think",
    "No",
    "Designer",
    "Different",
    "See",
    "Problem",
    "UX",
    "Information",
    "Right",
    "Team",
    "World",
    "Same",
    "Process",
    "Best",
    "Look",
    "Great",
    "Understand",
    "Products",
    "Human",
    "Research",
    "Interface",
    "Over",
    "Help",
    "Create",
    "Thinking",
    "Visual",
    "Feel",
    "Important",
    "Actually",
    "Using",
    "Making",
    "App",
    "Google",
    "Story",
    "Still",
    "Feedback",
    "Icons",
    "Facebook",
    "Apple"
]

chartData = chartData.map((word) => {
    return {
        word: word,
        re: new RegExp("\\b(" + word.toLowerCase() + ")\\b", "gi"),
        x: canvasWidth/2,
        y: canvasHeight/2
    }
})

chartData.forEach(topic)

var xMax = d3.max(chartData.map(word => word.count))

var force = d3.forceSimulation()
    .force('y', d3.forceY().strength(0.5).y(canvasHeight/2))
    .force('x', d3.forceX().strength(0.1).x(canvasWidth/2))
    .force('charge', d3.forceManyBody().strength(-0.3))
    // .force('center', d3.forceCenter(canvasWidth / 2, canvasHeight / 2))
    .force('collide', d3.forceCollide(function(d) {
            return rScale(count(d)) + 3
        })
        .iterations(8)
        .strength(1)
    )
    .alphaTarget(0)
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
        if(word) addTopic(word)
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

    container = d3.select('g.container')

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
        .style('font-size', (d) => Math.max(8, rScale(count(d) / 2)) + 'px')
        .attr('transform', function(d) {
            var w = ( this.getBBox ? this.getBBox() : this.getBoundingClientRect() ).width
            return `translate( ${ -w/2 } , ${ rScale(count(d)) - Math.max(8, rScale(count(d)))/1.25 } )`
        })
        .style('width', (d) => 2.5 * rScale(count(d)) + 'px')

    label = container.selectAll('text.label')

    // label
        // .style('font-size', (d) => {
        //     console.log('selected', this)
        //     return Math.max(8, rScale(count(d) / 2))
        // })
        // .attr('transform', function(d) {
        //     var w = ( this.getBBox ? this.getBBox() : this.getBoundingClientRect() ).width
        //     return `translate( ${ -w/2 } , ${ rScale(count(d)) - Math.max(8, rScale(count(d)))/1.25 } )`
        // })
        // .style('width', (d) => 2.5 * rScale(count(d)))

    nodeEnter.append('text', 'count')
        .attr('class', 'count')
        .text(count)

    countLabel = container.selectAll('text.count')

    countLabel
        .style('font-size', 10)
        .attr('transform', function(d) {
            var w = ( this.getBBox ? this.getBBox() : this.getBoundingClientRect() ).width
            return `translate( ${ -w/2 } , ${ Math.max(8, rScale(count(d)))/1.25 } )`
        })

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

function topic(topic) {
    topic.count = 0;
    topic.mentions = [];

    data.articles.forEach(function(article, idx) {
        var text = article.text,
            match,
            localCount = 0;

        topic.re.lastIndex = 0;

        while (match = topic.re.exec(text)) {
            ++topic.count;
            ++localCount;
        }

        if(localCount > 0) {
            topic.mentions.push({
                title: article.title,
                index: idx,
                count: localCount
            });
        }

    });

    return topic;
}


function addTopic(word) {

    var t = topic({ word: word, re: new RegExp("\\b(" + word.trim() + ")\\b", "gi")});

    var check = chartData.find(function(w) {
        return w.word.toLowerCase() === word.toLowerCase()
    })

    if(check) return click(check)

    t.x = width
    t.y = 0

    chartData.push(t);

    // force.stop()
    redraw()
    force.alpha(0.1)
    force.restart()
    // force.alphaTarget(1)
    click(t)

}
