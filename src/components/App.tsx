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
import { list_item } from 'utils/constants'
import { IBalls } from 'utils/types'

function App() {
  const scene = useRef<HTMLDivElement>(null)
  const previewBox = useRef<HTMLDivElement>(null)
  const [dropCounter, setDropCounter] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [score, setScore] = useState<number>(0)
  const [availableBall, setAvailableBall] = useState<IBalls[]>([
    list_item[0],
    list_item[1]
  ])
  const [ballSize, setBallSize] = useState<IBalls>(list_item[0]) // random radius between 10 and 40
  const ballSizeRef = useRef(ballSize)
  const [showModal, setShowModal] = useState(false)

  const handleCloseModal = () => {
    setShowModal(false)
  }

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
    if (dropCounter > 0 && dropCounter % 2 === 0) {
      setShowModal(true)
    }
  }, [dropCounter])

  useEffect(() => {
    ballSizeRef.current = ballSize
  }, [ballSize])

  const engine = useRef<Engine>(Engine.create())

  useEffect(() => {
    // create an engine
    const { current: engineInstance } = engine

    // create a renderer
    var render = Render.create({
      element: scene.current || undefined, // updated to use scene.current with null check
      engine: engineInstance,
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
    Composite.add(engineInstance.world, [
      ground,
      leftWall,
      rightWall,
      topSensor
    ])

    // run the renderer
    Render.run(render)

    // create runner
    var runner = Runner.create()

    // run the engine
    Runner.run(runner, engineInstance)

    // add collision event listener for the top sensor
    const touchedBodies = new Set()
    Events.on(
      engineInstance,
      'collisionStart',
      (event: Matter.IEventCollision<Matter.Engine>) => {
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
                  {
                    label: nextBall.name,
                    render: { fillStyle: nextBall.color }
                  }
                )
                Composite.add(engineInstance.world, newBall)
                setScore((prev) => prev + ballA.size)
                Composite.remove(engineInstance.world, bodyA)
                Composite.remove(engineInstance.world, bodyB)
              }
            }
          }
        })
      }
    )

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
        Composite.add(engineInstance.world, circle)

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

  // Cleanup bodies that are out of the viewport
  Composite.allBodies(engine.current.world).forEach((body) => {
    const interval = setInterval(() => {
      Composite.allBodies(engine.current.world).forEach((body) => {
        if (body.position.y > 700) {
          Composite.remove(engine.current.world, body)
        }
      })
    }, 1000) // Check every second

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (previewBox.current) {
      previewBox.current.style.width = `${ballSize.size * 2}px`
      previewBox.current.style.height = `${ballSize.size * 2}px`
    }
  }, [ballSize])

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center p-6 bg-white shadow-lg rounded-lg mr-4">
        <h1 className="text-2xl font-bold mb-4">Player Status</h1>
        <p className="text-lg">
          Is Game Over: <span className="font-semibold">{`${isGameOver}`}</span>
        </p>
        <p className="text-lg">
          Score: <span className="font-semibold">{`${score}`}</span>
        </p>
        <p className="text-lg">
          Drop Count: <span className="font-semibold">{`${dropCounter}`}</span>
        </p>
      </div>
      <div
        ref={scene}
        style={{ width: '800px', height: '600px', position: 'relative' }}
        className="bg-gray-200 shadow-lg rounded-lg"
      >
        <div
          ref={previewBox}
          style={{
            width: `${ballSize.size * 2}px`,
            height: `${ballSize.size * 2}px`,
            borderRadius: '50%',
            backgroundColor: `${ballSize.color}`,
            position: 'absolute',
            top: '0',
            pointerEvents: 'none'
          }}
        ></div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg relative">
            <h2 className="text-2xl font-bold mb-4">Shop</h2>
            <div className="grid grid-cols-3 gap-4">
              {availableBall.map((item) => (
                <div
                  key={item.name}
                  className="p-4 bg-gray-200 rounded-lg relative"
                >
                  <div className="absolute inset-0 bg-black bg-opacity-75 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p>{`Upgrade ${item.name}: ${item.size}px`}</p>
                  </div>
                  <p className="text-center">{item.name}</p>
                </div>
              ))}
            </div>
            <button
              onClick={handleCloseModal}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
