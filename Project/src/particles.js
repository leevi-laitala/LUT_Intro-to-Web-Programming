gameScene.prototype.initParticles = function() {
    this.trailparticles = this.add.particles("playerTrail")
    this.deathblockSmoke = this.add.particles("playerTrail")

    this.trailparticles.createEmitter({
        quantity: 1,
        lifespan: 75,
        follow: this.player,
        followOffset: { x: constants.grid / 2, y: constants.grid / 2 },
        alpha: { start: 0.75, end: 0 },
        tint: colors.player
    })
    
    this.playerParticles = this.add.group()
    for (let i = 0; i < 10; i++)
    {
        const particle = this.add.rectangle(100 + 16 * i, 100, constants.grid, constants.grid, colors.player)
        this.playerParticles.add(particle)
        this.physics.add.existing(particle)
        this.physics.add.collider(particle, this.wallsGroup)
        particle.fillAlpha = 0
    }
    // Particles
    this.deathblockSmoke = this.add.particles("playerTrail")
    this.deathblockSmoke.createEmitter({
        speed: { min: 10, max: 30 },
        lifespan: 500,
        alpha: { start: 0.5, end: 0, ease: "Cubic.Out" },
        scale: { min: 0.2, max: 0.4, end: 0 },
        rotate: { min: 0, max: 90 },
        tint: colors.deathblock,
        gravityY: -200,
        on: false
    })
}
