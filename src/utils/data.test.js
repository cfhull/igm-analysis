import { describe } from 'riteway'
import { voteToVal, wrangleQuestions, getConsensusRatio } from './data.js'

describe('getConsensusRatio()', async assert => {
  const responses = [
    { vote: 'Agree', confidence: 10 },
    { vote: 'Agree', confidence: 10 },
    { vote: 'Agree', confidence: 10 },
    { vote: 'Strongly Agree', confidence: 10 },
    { vote: 'Disagree', confidence: 5 },
  ]

  assert({
    given: 'responses unweighted',
    should: 'return unweighted consensus ratio',
    actual: getConsensusRatio(responses),
    expected: 0.8,
  })

  assert({
    given: 'responses weighted',
    should: 'return weighted consensus ratio',
    actual: getConsensusRatio(responses, true),
    expected: 0.889,
  })
})

describe('voteToVal()', async assert => {
  assert({
    given: 'Agree',
    should: 'return 1',
    actual: voteToVal('Agree'),
    expected: 2,
  })
})

describe('wrangleQuestions()', async assert => {
  const data = {
    data: [
      {
        question: 'test question 1',
        responses: [
          {
            participant: 'participant 1',
            vote: 'Agree',
            confidence: '10',
            comment: 'Test Comment',
          },
        ],
      },
    ],
  }

  assert({
    given: 'data',
    should: 'return questions',
    actual: wrangleQuestions(data),
    expected: [
      {
        id: 0,
        question: 'test question 1',
        responses: [
          {
            participant: 'participant 1',
            vote: 'Agree',
            confidence: 10,
            comment: 'Test Comment',
          },
        ],
        mean: 2,
        stdDev: 0,
      },
    ],
  })
})
