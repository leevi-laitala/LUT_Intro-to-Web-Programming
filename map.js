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

                let color = (pos / neg) ** 3 * 60
                color = (color < 120) ? color : 120

                return {
                    color: `hsl(${color}, 75%, 50%)`
                }
            }
        }).addTo(map)
    
    let openstreetmap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(map)

    map.fitBounds(geoJson.getBounds())

}

async function fetchGeoData()
{
    const url = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326"

    const res = await fetch(url)
    const data = await res.json()

    return data
}

//function getFeature(feature, layer)
//{
//    if (!feature.properties.name) { return }
//
//    console.log(migData)
//
//    const name = feature.properties.name 
//    layer.bindPopup(
//        `Moromoro`
//    )
//    //layer.bindTooltip(name)
//    layer.bindTooltip(migData["KU" + feature.properties.kunta])
//}

document.addEventListener("DOMContentLoaded", initMap)
