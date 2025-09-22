import { JobState } from '../types/domain'

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
}
