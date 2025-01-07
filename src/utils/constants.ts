import { IBalls, IPower } from './types'

export const list_powerballs: IBalls[] = [
  { size: 40, name: 'GOD_BALL', color: '#eeff00', power_id: 'PW7' },
  { size: 40, name: 'FIRE_BALL', color: '#ff8833', power_id: 'PW4' },
  { size: 40, name: 'SPIKE_BALL', color: '#616161', power_id: 'DS9' },
  { size: 40, name: 'JUNKY_BALL', color: '#ffffff', power_id: 'DS3' }
]

export const list_item: IBalls[] = [
  { size: 10, name: 'A', color: '#FF5733' },
  { size: 20, name: 'B', color: '#33FF57' },
  { size: 30, name: 'C', color: '#3357FF' },
  { size: 40, name: 'D', color: '#FF33A1' },
  { size: 50, name: 'E', color: '#A133FF' },
  { size: 60, name: 'F', color: '#33FFA1' },
  { size: 70, name: 'G', color: '#FFAA33' },
  { size: 80, name: 'H', color: '#33AAFF' },
  { size: 90, name: 'I', color: '#AA33FF' },
  { size: 100, name: 'J', color: '#FF33AA' }
]

export const list_disaster: IPower[] = [
  {
    name: 'Icy Ball',
    description:
      'Your next spawned ball will be icy and froze the next ball, frozen ball need to merged twice',
    power_id: 'DS1'
  },
  {
    name: 'Infection',
    description: 'For every merge, minus 5 point',
    power_id: 'DS2'
  },
  {
    name: 'Junky Ball',
    description: 'The next spawned ball will have high friction',
    power_id: 'DS3'
  },
  {
    name: 'Pandemic',
    description: 'After the next merge, will destroy any same sized ball',
    power_id: 'DS4'
  },
  {
    name: 'Corosive',
    description:
      'The next spawned ball will destroy any touched ball until it touched the ground, no point gained from this',
    power_id: 'DS5'
  },
  {
    name: 'Bigger Ball',
    description:
      'The next spawned ball is the biggest ball in the list, prepare for it!',
    power_id: 'DS6'
  },
  {
    name: 'Lowered the gate',
    description:
      'Both of the side container will be lowered, removing any falling ball',
    power_id: 'DS7'
  },
  {
    name: 'Ace in the hole',
    description: 'Creating a hole in the ground, removing any falling ball',
    power_id: 'DS8'
  },
  {
    name: 'Spiky ball',
    description:
      'The next spawned ball will be spiky, it will destroy any touched ball, no points gained, cannot be merged with any ball, and the only way to get rid of it is by paying 500 points',
    power_id: 'DS9'
  },
  {
    name: 'God of debt',
    description:
      'If your score is above 10.000, set the score to 0, but if the score is below 10.000, set your score to minus 1.000.000',
    power_id: 'DS10'
  }
]

export const list_power: IPower[] = [
  {
    name: 'Extra score',
    description: 'Your next score will be mutiplied',
    power_id: 'PW1'
  },
  {
    name: 'Heavy Ball',
    description: 'Next spawned ball will be heavy and less rolling',
    power_id: 'PW2'
  },
  {
    name: 'God Hand',
    description: 'You can rearrange the ball for 3 seconds',
    power_id: 'PW3'
  },
  {
    name: 'Flaming Ball',
    description:
      'Next spawned ball will go through any ball, destroying it and immediately convert it to points for 3 seconds',
    power_id: 'PW4'
  },
  {
    name: 'Magnetic Ball',
    description: 'Next spawned ball will pulled towards the same ball',
    power_id: 'PW5'
  },
  {
    name: 'Re Incarnate',
    description:
      'Sets all the ball away, turn them into points and cleaning your container',
    power_id: 'PW6'
  },
  {
    name: 'Ball of God',
    description:
      'The next ball will be the god ball, the first ball to touch this ball will be the base point, remove any ball in the container and multiply the ball count with the base point as score',
    power_id: 'PW7'
  },
  {
    name: 'Wee ball',
    description:
      'The next 10 dropped ball guaranted to be the smallest ball, but will multiply the score by 10 by the end',
    power_id: 'PW8'
  },
  {
    name: 'Ballionaire',
    description: 'Instantly gained 1.000.000 point',
    power_id: 'PW9'
  },
  {
    name: 'Quantum Container of Balls',
    description:
      'Permanently reduce all the ball size to 50%, this power only comes once in a run',
    power_id: 'PW10'
  }
]
