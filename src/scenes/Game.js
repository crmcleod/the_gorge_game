import { Scene } from 'phaser';

var cursors;
var player;
var score = 0;
var remainingFenceSections;

var scoreText;
var platforms;

function interactWithfix(player, fix, context) {
    fix.disableBody(true, true);

    score += 1;
    scoreText.setText(`FENCE SECTIONS FIXED: ${score}`);
    remainingFenceSections -= 1;

    // Regenerate fix signs if all are collected
    if (!remainingFenceSections) {
        addFixSigns(context); // regenerate fix signs
    }
}

function addFixSigns(context) {
    // Clear existing 'fix' signs
    if (context.fix) {
        context.fix.clear(true, true); // Removes all existing fix signs
    }

    // Create new 'fix' signs
    context.fix = context.physics.add.group({
        key: 'fix',
        repeat: 11,
        setXY: { x: 120, y: 100, stepX: 70 }
    });

    remainingFenceSections = context.fix.getLength(); // set new remaining fence sections

    // Set properties for each 'fix' sign
    context.fix.children.iterate(function (child, index) {
        child.setScale(2);
        child.setX(70+((((Math.random()*20)+80)*index)))
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    context.physics.add.collider(context.fix, platforms); // collision with platforms
    context.physics.add.overlap(player, context.fix, (player, fix) => interactWithfix(player, fix, context), null, context); // pass context to overlap handler
}

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    preload() {
        this.load.setPath('assets');

        this.load.image('background', 'main_scene.png');
        this.load.image('platform', 'platformblue.png');
        this.load.image('fix', 'fix.png');
        this.load.spritesheet('dude', 'dude.png', { frameWidth: 32, frameHeight: 48 });
    }

    create() {
        this.input.setDefaultCursor('url(/public/assets/crosshair.png), pointer')
        this.physics.world.setBounds(0, 0, this.sys.game.config.width, 920);

        this.add.image(602, 482, 'background');
        platforms = this.physics.add.staticGroup();
        platforms.create(602, 470, 'platform').setScale(8).refreshBody();

        player = this.physics.add.sprite(100, 300, 'dude').setScale(1.5);
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);

        const gameHeight = this.sys.game.config.height;

        this.anims.create({
            key: 'zombie-walk',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }), // adjust frame range
            frameRate: 10,
            repeat: -1 // loop forever
        });

        this.zombiesHorde = []; // array to store zombies

        // Create zombies
        for (let i = 0; i < Math.ceil(Math.random() * 10) + 5; i++) {
            const x = Phaser.Math.Between(50, this.sys.game.config.width - 50); // random x
            const y = gameHeight - 100; // ground level

            const zombies = this.physics.add.sprite(x, y, 'dude');
            zombies.setInteractive();
            zombies.on('pointerdown', (pointer) => {
                zombies.disableBody(true,true)
                createRedFlash(pointer.x, pointer.y, this)
            })
            zombies.setVelocityX(Phaser.Math.Between(80, 120)); // random speed
            zombies.setCollideWorldBounds(true);
            zombies.body.onWorldBounds = true;
            zombies.anims.play('zombie-walk', true);

            this.zombiesHorde.push(zombies);
        }

        // Player animations
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        // Zombie world bounds handling
        this.physics.world.on('worldbounds', (body, up, down, left, right) => {
            const zombiesObj = body.gameObject;

            if (this.zombiesHorde.includes(zombiesObj)) {
                if (right) { 
                    zombiesObj.setVelocityX((-Math.random() * 100) - 200);
                    zombiesObj.setFlipX(true);
                    zombiesObj.anims.play('zombie-walk', true);
                } else if (left) {
                    zombiesObj.setVelocityX((Math.random() * 100) + 200);
                    zombiesObj.setFlipX(false);
                    zombiesObj.anims.play('zombie-walk', true);
                }
            }
        });

        this.physics.add.collider(player, platforms);

        // Initialize fix signs
        addFixSigns(this);

        // Score text
        scoreText = this.add.text(16, 16, 'SCORE: 0', { fontSize: '32px', fill: '#FFF' });

        function createRedFlash(x, y, context) {
            const flash = context.add.graphics();
            flash.fillStyle(0xff0000, 0.6)
            flash.fillCircle(x, y, 20); // Create a circle at the click position with radius 20
            
            flash.setOrigin(x,y)
            // Tween to scale the circle and fade it out
            context.tweens.add({
                targets: flash,
                alpha: 0, // Fade out
                scaleX: 3, // Scale up horizontally
                scaleY: 3, // Scale up vertically
                duration: 1000, // Duration of the animation (half a second)
                onComplete: () => {
                    flash.destroy(); // Destroy the graphic after animation
                }
            })}
    }

    update() {
        cursors = this.input.keyboard.createCursorKeys();

        if (cursors.left.isDown) {
            player.setVelocityX(-300);
            player.anims.play('left', true);
        } else if (cursors.right.isDown) {
            player.setVelocityX(300);
            player.anims.play('right', true);
        } else {
            player.setVelocityX(0);
            player.anims.play('turn');
        }

        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-330);
        }
    }
}
