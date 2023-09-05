function buttonMoiMaailma() {
    console.log("hello world")
    const titleText = document.getElementById("title")
    titleText.innerHTML = "Moi maailma"
}

function buttonAppendText()
{
    const list = document.getElementById("list")
    var customtext = document.getElementById("customtext")
    var newli = document.createElement("li")

    newli.innerHTML = customtext.value

    list.appendChild(newli)

}
