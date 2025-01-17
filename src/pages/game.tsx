import React, { useEffect, useRef, useState } from 'react'
import * as PIXI from 'pixi.js'
import Matter, { Engine, World, Bodies, Composite, Events } from 'matter-js'
import ballFire from '../assets/ball_fire.svg'
import { IBalls, IPower } from 'utils/types'
import { COLORS, DIFFICULTIES, list_disaster, list_item } from 'utils/constants'
import useGameStore from 'store'
import { ScoreView } from 'components/score'
import { PowerContainer } from 'components/power'

const MODAL_SHOW_PER_COUNT = 5
const DIFFICULTY = DIFFICULTIES.EASY

const App: React.FC = () => {
  // zustand states
  const {
    disasters,
    dropCounter,
    availableBall,
    availablePower,
    isGameOver,
    increase,
    incrementDropCounter,
    setAvailableBall,
    setIsGameOver,
    addDisaster,
    activePower,
    setActivePower,
    cureAnyDisaster
  } = useGameStore()
  // hooks
  const [ballSize, setBallSize] = useState<IBalls>(list_item[0]) // random radius between 10 and 40
  const [showModal, setShowModal] = useState(false)
  // refs
  const sceneRef = useRef<HTMLDivElement>(null)
  const previewBox = useRef<HTMLDivElement>(null)
  const ballSizeRef = useRef(ballSize)
  // dw1
  const [isDw1, setIsDw1] = useState(false)
  const isDw1Ref = useRef(false)
  // pw1
  const [isPw1, setIsPw1] = useState(false)
  const isPw1Ref = useRef(false)
  // pw2
  const [isPw2, setIsPw2] = useState(false)
  const isPw2Ref = useRef(false)
  // pw4
  const [isPw4, setIsPw4] = useState(false)
  const isPw4Ref = useRef(false)

  useEffect(() => {
    if (dropCounter > 0) {
      if (dropCounter % DIFFICULTY === 0) {
        const nextBallIndex = availableBall.length
        if (nextBallIndex < list_item.length) {
          setAvailableBall([...availableBall, list_item[nextBallIndex]])
        }
      }
      if (dropCounter % MODAL_SHOW_PER_COUNT === 0) {
        setShowModal(true)
      }
      if ((dropCounter % MODAL_SHOW_PER_COUNT) * 2 === 0) {
        const nextIdx = disasters.length
        if (nextIdx < list_disaster.length) {
          addDisaster(list_disaster[nextIdx])
        }
      }
    }
  }, [dropCounter])
  useEffect(() => {
    if (activePower.length > 0) {
      for (let i = 0; i < activePower.length; i++) {
        const element = activePower[i]
        if (element.power_id === 'PW1') {
          setIsPw1(true)
        }
        if (element.power_id === 'PW2') {
          setIsPw2(true)
        }
        if (element.power_id === 'PW4') {
          setIsPw4(true)
        }
      }
    }
    if (disasters.length > 0) {
      for (let i = 0; i < disasters.length; i++) {
        const element = disasters[i]
        if (element.power_id === 'DS1') {
          setIsDw1(true)
        }
      }
    }
  }, [activePower, showModal, disasters])

  useEffect(() => {
    ballSizeRef.current = ballSize
  }, [ballSize])

  useEffect(() => {
    isDw1Ref.current = isDw1
  }, [isDw1])

  useEffect(() => {
    isPw4Ref.current = isPw4
  }, [isPw4])

  useEffect(() => {
    // Initialize Matter.js
    const engine = Engine.create()
    // create an engine
    const world = engine.world

    // Create a ball in Matter.js
    const ball = Bodies.circle(400, 300, 50, {
      // Adjust radius to be smaller
      restitution: 1
    })
    World.add(world, ball)

    // Create a ground in Matter.js
    const ground = Bodies.rectangle(200, 580, 400, 40, { isStatic: true }) // Adjust width to 400 and position to 200
    var leftWall = Bodies.rectangle(0, 300, 30, 600, { isStatic: true }) // Adjust position for left edge
    var rightWall = Bodies.rectangle(400, 300, 30, 600, { isStatic: true }) // Adjust position for right edge
    var topSensor = Bodies.rectangle(400, 10, 810, 80, {
      isStatic: true,
      isSensor: true,
      render: { fillStyle: 'transparent', strokeStyle: 'red', lineWidth: 2 }
    }) // top sensor
    // add all of the bodies to the world
    Composite.add(world, [ground, leftWall, rightWall, topSensor])

    // Initialize PixiJS Application
    const app = new PIXI.Application({
      width: 400, // Adjust width to 400
      height: 600,
      backgroundColor: 0xfff396 // Change background color
    })

    // Append the canvas to the DOM
    if (sceneRef.current) {
      sceneRef.current.appendChild(app.view as HTMLCanvasElement) // Correct use of `app.view`
    }

    // Directly manipulate the Matter.js canvas width
    const matterCanvas = document.querySelector('canvas')
    if (matterCanvas) {
      matterCanvas.width = 400 // Adjust width to 400
    }

    // Create PixiJS graphics for the ground
    const groundGraphics = new PIXI.Graphics()
    groundGraphics.beginFill(COLORS.BLACK)
    groundGraphics.drawRect(0, 0, 400, 40) // Adjust width to 400
    groundGraphics.endFill()
    groundGraphics.y = 580 - 20 // Adjust position to match Matter.js ground
    app.stage.addChild(groundGraphics)

    // Create PixiJS graphics for the left wall
    const leftWallGraphics = new PIXI.Graphics()
    leftWallGraphics.beginFill(COLORS.BLACK)
    leftWallGraphics.drawRect(0, 0, 15, 600)
    leftWallGraphics.endFill()
    leftWallGraphics.x = 0 // Adjust position to match Matter.js left wall
    app.stage.addChild(leftWallGraphics)

    // Create PixiJS graphics for the right wall
    const rightWallGraphics = new PIXI.Graphics()
    rightWallGraphics.beginFill(COLORS.BLACK)
    rightWallGraphics.drawRect(0, 0, 15, 600)
    rightWallGraphics.endFill()
    rightWallGraphics.x = 400 - 15 // Adjust position to match Matter.js right wall
    app.stage.addChild(rightWallGraphics)

    // Smoke particle container
    const smokeContainer = new PIXI.Container()
    app.stage.addChild(smokeContainer)

    // Store references to Matter.js bodies and their corresponding PixiJS sprites
    const matterBodies: Matter.Body[] = []
    const pixiSprites: (PIXI.Graphics | PIXI.Sprite)[] = []

    // console.log('========')
    // console.log(pixiSprites)
    // console.log('========')
    // console.log(matterBodies)
    // Timer to stop generating smoke after 3 seconds
    const smokeDuration = 3000 // 3 seconds
    const startTime = Date.now()

    // Update function for syncing Matter.js and PixiJS
    const update = () => {
      Engine.update(engine)

      // Sync ball position
      // ballSprite.x = ball.position.x
      // ballSprite.y = ball.position.y

      // // Ensure the ball touches the ground
      // if (ballSprite.y + ballSprite.height / 2 > groundGraphics.y) {
      //   ballSprite.y = groundGraphics.y - ballSprite.height / 2
      // }

      // Sync positions of all Matter.js bodies and their corresponding PixiJS sprites
      for (let i = 0; i < matterBodies.length; i++) {
        const body = matterBodies[i]
        const sprite = pixiSprites[i]
        sprite.x = body.position.x
        sprite.y = body.position.y
      }
      // console.log('========')
      // console.log(pixiSprites)
      // console.log('========')
      // console.log(matterBodies)

      // Generate smoke particles if within smoke duration
      if (Date.now() - startTime < smokeDuration) {
        const smokeParticle = new PIXI.Graphics()
        smokeParticle.beginFill(0xaaaaaa, 0.6)
        smokeParticle.drawCircle(0, 0, 30) // Match the size of the ball
        smokeParticle.endFill()
        smokeParticle.x = ball.position.x
        smokeParticle.y = ball.position.y
        smokeContainer.addChild(smokeParticle)

        // Animate smoke particles
        const lifetime = 60 // Frames
        let frame = 0

        const animateParticle = () => {
          smokeParticle.alpha = 0.6 * (1 - frame / lifetime) // Gradually decrease opacity
          smokeParticle.y -= 1 // Move upwards
          smokeParticle.scale.set(1 + frame / lifetime) // Gradually increase size
          frame++

          if (frame >= lifetime) {
            smokeContainer.removeChild(smokeParticle)
            smokeParticle.destroy()
          } else {
            requestAnimationFrame(animateParticle)
          }
        }

        animateParticle()
      }
    }

    const touchedBodies = new Set()
    const fireballs = new Set<Matter.Body>() // Store fireballs for cleanup

    Events.on(
      engine,
      'collisionStart',
      (event: Matter.IEventCollision<Matter.Engine>) => {
        event.pairs.forEach((pair) => {
          const bodyA = pair.bodyA
          const bodyB = pair.bodyB
          if (isPw4Ref.current) {
            // Check if fireball is involved in the collision
            const fireballBody = fireballs.has(bodyA)
              ? bodyA
              : fireballs.has(bodyB)
                ? bodyB
                : null
            const otherBody = fireballBody === bodyA ? bodyB : bodyA
            if (fireballBody && otherBody) {
              // Check if the other body is a ball
              const ballIndex = matterBodies.indexOf(otherBody)
              if (ballIndex !== -1) {
                // Remove ball from Matter.js world
                Composite.remove(world, otherBody)

                // Remove corresponding PixiJS sprite
                const ballSprite = pixiSprites[ballIndex]
                if (ballSprite) {
                  app.stage.removeChild(ballSprite)
                  ballSprite.destroy()
                }

                // Remove references
                matterBodies.splice(ballIndex, 1)
                pixiSprites.splice(ballIndex, 1)

                // Update score or other game state if necessary
                increase(10) // Example: Add points for removing a ball
              }
            }
          } else if (bodyA === topSensor || bodyB === topSensor) {
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
                Composite.add(world, newBall)
                // modify score
                if (isPw1Ref.current) {
                  increase(ballA.size * 2)
                  setIsPw1(false)
                  setActivePower((prev) => {
                    const index = prev.findIndex(
                      (power) => power.power_id === 'PW1'
                    )
                    if (index !== -1) {
                      const newActivePower = [...prev]
                      newActivePower.splice(index, 1)
                      return newActivePower
                    }
                    return prev
                  })
                } else {
                  increase(ballA.size)
                }
                // Remove corresponding PixiJS sprites
                const indexA = matterBodies.indexOf(bodyA)
                const indexB = matterBodies.indexOf(bodyB)
                if (indexA !== -1 && indexB !== -1) {
                  const spriteA = pixiSprites[indexA]
                  const spriteB = pixiSprites[indexB]
                  if (spriteA) {
                    app.stage.removeChild(spriteA)
                    spriteA.destroy()
                  }
                  if (spriteB) {
                    app.stage.removeChild(spriteB)
                    spriteB.destroy()
                  }
                  matterBodies.splice(indexA, 1)
                  pixiSprites.splice(indexA, 1)
                  // Adjust indexB if it comes after indexA
                  const adjustedIndexB = indexB > indexA ? indexB - 1 : indexB
                  matterBodies.splice(adjustedIndexB, 1)
                  pixiSprites.splice(adjustedIndexB, 1)
                }
                Composite.remove(world, bodyA)
                Composite.remove(world, bodyB)

                // Create a new PixiJS graphics for the merged ball
                const newBallGraphics = new PIXI.Graphics()
                newBallGraphics.beginFill(nextBall.color)
                newBallGraphics.drawCircle(0, 0, nextBall.size)
                newBallGraphics.endFill()
                newBallGraphics.x = newBall.position.x
                newBallGraphics.y = newBall.position.y
                app.stage.addChild(newBallGraphics)

                // Store references to the new Matter.js body and PixiJS graphics
                matterBodies.push(newBall)
                pixiSprites.push(newBallGraphics)
              }
            }
          }
        })
      }
    )

    // PixiJS ticker
    app.ticker.add(update)

    // add mouse move event listener to update preview box position
    let canDrop = true
    const handleMouseMove = (event: MouseEvent) => {
      if (sceneRef.current && previewBox.current) {
        const rect = sceneRef.current.getBoundingClientRect()
        const mouseX = event.clientX - rect.left
        previewBox.current.style.left = `${mouseX - ballSize.size}px` // center the preview box
      }
    }
    const handleMouseClick = (event: MouseEvent) => {
      if (sceneRef.current && canDrop) {
        canDrop = false
        const rect = sceneRef.current.getBoundingClientRect()
        const mouseX = event.clientX - rect.left
        const circle = Bodies.circle(
          mouseX,
          0,
          !isPw4Ref.current ? ballSizeRef.current.size : 30,
          {
            label: ballSizeRef.current.name,
            // force:  { x: 0, y: 0.05 }, // Add downward force to make the ball heavy
            render: { fillStyle: ballSizeRef.current.color },
            friction: 1,
            frictionStatic: 0.5,
            frictionAir: isDw1Ref.current ? 0.5 : 0.01
          }
        )
        Composite.add(engine.world, circle)
        if (!isPw4Ref.current) {
          // Create a corresponding PixiJS graphics for the dropped ball
          const newBallGraphics = new PIXI.Graphics()
          newBallGraphics.beginFill(ballSizeRef.current.color)
          newBallGraphics.drawCircle(0, 0, ballSizeRef.current.size)
          newBallGraphics.endFill()
          newBallGraphics.x = mouseX
          newBallGraphics.y = 0
          app.stage.addChild(newBallGraphics)
          // Store references to the Matter.js body and PixiJS graphics
          matterBodies.push(circle)
          pixiSprites.push(newBallGraphics)
        } else {
          // logic to add spike
          const newBallGraphics = new PIXI.Sprite(PIXI.Texture.from(ballFire))
          newBallGraphics.anchor.set(0.5)
          newBallGraphics.width = 30 * 2
          newBallGraphics.height = 30 * 2
          newBallGraphics.x = mouseX
          newBallGraphics.y = 0
          app.stage.addChild(newBallGraphics)
          matterBodies.push(circle)
          pixiSprites.push(newBallGraphics)
          fireballs.add(circle) // Add fireball to the set
        }

        // Increment drop counter
        incrementDropCounter()

        if (isPw4Ref.current) {
          // Generate smoke particles for the dropped ball
          const smokeDuration = 3000 // 3 seconds
          const startTime = Date.now()

          const generateSmoke = () => {
            if (Date.now() - startTime < smokeDuration) {
              const smokeParticle = new PIXI.Graphics()
              smokeParticle.beginFill(0xaaaaaa, 0.6)
              smokeParticle.drawCircle(0, 0, 30) // Match the size of the ball
              smokeParticle.endFill()
              smokeParticle.x = circle.position.x
              smokeParticle.y = circle.position.y
              smokeContainer.addChild(smokeParticle)

              // Animate smoke particles
              const lifetime = 60 // Frames
              let frame = 0

              const animateParticle = () => {
                smokeParticle.alpha = 0.6 * (1 - frame / lifetime) // Gradually decrease opacity
                smokeParticle.y -= 1 // Move upwards
                smokeParticle.scale.set(1 + frame / lifetime) // Gradually increase size
                frame++

                if (frame >= lifetime) {
                  smokeContainer.removeChild(smokeParticle)
                  smokeParticle.destroy()
                } else {
                  requestAnimationFrame(animateParticle)
                }
              }

              animateParticle()
            }
          }

          const smokeTicker = new PIXI.Ticker()
          smokeTicker.add(generateSmoke)
          smokeTicker.start()

          setTimeout(() => {
            canDrop = true
            setIsPw4(false)
            setActivePower((prev: IPower[]) => {
              const index = prev.findIndex((power) => power.power_id === 'PW4')
              if (index !== -1) {
                const newActivePower = [...prev]
                newActivePower.splice(index, 1)
                return newActivePower
              }
              return prev
            })
            smokeTicker.stop()
            // Remove the fireball after smoke duration
            Composite.remove(engine.world, circle)
            const fireballIndex = matterBodies.indexOf(circle)
            if (fireballIndex !== -1) {
              const fireballSprite = pixiSprites[fireballIndex]
              if (fireballSprite) {
                app.stage.removeChild(fireballSprite)
                fireballSprite.destroy()
              }
              matterBodies.splice(fireballIndex, 1)
              pixiSprites.splice(fireballIndex, 1)
            }
            fireballs.delete(circle)
          }, smokeDuration) // Run the ticker for the entire smoke duration
        } else {
          canDrop = true
        }

        // Randomly select the next ball size
        const randomIndex = Math.floor(Math.random() * availableBall.length)
        setBallSize(availableBall[randomIndex])
      }
    }
    sceneRef.current?.addEventListener('mousemove', handleMouseMove)
    sceneRef.current?.addEventListener('click', handleMouseClick)

    return () => {
      app.destroy(true, { children: true })
      Engine.clear(engine)
      World.clear(world, false)
    }
  }, [])

  return (
    <>
      <div className="w-full h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center p-6 bg-white shadow-lg rounded-lg mr-4">
          <h1 className="text-2xl font-bold mb-4">Player Status</h1>
          <p className="text-lg">
            Is Game Over:{' '}
            <span className="font-semibold">{`${isGameOver}`}</span>
          </p>
          <ScoreView />
          <p className="text-lg">
            Drop Count:{' '}
            <span className="font-semibold">{`${dropCounter}`}</span>
          </p>
          {activePower.length != 0 && (
            <PowerContainer
              onCure={() => {
                // to do implement curing
                cureAnyDisaster("DS1")
                setIsDw1(false)
              }}
            />
          )}
          {disasters.length != 0 && (
            <>
              <p className="text-lg">Active Disasters:</p>
              {disasters.map((e, index) => (
                <span key={`${e.name}-${index}`} className="font-semibold">
                  {e.name}
                </span>
              ))}
            </>
          )}
        </div>
        <div
          ref={sceneRef}
          style={{ width: '400px', height: '600px', position: 'relative' }}
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
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg relative">
            <h2 className="text-2xl font-bold mb-4">Pick A Power Ups</h2>
            <div className="grid grid-cols-3 gap-4">
              {availablePower.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="p-4 bg-gray-200 rounded-lg relative group cursor-pointer"
                  onClick={() => {
                    setActivePower((prev: IPower[]) => [...prev, item])
                    setShowModal(false)
                  }}
                >
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg">
                    {item.description}
                  </div>
                  <p className="text-center">{item.name}</p>
                </div>
              ))}
            </div>
            <p className="text-md font-normal mb-4 my-4">Current Disasters</p>
            <div className="w-full flex items-center justify-center">
              <div className="grid grid-cols-3 gap-4">
                {disasters.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="p-4 bg-gray-200 rounded-lg relative group"
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg">
                      {item.description}
                    </div>
                    <p className="text-center">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App
