import React, { useEffect, useRef, useState } from 'react'
import {
  Engine,
  Render,
  World,
  Bodies,
  Composite,
  Runner,
  Events
} from 'matter-js'

interface IBalls {
  size: number
  name: string
  color: string
}

const list_item: IBalls[] = [
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

function App() {
  const scene = useRef<HTMLDivElement>(null)
  const previewBox = useRef<HTMLDivElement>(null)
  const [dropCounter, setDropCounter] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [availableBall, setAvailableBall] = useState<IBalls[]>([
    list_item[0],
    list_item[1]
  ])
  const [ballSize, setBallSize] = useState<IBalls>(list_item[0]) // random radius between 10 and 40
  const ballSizeRef = useRef(ballSize)

  useEffect(() => {
    if (dropCounter > 0 && dropCounter % 5 === 0) {
      const nextBallIndex = availableBall.length
      if (nextBallIndex < list_item.length) {
        setAvailableBall((prevAvailableBall) => [
          ...prevAvailableBall,
          list_item[nextBallIndex]
        ])
      }
    }
  }, [dropCounter])

  useEffect(() => {
    ballSizeRef.current = ballSize
  }, [ballSize])

  useEffect(() => {
    // create an engine
    var engine = Engine.create()

    // create a renderer
    var render = Render.create({
      element: scene.current || undefined, // updated to use scene.current with null check
      engine: engine,
      options: {
        wireframes: false, // set wireframes to false to enable colors
        background: '#fff396' // set the background color
      }
    })

    // create a ground
    var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true })
    var leftWall = Bodies.rectangle(0, 300, 60, 600, { isStatic: true }) // left edge
    var rightWall = Bodies.rectangle(800, 300, 60, 600, { isStatic: true }) // right edge
    var topSensor = Bodies.rectangle(400, 10, 810, 80, {
      isStatic: true,
      isSensor: true,
      render: { fillStyle: 'transparent', strokeStyle: 'red', lineWidth: 2 }
    }) // top sensor

    // add all of the bodies to the world
    Composite.add(engine.world, [ground, leftWall, rightWall, topSensor])

    // run the renderer
    Render.run(render)

    // create runner
    var runner = Runner.create()

    // run the engine
    Runner.run(runner, engine)

    // add collision event listener for the top sensor
    const touchedBodies = new Set()
    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA
        const bodyB = pair.bodyB

        if (bodyA === topSensor || bodyB === topSensor) {
          const otherBody = bodyA === topSensor ? bodyB : bodyA
          if (touchedBodies.has(otherBody)) {
            setIsGameOver(true)
          } else {
            touchedBodies.add(otherBody)
          }
        } else if (
          (touchedBodies.has(bodyA) && bodyB === topSensor) ||
          (touchedBodies.has(bodyB) && bodyA === topSensor)
        ) {
          setIsGameOver(true)
        } else {
          // Check if two balls of the same size collide
          const ballA = list_item.find((item) => item.name === bodyA.label)
          const ballB = list_item.find((item) => item.name === bodyB.label)
          if (ballA && ballB && ballA.name === ballB.name) {
            const nextBallIndex = list_item.indexOf(ballA) + 1
            if (nextBallIndex < list_item.length) {
              const nextBall = list_item[nextBallIndex]
              const newBall = Bodies.circle(
                (bodyA.position.x + bodyB.position.x) / 2,
                (bodyA.position.y + bodyB.position.y) / 2,
                nextBall.size,
                { label: nextBall.name, render: { fillStyle: nextBall.color } }
              )
              Composite.add(engine.world, newBall)
              Composite.remove(engine.world, bodyA)
              Composite.remove(engine.world, bodyB)
            }
          }
        }
      })
    })

    // add mouse move event listener to update preview box position
    const handleMouseMove = (event: MouseEvent) => {
      if (scene.current && previewBox.current) {
        const rect = scene.current.getBoundingClientRect()
        const mouseX = event.clientX - rect.left
        previewBox.current.style.left = `${mouseX - ballSize.size}px` // center the preview box
      }
    }

    // add mouse click event listener to create a falling circle
    let canDrop = true
    const handleMouseClick = (event: MouseEvent) => {
      if (scene.current && canDrop) {
        canDrop = false
        const rect = scene.current.getBoundingClientRect()
        const mouseX = event.clientX - rect.left
        const circle = Bodies.circle(mouseX, 0, ballSizeRef.current.size, {
          label: ballSizeRef.current.name,
          render: { fillStyle: ballSizeRef.current.color }
        })
        Composite.add(engine.world, circle)

        // Increment drop counter
        setDropCounter((prevCounter) => prevCounter + 1)

        // Randomly select the next ball size
        const randomIndex = Math.floor(Math.random() * availableBall.length)
        setBallSize(availableBall[randomIndex])

        setTimeout(() => {
          canDrop = true
        }, 500) // 0.5 second delay
      }
    }

    scene.current?.addEventListener('mousemove', handleMouseMove)
    scene.current?.addEventListener('click', handleMouseClick)

    // cleanup event listeners on component unmount
    return () => {
      scene.current?.removeEventListener('mousemove', handleMouseMove)
      scene.current?.removeEventListener('click', handleMouseClick)
    }
  }, [])

  useEffect(() => {
    if (previewBox.current) {
      previewBox.current.style.width = `${ballSize.size * 2}px`
      previewBox.current.style.height = `${ballSize.size * 2}px`
    }
  }, [ballSize])

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="p-6">
        <p>Is Game over: {`${isGameOver}`}</p>
        <p>Count: {`${dropCounter}`}</p>
      </div>
      <div
        ref={scene}
        style={{ width: '800px', height: '600px', position: 'relative' }}
      >
        <div
          ref={previewBox}
          style={{
            width: `${ballSize.size * 2}px`,
            height: `${ballSize.size * 2}px`,
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 255, 0, 0.5)',
            position: 'absolute',
            top: '0',
            pointerEvents: 'none'
          }}
        ></div>
      </div>
    </div>
  )
}

export default App
