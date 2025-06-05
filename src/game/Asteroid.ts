import { GameObject } from './GameObject';
import { Vector2D } from '../types/Vector2D';

export enum AsteroidSize {
    Large = 3,
    Medium = 2,
    Small = 1
}

export class Asteroid extends GameObject {
    private readonly rotationSpeed: number;
    private readonly baseRadius: number;

    constructor(x: number, y: number, private size: AsteroidSize) {
        super(x, y);
        
        // Set properties based on size
        this.baseRadius = size * 15;
        const speed = 100 - size * 20; // Smaller asteroids move faster
        
        // Random velocity
        const angle = Math.random() * Math.PI * 2;
        this.velocity = new Vector2D(Math.cos(angle), Math.sin(angle))
            .multiply(speed);
        
        // Random rotation speed
        this.rotationSpeed = (Math.random() - 0.5) * Math.PI; // +/- π/2 radians per second
    }

    public getSize(): AsteroidSize {
        return this.size;
    }

    public getRadius(): number {
        return this.baseRadius;
    }

    public update(delta: number): void {
        if (!this.active) return;

        // Move the asteroid
        this.moveByVelocity(delta);
        this.wrapPosition(800, 600); // TODO: Get actual canvas dimensions
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.arc(0, 0, this.baseRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
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