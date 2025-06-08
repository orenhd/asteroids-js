import { GameObject } from './GameObject';
import { Vector2D } from '../types/Vector2D';

export const enum AsteroidSize {
    Large = 3,
    Medium = 2,
    Small = 1
}

export class Asteroid extends GameObject {
    private static readonly BASE_SPEED = 50;
    private static readonly SPEED_INCREASE_PER_SIZE = 25;
    private static readonly MAX_ROTATION_SPEED = Math.PI / 2; // radians per second
    private static readonly SIZE_RADIUS_MULTIPLIER = 10;
    private static readonly SPLIT_OFFSET = 20;
    private static readonly NUM_SPLIT_ASTEROIDS = 2;

    private readonly rotationSpeed: number;
    private readonly size: AsteroidSize;

    constructor(x: number, y: number, size: AsteroidSize) {
        super(x, y);
        this.size = size;
        // Random rotation speed between -PI/2 and PI/2 radians per second
        this.rotationSpeed = (Math.random() - 0.5) * Asteroid.MAX_ROTATION_SPEED * 2;
        
        // Set random velocity based on size
        const speed = Asteroid.BASE_SPEED + (4 - size) * Asteroid.SPEED_INCREASE_PER_SIZE; // Smaller asteroids move faster
        const angle = Math.random() * Math.PI * 2;
        this.velocity = new Vector2D(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
    }

    public update(delta: number): void {
        // Rotate the asteroid
        this.rotation += this.rotationSpeed * delta / 1000;
        
        // Move the asteroid
        this.moveByVelocity(delta);
        this.wrapPosition(800, 600); // TODO: Get actual canvas dimensions
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        this.drawWrapped(ctx, () => {
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(this.rotation);

            const radius = this.size * Asteroid.SIZE_RADIUS_MULTIPLIER;
            ctx.beginPath();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();
        });
    }

    public getSize(): AsteroidSize {
        return this.size;
    }

    public getCollisionRadius(): number {
        return this.size * Asteroid.SIZE_RADIUS_MULTIPLIER;
    }

    protected getWrapRadius(): number {
        return this.size * Asteroid.SIZE_RADIUS_MULTIPLIER;
    }

    public split(): Asteroid[] {
        if (this.size === AsteroidSize.Small) {
            return [];
        }

        const newSize = this.size - 1;
        const newAsteroids: Asteroid[] = [];

        // Create two smaller asteroids
        for (let i = 0; i < Asteroid.NUM_SPLIT_ASTEROIDS; i++) {
            const offset = new Vector2D(
                (Math.random() - 0.5) * Asteroid.SPLIT_OFFSET,
                (Math.random() - 0.5) * Asteroid.SPLIT_OFFSET
            );
            const newPos = this.position.add(offset);
            newAsteroids.push(new Asteroid(newPos.x, newPos.y, newSize));
        }

        return newAsteroids;
    }
} 