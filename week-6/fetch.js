// Resources used:
//
// Frappe configuration documentation
// https://frappe.io/charts/docs/reference/configuration
//
// Prevent submit from refreshing the page:
// https://stackoverflow.com/questions/19454310/stop-form-refreshing-page-on-submit
//
// Easy way to lowercase an array full of strings 
// https://stackoverflow.com/questions/55055089/changing-an-array-to-lower-case
//
// Atte Hakkarainen helped with patching the query
//

const query = {
    "query": [
        {
            "code": "Vuosi",
            "selection": {
                "filter": "item",
                "values": [
                    "2000",
                    "2001",
                    "2002",
                    "2003",
                    "2004",
                    "2005",
                    "2006",
                    "2007",
                    "2008",
                    "2009",
                    "2010",
                    "2011",
                    "2012",
                    "2013",
                    "2014",
                    "2015",
                    "2016",
                    "2017",
                    "2018",
                    "2019",
                    "2020",
                    "2021"
                ]
            }
        },
        {
            "code": "Alue",
            "selection": {
                "filter": "item",
                "values": [
                    "SSS"
                ]
            }
        },
        {
            "code": "Tiedot",
            "selection": {
                "filter": "item",
                "values": [
                    "vaesto"
                ]
            }
        }
    ],
    "response": {
        "format": "json-stat2"
    }
}

async function fetchPopulationData(areaCode)
{
    query.query[1].selection.values = [areaCode]

    const url = "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px"
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify(query)
    })

    if (!res.ok) { return }

    return await res.json()
}

function predictData(dataValues)
{
    let result = 0
    for (let i = 1; i < dataValues.length; i++)
    {
        result += dataValues[i] - dataValues[i - 1]
    }

    result = result / (dataValues.length - 1) + dataValues[dataValues.length - 1]

    return result
}

async function parsePopulationData(areaName, predictYears)
{
    if (!areaName) { areaName = "Whole country" }

    const areaCode = await getAreaCodeFromName(areaName)
    const data = await fetchPopulationData(areaCode)

    let years = Object.values(data.dimension.Vuosi.category.label)
    let datavalues = Object.values(data.value)

    if (predictYears)
    {
        if (gChart)
        {
            years = Object.values(gChart.state.xAxis.labels)
            datavalues = gChart.state.datasets[0].values
        }

        years.push("" + (Number(years[years.length - 1]) + 1))

        datavalues.push(predictData(datavalues))
    }

    const set = {
        labels: years,
        datasets: [{ name: "Population", type: "line", values: datavalues}]
    }

    return set
}

async function getAreaCodeFromName(name)
{
    if (!name) { return "SSS" }

    const url = "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px"
    const res = await fetch(url)
    const data = await res.json()


    let names = Object.values(data.variables[1].valueTexts)
    let lower = names.map(v => v.toLowerCase())
    let index = lower.indexOf(name.toLowerCase())

    return data.variables[1].values[index]
}

async function initChart()
{
    const initialAreaName = gCurrentArea
    const initialData = await parsePopulationData(initialAreaName, 0)

    return new frappe.Chart("#chart", {
        title: "Population in " + initialAreaName,
        data: initialData,
        type: "line",
        height: 450,
        colors: ['#eb5146']
    })
}

async function updateChart(areaName, chart, predictYears)
{
    const data = await parsePopulationData(areaName, predictYears)
    chart.update(data)

    gCurrentArea = areaName
}

let gChart = null
let gCurrentArea = "Whole country"
document.addEventListener("DOMContentLoaded", async function() { gChart = await initChart(); })


const form = document.getElementById("area-form")
const inputfield = document.getElementById("input-area")
const addDataButton = document.getElementById("add-data")

function handleForm(event)
{
    event.preventDefault()
    updateChart(inputfield.value, gChart, 0)
}

function buttonAdd(event)
{
    updateChart(gCurrentArea, gChart, 1)
}


addDataButton.addEventListener('click', buttonAdd)
form.addEventListener('submit', handleForm)

