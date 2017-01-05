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
    { word: "Design", re: /\b(design[a-z]*)\b/gi },
    { word: "UX", re: /\b(ux[a-z]*)\b/gi },
    { word: "User", re: /\b(user[a-z]*)\b/gi },
    { word: "UI", re: /\b(ui[a-z]*)\b/gi },
    { word: "Interface", re: /\b(interface[a-z]*)\b/gi },
    { word: "Wrong", re: /\b(wrong[a-z]*)\b/gi },
    { word: "Right", re: /\b(right[a-z]*)\b/gi },
    { word: "Create", re: /\b(create[a-z]*)\b/gi },
    { word: "Problem", re: /\b(problem[a-z]*)\b/gi },
    { word: "Research", re: /\b(research[a-z]*)\b/gi },
    { word: "Understand", re: /\b(understand[a-z]*)\b/gi },
    { word: "HTML", re: /\b(html[a-z]*)\b/gi },
    { word: "Google", re: /\b(google[a-z]*)\b/gi },
    { word: "Facebook", re: /\b(facebook[a-z]*)\b/gi },
    { word: "Apple", re: /\b(apple[a-z]*)\b/gi },
    { word: "Engage", re: /\b(engage[a-z]*)\b/gi },
    { word: "Experience", re: /\b(experience[a-z]*)\b/gi },
    { word: "Chatbot", re: /\b(chatbot[a-z]*)\b/gi },
    { word: "Bot", re: /\b(bot[a-z]*)\b/gi },
    { word: "Usability", re: /\b(usability[a-z]*)\b/gi },
    { word: "Icon", re: /\b(icon[a-z]*)\b/gi },
    { word: "Invisible", re: /\b(invisible[a-z]*)\b/gi },
    { word: "Product", re: /\b(product[a-z]*)\b/gi },
    { word: "App", re: /\b(app[a-z]*)\b/gi },
    { word: "Process", re: /\b(process[a-z]*)\b/gi },
    { word: "Leadership", re: /\b(leadership[a-z]*)\b/gi },
    { word: "Management", re: /\b(management[a-z]*)\b/gi },
    { word: "Design Organization", re: /\b(leadership[a-z]*)\b/gi },
    { word: "Workflow", re: /\b(workflow[a-z]*)\b/gi },
    { word: "Tool", re: /\b(tool[a-z]*)\b/gi },
    { word: "Wireframe", re: /\b(wireframe[a-z]*)\b/gi },
    { word: "Prototype", re: /\b(prototype[a-z]*)\b/gi },
    { word: "Photoshop", re: /\b(photoshop[a-z]*)\b/gi },
    { word: "Sketch", re: /\b(sketch[a-z]*)\b/gi },
    { word: "Framer", re: /\b(framer[a-z]*)\b/gi },
    { word: "Code", re: /\b(code[a-z]*)\b/gi },
    { word: "Web", re: /\b(web[a-z]*)\b/gi },
    { word: "Work", re: /\b(work[a-z]*)\b/gi },
    { word: "Natural", re: /\b(natural[a-z]*)\b/gi },
    { word: "Expert", re: /\b(expert[a-z]*)\b/gi },
    { word: "Different", re: /\b(different[a-z]*)\b/gi },
    { word: "AI", re: /\b(ai[a-z]*)\b/gi },
    { word: "Conversational", re: /\b(conversational[a-z]*)\b/gi },
    { word: "Context", re: /\b(context[a-z]*)\b/gi },
    { word: "Mobile", re: /\b(mobile[a-z]*)\b/gi },
    { word: "Desktop", re: /\b(desktop[a-z]*)\b/gi },
    { word: "Automated", re: /\b(automated[a-z]*)\b/gi },
    { word: "Think", re: /\b(think[a-z]*)\b/gi },
    { word: "Material Design", re: /\b(material design[a-z]*)\b/gi },
    { word: "Computer", re: /\b(computer[a-z]*)\b/gi }
]

chartData.forEach(topic);

var xMax = d3.max(chartData.map(word => word.count))

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
    .alphaTarget(1)
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

    label = container.selectAll('text.label')

    label
        .style('font-size', (d) => Math.max(8, rScale(count(d) / 2)))
        .attr('transform', function(d) {
            var w = ( this.getBBox ? this.getBBox() : this.getBoundingClientRect() ).width
            return `translate( ${ -w/2 } , ${ rScale(count(d)) - Math.max(8, rScale(count(d)))/1.25 } )`
        })
        .style('width', (d) => 2.5 * rScale(count(d)))

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
    if (!d3.event.active) force.alphaTarget(1);
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

    t.x = width + 20
    t.y = -20

    chartData.push(t);

    // force.stop()
    redraw()
    // force.restart()
    // force.alphaTarget(1)
    click(t)

}
