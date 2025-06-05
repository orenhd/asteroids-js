import { GameObject } from './GameObject';
import { Vector2D } from '../types/Vector2D';
import { InputManager } from '../engine/InputManager';
import { Bullet } from './Bullet';

export class Player extends GameObject {
    private readonly ROTATION_SPEED = Math.PI; // Radians per second
    private readonly ACCELERATION = 200; // Pixels per second squared
    private readonly DECELERATION = 300; // Pixels per second squared (faster than acceleration)
    private readonly FRICTION = 0.99; // Velocity multiplier per second
    private readonly MAX_SPEED = 400; // Maximum speed in pixels per second
    private readonly FIRE_RATE = 250; // Milliseconds between shots
    private readonly COLLISION_RADIUS = 15; // Pixels
    private readonly EXPLOSION_DURATION = 2000; // Milliseconds
    private readonly CHEVRON_DEPTH = 5; // How far up the base point moves
    private readonly THRUST_FADE_DURATION = 600; // Milliseconds for thrust fade in/out

    private input: InputManager;
    private thrusting: boolean = false;
    private reversing: boolean = false;
    private lastThrustTime: number = 0;
    private lastFireTime: number = 0;
    private bullets: Bullet[] = [];
    private exploding: boolean = false;
    private explosionTime: number = 0;
    private explosionLines: { start: Vector2D, end: Vector2D, velocity: Vector2D }[] = [];

    constructor(x: number, y: number) {
        super(x, y);
        this.input = InputManager.getInstance();
    }

    public update(delta: number): void {
        if (!this.active) return;

        if (this.exploding) {
            this.updateExplosion(delta);
            return;
        }

        // Handle rotation
        if (this.input.isKeyPressed('ArrowLeft')) {
            this.rotation -= this.ROTATION_SPEED * delta / 1000;
        }
        if (this.input.isKeyPressed('ArrowRight')) {
            this.rotation += this.ROTATION_SPEED * delta / 1000;
        }

        // Handle thrust and reverse
        const wasThrusting = this.thrusting;
        const wasReversing = this.reversing;
        this.thrusting = this.input.isKeyPressed('ArrowUp');
        this.reversing = this.input.isKeyPressed('ArrowDown');

        // Can't thrust and reverse at the same time
        if (this.thrusting && this.reversing) {
            this.thrusting = false;
            this.reversing = false;
        }
        
        // Update thrust timing when state changes
        if (this.thrusting !== wasThrusting || this.reversing !== wasReversing) {
            this.lastThrustTime = 0;
        }
        this.lastThrustTime += delta;

        if (this.thrusting) {
            const thrustVector = new Vector2D(0, -1)
                .rotate(this.rotation)
                .multiply(this.ACCELERATION * delta / 1000);
            this.velocity = this.velocity.add(thrustVector);

            // Limit speed
            const speed = this.velocity.magnitude();
            if (speed > this.MAX_SPEED) {
                this.velocity = this.velocity.multiply(this.MAX_SPEED / speed);
            }
        } else if (this.reversing) {
            // Get ship's forward direction vector
            const shipDirection = new Vector2D(0, -1).rotate(this.rotation);
            
            // Project current velocity onto ship's direction
            const projection = this.velocity.dot(shipDirection);
            
            // Only decelerate if we have forward velocity
            if (projection > 0) {
                // Calculate deceleration that would occur this frame
                const decelAmount = this.DECELERATION * delta / 1000;
                
                // If we would decelerate past zero in this direction, remove all velocity in this direction
                if (decelAmount >= projection) {
                    // Remove the projected component from velocity
                    this.velocity = this.velocity.subtract(shipDirection.multiply(projection));
                } else {
                    // Apply deceleration in ship's direction
                    this.velocity = this.velocity.subtract(shipDirection.multiply(decelAmount));
                }
            }
        }

        // Handle shooting
        if (this.input.isKeyPressed('Space')) {
            this.tryShoot();
        }

        // Apply friction
        this.velocity = this.velocity.multiply(Math.pow(this.FRICTION, delta / 1000));

        // Move the ship
        this.moveByVelocity(delta);
        this.wrapPosition(800, 600); // TODO: Get actual canvas dimensions

        // Update bullets
        this.bullets = this.bullets.filter(bullet => bullet.isActive());
        this.bullets.forEach(bullet => bullet.update(delta));

        // Update last fire time
        this.lastFireTime += delta;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (!this.active) return;

        // Draw bullets
        this.bullets.forEach(bullet => bullet.draw(ctx));

        if (this.exploding) {
            this.drawExplosion(ctx);
            return;
        }

        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);

        // Draw the ship
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;

        // Calculate base point using trigonometry
        const baseX = 0;
        const baseY = 15 - this.CHEVRON_DEPTH;

        // Draw triangle with chevron base
        ctx.moveTo(0, -15);     // Nose
        ctx.lineTo(10, 15);     // Bottom right
        ctx.lineTo(baseX, baseY); // Base middle point
        ctx.lineTo(-10, 15);    // Bottom left
        ctx.lineTo(0, -15);     // Back to nose
        ctx.stroke();

        // Calculate thrust alpha based on timing
        let thrustAlpha = 0;
        if (this.thrusting) {  // Only show thrust during forward acceleration
            // Fade in
            thrustAlpha = Math.min(1, this.lastThrustTime / this.THRUST_FADE_DURATION);
        } else if (this.lastThrustTime < this.THRUST_FADE_DURATION) {
            // Fade out
            thrustAlpha = 1 - (this.lastThrustTime / this.THRUST_FADE_DURATION);
        }

        if (thrustAlpha > 0) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${thrustAlpha})`;
            ctx.moveTo(-5, 15);    // Left
            ctx.lineTo(0, 20);     // Bottom
            ctx.lineTo(5, 15);     // Right
            ctx.stroke();
        }

        ctx.restore();
    }

    private tryShoot(): void {
        if (this.lastFireTime >= this.FIRE_RATE) {
            const bulletPos = this.position.add(
                new Vector2D(0, -15).rotate(this.rotation)
            );
            this.bullets.push(new Bullet(bulletPos, this.rotation));
            this.lastFireTime = 0;
        }
    }

    public getBullets(): Bullet[] {
        return this.bullets;
    }

    public getCollisionRadius(): number {
        return this.COLLISION_RADIUS;
    }

    public explode(): void {
        if (!this.exploding) {
            this.exploding = true;
            this.explosionTime = 0;
            this.explosionLines = [];
            
            // Reset thrust state
            this.thrusting = false;
            this.reversing = false;
            this.lastThrustTime = 0;

            // Ship points for explosion with chevron
            const baseY = 15 - this.CHEVRON_DEPTH;
            const points = [
                new Vector2D(0, -15),     // Nose
                new Vector2D(10, 15),     // Bottom right
                new Vector2D(0, baseY),   // Base middle
                new Vector2D(-10, 15)     // Bottom left
            ];

            // Create explosion lines
            for (let i = 0; i < points.length; i++) {
                const start = points[i].rotate(this.rotation);
                const end = points[(i + 1) % points.length].rotate(this.rotation);
                const center = start.add(end).multiply(0.5);
                const velocity = center.normalize().multiply(100);

                this.explosionLines.push({
                    start: start,
                    end: end,
                    velocity: velocity
                });
            }
        }
    }

    private updateExplosion(delta: number): void {
        this.explosionTime += delta;

        if (this.explosionTime >= this.EXPLOSION_DURATION) {
            this.exploding = false;
            this.active = false;
            return;
        }

        // Update explosion line positions
        for (const line of this.explosionLines) {
            const movement = line.velocity.multiply(delta / 1000);
            line.start = line.start.add(movement);
            line.end = line.end.add(movement);
        }
    }

    private drawExplosion(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        const alpha = 1 - (this.explosionTime / this.EXPLOSION_DURATION);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 2;

        for (const line of this.explosionLines) {
            ctx.beginPath();
            ctx.moveTo(line.start.x, line.start.y);
            ctx.lineTo(line.end.x, line.end.y);
            ctx.stroke();
        }

        ctx.restore();
    }
} 