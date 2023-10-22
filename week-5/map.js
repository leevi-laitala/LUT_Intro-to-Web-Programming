// Resources that helped with this assignment:
//
// Example code from this course
// https://version.lab.fi/Erno.Vanhala/itwp-week-5/-/blob/main/demo6-leaflet/js/code.js?ref_type=heads
//
// Official documentation
// https://leafletjs.com/reference.html
//
// Multiple value function return
// https://stackoverflow.com/questions/2917175/return-multiple-values-in-javascript


// Fetch migration data, both negative and positive, and return json from .dataset
async function fetchMigrationData()
{
    const posUrl = "https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f"
    const negUrl = "https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e"

    const posRes = await fetch(posUrl)
    const negRes = await fetch(negUrl)

    const posJson = await posRes.json()
    const negJson = await negRes.json()

    const posData = posJson.dataset 
    const negData = negJson.dataset 

    return [posData, negData]
}

// Initialize and populate map
async function initMap()
{
    let map = L.map('map', { minZoom: -3 })

    const migData = await fetchMigrationData()

    let geoJson = L.geoJSON(await fetchGeoData(), 
        {
            weight: 2,
            onEachFeature: function getFeature(feature, layer)
            {
                if (!feature.properties.name) { return }
                const name = feature.properties.name 

                // First fetch the index for municipality, then match value for given index
                let index = migData[0].dimension.Tuloalue.category.index["KU" + feature.properties.kunta]
                let pos = migData[0].value[index]
                let neg = migData[1].value[index]

                layer.bindPopup(
                    "Pos: " + pos + "\n" + "Neg: " + neg
                )
                layer.bindTooltip(name)
            },
            style: function getStyle(feature)
            {
                let index = migData[0].dimension.Tuloalue.category.index["KU" + feature.properties.kunta]
                let pos = migData[0].value[index]
                let neg = migData[1].value[index]

                // Calculate color, and cap hue at 120
                let color = (pos / neg) ** 3 * 60
                color = (color < 120) ? color : 120

                return {
                    color: `hsl(${color}, 75%, 50%)`
                }
            }
        }).addTo(map)
    
    let openstreetmap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
    }).addTo(map)

    map.fitBounds(geoJson.getBounds())

}

async function fetchGeoData()
{
    const url = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326"

    const res = await fetch(url)
    const data = await res.json()

    return data
}

document.addEventListener("DOMContentLoaded", initMap)
