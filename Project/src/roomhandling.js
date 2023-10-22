gameScene.prototype.initTextElements = function() {
    this.banner = this.add.text(constants.grid * 2, constants.grid * 2, tutorials[this.currentRoom], { color: colors.wall })
    this.deathbannertint = this.add.rectangle(0, 0, constants.width * constants.grid, constants.height * constants.grid, colors.cannonhead, 0)
    this.deathbannertitle = this.add.text(constants.width * constants.grid / 2 - 90, constants.height * constants.grid / 3, "DEAD!", { style: "strong", color: "#f55", align: 'center', fontSize: "72px" })
    this.deathbannerheader = this.add.text(constants.width * constants.grid / 2 - 135, constants.height * constants.grid / 2 + 24, "Respawn by pressing 'Space' key", { color: "#f55", align: 'center' })

    // Death counter
    this.deathcounter = this.add.text(constants.grid * (constants.width - 5), constants.grid * 2, "Deaths: " + this.totalDeaths, { color: "#f55" })

    // Winscreen
    this.wintitle = this.add.text(constants.width * constants.grid / 2 - 230, constants.height * constants.grid / 3, "CONGRATULATIONS!", { style: "strong", color: "#6c6", align: 'center', fontSize: "48px" })
    this.windeaths = this.add.text(constants.width * constants.grid / 2 - 210, constants.height * constants.grid / 3 + 48, "You died in total " + this.totalDeaths + " times!", { style: "strong", color: "#6c6", align: 'center', fontSize: "24px" })
    this.winheader = this.add.text(constants.width * constants.grid / 2 - 190, constants.height * constants.grid / 2 + 32, "Type your name on the leaderboard!\nAfter which enter the goal to restart!", { color: "#6c6", align: 'center' })

    this.wintitle.visible = false
    this.windeaths.visible = false
    this.winheader.visible = false
    
    this.deathbannertitle.visible = false
    this.deathbannerheader.visible = false
    this.deathbannertint.setOrigin(0, 0)
}

gameScene.prototype.viewScoreboard = function() {
    this.wintitle.visible = true
    this.windeaths.visible = true
    this.winheader.visible = true

    this.deathcounter.visible = false

    this.windeaths.text = "You died in total " + this.totalDeaths + " times!"
   
    this.showLeaderboard(true)
}

gameScene.prototype.constructRoom = function() {
    this.wallsGroup.clear(true, true)
    this.cannonheads.clear(true, true)
    this.bullets.clear(true, true)

    if (this.currentRoom == maps.length - 1)
    {
        this.playerDisabled = true
        this.viewScoreboard()
    }

    if (this.currentRoom == maps.length)
    {
        this.currentRoom = 0
        this.totalDeaths = 0
    }

    let context = this
    
    // Odd physics bug, where two walls on top of each other, would result
    // collisions between them. So if player would jump against two walls,
    // player would hit their head on the seam.
    //
    // To fix this, combine adjecent walls into one long wall. Only in Y
    // axis in this case.
    for (let x = 0; x < constants.width - 2; x++)
    {
        let wallType = '.'
        let wallStart = 0
        let wallLength = 0

        function createWall()
        {
            if (wallLength)
            {
                let wall = context.add.rectangle((x + 1) * constants.grid, (wallStart + 1) * constants.grid, constants.grid, wallLength * constants.grid, colors.wall, (wallType == 'L') ? 0.5 : 1)

                wall.name = (wallType == 'L') ? "lock" : ""

                context.wallsGroup.add(wall)

                wallLength = 0
                wallType = '.'
            }
        }
        
        for (let y = 0; y < constants.height - 2; y++)
        {

            switch(maps[this.currentRoom][y][x])
            {
                case '.':
                    createWall()
                    break
    
                case 'L':
                {
                    let old = wallType
                    wallType = 'L'
                    
                    wallStart = (!wallLength) ? y : wallStart
                    wallLength += 1

                    if (maps[this.currentRoom][y + 1])
                    {
                        if (maps[this.currentRoom][y + 1][x] == 'W')
                        {
                            createWall()
                        }
                    }

                    break
                }

                case 'W':
                {
                    wallType = 'W'

                    wallStart = (!wallLength) ? y : wallStart
                    wallLength += 1
                    
                    if (maps[this.currentRoom][y + 1])
                    {
                        if (maps[this.currentRoom][y + 1][x] == 'L')
                        {
                            createWall()
                        }
                    }

                    break
                }
    
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

                case 'K':
                    let key = this.add.rectangle((x + 1) * constants.grid + constants.grid / 4, (y + 1) * constants.grid + constants.grid / 4, constants.grid / 2, constants.grid / 2, colors.player, 0.5)
                    key.name = "key"
                    this.wallsGroup.add(key)
                    break
            }
    
        }
    
        createWall()
    }
    
    this.wallsGroup.add(this.add.rectangle(0, 0, constants.grid, constants.grid * constants.height, colors.wall))
    this.wallsGroup.add(this.add.rectangle(constants.grid * (constants.width - 1), 0, constants.grid, constants.grid * constants.height, colors.wall))
    this.wallsGroup.add(this.add.rectangle(constants.grid, 0, constants.grid * (constants.width - 2), constants.grid, colors.wall))
    this.wallsGroup.add(this.add.rectangle(constants.grid, constants.grid * (constants.height - 1), constants.grid * (constants.width - 2), constants.grid, colors.wall))
    
    for (let wall of this.wallsGroup.children.entries)
    {
        wall.setOrigin(0, 0)
        this.physics.add.existing(wall, true)

        switch (wall.name)
        {
            case "goal":
                // For some reason this will fail if just given 'this.switchRoom' as is
                // for callback. Had to create lambda that calls the function instead
                this.physics.add.overlap(this.player, wall, () => { this.sfxWoosh.play(); this.switchRoom(true) })
                break

            case "cannon":
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
                break

            case "deathblock":
                this.physics.add.collider(this.player, wall, () => { this.killPlayer() })
                break

            case "key":
                this.physics.add.overlap(this.player, wall, () => {
                    for (let wall of this.wallsGroup.children.entries)
                    {
                        if (wall.name == "lock" || wall.name == "key") { wall.destroy() }
                    }
                })
                break

            default:
                this.physics.add.collider(this.player, wall)
        }
    }
}


gameScene.prototype.switchRoom = function(increment) 
{
    this.currentRoom += increment
    this.constructRoom()
    this.banner.text = tutorials[this.currentRoom]
    this.deathcounter.text = "Deaths: " + this.totalDeaths
}

