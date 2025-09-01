import { useEffect, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import type { UseFormRegister } from 'react-hook-form'
import SingleScoreInput from './single-score-input'

interface SetInputFieldProps {
  setNumber: string
  register: UseFormRegister<any>
}

const isNumber = (v: unknown): v is number =>
  typeof v === 'number' && !Number.isNaN(v)

const SetInputField = ({ setNumber, register }: SetInputFieldProps) => {
  const { watch, setValue } = useFormContext()
  const [activeElement, setActiveElement] = useState<Element | null | undefined>()

  const [
    playerOneSetScore,
    playerTwoSetScore,
    playerOneTiebreakerScore,
    playerTwoTiebreakerScore
  ] = watch([
    `playerOne.set${setNumber}`,
    `playerTwo.set${setNumber}`,
    `playerOne.tiebreaker${setNumber}`,
    `playerTwo.tiebreaker${setNumber}`
  ])

  
  const playerOneSetRef = useRef<HTMLInputElement | null>(null)
  const playerTwoSetRef = useRef<HTMLInputElement | null>(null)
  const playerOneTiebreakerRef = useRef<HTMLInputElement | null>(null)
  const playerTwoTiebreakerRef = useRef<HTMLInputElement | null>(null)
  const allRefs = [playerOneSetRef, playerTwoSetRef, playerOneTiebreakerRef, playerTwoTiebreakerRef]
  
  const playerOneSetRegister = register(`playerOne.set${setNumber}`, {
    setValueAs: (v) => (v === '' || v === null || v === undefined ? undefined : parseInt(v, 10))
  })
  const playerTwoSetRegister = register(`playerTwo.set${setNumber}`, {
    setValueAs: (v) => (v === '' || v === null || v === undefined ? undefined : parseInt(v, 10))
  })
  const playerOneTiebreakerRegister = register(`playerOne.tiebreaker${setNumber}`, {
    // Avoid NaN showing in the input when the field is empty
    setValueAs: (v) => (v === '' || v === null || v === undefined ? undefined : parseInt(v, 10))
  })
  const playerTwoTiebreakerRegister = register(`playerTwo.tiebreaker${setNumber}`, {
    // Avoid NaN showing in the input when the field is empty
    setValueAs: (v) => (v === '' || v === null || v === undefined ? undefined : parseInt(v, 10))
  })
  
  const hasBothScores = isNumber(playerOneSetScore) && isNumber(playerTwoSetScore)
  const hasPlayerOneWonSet = hasBothScores && playerOneSetScore > playerTwoSetScore
  const hasPlayerTwoWonSet = hasBothScores && playerTwoSetScore > playerOneSetScore

  const isTiebreaker = hasBothScores && Math.abs(playerOneSetScore - playerTwoSetScore) === 1
  const isEditingTiebreakerScore = hasBothScores && isTiebreaker && !!allRefs.find(ref => ref.current === activeElement)

  // Only show tiebreaker scores when they exist and we're not editing them
  const hasTiebreakerScore = isTiebreaker && 
    isNumber(playerOneTiebreakerScore) && 
    isNumber(playerTwoTiebreakerScore) && 
    !isEditingTiebreakerScore
    
  const tiebreakerTitle = isEditingTiebreakerScore ? '- Tiebreaker' : ''

  // When transitioning from a tiebreak set (e.g., 7-6) to a non-tiebreak set (e.g., 6-4),
  // clear any existing tiebreaker values so they aren't submitted.
  const prevIsTiebreakerRef = useRef<boolean>(isTiebreaker)
  useEffect(() => {
    if (prevIsTiebreakerRef.current && !isTiebreaker) {
      setValue(`playerOne.tiebreaker${setNumber}`, undefined, { shouldDirty: true, shouldValidate: true })
      setValue(`playerTwo.tiebreaker${setNumber}`, undefined, { shouldDirty: true, shouldValidate: true })
    }
    prevIsTiebreakerRef.current = isTiebreaker
  }, [isTiebreaker, setNumber, setValue])

  return (
    <div className='inline-flex items-center flex-col pr-3'>
      <p className='text-zinc-500 dark:text-zinc-400'>Set {setNumber} {tiebreakerTitle}</p>
      <div className='flex-row'>
        <div className='inline-flex flex-col relative'>
          {hasTiebreakerScore && (
            <div className='absolute top-[10px] right-3 text-xs text-zinc-600 dark:text-zinc-300'>
              {playerOneTiebreakerScore}
            </div>
          )}
          <SingleScoreInput
            hasWonSet={hasPlayerOneWonSet}
            setActiveElement={setActiveElement}
            register={playerOneSetRegister}
            setRef={playerOneSetRef}
          />
          {hasTiebreakerScore && (
            <div className='absolute bottom-11 right-3 text-xs text-zinc-600 dark:text-zinc-300'>
              {playerTwoTiebreakerScore}
            </div>
          )}
          <SingleScoreInput
            hasWonSet={hasPlayerTwoWonSet}
            setActiveElement={setActiveElement}
            register={playerTwoSetRegister}
            setRef={playerTwoSetRef}
          />
        </div>
        {isEditingTiebreakerScore && (
          <div className='inline-flex flex-col px-1'>
            <SingleScoreInput
              setActiveElement={setActiveElement}
              register={playerOneTiebreakerRegister}
              setRef={playerOneTiebreakerRef}
              maxLength={2}
            />
            <SingleScoreInput
              setActiveElement={setActiveElement}
              register={playerTwoTiebreakerRegister}
              setRef={playerTwoTiebreakerRef}
              maxLength={2}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default SetInputField
