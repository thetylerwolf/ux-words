import * as d3 from 'd3'

export default class Controller {

    static displayData(d, data) {
        var word = d.word,
            count = d.count,
            articles;

        articles = d.mentions;

        var container = d3.select('div.selected')

        container.select('.word')
            .html(word.charAt(0).toUpperCase() + word.slice(1))
            .append('span')
            .attr('class', 'count')
            .html(count + ' times, ' + d.mentions.length + ' articles')

        container.select('.articles')
            .selectAll('div.article').remove()

        container.select('.articles')
            .selectAll('div.article').data(articles)
            .enter().append('div')
            .attr('class', 'article')
            .html((article) => article.title)
            .append('span')
            .attr('class', 'count')
            .html((article) => article.count + ' times')

        container.select('.articles')
            .selectAll('span')
            .html((article) => article.count + ' times')

        container.select('.articles')
            .selectAll('div.article').data(articles)
            .exit().remove()
    }

}
