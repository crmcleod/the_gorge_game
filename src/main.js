import { Game as MainGame } from './scenes/Game';
import { AUTO, Scale,Game, Physics } from 'phaser';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: AUTO,
    width: 1204,
    height: 964,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    },
    parent: 'game-container',
    scale: {
        mode: Scale.MAX_ZOOM,
        autoCenter: Scale.CENTER_BOTH
    },
    scene: [
        MainGame
    ]
};

export default new Game(config);
