// Mock AI service. Swap for real API calls once AI modules are ready.

export async function askAIManager(question) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        response:
          'Two switchgear orders are missing the certification field required by spec section 26-24.',
        confidence: 0.94,
        citedSource: 'specifications.pdf, section 26-24'
      })
    }, 500)
  })
}

export async function getChatHistory() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: 'Switchgear certification' },
        { id: 2, title: 'Steel delivery delay' },
        { id: 3, title: 'Weekly summary request' }
      ])
    }, 200)
  })
}

export async function getRiskAnalysis() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        riskScore: 72,
        predictedCompletion: 'Mar 14, 2027',
        delayDays: 18,
        risks: [
          { variant: 'danger', title: 'Switchgear order missing certification field' },
          { variant: 'warning', title: 'Steel delivery trending 6 days late' },
          { variant: 'warning', title: 'Cooling tower commissioning pending' }
        ]
      })
    }, 300)
  })
}

export async function getComplianceResults() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        passRate: 85,
        passed: 17,
        failed: 3,
        items: [
          { name: 'Switchgear certification', status: 'passed' },
          { name: 'Cooling system spec compliance', status: 'passed' },
          { name: 'Vendor submittal review', status: 'failed' },
          { name: 'Electrical load calculation', status: 'passed' },
          { name: 'Fire suppression system', status: 'failed' }
        ]
      })
    }, 300)
  })
}

export async function getSimulationResults() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        scenarios: [
          {
            name: 'Steel Delivery Delay',
            description: 'What if steel delivery is delayed by 2 weeks?',
            result: '5 day schedule impact · +2 critical path days'
          },
          {
            name: 'Switchgear Shortage',
            description: 'What if switchgear order is delayed by 1 month?',
            result: '12 day schedule impact · +8 critical path days'
          },
          {
            name: 'Accelerate Grading',
            description: 'What if grading is accelerated by 1 week?',
            result: 'Recovers 7 days · reduces overall delay by 40%'
          }
        ]
      })
    }, 300)
  })
}