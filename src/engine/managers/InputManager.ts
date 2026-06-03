export class InputManager {
    private static instance: InputManager;
    private keys: { [key: string]: boolean } = {};
    public mousePos = { x: 0, y: 0 };
    private mouseButtons: { [button: number]: boolean } = {};
    private touchVector = { x: 0, y: 0 };

    private constructor() {
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
        window.addEventListener('mousemove', (e) => {
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
        });
        window.addEventListener('mousedown', (e) => {
            this.mouseButtons[e.button] = true;
        });
        window.addEventListener('mouseup', (e) => {
            this.mouseButtons[e.button] = false;
        });
        window.addEventListener('blur', () => {
            this.keys = {};
            this.mouseButtons = {};
            this.touchVector = { x: 0, y: 0 };
        });
    }

    public static getInstance(): InputManager {
        if (!InputManager.instance) {
            InputManager.instance = new InputManager();
        }
        return InputManager.instance;
    }

    public setTouchVector(x: number, y: number) {
        this.touchVector = { x, y };
    }

    public isKeyDown(code: string): boolean {
        return !!this.keys[code];
    }

    public isMouseDown(button: number): boolean {
        return !!this.mouseButtons[button];
    }

    private getKeyboardVector() {
        const vector = { x: 0, y: 0 };
        if (this.isKeyDown('KeyW') || this.isKeyDown('ArrowUp')) vector.y -= 1;
        if (this.isKeyDown('KeyS') || this.isKeyDown('ArrowDown')) vector.y += 1;
        if (this.isKeyDown('KeyA') || this.isKeyDown('ArrowLeft')) vector.x -= 1;
        if (this.isKeyDown('KeyD') || this.isKeyDown('ArrowRight')) vector.x += 1;
        return vector;
    }

    private getMouseVector() {
        if (!this.isMouseDown(0)) return { x: 0, y: 0 };

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const vector = {
            x: this.mousePos.x - centerX,
            y: this.mousePos.y - centerY,
        };

        const deadzone = 18;
        const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        if (length < deadzone) {
            return { x: 0, y: 0 };
        }

        vector.x /= length;
        vector.y /= length;
        return vector;
    }

    public get movementVector() {
        const keyboardVector = this.getKeyboardVector();
        const mouseVector = this.getMouseVector();
        const vector = {
            x: keyboardVector.x + mouseVector.x + this.touchVector.x,
            y: keyboardVector.y + mouseVector.y + this.touchVector.y,
        };

        if (vector.x !== 0 || vector.y !== 0) {
            const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
            vector.x /= length;
            vector.y /= length;
        }

        return vector;
    }
}
