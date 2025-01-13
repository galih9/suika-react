import { animate } from 'framer-motion'
import { FC, useEffect, useRef, useState } from 'react'
import useGameStore from 'store'

interface IProps {}

export const ScoreView: FC<IProps> = () => {
  const { score, disasters, dropCounter, decrease } = useGameStore()
  const nodeRef = useRef<HTMLParagraphElement>(null)
  const [lastScore, setLastScore] = useState(score)

  useEffect(() => {
    if (disasters.some((e) => e.power_id === 'DS2')) {
      decrease(5)
    }
  }, [disasters, dropCounter])

  useEffect(() => {
    const node = nodeRef.current

    const controls = animate(lastScore, score, {
      duration: 1,
      onUpdate(value) {
        if (node) {
          node.textContent = value.toFixed(0)
        }
      },
      onComplete() {
        setLastScore(score)
      }
    })

    return () => controls.stop()
  }, [score])

  return (
    <>
      <p className="text-lg">
        Score:{' '}
        <span className="font-semibold" ref={nodeRef}>
          {score}
        </span>
      </p>
    </>
  )
}
