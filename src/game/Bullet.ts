import { GameObject } from './GameObject';
import { Vector2D } from '../types/Vector2D';
import { GAME_CONSTANTS } from '../constants';

export class Bullet extends GameObject {
    private static readonly BULLET_SPEED = 500; // Pixels per second
    private static readonly LIFETIME = 1000; // Milliseconds
    private static readonly RADIUS = 2; // Pixels
    private static readonly LINE_WIDTH = 2;

    private timeAlive: number = 0;

    constructor(position: Vector2D, rotation: number) {
        super(position.x, position.y);
        this.velocity = new Vector2D(0, -1)
            .rotate(rotation)
            .multiply(Bullet.BULLET_SPEED);
    }

    public update(delta: number): void {
        if (!this.active) return;

        this.timeAlive += delta;
        if (this.timeAlive >= Bullet.LIFETIME) {
            this.active = false;
            return;
        }

        this.moveByVelocity(delta);
        this.wrapPosition(GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (!this.active) return;

        this.drawWrapped(ctx, () => {
            ctx.translate(this.position.x, this.position.y);
            
            ctx.beginPath();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = Bullet.LINE_WIDTH;
            ctx.arc(0, 0, Bullet.RADIUS, 0, Math.PI * 2);
            ctx.stroke();
        });
    }

    protected getWrapRadius(): number {
        return Bullet.RADIUS;
    }
} 