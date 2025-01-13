import { animate } from 'framer-motion'
import { FC, useEffect, useRef } from 'react'
import useGameStore from 'store'

interface IProps {}

export const ScoreView: FC<IProps> = () => {
  const { score } = useGameStore()
  const nodeRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const node = nodeRef.current

    const controls = animate(0, score, {
      duration: 1,
      onUpdate(value) {
        if (node) {
          node.textContent = value.toFixed(0)
        }
      }
    })

    return () => controls.stop()
  }, [score])

  return (
    <>
      <p className="text-lg">
        Score: <span className="font-semibold" ref={nodeRef}>{score}</span>
      </p>
    </>
  )
}
