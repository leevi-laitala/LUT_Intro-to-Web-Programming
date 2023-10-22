// Used the lecture material as a template for this code
//
// How to apply physics to shapes
// https://www.youtube.com/watch?v=gmsIkGWvvfs
//
// Some information about particles
// https://www.youtube.com/watch?v=JSrafZXuehQ
//
// Official documentation
// https://photonstorm.github.io/phaser3-docs

let game = null;

const constants = {
    grid: 32,
    width: 19,
    height: 9,
    playerSpeed: 4,
    acceleration: 200,
    jumpacceleration: 800,
    friction: 50,
    maxvelocity: 300,
    gravity: 3000,
    cannonheadspeed: 0.02,
    bulletspeed: 500
}

const colors = {
    background: 0xeae5cc,
    player: 0x5add5f,
    wall: 0x6b6b6b,
    cannon: 0xfc4465,
    cannonhead: 0x9e4757,
    goal: 0x94d9f7,
    deathblock: 0x78932d
}

window.onload = function() {
    const config = {
        type: Phaser.AUTO,
        backgroundColor: colors.background,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: constants.grid * constants.width,
            height: constants.grid * constants.height
        },
        physics: {
            default: "arcade",
            arcade: {
                gravity: {
                    y: constants.gravity
                }
            }
        },
        pixelArt: true,
        scene: gameScene
    }

    game = new Phaser.Game(config)
    window.focus()
}

class gameScene extends Phaser.Scene {
    constructor() 
    {
        super("gameScene")
    }

    preload()
    {
        // For some ridiculous reason, particles require image texture. Shapes
        // wont work. So load 32x32 image with green fill for particles.
        this.load.image("playerTrail", "particle.png")
    }

    constructRoom()
    {
        this.wallsGroup.clear(true, true)
        this.cannonheads.clear(true, true)
        this.bullets.clear(true, true)

        // Odd physics bug, where two walls on top of each other, would result
        // collisions between them. So if player would jump against two walls,
        // player would hit their head on the seam.
        //
        // To fix this, combine adjecent walls into one long wall. Only in Y
        // axis in this case.
        for (let x = 0; x < constants.width - 2; x++)
        {
            let wallStart = 0
            let wallLength = 0
            
            for (let y = 0; y < constants.height - 2; y++)
            {
                switch(maps[this.currentRoom][y][x])
                {
                    case '.':
                        if (wallLength)
                        {
                            this.wallsGroup.add(this.add.rectangle((x + 1) * constants.grid, (wallStart + 1) * constants.grid, constants.grid, wallLength * constants.grid, colors.wall))

                            wallLength = 0
                        }
                        break

                    case 'W':
                        wallStart = (!wallLength) ? y : wallStart
                        wallLength += 1
                        break

                    case 'G':
                        let goal = this.add.rectangle((x + 1) * constants.grid, (y + 1) * constants.grid, constants.grid, constants.grid, colors.goal)
                        goal.name = "goal"
                        this.wallsGroup.add(goal)
                        break

                    case 'C':
                        let cannon = this.add.rectangle((x + 1) * constants.grid, (y + 1) * constants.grid, constants.grid, constants.grid, colors.cannon)
                        cannon.name = "cannon"
                        this.wallsGroup.add(cannon)
                        break

                    case 'S':
                        this.spawnpoint = [ x + 1, y + 1 ]
                        break

                    case 'D':
                        let deathblock = this.add.rectangle((x + 1) * constants.grid, (y + 1) * constants.grid, constants.grid, constants.grid, colors.deathblock)
                        deathblock.name = "deathblock"
                        this.wallsGroup.add(deathblock)
                        break
                }

            }

            if (wallLength)
            {
                this.wallsGroup.add(this.add.rectangle((x + 1) * constants.grid, (wallStart + 1) * constants.grid, constants.grid, wallLength * constants.grid, colors.wall))
                wallLength = 0
            }
        }

        this.wallsGroup.add(this.add.rectangle(0, 0, constants.grid, constants.grid * constants.height, colors.wall))
        this.wallsGroup.add(this.add.rectangle(constants.grid * (constants.width - 1), 0, constants.grid, constants.grid * constants.height, colors.wall))
        this.wallsGroup.add(this.add.rectangle(constants.grid, 0, constants.grid * (constants.width - 2), constants.grid, colors.wall))
        this.wallsGroup.add(this.add.rectangle(constants.grid, constants.grid * (constants.height - 1), constants.grid * (constants.width - 2), constants.grid, colors.wall))

        for (let wall of this.wallsGroup.children.entries)
        {
            wall.setOrigin(0, 0)
            this.physics.add.existing(wall, true)
            
            if (wall.name == "goal")
            {
                // For some reason this will fail if just given 'this.switchRoom' as is
                // for callback. Had to create lambda that calls the function instead
                this.physics.add.overlap(this.player, wall, () => { this.switchRoom() })
            } else if (wall.name == "cannon")
            {
                this.physics.add.collider(this.player, wall)
                const cannonhead = this.add.rectangle(
                    wall.x + constants.grid / 2,
                    wall.y + constants.grid / 2,
                    constants.grid,
                    constants.grid / 2,
                    colors.cannonhead
                )
                cannonhead.setOrigin(0.25, 0.5) // TODO: what are these numbers
                let rotation = Math.atan((cannonhead.y - this.player.y) / (cannonhead.x - this.player.x))

                if (rotation < 0) { rotation += Math.PI }

                cannonhead.rotation = rotation

                this.cannonheads.add(cannonhead)


            } else if (wall.name == "deathblock")
            {
                this.physics.add.collider(this.player, wall, () => { this.killPlayer() })
            } else
            {
                this.physics.add.collider(this.player, wall)
            }
        }
    }

    create() 
    {
        // Rooms
        this.wallsGroup = this.add.group()
        this.currentRoom = 0

        // Titletext
        this.banner = this.add.text(constants.grid * 2, constants.grid * 2, tutorials[this.currentRoom], { color: colors.wall })

        this.deathbannertint = this.add.rectangle(0, 0, constants.width * constants.grid, constants.height * constants.grid, colors.cannonhead, 0)
        this.deathbannertitle = this.add.text(constants.width * constants.grid / 2 - 90, constants.height * constants.grid / 3, "DEAD!", { style: "strong", color: "#f55", align: 'center', fontSize: "72px" })
        this.deathbannerheader = this.add.text(constants.width * constants.grid / 2 - 120, constants.height * constants.grid / 2 + 24, "Respawn by pressing 'R' key", { color: "#f55", align: 'center' })
        
        this.deathbannertitle.visible = false
        this.deathbannerheader.visible = false
        this.deathbannertint.setOrigin(0, 0)

        // Player trail
        this.trailparticles = this.add.particles("playerTrail")

        // Create player
        this.spawnpoint = [3, 7]
        const player = this.add.rectangle(this.spawnpoint[0] * constants.grid, this.spawnpoint[1] * constants.grid, constants.grid, constants.grid, colors.player, 1)
        player.setOrigin(0, 0)
        this.physics.add.existing(player)
        this.player = player
        this.player.body.setMaxVelocity(constants.maxvelocity, 100000)
        this.smash = false
        this.dead = false

        // Player trail emitter
        this.trailparticles.createEmitter({
            quantity: 1,
            lifespan: 75,
            follow: this.player,
            followOffset: { x: constants.grid / 2, y: constants.grid / 2 },
            alpha: { start: 0.75, end: 0 },
            tint: colors.player
        })

        // Cannons
        this.cannonheads = this.add.group()
        this.bullets = this.add.group()
        this.time.addEvent({ callback: () => { this.cannonShoot() }, loop: true, delay: 2000 })

        // Keys
        this.keyUp = this.input.keyboard.addKey("W")
        this.keyDown = this.input.keyboard.addKey("S")
        this.keyLeft = this.input.keyboard.addKey("A")
        this.keyRight = this.input.keyboard.addKey("D")
        
        this.keyRespawn = this.input.keyboard.addKey("R")

        // TODO: remove this
        this.keyHack = this.input.keyboard.addKey("H")
        this.hackedxd = false

        // Particles
        this.playerParticles = this.add.group()
        for (let i = 0; i < 10; i++)
        {
            const particle = this.add.rectangle(100 + 16 * i, 100, constants.grid, constants.grid, colors.player)
            this.playerParticles.add(particle)
            this.physics.add.existing(particle)
            this.physics.add.collider(particle, this.wallsGroup)
            particle.fillAlpha = 0
        }

        this.constructRoom()
    }

    switchRoom()
    {
        this.currentRoom++
        this.constructRoom()
        this.banner.text = tutorials[this.currentRoom]
    }

    spawnPlayerPhysicsParticles()
    {
        for (let particle of this.playerParticles.children.entries)
        {
            particle.x = this.player.x + constants.grid / 2 + (Math.random() - 0.5) * constants.grid
            particle.y = this.player.y + constants.grid / 2 + (Math.random() - 0.5) * constants.grid

            particle.body.velocity.x = (Math.random() - 0.5) * 500
            particle.body.velocity.y = -Math.random() * 500

            let width = (Math.random() + 0.2) * 10
            let height = (Math.random() + 0.2) * 10
            particle.body.width = particle.width = width
            particle.body.height = particle.height = height

            particle.rotation = Math.random() * (Math.PI * 2)

            particle.fillAlpha = 1
        }
    }

    killPlayer()
    {
        this.dead = true

        this.spawnPlayerPhysicsParticles()

        this.player.y = -100

        this.deathbannertint.depth = 100
        this.deathbannertitle.depth = 100
        this.deathbannerheader.depth = 100
        
        this.deathbannertint.fillAlpha = 0.8
        this.deathbannertitle.visible = true
        this.deathbannerheader.visible = true
    }

    cannonAimAtPlayer()
    {
        for (let cannon of this.cannonheads.children.entries)
        {
            let rotation = Math.atan2((cannon.y - (this.player.y + constants.grid / 2)), (cannon.x - (this.player.x + constants.grid / 2)))
            cannon.rotation = rotation + Math.PI
        }
    }


    cannonShoot()
    {
        if (this.dead) { return }

        for (let cannonhead of this.cannonheads.children.entries)
        {
            const bullet = this.add.rectangle(
                cannonhead.x,
                cannonhead.y,
                cannonhead.width / 1.25,
                cannonhead.height / 1.25,
                colors.wall
            )
            bullet.setOrigin(cannonhead.originX, cannonhead.originY)
            bullet.rotation = cannonhead.rotation


            this.physics.add.existing(bullet)
            bullet.body.setVelocity(
                Math.cos(bullet.rotation) * constants.bulletspeed,
                Math.sin(bullet.rotation) * constants.bulletspeed
            )
            bullet.body.allowGravity = false

            console.log(bullet.body)

            for (let wall of this.wallsGroup.children.entries)
            {
                if (wall.name != "") { continue }

                this.physics.add.collider(bullet, wall, () => {
                    bullet.destroy()
                })
            }


            this.physics.add.collider(bullet, this.player, () => {
                bullet.destroy()
                this.killPlayer()
            })

            this.bullets.add(bullet)

            let cannonDiffX = Math.cos(cannonhead.rotation) * constants.bulletspeed / 50
            let cannonDiffY = Math.sin(cannonhead.rotation) * constants.bulletspeed / 50

            cannonhead.x -= cannonDiffX
            cannonhead.y -= cannonDiffY

            this.time.delayedCall(50, () => {
                cannonhead.x += cannonDiffX
                cannonhead.y += cannonDiffY
            })
        }
    }

    update() 
    {
        if (this.keyUp.isDown && this.player.body.blocked.down && this.player.body.velocity.y == 0)
        {
            this.player.body.velocity.y -= constants.jumpacceleration
        }

        if (this.player.body.blocked.down && this.smash)
        {
            this.spawnPlayerPhysicsParticles()
            this.smash = false
        }

        if (this.keyDown.isDown && !this.player.body.blocked.down && !this.smash)
        {
            this.smash = true
            this.player.body.velocity.y += constants.jumpacceleration
        }

        if (this.keyRespawn.isDown && this.dead)
        {
            this.dead = false
            this.player.x = this.spawnpoint[0] * constants.grid
            this.player.y = this.spawnpoint[1] * constants.grid

            this.deathbannertint.fillAlpha = 0
            this.deathbannertitle.visible = false
            this.deathbannerheader.visible = false
        }

        if (this.keyHack.isDown && !this.hackedxd)
        {
            this.hackedxd = true
            this.switchRoom()
        }
        if (this.keyHack.isUp)
        {
            this.hackedxd = false
        }

        // Movement
        this.player.body.velocity.x += (-this.keyLeft.isDown + this.keyRight.isDown) * constants.acceleration

        // Friction
        this.player.body.velocity.x = Math.min(this.player.body.velocity.x + constants.friction, Math.max(this.player.body.velocity.x - constants.friction, 0))
        
        if (!this.dead)
        {
            this.cannonAimAtPlayer()
        }

        for (let deadparticle of this.playerParticles.children.entries)
        {
            if (deadparticle.fillAlpha > 0) 
            {
                deadparticle.fillAlpha -= 0.01
            }

            deadparticle.body.velocity.x = Math.min(deadparticle.body.velocity.x + constants.friction / 20, Math.max(deadparticle.body.velocity.x - constants.friction / 20, 0))
        }

        for (let block of this.wallsGroup.children.entries)
        {
            if (block.name != "deathblock") { continue }
        }
    }
}
