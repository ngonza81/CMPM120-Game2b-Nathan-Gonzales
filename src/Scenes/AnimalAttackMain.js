class AnimalAttackMain extends Phaser.Scene {
    

    constructor(){
        // Scene
        super('animalAttack');

        // Intializing class variables
        this.my = {sprite: {}, text: {}};

        // Key initializations
        this.goLeftKey = null;
        this.goRightKey = null;
        this.shootKey = null;
    }

    preload() {
        this.load.setPath("./assets/"); // Set load path

        // Loading images
        this.load.image("ship", "ship_D.png");
        this.load.image("bullet", "star_small.png");
        this.load.image("narwhal", "narwhal.png");
        this.load.image("penguin", "penguin.png");
        this.load.image("chicken", "chick.png");
        this.load.image('bg', 'https://labs.phaser.io/assets/skies/space3.png');

        //Loading blowup animation
        this.load.image("blowup1", "Explosion1.png");
        this.load.image("blowup2", "Explosion2.png");
        this.load.image("blowup3", "Explosion3.png");
        this.load.image("blowup4", "Explosion4.png");
        this.load.image("blowup5", "Explosion5.png");
        this.load.image("blowup6", "Explosion6.png");
        this.load.image("blowup7", "Explosion7.png");
        this.load.image("blowup8", "Explosion8.png");
        this.load.image("blowup9", "Explosion9.png");
        this.load.image("blowup10", "Explosion10.png");
        this.load.image("blowup11", "Explosion11.png");
        this.load.image("blowup12", "Explosion12.png");


        // Load the Kenny Rocket Square bitmap font
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");

        // Audio 
        this.load.audio("shootPlayerSound", "laserSmall_001.ogg");
        this.load.audio("explosionSound", "explosionCrunch_000.ogg");
        this.load.audio("explosionPlayerSound", "explosionCrunch_001.ogg");
        this.load.audio("lostLifeSound", "forceField_000.ogg");

    }

    create() {
        let my = this.my;
        const bg = this.add.image(0, 0, 'bg').setOrigin(0, 0);
        bg.setDisplaySize(game.config.width, game.config.height);

        // Create all variables
        this.init_game();

        // update HTML description
        document.getElementById('description').innerHTML = '<h2>Animal Attack</h2><br>A: left // D: right // Space: fire/emit'

        // Put score and lives on screen
        my.text.score = this.add.bitmapText(670, 0, "rocketSquare", "Score: " + this.myScore);
        my.text.lives = this.add.bitmapText(20, 0, "rocketSquare", "Lives: " + this.myLives);

        // Create blowup animation
        this.anims.create({
            key: "blowup",
            frames: [
                { key: "blowup1" },
                { key: "blowup2" },
                { key: "blowup3" },
                { key: "blowup4" },
                { key: "blowup5" },
                { key: "blowup6" },
                { key: "blowup7" },
                { key: "blowup8" },
                { key: "blowup9" },
                { key: "blowup10" },
                { key: "blowup11" },
                { key: "blowup12" },

            ],
            frameRate: 20,
            repeat: 0,
            hideOnComplete: true
        });

        // Creating key objects
        this.goLeftKey = this.input.keyboard.addKey("A");
        this.goRightKey= this.input.keyboard.addKey("D");
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Creating ship sprite
        my.sprite.ship = new Player(this, game.config.width/2, game.config.height - 40, "ship", null,
            this.goLeftKey, this.goRightKey, 5);
        my.sprite.ship.setScale(1.25);

        // Creating narwhal sprite
        my.sprite.narwhal = this.add.sprite(game.config.width/2 - 300, 80, "narwhal");
        my.sprite.narwhal.setScale(0.65);
        my.sprite.narwhal.points = 25;

        // Creating points and spline for Penguin's path
        this.points = [100, 300,
                       500, 300,
                       800, 300
        ];
        this.line = new Phaser.Curves.Spline(this.points);

        // Creating penguin sprite
        my.sprite.penguin = this.add.follower(this.line, 100, 300, "penguin");
        my.sprite.penguin.setScale(0.65);
        my.sprite.penguin.startFollow({
            from: 0,
            to: 1,
            delay: 0,
            duration: 3500,
            ease: 'Sine.easeInOut',
            repeat: -1,
            yoyo: true,
            rotateToPath: true,
            rotationOffset: -90
        });
        my.sprite.penguin.points = 15;

        // Creating chicken sprite
        my.sprite.chicken = this.add.sprite(game.config.width/2 + 300, 80, "chicken");
        my.sprite.chicken.setScale(0.65);
        my.sprite.chicken.points = 25;

        // Randomizing narwhal and chicken locations
        this.time.addEvent({
            delay: Phaser.Math.Between(4000, 7000), 
            callback: this.moveNarwhal,
            callbackScope: this,
            loop: true
        });
        this.time.addEvent({
            delay: Phaser.Math.Between(4000, 7000), 
            callback: this.moveChicken,
            callbackScope: this,
            loop: true
        });

        // Set movement speeds (in pixels/tick)
        this.bulletSpeed = 10;
        this.enemyBulletSpeed = 5;
        
        // Creating enemy shooting event
        this.time.addEvent({
            delay: Phaser.Math.Between(1000, 2000),
            callback: this.enemyShootNarwhal,
            callbackScope: this,
            loop: true
        });
        this.time.addEvent({
            delay: Phaser.Math.Between(3000, 5000),
            callback: this.enemyShootPenguin,
            callbackScope: this,
            loop: true
        });
        this.time.addEvent({
            delay: Phaser.Math.Between(1000, 2000),
            callback: this.enemyShootChicken,
            callbackScope: this,
            loop: true
        });


    }
  
    update() {
        let my = this.my;

        // Check for bullet being fired
        if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
            // Are we under our bullet quota?
            if (my.sprite.bullet.length < this.maxBullets) {
                my.sprite.bullet.push(this.add.sprite(
                    my.sprite.ship.x, my.sprite.ship.y-(my.sprite.ship.displayHeight/2), "bullet")
                );
                this.sound.play("shootPlayerSound", {volume: 1});
            }
        }

        // Remove all of the player bullets which are offscreen
        my.sprite.bullet = my.sprite.bullet.filter((bullet) => bullet.y > -(bullet.displayHeight/2));

        // Make all of the player bullets move
        for (let bullet of my.sprite.bullet) {
            bullet.y -= this.bulletSpeed;
        }

        // update the player avatar by by calling the elephant's update()
        my.sprite.ship.update();

        // Check collison with enemies
        for (let bullet of my.sprite.bullet) {
            // Check collision with Narwhal
            if (this.narwhalIsActive && this.collides(my.sprite.narwhal, bullet)) {
                // start animation
                this.blowup = this.add.sprite(my.sprite.narwhal.x, my.sprite.narwhal.y, "blowup").setScale(0.25).play("blowup");
                // clear out bullet -- put y offscreen, will get reaped next update
                bullet.y = -100;
                this.narwhalIsActive = false;
                my.sprite.narwhal.visible = false;
                my.sprite.narwhal.x = -100;
                // Update score
                this.myScore += my.sprite.narwhal.points;
                this.updateScore();
                // Play sound
                this.sound.play("explosionSound", {volume: 1});
                // Have new enemies appear after end of animation
                this.blowup.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    let minDistance = 300;
                    let maxY = this.my.sprite.ship.y - minDistance;
                    
                    this.narwhalIsActive = true;
                    this.my.sprite.narwhal.visible = true;
                    this.my.sprite.narwhal.x = Phaser.Math.Between(
                        this.my.sprite.narwhal.displayWidth / 2, 
                        game.config.width - this.my.sprite.narwhal.displayWidth / 2
                    );
                    this.my.sprite.narwhal.y = Phaser.Math.Between(
                        this.my.sprite.narwhal.displayHeight / 2,
                        maxY
                    );
                }, this);
            }

            // Check collision with penguin
            if (this.penguinIsActive && this.collides(my.sprite.penguin, bullet)) {
                // start animation
                this.blowup = this.add.sprite(my.sprite.penguin.x, my.sprite.penguin.y, "blowup").setScale(0.25).play("blowup");
                // clear out bullet -- put y offscreen, will get reaped next update
                bullet.y = -100;
                this.penguinIsActive = false;
                my.sprite.penguin.visible = false;
                my.sprite.penguin.x = -100;
                // Update score and death count
                this.myScore += my.sprite.penguin.points;
                this.updateScore();
                this.penguinDeathCount++;
                // Play sound
                this.sound.play("explosionSound", {volume: 1});
                // Have new enemies appear after end of animation
                this.blowup.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    // Stop the penguin's movement
                    this.my.sprite.penguin.stopFollow();

                    // Randomly choose respawn time
                    let delayTime = Phaser.Math.Between(1000, 3000);
                    this.time.delayedCall(delayTime, () => {
                        // Reset visibility and position
                        this.penguinIsActive = true;
                        this.my.sprite.penguin.visible = true;
                        this.my.sprite.penguin.x = 100;  
                        this.my.sprite.penguin.y = 300;
                        
                        // Restart movement
                        let newDuration = Math.max(1000, 3500 - (this.penguinDeathCount * 500));
                        console.log("Penguin movement duration:", newDuration);
                        this.my.sprite.penguin.startFollow({
                            from: 0,
                            to: 1,
                            delay: 0,
                            duration: newDuration,
                            ease: 'Sine.easeInOut',
                            repeat: -1,
                            yoyo: true,
                            rotateToPath: true,
                            rotationOffset: -90
                        });
                    });
                }, this);
                
            }

            // Check collision with Chicken
            if (this.chickenIsActive && this.collides(my.sprite.chicken, bullet)) {
                // start animation
                this.blowup = this.add.sprite(my.sprite.chicken.x, my.sprite.chicken.y, "blowup").setScale(0.25).play("blowup");
                // clear out bullet -- put y offscreen, will get reaped next update
                bullet.y = -100;
                this.chickenIsActive = false;
                my.sprite.chicken.visible = false;
                my.sprite.chicken.x = -100;
                // Update score
                this.myScore += my.sprite.chicken.points;
                this.updateScore();
                // Play sound
                this.sound.play("explosionSound", {volume: 1});
                // Have new enemies appear after end of animation
                this.blowup.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    let minDistance = 300;
                    let maxY = this.my.sprite.ship.y - minDistance;
                    
                    this.chickenIsActive = true;
                    this.my.sprite.chicken.visible = true;
                    this.my.sprite.chicken.x = Phaser.Math.Between(
                        this.my.sprite.chicken.displayWidth / 2, 
                        game.config.width - this.my.sprite.chicken.displayWidth / 2
                    );
                    this.my.sprite.chicken.y = Phaser.Math.Between(
                        this.my.sprite.chicken.displayHeight / 2,
                        maxY
                    );
                }, this);
            }
        }

        // Remove all of the enemy bullets which are offscreen
        this.my.sprite.enemyBullet = this.my.sprite.enemyBullet.filter((bullet) => bullet.y < game.config.height + bullet.displayHeight/2);

        // Make all of the enemy bullets move
        for (let bullet of this.my.sprite.enemyBullet) {
            bullet.y += this.enemyBulletSpeed;
        }

        // Check collision with player
        for (let bullet of this.my.sprite.enemyBullet) {
            if (this.shipIsActive && this.collides(bullet, my.sprite.ship)) {
                // Remove the bullet
                bullet.y = game.config.height + 100; 
                this.myLives--;
                this.updateLives();
                // Play Sound
                this.sound.play("lostLifeSound", {volume: 1});
            }

            // If player dies
            if (this.myLives == 0) {
                this.blowup = this.add.sprite(my.sprite.ship.x, my.sprite.ship.y, "blowup").setScale(0.25).play("blowup");
                this.shipIsActive = false;
                this.my.sprite.ship.visible = false;
                if (!this.hasPlayedDeathShipSound) {
                    this.hasPlayedDeathShipSound = true;
                    this.sound.play("explosionPlayerSound", {volume: 0.8});
                    this.blowup.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                        this.scene.start("gameOver", {score: this.myScore});
                    }, this);
                }
                
            }
        }

    }

    // A center-radius AABB collision check
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    // Updates Score
    updateScore() {
        let my = this.my;
        my.text.score.setText("Score: " + this.myScore);
    }

    // Updates Lives
    updateLives() {
        this.my.text.lives.setText("Lives: " + this.myLives);
    }

    // Narwhl randomly teleports
    moveNarwhal() {
        let my = this.my; 
        let narwhal = my.sprite.narwhal;
        
        if (!this.narwhalIsActive) {
            return; // skip if it's currently "dead"
        } 

        let newX;
        let newY;
        let maxY = this.my.sprite.ship.y - 200;
    
        // Avoiding spawning at Penguin's path
        do {
             newX = Phaser.Math.Between(
                narwhal.displayWidth / 2,
                game.config.width - narwhal.displayWidth / 2
            );
    
            newY = Phaser.Math.Between(
                narwhal.displayHeight / 2,
                maxY
            );
        } while (
            newX > 100 && newX < 700 &&
            newY > 250 && newY < 350
        );
    
        narwhal.x = newX;
        narwhal.y = newY;

    }

    // Chicken randomly teleports
    moveChicken() {
        let my = this.my; 
        let chicken = my.sprite.chicken;
        
        if (!this.chickenIsActive) {
            return; // skip if it's currently "dead"
        } 

        let newX;
        let newY;
        let maxY = this.my.sprite.ship.y - 200;
    
        // Avoiding spawning at Penguin's path
        do {
             newX = Phaser.Math.Between(
                chicken.displayWidth / 2,
                game.config.width - chicken.displayWidth / 2
            );
    
            newY = Phaser.Math.Between(
                chicken.displayHeight / 2,
                maxY
            );
        } while (
            newX > 100 && newX < 700 &&
            newY > 250 && newY < 350
        );
    
        chicken.x = newX;
        chicken.y = newY;

    }

    // Narwhal shoots bullet
    enemyShootNarwhal() {
        let my = this.my;
    
        // Shoot from narwhal if active
        if (this.narwhalIsActive) {
            let bullet = this.add.sprite(my.sprite.narwhal.x, my.sprite.narwhal.y, "bullet");
            bullet.setTint(0xff0000); 
            this.my.sprite.enemyBullet.push(bullet);
        }
    }

    // Penguin shoots bullet
    enemyShootPenguin() {
        let my = this.my;

        // Shoot from penguin if active
        if (this.penguinIsActive) {
            let bullet = this.add.sprite(my.sprite.penguin.x, my.sprite.penguin.y, "bullet");
            bullet.setTint(0xff0000); 
            this.my.sprite.enemyBullet.push(bullet);
        }
    }

    // Chicken shoots bullet
    enemyShootChicken() {
        let my = this.my;

        // Shoot from chicken if active
        if (this.chickenIsActive) {
            let bullet = this.add.sprite(my.sprite.chicken.x, my.sprite.chicken.y, "bullet");
            bullet.setTint(0xff0000); 
            this.my.sprite.enemyBullet.push(bullet);
        }
    }

    // Initializes/Resets Reseting all variables
    init_game() {
         
        // Create a player bullet.
        this.my.sprite.bullet = [];   
        this.maxBullets = 5;
 
        // Create an enemy bullet.
        this.my.sprite.enemyBullet = [];   
         
        // Record Score
        this.myScore = 0; 
 
        // Record Lives;
        this.myLives = 3;
 
        // Death count for each enemy
        this.penguinDeathCount = 0;
        this.narwhalDeathCount = 0;
        this.chickenDeathCount = 0;
 
        // Currently alive
        this.narwhalIsActive = true;
        this.penguinIsActive = true;
        this.chickenIsActive = true;
        this.shipIsActive = true;
 
        // Making sure death audio has been played once and once only
        this.hasPlayedDeathShipSound = false;
    }

}