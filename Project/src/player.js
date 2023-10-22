gameScene.prototype.initPlayer = function() {
    this.spawnpoint = [3, 7]
    const player = this.add.rectangle(this.spawnpoint[0] * constants.grid, this.spawnpoint[1] * constants.grid, constants.grid, constants.grid, colors.player, 1)
    player.setOrigin(0, 0)
    this.physics.add.existing(player)
    this.player = player
    this.player.body.setMaxVelocity(constants.maxvelocity, 100000)
    this.smash = false
    this.dead = false
}

gameScene.prototype.respawnPlayer = function() {
    this.switchRoom(false)

    this.dead = false
    this.player.x = this.spawnpoint[0] * constants.grid
    this.player.y = this.spawnpoint[1] * constants.grid

    this.deathbannertint.fillAlpha = 0
    this.deathbannertitle.visible = false
    this.deathbannerheader.visible = false

    this.sfxBlob.play()
}


gameScene.prototype.killPlayer = function() {
    this.dead = true

    this.totalDeaths ++
    this.deathcounter.text = "Deaths: " + this.totalDeaths
    
    this.spawnPlayerPhysicsParticles()
    
    this.player.y = -100
    
    this.deathbannertint.depth = 100
    this.deathbannertitle.depth = 100
    this.deathbannerheader.depth = 100
    
    this.deathbannertint.fillAlpha = 0.8
    this.deathbannertitle.visible = true
    this.deathbannerheader.visible = true
    
    this.sfxClick.play()
}

gameScene.prototype.spawnPlayerPhysicsParticles = function() {
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
