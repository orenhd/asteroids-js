export class GameEngine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private isPaused: boolean = false;
    private last: number = performance.now();
    private readonly targetFps: number = 60;
    private readonly frameInterval: number = 1000 / this.targetFps;

    constructor(canvasId: string) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) {
            throw new Error(`Canvas with id ${canvasId} not found`);
        }
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get 2D context');
        }
        this.ctx = ctx;

        // Setup pause/unpause handlers
        window.addEventListener('blur', () => this.isPaused = true);
        window.addEventListener('focus', () => {
            if (this.isPaused) {
                this.last = performance.now();
                this.isPaused = false;
            }
        });
    }

    public start(): void {
        this.gameLoop();
    }

    private gameLoop = (): void => {
        if (!this.isPaused) {
            const now = performance.now();
            const delta = now - this.last;

            // Only update if we've exceeded our target frame interval
            if (delta >= this.frameInterval) {
                // Update game state
                this.update(delta);

                // Clear canvas
                this.clear();

                // Draw game state
                this.draw();

                // Update last frame time, accounting for any extra time beyond the frame interval
                this.last = now - (delta % this.frameInterval);
            }
        }
        requestAnimationFrame(this.gameLoop);
    }

    private clear(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    protected update(delta: number): void {
        // To be overridden by game implementation
    }

    protected draw(): void {
        // To be overridden by game implementation
    }

    public getContext(): CanvasRenderingContext2D {
        return this.ctx;
    }

    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }
} 