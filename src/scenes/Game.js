import { Scene } from 'phaser';

var cursors;
var player;
var bomb;
var zombies;
var score = 0;
var scoreText;

function  interactWithBomb(player, bomb){
    bomb.disableBody(true, true);
    
    score+=10;
    console.log(score)
    scoreText.setText(`SCORE: ${score}`)
}

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    preload ()
    {
        this.load.setPath('assets');
        
        this.load.image('background', 'main_scene.png');
        this.load.image('platform', 'platformblue.png')
        this.load.image('bomb', 'bomb.png')
        this.load.spritesheet('dude', 
            'dude.png',
            { frameWidth: 32, frameHeight: 48 }
        );
    }
    create ()
    {
        this.physics.world.setBounds(0, 0, this.sys.game.config.width, 920);

        this.add.image(602, 482, 'background');
        var platforms
        platforms = this.physics.add.staticGroup();
        platforms.create(602,470, 'platform').setScale(8).refreshBody()

        player = this.physics.add.sprite(100, 300, 'dude')
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);

        const gameHeight = this.sys.game.config.height;


        zombies = this.physics.add.sprite(0, gameHeight - 100, 'dude');
        zombies.setOrigin(0,0)
        zombies.setCollideWorldBounds(true);

        zombies.setVelocity(100)

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });
        
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.physics.add.collider(player, platforms)
        bomb = this.physics.add.group({
            key: 'bomb',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        })
        bomb.children.iterate(function (child) {

            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        
        });
        this.physics.add.collider(bomb, platforms);
        this.physics.add.overlap(player, bomb, interactWithBomb, null, this);

        scoreText = this.add.text(16, 16, 'SCORE: 0', { fontSize: '32px', fill: '#FFF' });
    }

  

    update() {
        cursors = this.input.keyboard.createCursorKeys();
        if (cursors.left.isDown)
            {
                player.setVelocityX(-300);
            
                player.anims.play('left', true);
            }
            else if (cursors.right.isDown)
            {
                player.setVelocityX(300);
            
                player.anims.play('right', true);
            }
            else
            {
                player.setVelocityX(0);
            
                player.anims.play('turn');
            }
            
            if (cursors.up.isDown && player.body.touching.down)
            {
                player.setVelocityY(-330);
            }

    }
}
