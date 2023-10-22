gameScene.prototype.showLeaderboard = function(withInput) {
    const body = document.getElementById("body")

    if (document.getElementById("title")) { document.getElementById("title").remove() }

    const title = document.createElement("h1")
    title.innerHTML = "Leaderboard"
    title.id = "title"
    body.appendChild(title)

    if (!withInput)
    {
        this.insertOrderedList(this.highscores)
        return
    }

    const inputField = document.createElement("input")
    inputField.type = "text"
    inputField.id = "input-name"

    const submitButton = document.createElement("button")
    submitButton.innerHTML = "Submit"

    let context = this

    submitButton.onclick = function() {
        let name = inputField.value

        if (!name) { name = "Player" }

        context.highscores[name] = context.totalDeaths
        context.insertOrderedList(context.highscores)

        context.playerDisabled = false

        submitButton.remove()
        inputField.remove()

        context.windeaths.visible = false
        context.winheader.visible = false

        context.deathcounter.visible = true
       
        context.deathcounter.text = "Deaths: 0"
    }

    body.appendChild(inputField)
    body.appendChild(submitButton)
        
    this.insertOrderedList(this.highscores)
}

gameScene.prototype.insertOrderedList = function(list) {
    const old = document.getElementById("leaderboard")

    if (old) { old.remove() }

    const body = document.getElementById("body")

    let leaderboardElement = document.createElement("table")
    leaderboardElement.id = "leaderboard"

    body.appendChild(leaderboardElement)

    // This sorting snippet from
    // https://stackoverflow.com/questions/25500316/sort-a-dictionary-by-value-in-javascript
    let orderedList = Object.keys(list).map(function(key) { 
        return [key, list[key]]
    })

    orderedList.sort(function(a, b) {
        return a[1] - b[1]
    })

    const leaderboard = document.getElementById("leaderboard")

    for (let score of orderedList)
    {
        let newrow = leaderboard.insertRow(-1)

        let colName = newrow.insertCell(0)
        let colScore = newrow.insertCell(1)

        colScore.innerHTML = score[1]
        colName.innerHTML = score[0]

        colScore.id = "score"
        colName.id = "name"
    }
}
