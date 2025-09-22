import React from 'react'
import { useAtom } from 'jotai'
import { stepAtom } from '../../state/atoms'

export default function StepNav({ onNext, onBack, onBlank, onReset }: any) {
  const [step, setStep] = useAtom(stepAtom)
  return (
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center gap-2">
        <button onClick={() => typeof onBlank === 'function' ? onBlank() : null} className="px-3 py-1 rounded bg-transparent border">Blank</button>
        <button onClick={() => typeof onReset === 'function' ? onReset() : null} className="px-3 py-1 rounded bg-red-600 text-white">Reset</button>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => step > 1 && (typeof onBack === 'function' ? onBack() : setStep(step - 1))} className="px-3 py-1 rounded bg-slate-700 text-white">Back</button>
        <button onClick={() => typeof onNext === 'function' ? onNext() : setStep(step + 1)} className="px-3 py-1 rounded bg-primary-500 text-white">Next</button>
      </div>
    </div>
  )
}
