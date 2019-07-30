import 'core-js/stable'
import 'regenerator-runtime/runtime'
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import igm from './igmdata.json'
import Choices from 'choices.js'
import '../node_modules/choices.js/public/assets/styles/choices.min.css'
import './components/choices.css'
import { wrangleQuestions, voteToVal, getConsensusRatio } from './utils/data'
import useBarChart from './effects/useBarChart.js'
import Table from './components/table.js'
import './index.css'
import { SwitchTransition } from 'react-transition-group'
import { SlideTransition, FadeTransition } from './components/transitions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons'

const App = () => {
  const [questions, setQuestions] = useState(wrangleQuestions(igm))
  const [selectedQuestion, setSelectedQuestion] = useState()
  const [tableType, setTableType] = useState('questions')
  const [voteFilter, setVoteFilter] = useState()
  const [isWeighted, setIsWeighted] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(true)

  useEffect(() => {
    if (selectedQuestion) setIsHelpOpen(false)
  }, [selectedQuestion])

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
    setIsHelpOpen(false)
    setSelectedQuestion(questions.find(q => q.id === id))
  }

  return (
    <div id="app">
      <div className="header">
        <h1>IGM Economic Experts Panel</h1>
        <h2>An Exploratory Vizualization Tool</h2>
      </div>
      <div className={classNames('help', { collapsed: !isHelpOpen })}>
        <div className="info">
          <div>
            <p>
              This tool uses data scraped from the{' '}
              <a href="http://www.igmchicago.org/igm-economic-experts-panel">
                IGM Economic Experts Panel
              </a>
              .
            </p>
            <p>
              The IGM Forum surveys participating economists on a number of
              economic related questions.
            </p>
            <p>
              By scraping the data we are able to do some additional analysis.
              For instance, each question below has a Consensus Ratio associated
              with it, which is a calculation of how much consensus there is on
              an answer to any given question.
            </p>
            <p>
              A rating of 1 indicates full consensus on an issue, while ratings
              approaching 0 indicate low consensus.
            </p>
            <p>Select a question below to begin</p>
          </div>
        </div>
        <div className="icon">
          <FontAwesomeIcon
            icon={faQuestionCircle}
            onClick={() => {
              if (!isHelpOpen) {
                setIsHelpOpen(true)
                setTableType('questions')
                setSelectedQuestion(null)
              }
            }}
          />
        </div>
      </div>
      <div className="charts">
        <div className="question-container">
          {selectedQuestion && (
            <div>
              <div className="chart-container">
                <svg id={'bar-chart'}></svg>
              </div>
              <p className="question">
                {selectedQuestion && selectedQuestion.question}
              </p>
            </div>
          )}
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
