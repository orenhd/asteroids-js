import { GameObject } from '../game/GameObject';

export abstract class GameEngine {
    protected gameObjects: GameObject[] = [];
    private lastTime: number = 0;
    private running: boolean = false;
    protected canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    public start(): void {
        if (!this.running) {
            this.running = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }

    public stop(): void {
        this.running = false;
    }

    private gameLoop(currentTime: number): void {
        if (!this.running) return;

        const delta = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(delta);
        this.draw();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    protected update(delta: number): void {
        // Update all game objects
        this.gameObjects.forEach(obj => {
            if (obj.isActive()) {
                obj.update(delta);
            }
        });
    }

    protected abstract draw(): void;

    protected getContext(): CanvasRenderingContext2D {
        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('Could not get 2D context from canvas');
        }
        return context;
    }
} 