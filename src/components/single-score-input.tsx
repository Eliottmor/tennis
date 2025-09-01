import type { Dispatch, MutableRefObject, SetStateAction } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

interface SingleScoreInputProps {
  hasWonSet?: boolean
  setActiveElement: Dispatch<SetStateAction<Element | null | undefined>>
  register: UseFormRegisterReturn
  setRef: MutableRefObject<HTMLInputElement | null>
  maxLength?: number
}

const SingleScoreInput = ({
  hasWonSet,
  setActiveElement,
  register,
  setRef,
  maxLength = 1
}: SingleScoreInputProps) => {
  const borderStyle = 'border-2 border-green-600'
  const { onBlur, ref } = register

  return (
    <input
      className={`w-[56px] text-center h-[48px] inline-flex items-center justify-center rounded py-0 px-2 text-lg leading-[1] bg-neutral mt-2 mx-0 mb-4 box-border focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasWonSet ? borderStyle : 'border border-zinc-950/10 dark:border-white/10'}`}
      maxLength={maxLength}
      placeholder='0'
      inputMode='numeric'
      pattern='[0-9]*'
      onFocus={() => setActiveElement(document.activeElement || undefined)}
      {...register}
      ref={(e) => {
        ref(e)
        setRef.current = e
      }}
      onBlur={(e) => {
        onBlur(e)
        setActiveElement(e.relatedTarget as Element | null)
      }}
    />
  )
}

export default SingleScoreInput
