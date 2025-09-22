import { useAtom } from 'jotai'
import React, { useEffect } from 'react'
import { jobAtom, saveJob } from '../../state/atoms'

export default function JobAutosave() {
  const [job] = useAtom(jobAtom)
  useEffect(() => {
    saveJob(job)
  }, [job])
  return null
}
