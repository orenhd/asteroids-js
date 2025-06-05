import { GameEngine } from '../engine/GameEngine';
import { Player } from './Player';
import { Asteroid, AsteroidSize } from './Asteroid';
import { Vector2D } from '../types/Vector2D';

export class AsteroidsGame extends GameEngine {
    private player!: Player;
    private readonly CANVAS_WIDTH = 800;
    private readonly CANVAS_HEIGHT = 600;
    private asteroids: Asteroid[] = [];
    private score: number = 0;
    private level: number = 1;

    constructor(canvasId: string) {
        super(canvasId);
        this.init();
    }

    private init(): void {
        // Set canvas size
        const canvas = this.getCanvas();
        canvas.width = this.CANVAS_WIDTH;
        canvas.height = this.CANVAS_HEIGHT;

        // Create player at center of screen
        this.player = new Player(
            this.CANVAS_WIDTH / 2,
            this.CANVAS_HEIGHT / 2
        );

        // Start first level
        this.startLevel();
    }

    private startLevel(): void {
        // Clear any existing asteroids
        this.asteroids = [];

        // Create initial asteroids
        const asteroidCount = 2 + this.level;
        for (let i = 0; i < asteroidCount; i++) {
            this.spawnAsteroid();
        }
    }

    private spawnAsteroid(): void {
        // Spawn asteroid at random edge position
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 : this.CANVAS_WIDTH;
            y = Math.random() * this.CANVAS_HEIGHT;
        } else {
            x = Math.random() * this.CANVAS_WIDTH;
            y = Math.random() < 0.5 ? 0 : this.CANVAS_HEIGHT;
        }
        
        this.asteroids.push(new Asteroid(x, y, AsteroidSize.Large));
    }

    protected override update(delta: number): void {
        // Update game objects
        this.player.update(delta);
        this.asteroids.forEach(asteroid => asteroid.update(delta));

        // Check collisions
        this.checkCollisions();

        // Check level completion
        if (this.asteroids.length === 0) {
            this.level++;
            this.startLevel();
        }
    }

    protected override draw(): void {
        const ctx = this.getContext();

        // Draw game objects
        this.asteroids.forEach(asteroid => asteroid.draw(ctx));
        this.player.draw(ctx);

        // Draw score
        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${this.score}`, 10, 30);
        ctx.fillText(`Level: ${this.level}`, 10, 60);
    }

    private checkCollisions(): void {
        // Check bullet-asteroid collisions
        const bullets = this.player.getBullets();
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            for (let j = this.asteroids.length - 1; j >= 0; j--) {
                const asteroid = this.asteroids[j];
                const distance = bullet.getPosition().subtract(asteroid.getPosition()).magnitude();
                
                if (distance < asteroid.getRadius()) {
                    // Split asteroid
                    const newAsteroids = asteroid.split();
                    this.asteroids.push(...newAsteroids);

                    // Update score
                    this.score += (4 - asteroid.getSize()) * 100;

                    // Remove bullet and asteroid
                    bullet.setActive(false);
                    this.asteroids.splice(j, 1);
                    break;
                }
            }
        }

        // Check player-asteroid collisions
        if (!this.player.isActive()) return;
        
        for (const asteroid of this.asteroids) {
            const distance = this.player.getPosition().subtract(asteroid.getPosition()).magnitude();
            if (distance < this.player.getCollisionRadius() + asteroid.getRadius()) {
                // Start explosion animation
                this.player.explode();

                // Reset player after explosion
                setTimeout(() => {
                    this.player = new Player(this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2);
                }, 2000);
                break;
            }
        }
    }
} 