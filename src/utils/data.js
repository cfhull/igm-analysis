import { mean, std } from 'mathjs'

const getValidResponses = question =>
  question.responses.filter(res => !['Did Not Answer'].includes(res.vote))

const voteToVal = vote =>
  ({
    'Strongly Disagree': 5,
    Disagree: 4,
    'No Opinion': 3,
    Uncertain: 3,
    Agree: 2,
    'Strongly Agree': 1,
  }[vote])

const wrangleQuestions = data => {
  const questions = data.data

  questions.forEach((question, i) => {
    question.id = i
    question.mean = mean(
      getValidResponses(question).map(r => voteToVal(r.vote))
    )
    question.stdDev =
      Math.round(
        (std(getValidResponses(question).map(x => voteToVal(x.vote))) +
          Number.EPSILON) *
          1000
      ) / 1000

    question.responses.forEach(res => {
      res.confidence = +res.confidence
    })
  })

  return questions
}

const getConsensusRatio = (responses, isWeighted) => {
  const data = responses.reduce(
    (a, b) => {
      const value = isWeighted ? +b.confidence : 1
      if (['Agree', 'Strongly Agree'].includes(b.vote)) {
        a.agree += value
      } else if (['Disagree', 'Strongly Disagree'].includes(b.vote)) {
        a.disagree += value
      } else if (['No Opinion', 'Uncertain'].includes(b.vote)) {
        a.uncertain += value
      }

      return a
    },
    {
      disagree: 0,
      uncertain: 0,
      agree: 0,
    }
  )
  return (
    Math.round(
      (Math.max(data.agree, data.disagree) /
        Object.values(data).reduce((a, b) => (a += b), 0) +
        Number.EPSILON) *
        1000
    ) / 1000
  )
}

/*
const names = [
  ...new Set(questions.flatMap(q => q.responses.map(r => r.participant))),
]

const participants = names.map(name => {
  const participantQuestions = questions.map(q => {
    const newq = { ...q }
    newq.response = q.responses.find(r => r.participant === name) || {}
    newq.diffFromMean = Math.abs(newq.mean - voteToVal(newq.response.vote))
    delete newq.responses
    return newq
  })
  return {
    name,
    questions: participantQuestions,
    meanDiffFromMean: mean(
      participantQuestions.filter(q => q.diffFromMean).map(q => q.diffFromMean)
    ),
  }
})
*/
//console.log(JSON.stringify(participants.sort((a, b) => b.meanDiffFromMean - a.meanDiffFromMean).map(p => [p.name, p.meanDiffFromMean]), null, 2))

/*
const averageParticipantCount = mean(
  questions.map(q => getValidResponses(q).length)
)
*/

/*

console.log(
  questions
    .map(q => ({
      questions: q.question,
      variance: calcVariance(q.responses.map(x => voteToVal(x.vote))),
    }))
    .sort((a, b) => b.variance - a.variance)
)

console.log(
  'Economists in agreement: '
  //`[${questionsWithLowVariance.length}/${questions.length}]`
)
console.log(
  'Economists in disagreement: '
  //`[${questionsWithHighVariance.length}/${questions.length}]`
)
console.log('Average Participant Count: ', Math.round(averageParticipantCount))
//console.log('Low Variance Questions: ', questionsWithLowVariance.map(x => x.question))
*/

export { wrangleQuestions, voteToVal, getConsensusRatio }
