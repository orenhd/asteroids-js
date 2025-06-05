import { AsteroidsGame } from './game/AsteroidsGame';
import './style.css';

// Create game container and canvas
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <div class="game-container">
    <canvas id="gameCanvas"></canvas>
  </div>
`;

// Initialize and start the game
const game = new AsteroidsGame('gameCanvas');
game.start();
