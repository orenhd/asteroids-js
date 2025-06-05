export class InputManager {
    private static instance: InputManager;
    private keys: { [key: string]: boolean } = {};

    private constructor() {
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    public static getInstance(): InputManager {
        if (!InputManager.instance) {
            InputManager.instance = new InputManager();
        }
        return InputManager.instance;
    }

    private onKeyDown(event: KeyboardEvent): void {
        this.keys[event.code] = true;
    }

    private onKeyUp(event: KeyboardEvent): void {
        this.keys[event.code] = false;
    }

    public isKeyPressed(keyCode: string): boolean {
        return this.keys[keyCode] === true;
    }

    public clearKeys(): void {
        this.keys = {};
    }
} 