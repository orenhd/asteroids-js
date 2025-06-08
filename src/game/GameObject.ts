import { Vector2D } from '../types/Vector2D';

export abstract class GameObject {
    protected position: Vector2D;
    protected velocity: Vector2D;
    protected rotation: number;
    protected scale: number;
    protected active: boolean;

    constructor(x: number = 0, y: number = 0) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D();
        this.rotation = 0;
        this.scale = 1;
        this.active = true;
    }

    public abstract update(delta: number): void;
    public abstract draw(ctx: CanvasRenderingContext2D): void;
    protected abstract getWrapRadius(): number;

    protected drawWrapped(ctx: CanvasRenderingContext2D, drawFn: () => void): void {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        
        // Original position
        ctx.save();
        drawFn();
        ctx.restore();

        // Get the wrap radius for this object
        const radius = this.getWrapRadius();
        
        // Draw wrapped copies when near edges
        if (this.position.x < radius) {
            // Draw on right edge
            ctx.save();
            ctx.translate(width, 0);
            drawFn();
            ctx.restore();
        } else if (this.position.x > width - radius) {
            // Draw on left edge
            ctx.save();
            ctx.translate(-width, 0);
            drawFn();
            ctx.restore();
        }

        if (this.position.y < radius) {
            // Draw on bottom edge
            ctx.save();
            ctx.translate(0, height);
            drawFn();
            ctx.restore();
        } else if (this.position.y > height - radius) {
            // Draw on top edge
            ctx.save();
            ctx.translate(0, -height);
            drawFn();
            ctx.restore();
        }

        // Draw corner copies when near corners
        if ((this.position.x < radius && this.position.y < radius) ||
            (this.position.x < radius && this.position.y > height - radius) ||
            (this.position.x > width - radius && this.position.y < radius) ||
            (this.position.x > width - radius && this.position.y > height - radius)) {
            
            // Draw diagonally wrapped copy
            ctx.save();
            if (this.position.x < radius) {
                ctx.translate(width, 0);
            } else {
                ctx.translate(-width, 0);
            }
            if (this.position.y < radius) {
                ctx.translate(0, height);
            } else {
                ctx.translate(0, -height);
            }
            drawFn();
            ctx.restore();
        }
    }

    public isActive(): boolean {
        return this.active;
    }

    public setActive(active: boolean): void {
        this.active = active;
    }

    public getPosition(): Vector2D {
        return this.position.clone();
    }

    public setPosition(x: number, y: number): void {
        this.position.x = x;
        this.position.y = y;
    }

    public getVelocity(): Vector2D {
        return this.velocity.clone();
    }

    public setVelocity(x: number, y: number): void {
        this.velocity.x = x;
        this.velocity.y = y;
    }

    public getRotation(): number {
        return this.rotation;
    }

    public setRotation(rotation: number): void {
        this.rotation = rotation;
    }

    protected wrapPosition(width: number, height: number): void {
        if (this.position.x < 0) this.position.x = width;
        if (this.position.x > width) this.position.x = 0;
        if (this.position.y < 0) this.position.y = height;
        if (this.position.y > height) this.position.y = 0;
    }

    protected moveByVelocity(delta: number): void {
        this.position = this.position.add(this.velocity.multiply(delta / 1000));
    }
} 