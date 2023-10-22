class gameScene extends Phaser.Scene 
{
    constructor() 
    {
        super("gameScene") 
    }

    preload()
    {
        // For some ridiculous reason, particles require image texture. Shapes
        // wont work. So load 32x32 image with green fill for particles.
        this.load.image("playerTrail", "../assets/images/particle.png")

        this.load.audio("music", "../assets/sfx/Anemoia - Vague - compressed.mp3")
        this.load.audio("blob", "../assets/sfx/blob.mp3")
        this.load.audio("click", "../assets/sfx/click.mp3")
        this.load.audio("smash", "../assets/sfx/plosive.mp3")
        this.load.audio("woosh", "../assets/sfx/woosh.mp3")
        this.load.audio("cannon", "../assets/sfx/cannon.mp3")
    }

    create() 
    {
        this.wallsGroup = this.add.group()
        this.currentRoom = 0
        this.totalDeaths = 0
        this.playerDisabled = false

        this.musSoundtrack = this.sound.add("music")
        this.musSoundtrack.setVolume(0.1)
        this.musSoundtrack.play()

        this.sfxBlob = this.sound.add("blob")
        this.sfxClick = this.sound.add("click")
        this.sfxSmash = this.sound.add("smash")
        this.sfxWoosh = this.sound.add("woosh")
        this.sfxCannon = this.sound.add("cannon")

        this.sfxClick.setVolume(0.7)
        this.sfxSmash.setVolume(0.7)
        this.sfxWoosh.setVolume(0.1)

        this.keyUp = this.input.keyboard.addKey("Up")
        this.keyDown = this.input.keyboard.addKey("Down")
        this.keyLeft = this.input.keyboard.addKey("Left")
        this.keyRight = this.input.keyboard.addKey("Right")
        this.keyRespawn = this.input.keyboard.addKey("Space")
        this.keyKill = this.input.keyboard.addKey("Esc")

        // TODO: remove this
        this.keyHack = this.input.keyboard.addKey("FOUR")
        this.hackedxd = false

        this.initTextElements()
        this.initPlayer()
        this.initParticles()
        this.initCannons()

        this.constructRoom()

        this.highscores = {
            "Meni ihan rusinaks": 28,
            "Meikämandolini": 6,
            "Kaiffari": 19,
        }

        this.showLeaderboard(false)
    }

    update() 
    {

        // TODO: Remove these
        if (this.keyHack.isDown && !this.hackedxd)
        {
            this.hackedxd = true
            this.totalDeaths += 50 + Math.round(Math.random() * 50)
            this.currentRoom++
            this.respawnPlayer()
        }
        if (this.keyHack.isUp) { this.hackedxd = false }
        
        // Prevent cannons from aiming when player is dead
        if (!this.dead) { this.cannonAimAtPlayer() }

        // Update physics particles
        for (let deadparticle of this.playerParticles.children.entries)
        {
            if (deadparticle.fillAlpha > 0) 
            {
                deadparticle.fillAlpha -= 0.01
            }

            deadparticle.body.velocity.x = Math.min(deadparticle.body.velocity.x + constants.friction / 20, Math.max(deadparticle.body.velocity.x - constants.friction / 20, 0))
        }

        // Emit deathblock particles
        for (let block of this.wallsGroup.children.entries)
        {
            if (block.name != "deathblock") { continue }

            this.deathblockSmoke.emitParticleAt(block.x + Math.random() * constants.grid, block.y + Math.random() * constants.grid, 1)
        }

        if (this.playerDisabled)
        {
            this.player.body.velocity.x = 0
            return
        }

        // Jumping
        if (this.keyUp.isDown && this.player.body.blocked.down && this.player.body.velocity.y == 0)
        {
            this.player.body.velocity.y -= constants.jumpacceleration
        }

        // Downwards smash move
        if (this.keyDown.isDown && !this.player.body.blocked.down && !this.smash)
        {
            this.smash = true
            this.player.body.velocity.y += constants.jumpacceleration
        }

        // Move player
        this.player.body.velocity.x += (-this.keyLeft.isDown + this.keyRight.isDown) * constants.acceleration

        // Apply friction to player
        this.player.body.velocity.x = Math.min(this.player.body.velocity.x + constants.friction, Math.max(this.player.body.velocity.x - constants.friction, 0))

        // Spawn particles when hitting ground after smash
        if (this.player.body.blocked.down && this.smash)
        {
            this.spawnPlayerPhysicsParticles()
            this.smash = false
            this.sfxSmash.play()
        }

        // Kill player
        if (this.keyKill.isDown && !this.dead && !this.keyRespawn.isDown) { this.killPlayer() }

        // Respawn if dead
        if (this.keyRespawn.isDown && this.dead) { this.respawnPlayer() }
    }
}
