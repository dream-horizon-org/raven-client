const express = require('express')
const cors = require('cors')

// Import mock data for Bottomsheet, Tooltip, and Popup screens
const {BOTTOM_SHEET_MOCK_DATA} = require('./bottomSheetMockData')
const {TOOLTIP_MOCK_DATA} = require('./tooltipMockData')
const {POP_UP_MOCK_DATA} = require('./popUpMockData')

const app = express()
const PORT = process.env.MOCK_SERVER_PORT || 4000

app.use(cors())
app.use(express.json())

function buildCombinedMockResponse() {
  const bottom = BOTTOM_SHEET_MOCK_DATA || {}
  const tooltip = TOOLTIP_MOCK_DATA || {}
  const popup = POP_UP_MOCK_DATA || {}

  const bottomData = bottom.data || {}
  const tooltipData = tooltip.data || {}
  const popupData = popup.data || {}

  return {
    data: {
      ctas: [
        ...(Array.isArray(bottomData.ctas) ? bottomData.ctas : []),
        ...(Array.isArray(tooltipData.ctas) ? tooltipData.ctas : []),
        ...(Array.isArray(popupData.ctas) ? popupData.ctas : []),
      ],
      behaviourTags: [
        ...(Array.isArray(bottomData.behaviourTags)
          ? bottomData.behaviourTags
          : []),
        ...(Array.isArray(tooltipData.behaviourTags)
          ? tooltipData.behaviourTags
          : []),
        ...(Array.isArray(popupData.behaviourTags)
          ? popupData.behaviourTags
          : []),
      ],
    },
  }
}

/**
 * State machine bootstrap endpoint
 * Matches: POST {baseUrl}/cta/active/state-machines/
 */
app.post('/cta/active/state-machines/', (req, res) => {
  console.log(
    '[mock-server] Received state machines init request with body:',
    JSON.stringify(req.body, null, 2),
  )

  const response = buildCombinedMockResponse()
  res.json(response)
})

app.post('/cta/state-machines/snapshot/delta/', (req, res) => {
  console.log(
    '[mock-server] Received delta snapshot payload:',
    JSON.stringify(req.body, null, 2),
  )
  res.status(204).send()
})

app.listen(PORT, () => {
  console.log(
    `[mock-server] Raven mock server running on http://localhost:${PORT}`,
  )
  console.log('[mock-server] Expected endpoints:')
  console.log(
    '  POST /cta/active/state-machines/                -> returns mock CTAs',
  )
  console.log(
    '  POST /cta/state-machines/snapshot/delta/        -> accepts delta snapshot',
  )
})
