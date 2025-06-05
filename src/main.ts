import { AsteroidsGame } from './game/AsteroidsGame';
import './style.css';

// Get the canvas element
const canvas = document.getElementById('gameCanvas');
if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Canvas element not found');
}

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Create and start game
const game = new AsteroidsGame(canvas);
game.start();
