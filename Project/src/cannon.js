gameScene.prototype.initCannons = function() {
    this.cannonheads = this.add.group()
    this.bullets = this.add.group()
    this.time.addEvent({ callback: () => { this.cannonShoot() }, loop: true, delay: 2000 })
}

gameScene.prototype.cannonAimAtPlayer = function() {
    for (let cannon of this.cannonheads.children.entries)
    {
        let rotation = Math.atan2((cannon.y - (this.player.y + constants.grid / 2)), (cannon.x - (this.player.x + constants.grid / 2)))
    
        cannon.rotation = rotation + Math.PI
    
        //rotation = normalizeAngle(rotation)
    
        //let cannonrot = normalizeAngle(cannon.rotation)
    
        //console.log((cannonrot - rotation) - Math.PI)
    
        //let diff = (cannonrot - rotation) - Math.PI
    
        //if (diff < 0)
        //{
        //    cannon.rotation += constants.cannonheadspeed
        //} else
        //{
        //    cannon.rotation -= constants.cannonheadspeed
        //}
    
        //cannon.rotation += Math.min(constants.cannonheadspeed, Math.abs(cannon.rotation - rotation)) * ((cannon.rotation - rotation < 0) ? 1 : -1)
        //let diff = cannon.rotation % Math.PI - rotation
    }
}

gameScene.prototype.cannonShoot = function() {
    if (this.dead) { return }
    if (this.cannonheads.children.entries.length == 0) { return }
    
    for (let cannonhead of this.cannonheads.children.entries)
    {
        const bullet = this.add.rectangle(
            cannonhead.x,
            cannonhead.y,
            cannonhead.width / 1.25,
            cannonhead.height / 1.25,
            colors.deathblock
        )
        bullet.setOrigin(cannonhead.originX, cannonhead.originY)
        bullet.rotation = cannonhead.rotation
    
        this.physics.add.existing(bullet)
        bullet.body.setVelocity(
            Math.cos(bullet.rotation) * constants.bulletspeed,
            Math.sin(bullet.rotation) * constants.bulletspeed
        )
        bullet.body.allowGravity = false
    
        for (let wall of this.wallsGroup.children.entries)
        {
            if (wall.name != "" && wall.name != "deathblock") { continue }
    
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

    this.sfxCannon.play()
}
