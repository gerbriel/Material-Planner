import { JobState, LeanTo } from '../types/domain'

export const makeDefaultLeanTo = (position: LeanTo['position']): LeanTo => ({
  position,
  width: 12,
  length: 20,
  legHeight: 8,
  pitch: 2,
  spacing: 5,
  roofStyle: 'a_frame_horizontal',
  roofOrientation: 'horizontal',
  wallOrientation: 'open',
  panelColorRoof: 'Galvalume',
  panelColorSide: 'Galvalume',
  panelColorEnd: 'Galvalume',
  wainscotColor: '',
  wallPanelMode: 'full',
  wallStripCount: 4,
  leftSide: 'Horizontal',
  rightSide: 'Horizontal',
  frontEnd: 'Horizontal',
  backEnd: 'Horizontal',
  openings: [],
  extraPanels: []
})

export const DEFAULT_JOB: JobState = {
  buildingType: 'garage',
  frameGauge: '14ga',
  panelGauge: '29ga',
  color: 'Galvalume',
  width: 30,
  length: 50,
  legHeight: 12,
  pitch: 3,
  spacing: 5,
  roofOrientation: 'vertical',
  roofStyle: 'a_frame_vertical',
  wallOrientation: 'vertical'
  ,openings: [],
  extraPanels: [],
  foam: { roof: false, sides: false, ends: false },
  insulation: { roof: false, sides: false, ends: false },
  extraBraces: 0,
  hatChannels: 0,
  foundation: 'bare',
  trim: { closure: 'none', anchorType: 'bolt' },
  panelColorRoof: 'Galvalume',
  panelColorSide: 'Galvalume',
  panelColorEnd: 'Galvalume',
  wainscotColor: '',
  wallPanelMode: 'full'
  ,leanToPresent: false,
  leanToCount: 0,
  wallStripCount: 4
  ,leftSide: 'Horizontal',
  rightSide: 'Horizontal',
  frontEnd: 'Horizontal',
  backEnd: 'Horizontal',
  leftSideCourses: undefined,
  rightSideCourses: undefined,
  frontEndCourses: undefined,
  backEndCourses: undefined
  ,leanTos: []
}
