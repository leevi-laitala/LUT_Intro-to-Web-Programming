const fetchData = document.getElementById("submit-data")
fetchData.addEventListener('click', async(event) => 
{
    event.preventDefault()

    let name = document.getElementById("input-show").value

    if (!name) { return null }

    const url = "https://api.tvmaze.com/search/shows?q=" + name
    const shows = await fetch(url)

    populateList(await shows.json())
})

function populateList(arr)
{
    for (let i = 0; i < arr.length; i++)
    {
        let current = arr[i].show
        let image = (current.image) ? current.image.medium : ""

        insertMovieContianer(current.name, current.summary, image)
    }
}

function insertMovieContianer(title, summary, image)
{
    let showData = document.createElement("div")
    showData.className = "show-data"
    
    let imageElement = document.createElement("img")
    imageElement.src = image
    
    let showInfo = document.createElement("div")
    showInfo.className = "show-info"
    
    let titleElement = document.createElement("h1")
    titleElement.textContent = title
    
    let summaryElement = document.createElement("p")
    summaryElement.innerHTML = summary
    
    showInfo.appendChild(titleElement)
    showInfo.appendChild(summaryElement)
    
    showData.appendChild(imageElement)
    showData.appendChild(showInfo)
    
    let containerElement = document.querySelector(".show-container")    

    containerElement.appendChild(showData)
}
