import { useState, useEffect } from 'react'
import createBarChart from '../components/barChart.js'

export default function useBarChart(selectedQuestion, isWeighted, onBarClick) {
  const [chart, setChart] = useState()

  useEffect(() => {
    if (!selectedQuestion) {
      setChart(null)
      return
    }
    const data = selectedQuestion.responses.reduce((a, b) => {
      const value = isWeighted ? +b.confidence : 1
      const d = a.find(a => a.label === b.vote)
      if (d) d.value += value
      return a
    }, initData(isWeighted))

    const total = isWeighted
      ? data.reduce((a, b) => (a += b.value), 0)
      : selectedQuestion.responses.length

    data.forEach(d => (d.value = Math.round((d.value / total) * 100)))

    const newChart = chart
      ? chart.update(data)
      : createBarChart({
          data,
          selector: '#bar-chart',
          onBarClick,
        })

    setChart(newChart)
  }, [selectedQuestion, isWeighted])

  return chart
}

function initData(isWeighted) {
  return [
    { label: 'Strongly Disagree', value: 0 },
    { label: 'Disagree', value: 0 },
    { label: 'Uncertain', value: 0 },
    { label: 'Agree', value: 0 },
    { label: 'Strongly Agree', value: 0 },
    ...(isWeighted
      ? []
      : [
          { label: 'No Opinion', value: 0 },
          { label: 'Did Not Answer', value: 0 },
        ]),
  ]
}
