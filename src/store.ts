import { list_disaster, list_item, list_power } from 'utils/constants'
import { IBalls, IPower } from 'utils/types'
import { create } from 'zustand'

// Define the interface for the state
interface GameState {
  score: number
  increase: (by: number) => void
  decrease: (by: number) => void
  setScore: (sc: number) => void
  disasters: IPower[]
  setDisasters: (disasters: IPower[]) => void
  addDisaster: (disaster: IPower) => void
  dropCounter: number
  setDropCounter: (count: number) => void
  incrementDropCounter: () => void
  availableBall: IBalls[]
  setAvailableBall: (balls: IBalls[]) => void
  availablePower: IPower[]
  setAvailablePower: (powers: IPower[]) => void
  isGameOver: boolean
  setIsGameOver: (isGameOver: boolean) => void
}

// Create the zustand store with initial state and actions
const useGameStore = create<GameState>()((set) => ({
  // initial state
  score: 0,
  disasters: [list_disaster[0]],
  dropCounter: 0,
  availableBall: [list_item[0], list_item[1]],
  availablePower: [list_power[0], list_power[1], list_power[2]],
  isGameOver: false,
  // setters
  setScore: (sc) => set((_) => ({ score: sc })),
  decrease: (by) => set((state) => ({ score: state.score - by })),
  increase: (by) =>
    set((state) => {
      //   console.log(state.score, 'from setter', by)
      return { score: state.score + by }
    }), // action to increase the score
  setDisasters: (disasters) => set(() => ({ disasters })),
  addDisaster: (disaster) =>
    set((state) => ({ disasters: [...state.disasters, disaster] })),
  setDropCounter: (count) => set(() => ({ dropCounter: count })),
  incrementDropCounter: () => set((state) => ({ dropCounter: state.dropCounter + 1 })),
  setAvailableBall: (balls) => set(() => ({ availableBall: balls })),
  setAvailablePower: (powers) => set(() => ({ availablePower: powers })),
  setIsGameOver: (isGameOver) => set(() => ({ isGameOver }))
}))

export default useGameStore
