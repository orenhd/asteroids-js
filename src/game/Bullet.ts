import { GameObject } from './GameObject';
import { Vector2D } from '../types/Vector2D';

export class Bullet extends GameObject {
    private readonly BULLET_SPEED = 500; // Pixels per second
    private readonly LIFETIME = 1000; // Milliseconds
    private timeAlive: number = 0;

    constructor(position: Vector2D, rotation: number) {
        super(position.x, position.y);
        this.velocity = new Vector2D(0, -1)
            .rotate(rotation)
            .multiply(this.BULLET_SPEED);
    }

    public update(delta: number): void {
        if (!this.active) return;

        this.timeAlive += delta;
        if (this.timeAlive >= this.LIFETIME) {
            this.active = false;
            return;
        }

        this.moveByVelocity(delta);
        this.wrapPosition(800, 600); // TODO: Get actual canvas dimensions
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (!this.active) return;

        this.drawWrapped(ctx, () => {
            ctx.translate(this.position.x, this.position.y);
            
            ctx.beginPath();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.arc(0, 0, 2, 0, Math.PI * 2);
            ctx.stroke();
        });
    }

    protected getWrapRadius(): number {
        return 2;
    }
} 