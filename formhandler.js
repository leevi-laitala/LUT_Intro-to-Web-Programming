function buttonMoiMaailma() {
    console.log("hello world")
    const titleText = document.getElementById("title")
    titleText.innerHTML = "Moi maailma"
}

function buttonAppendText()
{
    const list = document.getElementById("list")
    const customtext = document.getElementById("customtext")
    const newli = document.createElement("li")

    newli.innerHTML = customtext.value

    list.appendChild(newli)

}

function buttonSubmit()
{
    const formUsername = document.getElementById("input-username")
    const formEmail = document.getElementById("input-email")
    const formIsAdmin = document.getElementById("input-admin")
    const table = document.getElementById("table")

    var newrow = null
    for (var i = 1; i < table.rows.length; i++)
    {
        var user = table.rows[i].cells[0].innerHTML
        
        if (user == formUsername.value)
        {
            newrow = table.rows[i]
            break
        }
    }

    if (!newrow) 
    {
        newrow = table.insertRow(-1)
    }

    if (!newrow.cells.length)
    {
        var username = newrow.insertCell(0)
        var email = newrow.insertCell(1)
        var admin = newrow.insertCell(2)
    }

    newrow.cells[0].innerHTML = formUsername.value
    newrow.cells[1].innerHTML = formEmail.value
    newrow.cells[2].innerHTML = (formIsAdmin.checked) ? "X" : "-"

    //username.innerHTML = formUsername.value
    //email.innerHTML = formEmail.value

    //admin.innerHTML = (formIsAdmin.checked) ? "X" : "-"
}

function clearTable()
{
    const table = document.getElementById("table")
    
    while (table.rows.length > 1)
    {
        table.rows[1].remove()
    }
}
