import { z } from 'zod'

export const jobSchema = z.object({
  buildingType: z.string(),
  frameGauge: z.enum(['14ga', '12ga']),
  panelGauge: z.enum(['29ga', '26ga']),
  color: z.string().optional(),
  width: z.number().min(6).max(120),
  length: z.number().min(5),
  legHeight: z.number().min(6).max(20),
  pitch: z.union([z.literal(2), z.literal(3), z.literal(4)]),
  spacing: z.number().min(2).max(10),
  roofOrientation: z.enum(['vertical', 'horizontal']),
  wallOrientation: z.enum(['vertical', 'horizontal', 'open'])
})

export type JobSchema = z.infer<typeof jobSchema>
