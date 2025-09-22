export type BuildingType =
  | 'carport'
  | 'rv_cover'
  | 'garage'
  | 'barn'
  | 'lean_to'
  | 'combo'
  | 'widespan'
  | 'utility_garage'

export type Gauge = '14ga' | '12ga' | '29ga' | '26ga'

export interface JobState {
  id?: string
  workOrderId?: string
  coilId?: string
  buildingType: BuildingType
  frameGauge: '14ga' | '12ga'
  panelGauge: '29ga' | '26ga'
  color: string
  width: number
  length: number
  legHeight: number
  pitch: 2 | 3 | 4
  spacing: number
  roofOrientation: 'vertical' | 'horizontal'
  wallOrientation: 'vertical' | 'horizontal' | 'open'
  // openings: list of openings on the building (walk door, window, rollup)
  openings?: { type: 'walk' | 'window' | 'rollup'; widthFt?: number; side?: 'end' | 'side' }[]
  // simple trim/anchor selections
  trim?: { closure?: 'none' | 'foam' | 'strip'; anchorType?: 'bolt' | 'asphalt_kit' | 'screw' }
  // panel colors and wall panel mode
  panelColorRoof?: string
  panelColorSide?: string
  panelColorEnd?: string
  wainscotColor?: string
  wallPanelMode?: 'full' | 'wainscot' | 'strips' | 'partial'
  // when in 'strips' mode, user can choose how many strips high (1-7)
  wallStripCount?: number
  // per-wall panel selections (capitalized): 'Open' | 'Vertical' | 'Horizontal'
  leftSide?: 'Open' | 'Vertical' | 'Horizontal'
  rightSide?: 'Open' | 'Vertical' | 'Horizontal'
  frontEnd?: 'Open' | 'Vertical' | 'Horizontal'
  backEnd?: 'Open' | 'Vertical' | 'Horizontal'
  // per-wall selected courses when in Horizontal mode (number of courses/courses selected)
  leftSideCourses?: number
  rightSideCourses?: number
  frontEndCourses?: number
  backEndCourses?: number
  // lean-to presence and count
  leanToPresent?: boolean
  leanToCount?: number
  // UI additions
  roofStyle?: 'standard' | 'a_frame_horizontal' | 'a_frame_vertical'
  extraPanels?: Array<{ lengthFt?: number; qty?: number; color?: string }>
  foam?: { roof?: boolean; sides?: boolean; ends?: boolean }
  insulation?: { roof?: boolean; sides?: boolean; ends?: boolean }
  extraBraces?: number
  hatChannels?: number
  foundation?: 'bare' | 'asphalt' | 'concrete'
}
