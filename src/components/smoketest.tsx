import React, { useEffect, useRef, useState } from 'react'
import * as PIXI from 'pixi.js'
import Matter, { Engine, World, Bodies, Composite, Events } from 'matter-js'
import ballSpike from './assets/ball_spike.svg'
import { IBalls } from 'utils/types'
import { list_item } from 'utils/constants'

const BLACK_COLOR = 0x000000;

const MatterPixiSmoke: React.FC = () => {
  const sceneRef = useRef<HTMLDivElement>(null)
  const previewBox = useRef<HTMLDivElement>(null)
  const [ballSize, setBallSize] = useState<IBalls>(list_item[0]) // random radius between 10 and 40
  const ballSizeRef = useRef(ballSize)
  const [dropCounter, setDropCounter] = useState(0)
  const [availableBall, setAvailableBall] = useState<IBalls[]>([
    list_item[0],
    list_item[1]
  ])

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
    const ground = Bodies.rectangle(400, 580, 800, 40, { isStatic: true })
    var leftWall = Bodies.rectangle(0, 300, 60, 600, { isStatic: true }) // left edge
    var rightWall = Bodies.rectangle(800, 300, 60, 600, { isStatic: true }) // right edge
    var topSensor = Bodies.rectangle(400, 10, 810, 80, {
      isStatic: true,
      isSensor: true,
      render: { fillStyle: 'transparent', strokeStyle: 'red', lineWidth: 2 }
    }) // top sensor
    // add all of the bodies to the world
    Composite.add(world, [ground, leftWall, rightWall, topSensor])

    // Initialize PixiJS Application
    const app = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundColor: 0xfff396 // Change background color
    })

    // Append the canvas to the DOM
    if (sceneRef.current) {
      sceneRef.current.appendChild(app.view as HTMLCanvasElement) // Correct use of `app.view`
    }

    // Create PixiJS sprite for the ball using the SVG texture
    const ballTexture = PIXI.Texture.from(ballSpike)
    const ballSprite = new PIXI.Sprite(ballTexture)
    ballSprite.anchor.set(0.5)
    ballSprite.width = 100 // Match the size of the smaller ball
    ballSprite.height = 100 // Match the size of the smaller ball
    app.stage.addChild(ballSprite)

    // Create PixiJS graphics for the ground
    const groundGraphics = new PIXI.Graphics()
    groundGraphics.beginFill(BLACK_COLOR)
    groundGraphics.drawRect(0, 0, 800, 40)
    groundGraphics.endFill()
    groundGraphics.y = 580 - 20 // Adjust position to match Matter.js ground
    app.stage.addChild(groundGraphics)

    // Create PixiJS graphics for the left wall
    const leftWallGraphics = new PIXI.Graphics()
    leftWallGraphics.beginFill(BLACK_COLOR)
    leftWallGraphics.drawRect(0, 0, 30, 600)
    leftWallGraphics.endFill()
    leftWallGraphics.x = 0 // Adjust position to match Matter.js left wall
    app.stage.addChild(leftWallGraphics)

    // Create PixiJS graphics for the right wall
    const rightWallGraphics = new PIXI.Graphics()
    rightWallGraphics.beginFill(BLACK_COLOR)
    rightWallGraphics.drawRect(0, 0, 30, 600)
    rightWallGraphics.endFill()
    rightWallGraphics.x = 800 - 30 // Adjust position to match Matter.js right wall
    app.stage.addChild(rightWallGraphics)

    // Smoke particle container
    const smokeContainer = new PIXI.Container()
    app.stage.addChild(smokeContainer)

    // Store references to Matter.js bodies and their corresponding PixiJS sprites
    const matterBodies: Matter.Body[] = []
    const pixiSprites: PIXI.Graphics[] = []

    // Timer to stop generating smoke after 3 seconds
    const smokeDuration = 3000 // 3 seconds
    const startTime = Date.now()

    // Update function for syncing Matter.js and PixiJS
    const update = () => {
      Engine.update(engine)

      // Sync ball position
      ballSprite.x = ball.position.x
      ballSprite.y = ball.position.y

      // Ensure the ball touches the ground
      if (ballSprite.y + ballSprite.height / 2 > groundGraphics.y) {
        ballSprite.y = groundGraphics.y - ballSprite.height / 2
      }

      // Sync positions of all Matter.js bodies and their corresponding PixiJS sprites
      for (let i = 0; i < matterBodies.length; i++) {
        const body = matterBodies[i]
        const sprite = pixiSprites[i]
        sprite.x = body.position.x
        sprite.y = body.position.y
      }

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
    Events.on(
      engine,
      'collisionStart',
      (event: Matter.IEventCollision<Matter.Engine>) => {
        event.pairs.forEach((pair) => {
          const bodyA = pair.bodyA
          const bodyB = pair.bodyB

          if (bodyA === topSensor || bodyB === topSensor) {
            const otherBody = bodyA === topSensor ? bodyB : bodyA
            if (touchedBodies.has(otherBody)) {
              // setIsGameOver(true)
              console.log('test')
            } else {
              touchedBodies.add(otherBody)
            }
          } else if (
            (touchedBodies.has(bodyA) && bodyB === topSensor) ||
            (touchedBodies.has(bodyB) && bodyA === topSensor)
          ) {
            // setIsGameOver(true)
            console.log('test')
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
        const circle = Bodies.circle(mouseX, 0, ballSizeRef.current.size, {
          label: ballSizeRef.current.name,
          // force:  { x: 0, y: 0.05 }, // Add downward force to make the ball heavy
          render: { fillStyle: ballSizeRef.current.color },
          friction: 1,
          frictionStatic: 1
        })
        Composite.add(engine.world, circle)

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
    sceneRef.current?.addEventListener('mousemove', handleMouseMove)
    sceneRef.current?.addEventListener('click', handleMouseClick)

    return () => {
      app.destroy(true, { children: true })
      Engine.clear(engine)
      World.clear(world, false)
    }
  }, [])

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center p-6 bg-white shadow-lg rounded-lg mr-4">
        <h1 className="text-2xl font-bold mb-4">Player Status</h1>
        <p className="text-lg">
          Is Game Over: <span className="font-semibold">{``}</span>
        </p>
        <p className="text-lg">
          Score: <span className="font-semibold">{``}</span>
        </p>
        <p className="text-lg">
          Drop Count: <span className="font-semibold">{``}</span>
        </p>
      </div>
      <div
        ref={sceneRef}
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
    </div>
  )
}

export default MatterPixiSmoke
