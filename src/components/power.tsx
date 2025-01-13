import { FC } from 'react'
import useGameStore from 'store'

interface IProps {
  onCure: () => void
}

export const PowerContainer: FC<IProps> = ({ onCure }) => {
  const { activePower } = useGameStore()

  return (
    <>
      <p className="text-lg">Active Power:</p>
      {activePower?.map((e, index) => (
        <span key={`${e.name}-${index}`} className="font-semibold">
          {e.name}{' '}
          {e.type === 'active' && (
            <button
              className="bg-blue-500 text-white px-2 py-1 rounded"
              onClick={onCure}
            >
              {'Use'}
            </button>
          )}
        </span>
      ))}
    </>
  )
}
