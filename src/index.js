import 'core-js/stable'
import 'regenerator-runtime/runtime'
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import igm from './igmdata.json'
import Choices from 'choices.js'
import '../node_modules/choices.js/public/assets/styles/choices.min.css'
import './components/choices.css'
import { wrangleQuestions, voteToVal, getConsensusRatio } from './utils/data'
import useBarChart from './effects/useBarChart.js'
import Table from './components/table.js'
import './index.css'
import { SwitchTransition } from 'react-transition-group'
import { SlideTransition } from './components/transitions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

const App = () => {
  const [questions, setQuestions] = useState(wrangleQuestions(igm))
  const [selectedQuestion, setSelectedQuestion] = useState()
  const [tableType, setTableType] = useState('questions')
  const [voteFilter, setVoteFilter] = useState()
  const [isWeighted, setIsWeighted] = useState(false)

  useBarChart(selectedQuestion, isWeighted, data => {
    setVoteFilter(data)
    setTableType('participants')
  })

  useEffect(() => {
    const topics = new Choices('#topics', {
      choices: [...new Set(questions.map(q => q.topic))].map(topic => ({
        value: topic,
        label: topic,
      })),
      itemSelectText: '',
    })

    topics.passedElement.element.addEventListener('addItem', e => {
      setQuestions(
        e.detail.value === 'All Topics'
          ? questions
          : questions.filter(q => q.topic === e.detail.value)
      )
    })
  }, [])

  const rowClickHandler = id => {
    setSelectedQuestion(questions.find(q => q.id === id))
  }

  return (
    <div id="app">
      <div className="charts">
        <div className="question-container">
          <div className="chart-container">
            <svg id={'bar-chart'}></svg>
          </div>
          <p className="question">
            {selectedQuestion
              ? selectedQuestion.question
              : 'Select a question from below'}
          </p>
        </div>
      </div>
      <div className="controls">
        <label className="topic-selector">
          Filter By Topic:
          <select id="topics">
            <option value="All Topics">!-- All Topics --!</option>
          </select>
        </label>
        <label className="weighted-toggle">
          Weight By Confidence
          <input
            type="checkbox"
            onChange={e => setIsWeighted(e.currentTarget.checked)}
            checked={isWeighted}
          />
        </label>
        {selectedQuestion && (
          <button
            type="button"
            id="questions"
            onClick={() =>
              setTableType(
                tableType === 'questions' ? 'participants' : 'questions'
              )
            }
          >
            {tableType === 'questions' ? (
              <>View Responses</>
            ) : (
              <>
                <FontAwesomeIcon icon={faArrowLeft} /> Back To Questions
              </>
            )}
          </button>
        )}
      </div>
      <SwitchTransition>
        <SlideTransition key={tableType}>
          {tableType === 'questions' ? (
            <Table
              headers={['Topic', 'Question', 'Consensus Ratio']}
              rows={questions.map(q => ({
                id: q.id,
                values: [
                  { key: 'Topic', label: q.topic },
                  { key: 'Question', label: q.question },
                  {
                    key: 'Consensus Ratio',
                    label: getConsensusRatio(q.responses, isWeighted).toFixed(
                      3
                    ),
                    className: 'number',
                  },
                ],
              }))}
              rowClickHandler={rowClickHandler}
            />
          ) : (
            tableType === 'participants' && (
              <Table
                headers={[
                  'Participant',
                  'University',
                  'Vote',
                  'Confidence',
                  'Comment',
                ]}
                rows={(() => {
                  const filteredResponses = voteFilter
                    ? selectedQuestion.responses.filter(
                        r => r.vote === voteFilter.data.label
                      )
                    : selectedQuestion.responses

                  return filteredResponses.map((r, i) => ({
                    id: i,
                    values: [
                      { key: 'Participant', label: r.participant },
                      { key: 'University', label: r.university },
                      {
                        key: 'Vote',
                        label: r.vote,
                        value: voteToVal(r.vote) || null,
                      },
                      {
                        key: 'Confidence',
                        label: r.confidence,
                        className: 'number',
                      },
                      { key: 'Comment', label: r.comment },
                    ],
                  }))
                })()}
              />
            )
          )}
        </SlideTransition>
      </SwitchTransition>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
