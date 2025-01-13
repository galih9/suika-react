import { create } from 'zustand'

// Define the interface for the state
interface GameState {
  score: number
  increase: (by: number) => void
  decrease: (by: number) => void
  setScore: (sc: number) => void
}

// Create the zustand store with initial state and actions
const useGameStore = create<GameState>()((set) => ({
  score: 0, // initial state
  setScore: (sc) => set((_) => ({ score: sc })),
  decrease: (by) => set((state) => ({ score: state.score - by })),
  increase: (by) =>
    set((state) => {
    //   console.log(state.score, 'from setter', by)
      return { score: state.score + by }
    }) // action to increase the score
}))

export default useGameStore
