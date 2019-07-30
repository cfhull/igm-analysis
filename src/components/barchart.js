import * as d3 from 'd3'
import './barchart.css'

const createBarChart = ({
  data,
  selector,
  margin = {
    top: 20,
    right: 20,
    bottom: 100,
    left: 50,
  },
  onBarClick,
}) => {
  let width
  let height

  const svg = d3
    .select(selector)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  const gradientPrimary = svg
    .append('defs')
    .append('linearGradient')
    .attr('id', 'gradient-primary')
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', 0)
    .attr('x2', 0)

  gradientPrimary
    .selectAll('stop')
    .data([
      { offset: 0, color: '#da645d', opacity: 1 },
      { offset: 1, color: '#da645d', opacity: 0.3 },
    ])
    .join('stop')
    .attr('offset', d => d.offset)
    .attr('stop-color', d => d.color)
    .attr('stop-opacity', d => d.opacity)

  const gradientSecondary = svg
    .select('defs')
    .append('linearGradient')
    .attr('id', 'gradient-secondary')
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', 0)
    .attr('x2', 0)

  gradientSecondary
    .selectAll('stop')
    .data([
      { offset: 0, color: '##4e4e56', opacity: 1 },
      { offset: 1, color: '##4e4e56', opacity: 0.3 },
    ])
    .join('stop')
    .attr('offset', d => d.offset)
    .attr('stop-color', d => d.color)
    .attr('stop-opacity', d => d.opacity)

  const xScale = d3
    .scaleBand()
    .domain(data.map(x => x.label))
    .padding(0.2)

  const yScale = d3
    .scaleLinear()
    .domain([0, 100 || data.reduce((a, b) => a + b.value, 0)])

  const xAxis = svg.append('g')

  const yAxis = svg.append('g')

  const bars = svg.append('g')

  d3.select(window).on(`resize.${selector}`, resize)

  update(data)

  function getDimensions(selector, margin) {
    return {
      width:
        parseInt(d3.select(selector).style('width')) -
        margin.left -
        margin.right,
      height:
        parseInt(d3.select(selector).style('height')) -
        margin.top -
        margin.bottom,
    }
  }

  function resize() {
    width = getDimensions(selector, margin).width
    height = getDimensions(selector, margin).height

    d3.select(selector)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)

    xScale.rangeRound([0, width])

    yScale.rangeRound([height, 0])

    xAxis
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale))

    yAxis.call(d3.axisLeft(yScale).ticks(5))

    gradientPrimary.attr('y1', yScale(100)).attr('y2', yScale(0))

    gradientSecondary.attr('y1', yScale(100)).attr('y2', yScale(0))

    bars
      .selectAll('rect')
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - yScale(d.value))
      .attr('x', d => xScale(d.label))
      .attr('y', d => yScale(d.value))

    bars
      .selectAll('text')
      .attr('x', d => xScale(d.label) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.value) - 5)
  }

  function update(newData) {
    if (!newData) newData = []
    resize()

    data = newData
    xScale.domain(data.map(x => x.label))

    xAxis
      .transition()
      .duration(500)
      .call(d3.axisBottom(xScale))

    xAxis
      .selectAll('text')
      .attr('text-anchor', 'end')
      .attr('transform', 'translate(-9, 0) rotate(-45)')

    bars
      .selectAll('g')
      .data(data)
      .join(
        enter => {
          const bar = enter.append('g')

          bar
            .append('rect')
            .attr('width', xScale.bandwidth())
            .attr('height', 0)
            .attr('x', d => xScale(d.label))
            .attr('y', height)
            .attr(
              'fill',
              d =>
                `url(#gradient-${
                  ['No Opinion', 'Did Not Answer'].includes(d.label)
                    ? 'secondary'
                    : 'primary'
                }`
            ) // !!! abstrct this to not use harded data values
            .on('click', d => onBarClick({ selector: selector, data: d }))
            .call(enter =>
              enter
                .transition()
                .duration(500)
                .attr('y', d => yScale(d.value))
                .attr('height', d => height - yScale(d.value))
            )
          bar
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('x', d => xScale(d.label) + xScale.bandwidth() / 2)
            .attr('y', 0)
            .text(d => d.value + '%')
            .call(text =>
              text
                .transition()
                .duration(500)
                .attr('y', d => yScale(d.value) - 5)
            )
          return bar
        },
        update => {
          update.select('rect').call(update =>
            update
              .transition()
              .duration(500)
              .attr('width', xScale.bandwidth())
              .attr('height', d => height - yScale(d.value))
              .attr('x', d => xScale(d.label))
              .attr('y', d => yScale(d.value))
          )
          update
            .select('text')
            .text(d => d.value + '%')
            .call(text =>
              text
                .transition()
                .duration(500)
                .attr('x', d => xScale(d.label) + xScale.bandwidth() / 2)
                .attr('y', d => yScale(d.value) - 5)
            )
          return update
        },
        exit => exit.remove()
      )

    return this
  }

  function cleanup() {
    d3.select(window).on(`resize.${selector}`, null)
  }

  return {
    update,
    cleanup,
  }
}

export default createBarChart
