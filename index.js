import * as d3 from 'd3'
import Circle from './Circle'
import Annulator from './Annulator'

// Register the 'custom' namespace prefix for our custom elements.
d3.namespaces.custom = 'https://d3js.org/namespace/custom'

var canvasWidth = 960,
    canvasHeight = 500

var randCount = Math.ceil(Math.random() * 10)

var annulators = [{
    rank: 1,
    count: randCount,
    speed: 0.02,
    angle: Math.random() * Math.PI/6
},{
    rank: 2,
    count: randCount * 2,
    speed: 0.01,
    angle: Math.random() * Math.PI/6
},{
    rank: 3,
    count: randCount * 3,
    speed: 0.005,
    angle: Math.random() * Math.PI/6
}]

var circles = []

var prevChildren, randomTimer, renewTimer

annulators = annulators.map(function(d,i) {
    var an = new Annulator(d.rank * 20 - Math.random() * 20, d.rank, d.count, d.speed)
    an.setAngle(d.angle)
    var randRadius = Math.random() * 6
    an.genChildren(Circle, Math.max(1, randRadius - d.rank))
    if(d > 0) {
        an.children.forEach(function(c) {
            c.managers = prevChildren
        })
    }
    prevChildren = an.children
    circles.push(an.children)
    return an
})

circles = d3.merge(circles)

// Add our 'custom' sketch element to the body.
var sketch = d3.select('body').append('custom:sketch')
    .attr('width', canvasWidth)
    .attr('height', canvasHeight)
    .call(custom)

sketch.selectAll('circle')
    .data(circles)
    .enter().append('custom:circle')
        .attr('x', function(d) { return canvasWidth/2 + d.position.x })
        .attr('y', function(d) { return canvasHeight/2 + d.position.y })
        .attr('radius', function(d) { return d.radius })
        .attr('strokeStyle', '#404B59')
        .attr('fillStyle', '#404B59')

function custom(selection) {
  selection.each(function() {
    var root = this,
        canvas = root.parentNode.appendChild(document.createElement('canvas')),
        context = canvas.getContext('2d')

    canvas.style.position = 'absolute'
    canvas.style.top = root.offsetTop + 'px'
    canvas.style.left = root.offsetLeft + 'px'

    d3.timer(redraw)

    // Clear the canvas and then iterate over child elements.
    function redraw() {

        d3.selectAll(root.children)
            .attr('x', function(d) { return canvasWidth/2 + d.position.x })
            .attr('y', function(d) { return canvasHeight/2 + d.position.y })
            // .attr('radius', 5)
            // .attr('strokeStyle', 'white')
          .transition()
            .duration(750)
            .ease(Math.sqrt)
            .attr('fillStyle', function(d) {
                    if(d.revoked) return 'white'
                    else if (d.lost) return 'red'
                    else if (d.renewed) return '#00C872'
                    else return '#404B59'
            })

      canvas.width = root.getAttribute('width')
      canvas.height = root.getAttribute('height')
      for (var child = root.firstChild; child; child = child.nextSibling) draw(child);
    }

    // For now we only support circles with strokeStyle.
    // But you should imagine extending this to arbitrary shapes and groups!
    function draw(element) {
      switch (element.tagName) {
        case 'circle': {
          context.strokeStyle = element.getAttribute('strokeStyle')
          context.fillStyle = element.getAttribute('fillStyle')
          context.beginPath()
          context.arc(element.getAttribute('x'),
            element.getAttribute('y'),
            element.getAttribute('radius'),
            0,
            2 * Math.PI)
          context.stroke()
          context.fill()
          break
        }
      }
    }
  })
}
