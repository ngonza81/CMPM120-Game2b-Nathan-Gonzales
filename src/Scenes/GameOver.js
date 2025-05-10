class GameOver extends Phaser.Scene {
    constructor() {
        super('gameOver');
    }

    init(data) {
        this.finalScore = data.score;
    }

    preload() {

    }

    create() {
        this.add.bitmapText(this.cameras.main.width / 2, 200, "rocketSquare", 'Game Over').setScale(2).setOrigin(0.5);;
        this.add.bitmapText(this.cameras.main.width / 2, 300, "rocketSquare", "Score: " + this.finalScore).setScale(1.25).setOrigin(0.5);;
        this.add.bitmapText(this.cameras.main.width / 2, 400, "rocketSquare", 'Press SPACE to Restart').setScale(1.25).setOrigin(0.5);;
        this.goToNextScene = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.goToNextScene)) {
            this.scene.start("animalAttack");
        }
    }
 }