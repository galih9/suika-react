import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import Matter, { Engine, World, Bodies } from "matter-js";
import ballSpike from "./assets/ball_spike.svg";

const MatterPixiSmoke: React.FC = () => {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Matter.js
    const engine = Engine.create();
    const world = engine.world;

    // Create a ball in Matter.js
    const ball = Bodies.circle(400, 300, 50, { // Adjust radius to be smaller
      restitution: 1,
    });
    World.add(world, ball);

    // Create a ground in Matter.js
    const ground = Bodies.rectangle(400, 580, 800, 40, { isStatic: true });
    World.add(world, ground);

    // Initialize PixiJS Application
    const app = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundColor: 0x1099bb,
    });

    // Append the canvas to the DOM
    if (sceneRef.current) {
      sceneRef.current.appendChild(app.view as HTMLCanvasElement); // Correct use of `app.view`
    }

    // Create PixiJS sprite for the ball using the SVG texture
    const ballTexture = PIXI.Texture.from(ballSpike);
    const ballSprite = new PIXI.Sprite(ballTexture);
    ballSprite.anchor.set(0.5);
    ballSprite.width = 100; // Match the size of the smaller ball
    ballSprite.height = 100; // Match the size of the smaller ball
    app.stage.addChild(ballSprite);

    // Create PixiJS graphics for the ground
    const groundGraphics = new PIXI.Graphics();
    groundGraphics.beginFill(0x00ff00);
    groundGraphics.drawRect(0, 0, 800, 40);
    groundGraphics.endFill();
    groundGraphics.y = 580 - 20; // Adjust position to match Matter.js ground
    app.stage.addChild(groundGraphics);

    // Smoke particle container
    const smokeContainer = new PIXI.Container();
    app.stage.addChild(smokeContainer);

    // Timer to stop generating smoke after 3 seconds
    const smokeDuration = 3000; // 3 seconds
    const startTime = Date.now();

    // Update function for syncing Matter.js and PixiJS
    const update = () => {
      Engine.update(engine);

      // Sync ball position
      // ballGraphics.x = ball.position.x;
      // ballGraphics.y = ball.position.y;
      ballSprite.x = ball.position.x;
      ballSprite.y = ball.position.y;

      // Ensure the ball touches the ground
      if (ballSprite.y + ballSprite.height / 2 > groundGraphics.y) {
        ballSprite.y = groundGraphics.y - ballSprite.height / 2;
      }

      // Generate smoke particles if within smoke duration
      if (Date.now() - startTime < smokeDuration) {
        const smokeParticle = new PIXI.Graphics();
        smokeParticle.beginFill(0xaaaaaa, 0.6);
        smokeParticle.drawCircle(0, 0, 30); // Match the size of the ball
        smokeParticle.endFill();
        smokeParticle.x = ball.position.x;
        smokeParticle.y = ball.position.y;
        smokeContainer.addChild(smokeParticle);

        // Animate smoke particles
        const lifetime = 60; // Frames
        let frame = 0;

        const animateParticle = () => {
          smokeParticle.alpha = 0.6 * (1 - frame / lifetime); // Gradually decrease opacity
          smokeParticle.y -= 1; // Move upwards
          smokeParticle.scale.set(1 + frame / lifetime); // Gradually increase size
          frame++;

          if (frame >= lifetime) {
            smokeContainer.removeChild(smokeParticle);
            smokeParticle.destroy();
          } else {
            requestAnimationFrame(animateParticle);
          }
        };

        animateParticle();
      }
    };

    // PixiJS ticker
    app.ticker.add(update);

    return () => {
      app.destroy(true, { children: true });
      Engine.clear(engine);
      World.clear(world, false);
    };
  }, []);

  return <div ref={sceneRef} />;
};

export default MatterPixiSmoke;
