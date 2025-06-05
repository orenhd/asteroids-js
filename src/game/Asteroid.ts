import { GameObject } from './GameObject';
import { Vector2D } from '../types/Vector2D';

export const enum AsteroidSize {
    Large = 3,
    Medium = 2,
    Small = 1
}

export class Asteroid extends GameObject {
    private readonly rotationSpeed: number;
    private readonly size: AsteroidSize;

    constructor(x: number, y: number, size: AsteroidSize) {
        super(x, y);
        this.size = size;
        // Random rotation speed between -PI/2 and PI/2 radians per second
        this.rotationSpeed = (Math.random() - 0.5) * Math.PI;
        
        // Set random velocity based on size
        const speed = 50 + (4 - size) * 25; // Smaller asteroids move faster
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
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);

        const radius = this.size * 10;
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    public getSize(): AsteroidSize {
        return this.size;
    }

    public getCollisionRadius(): number {
        return this.size * 10;
    }

    public split(): Asteroid[] {
        if (this.size === AsteroidSize.Small) {
            return [];
        }

        const newSize = this.size - 1;
        const newAsteroids: Asteroid[] = [];

        // Create two smaller asteroids
        for (let i = 0; i < 2; i++) {
            const offset = new Vector2D(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
            );
            const newPos = this.position.add(offset);
            newAsteroids.push(new Asteroid(newPos.x, newPos.y, newSize));
        }

        return newAsteroids;
    }
} 