export class Vector2D {
    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    add(other: Vector2D): Vector2D {
        return new Vector2D(this.x + other.x, this.y + other.y);
    }

    subtract(other: Vector2D): Vector2D {
        return new Vector2D(this.x - other.x, this.y - other.y);
    }

    multiply(scalar: number): Vector2D {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize(): Vector2D {
        const mag = this.magnitude();
        if (mag === 0) return new Vector2D();
        return this.multiply(1 / mag);
    }

    rotate(angle: number): Vector2D {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector2D(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos
        );
    }

    clone(): Vector2D {
        return new Vector2D(this.x, this.y);
    }

    dot(other: Vector2D): number {
        return this.x * other.x + this.y * other.y;
    }
} 