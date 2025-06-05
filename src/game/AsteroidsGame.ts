import { GameEngine } from '../engine/GameEngine';
import { Player } from './Player';
import { Asteroid, AsteroidSize } from './Asteroid';

export class AsteroidsGame extends GameEngine {
    private player: Player;
    private asteroids: Asteroid[] = [];
    private score = 0;
    private level = 1;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this.player = new Player(canvas.width / 2, canvas.height / 2);
        this.gameObjects.push(this.player);
        this.startLevel();
    }

    protected update(delta: number): void {
        super.update(delta);
        this.checkCollisions();
    }

    protected draw(): void {
        const ctx = this.getContext();
        
        // Clear canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw all game objects
        this.gameObjects.forEach(obj => obj.draw(ctx));

        // Draw score
        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${this.score}`, 10, 30);
        ctx.fillText(`Level: ${this.level}`, 10, 60);
    }

    private startLevel(): void {
        // Create initial asteroids
        for (let i = 0; i < 4; i++) {
            this.createAsteroid();
        }
    }

    private createAsteroid(): void {
        const ctx = this.getContext();
        const edge = Math.floor(Math.random() * 4);
        let x: number, y: number;

        switch (edge) {
            case 0: // Top
                x = Math.random() * ctx.canvas.width;
                y = 0;
                break;
            case 1: // Right
                x = ctx.canvas.width;
                y = Math.random() * ctx.canvas.height;
                break;
            case 2: // Bottom
                x = Math.random() * ctx.canvas.width;
                y = ctx.canvas.height;
                break;
            default: // Left
                x = 0;
                y = Math.random() * ctx.canvas.height;
                break;
        }

        const asteroid = new Asteroid(x, y, AsteroidSize.Large);
        this.asteroids.push(asteroid);
        this.gameObjects.push(asteroid);
    }

    private checkCollisions(): void {
        // Check bullet-asteroid collisions
        this.player.getBullets().forEach(bullet => {
            this.asteroids.forEach(asteroid => {
                const distance = bullet.getPosition().subtract(asteroid.getPosition()).magnitude();
                if (distance < asteroid.getCollisionRadius()) {
                    bullet.setActive(false);
                    this.splitAsteroid(asteroid);
                }
            });
        });

        // Check player-asteroid collisions
        if (this.player.isActive() && !this.player.isExploding()) {
            this.asteroids.forEach(asteroid => {
                const distance = this.player.getPosition().subtract(asteroid.getPosition()).magnitude();
                if (distance < this.player.getCollisionRadius() + asteroid.getCollisionRadius()) {
                    this.player.explode();
                    this.resetPlayer();
                }
            });
        }
    }

    private splitAsteroid(asteroid: Asteroid): void {
        // Remove the original asteroid
        const asteroidIndex = this.asteroids.indexOf(asteroid);
        if (asteroidIndex > -1) {
            this.asteroids.splice(asteroidIndex, 1);
            const gameObjIndex = this.gameObjects.indexOf(asteroid);
            if (gameObjIndex > -1) {
                this.gameObjects.splice(gameObjIndex, 1);
            }
        }

        // Update score
        this.score += 100;

        // Create new asteroids if not smallest
        if (asteroid.getSize() > AsteroidSize.Small) {
            const newSize = asteroid.getSize() - 1;
            for (let i = 0; i < 2; i++) {
                const newAsteroid = new Asteroid(
                    asteroid.getPosition().x,
                    asteroid.getPosition().y,
                    newSize
                );
                this.asteroids.push(newAsteroid);
                this.gameObjects.push(newAsteroid);
            }
        }

        // Check if level complete
        if (this.asteroids.length === 0) {
            this.level++;
            this.startLevel();
        }
    }

    private resetPlayer(): void {
        setTimeout(() => {
            this.player = new Player(
                this.canvas.width / 2,
                this.canvas.height / 2
            );
            const playerIndex = this.gameObjects.findIndex(obj => obj instanceof Player);
            if (playerIndex > -1) {
                this.gameObjects[playerIndex] = this.player;
            } else {
                this.gameObjects.push(this.player);
            }
        }, 2000);
    }
}   