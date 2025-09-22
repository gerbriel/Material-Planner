import React from 'react'
import { useAtom } from 'jotai'
import Topbar from './components/layout/Topbar'
import JobAutosave from './components/layout/JobAutosave'
import { computeTrussCount, computeLegCount, estimateBraces } from './lib/calc/framing'
import { roofPanelSheets } from './lib/calc/panels'
import { computeHorizontalPanelSummary, formatPanelsSummaryString } from './lib/calc/horizontalPanels'
import { computeWallsAggregate } from './lib/calc/wallsAggregate'
import { breakdownTrims } from './lib/calc/trims'
import { countAnchorsDetailed } from './lib/calc/anchors'
import { computeOpeningReinforcement } from './lib/calc/openings'
import { formatFeetToFtIn } from './lib/format/length'
// Sidebar removed; navigation moved to Topbar
import Page from './components/layout/Page'
import ThemePreview from './pages/ThemePreview'
import TwoPane from './components/TwoPane'
import { stepAtom, jobAtom, rightColWidthAtom, layoutOrderAtom, asideHeightAtom, selectedWidgetAtom, stackedAtom, mainWidthAtom, mainHeightAtom } from './state/atoms'
import { computeKeyboardEffects } from './lib/keyboard'
import LiveSummary from './components/layout/LiveSummary'
// Lean-to editors are rendered inline within StepBuilding
import StepNav from './components/ui/StepNav'
import AppGrid from './components/AppGrid'
import StepBuilding from './components/forms/StepBuilding'
import StepOpenings from './components/forms/StepOpenings'
import StepReview from './components/forms/StepReview'
import ThemeFab from './components/layout/ThemeFab'
import { jobSchema } from './state/schema'
import DocumentHead from './components/layout/DocumentHead'

const steps = [
  { id: 1, title: 'Building' },
  { id: 2, title: 'Review' }
]

export default function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/'
  if (path === '/theme-preview') return <ThemePreview />
  if (path === '/two-pane') return <TwoPane />

  const [step, setStep] = useAtom(stepAtom)
  const [job, setJob] = useAtom(jobAtom)
  const [rightWidth, setRightWidth] = useAtom(rightColWidthAtom)
  const [layoutOrder, setLayoutOrder] = useAtom(layoutOrderAtom)
  const [asideHeight, setAsideHeight] = useAtom(asideHeightAtom)
  const [selectedWidget, setSelectedWidget] = useAtom(selectedWidgetAtom)
  const [mainWidth, setMainWidth] = useAtom(mainWidthAtom)
  const [mainHeight, setMainHeight] = useAtom(mainHeightAtom)

  const [stacked, setStacked] = useAtom(stackedAtom)
  const announcerRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!announcerRef.current) return
    announcerRef.current.setAttribute('aria-live', 'polite')
  }, [])

  const appGridInitialTiles = React.useMemo(() => {
    const mainTile = {
      id: 'main',
      label: 'Main',
      content: (
        <Page>
          {step === 1 && <StepBuilding />}
          {step === 2 && <StepReview />}
        </Page>
      )
    }

    // When reviewing (step 2) return only the main Review tile so the page focuses
    // on the total review/BOM. When on Building (step 1) include the Summary aside.
    if (step === 2) return [mainTile]

    const asideTile = {
      id: 'aside',
      label: 'Summary',
      content: (
        <div className="relative">
          <LiveSummary job={job} />
          {/* Step controls under Live Summary on page 1 */}
          <div className="mt-4">
            <StepNav
              onNext={() => {
                const result = jobSchema.safeParse(job)
                if (!result.success) {
                  // surface a basic notice; detailed inline errors remain in the form when focused
                  // eslint-disable-next-line no-alert
                  alert('Please complete required fields before continuing.')
                  return
                }
                setStep(2)
              }}
              onBlank={() => setJob({ ...job, buildingType: '' })}
              onReset={() => {
                // eslint-disable-next-line no-alert
                if (!window.confirm('Reset the job to blank values? This will clear the current job.')) return
                setJob({
                  buildingType: '',
                  frameGauge: '14ga',
                  panelGauge: '29ga',
                  color: '',
                  width: 0,
                  length: 0,
                  legHeight: 0,
                  pitch: 2,
                  spacing: 0,
                  roofOrientation: 'vertical',
                  wallOrientation: 'open',
                  openings: [],
                  trim: { closure: 'none', anchorType: 'bolt' },
                  panelColorRoof: '',
                  panelColorSide: '',
                  panelColorEnd: '',
                  wallPanelMode: 'full',
                  leanToPresent: false,
                  leanToCount: 0,
                  wallStripCount: 4
                } as any)
              }}
            />
          </div>
        </div>
      )
    }

    return [mainTile, asideTile]
  }, [step, job])

  // keyboard handler for focused widgets
  function onWidgetKeyDown(e: React.KeyboardEvent, id: 'main' | 'aside') {
    const newState = computeKeyboardEffects(e.key, { shift: e.shiftKey, alt: e.altKey, ctrl: e.ctrlKey, meta: e.metaKey }, id, { layoutOrder, stacked, mainWidth, rightWidth, asideHeight })
    // apply changes where needed and persist
    if (newState.layoutOrder !== layoutOrder) {
      setLayoutOrder(newState.layoutOrder)
      try { localStorage.setItem('mbuilder:layoutOrder', newState.layoutOrder) } catch (err) {}
    }
    if (newState.stacked !== stacked) {
      setStacked(newState.stacked)
      try { localStorage.setItem('mbuilder:stacked', String(newState.stacked)) } catch (err) {}
    }
    if (newState.mainWidth !== mainWidth) {
      setMainWidth(newState.mainWidth)
      try { localStorage.setItem('mbuilder:mainWidth', String(newState.mainWidth)) } catch (err) {}
    }
    if (newState.rightWidth !== rightWidth) {
      setRightWidth(newState.rightWidth)
      try { localStorage.setItem('mbuilder:rightWidth', String(newState.rightWidth)) } catch (err) {}
    }
    if (newState.asideHeight !== asideHeight) {
      setAsideHeight(newState.asideHeight)
      try { localStorage.setItem('mbuilder:asideHeight', String(newState.asideHeight)) } catch (err) {}
    }

    if (newState !== undefined) {
      e.preventDefault()
      if (announcerRef.current) announcerRef.current.textContent = `Adjusted ${id}`
    }
  }

  return (
    <div className="min-h-screen bg-bg text-fg">
      <DocumentHead
        title={(() => {
          const base = 'Material Planner'
          if (step === 1) return `${base} — Building`
          if (step === 2) return `${base} — Review`
          return base
        })()}
        faviconHref="/favicon.svg"
      />
      <Topbar />
      <JobAutosave />

      {/* content wrapper that clears the header and provides a reference for absolute/fixed children */}
      <main className="app-body relative pt-[var(--header-h)]">
        <div
          className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_6px_auto] gap-6 p-6"
          style={(() => {
            if (stacked) {
              return {
                gridTemplateRows: 'auto 6px auto',
                transitionProperty: 'grid-template-rows',
                transitionDuration: '300ms',
                transitionTimingFunction: 'ease'
              }
            }
            return {
              gridTemplateColumns: layoutOrder === 'main-right' ? undefined : 'auto 6px 1fr',
              transitionProperty: 'grid-template-columns',
              transitionDuration: '300ms',
              transitionTimingFunction: 'ease'
            }
          })()}
        >
          <AppGrid initialTiles={appGridInitialTiles} ignoreSaved={step === 2} />
        </div>
      </main>

      <div ref={(el) => announcerRef.current = el} className="sr-only" aria-live="polite" />
      <ThemeFab />
    </div>
  )
}
