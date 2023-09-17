function buttonSubmit()
{
    const formUsername = document.getElementById("input-username")
    const formEmail = document.getElementById("input-email")
    const formIsAdmin = document.getElementById("input-admin")
    const table = document.getElementById("table")
    const avatar = document.getElementById("input-image")

    var newrow = null
    for (var i = 1; i < table.rows.length; i++)
    {
        var user = table.rows[i].cells[1].innerHTML
        
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
        newrow.insertCell(0)
        newrow.insertCell(1)
        newrow.insertCell(2)
        newrow.insertCell(3)
    }

    var newavatar = document.createElement("img")
    newavatar.height = 64
    newavatar.width = 64

    const reader = new FileReader()
    reader.onload = (function(image)
        {
            return function(e)
            {
                image.src = e.target.result
            }
        })(newavatar)

    reader.readAsDataURL(avatar.files[0])

    if (newrow.cells[0].innerHTML)
    {
        //newrow.cells[0] = newavatar
        newrow.cells[0].remove()
        newrow.insertCell(0)
    }

    newrow.cells[0].appendChild(newavatar)
    newrow.cells[1].innerHTML = formUsername.value
    newrow.cells[2].innerHTML = formEmail.value
    newrow.cells[3].innerHTML = (formIsAdmin.checked) ? "X" : "-"
}

function clearTable()
{
    const table = document.getElementById("table")
    
    while (table.rows.length > 1)
    {
        table.rows[1].remove()
    }
}
