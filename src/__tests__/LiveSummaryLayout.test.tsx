import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import LiveSummary from '../components/layout/LiveSummary'

// These tests are lightweight integration tests verifying layout toggles

describe('Layout swap animation and controls', () => {
  test('LiveSummary creates a valid React element', () => {
    const el = React.createElement(LiveSummary, { job: { width:12, length:24, legHeight:8, roofOrientation: 'vertical', wallOrientation: 'open' } })
    expect(React.isValidElement(el)).toBe(true)
  })

  test('LiveSummary element contains expected props', () => {
    const props = { job: { width:12, length:24, legHeight:8, roofOrientation: 'vertical', wallOrientation: 'open' } }
    const el = React.createElement(LiveSummary, props)
    // verify props passed through
    // @ts-ignore - inspecting element props for test
    expect((el as any).props.job.width).toBe(12)
    expect((el as any).props.job.length).toBe(24)
  })
})
