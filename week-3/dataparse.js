window.onload = function fetchData() {
    tablebody = document.getElementById("tablebody")

    populationdata = function(data)
    {
        var municipalities = data.dataset.dimension.Alue.category.label
        var population = data.dataset.value
        var list = Object.values(municipalities)

        for (var i = 0; i < list.length; i++)
        {
            var newrow = tablebody.insertRow(-1)
            var c1 = newrow.insertCell(0)
            var c2 = newrow.insertCell(1)

            c1.innerHTML = list[i]
            c2.innerHTML = population[i]
        }
    }

    additionaldata = function(data)
    {
        var employment = data.dataset.value
        var list = Object.values(employment)

        for (var i = 0; i < list.length; i++)
        {
            var row = tablebody.rows[i]
            var c1 = row.insertCell(2)
            var c2 = row.insertCell(3)

            c1.innerHTML = employment[i]
            var percentage = (Number(employment[i]) / Number(row.cells[1].innerHTML) * 100).toFixed(2)
            c2.innerHTML = percentage

            if (percentage > 45)
            {
                row.style.background = "#abffbd"
            }
            if (percentage < 25)
            {
                row.style.background = "#ff9e9e"
            }
        }
    }

    xhr = new XMLHttpRequest();
    xhr.open('GET', "https://statfin.stat.fi/PxWeb/sq/4e244893-7761-4c4f-8e55-7a8d41d86eff", true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        populationdata(xhr.response);
    };
    xhr.send();

    axhr = new XMLHttpRequest();
    axhr.open('GET', "https://statfin.stat.fi/PxWeb/sq/5e288b40-f8c8-4f1e-b3b0-61b86ce5c065", true);
    axhr.responseType = 'json';
    axhr.onload = function() {
        additionaldata(axhr.response);
    };
    axhr.send();
};
