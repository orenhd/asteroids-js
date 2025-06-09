import { AsteroidsGame } from './game/AsteroidsGame';
import './style.css';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
if (!canvas) {
    throw new Error('Could not find canvas element');
}

// Create and start game
const game = new AsteroidsGame(canvas);
game.start();
