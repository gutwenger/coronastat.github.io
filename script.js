document.addEventListener('DOMContentLoaded', function() {

    // set the dimensions and margins of the graph
    let width =  1000;
    let height = 500;

    // Country List
    let countryList = {
        0: ["south-korea", "South Korea"],
        1: ["taiwan", "Taiwan"],
        2: ["japan", "Japan"],
        3: ["singapore", "Singapore"],
        4: ["italy", "Italy"],
        5: ["spain", "Spain"],
        6: ["portugal", "Portugal"],
        7: ["germany", "Germany"]
    }

    // function to update chart
    function update(country) {
        d3.selectAll("svg").remove();
        d3.selectAll("rect").remove();

        console.log(country);
        let code = country;
        let dateStart = "2020-02-01";
        let dateEnd = "2020-06-15";
        // scaled and unscaled datasets
        let unscaled = [];
        let scaled = [];
        // bar style
        let barWidth = width / unscaled.length;
        let padding = 15;
        let leftPad = 60;

        let chartContainer = d3.select("#chart")
                            .append("svg")
                            .attr("width", width)
                            .attr("height", height);

        // Fetch JSON data
        fetch(`https://api.covid19api.com/country/${code}?from=${dateStart}T00:00:00Z&to=${dateEnd}T00:00:00Z`)
            .then(response => response.json())
            .then(data => {
                // linearScale function
                let linearScale = d3.scaleLinear()
                                    .domain([0, data[data.length-1].Confirmed])
                                    .range([0, height - 30]);
                // Push data into dataset containers
                data.forEach(item => unscaled.push([item.Date.slice(0,10), item.Confirmed, item.Deaths, item.Recovered, item.Active]));
                data.forEach(item => scaled.push(linearScale(item.Confirmed)))

                // Get X-axis items
                let date = unscaled.map(item => new Date(item[0]));
                let xMax = date[date.length - 1];
                xMax.setMonth(xMax.getMonth());
                let xScale = d3.scaleTime()
                                .domain([d3.min(date), xMax])
                                .range([0, width - leftPad - 30]);
                const xAxis = d3.axisBottom(xScale);

                // Get Y-axis items
                let yScale = d3.scaleLinear()
                                .domain([0, unscaled[unscaled.length-1][1]])
                                .range([height, 30]);
                let yAxis = d3.axisLeft(yScale);
                
                // Add X-axis and Y-axis
                chartContainer.append("g")
                    .attr("transform", `translate(50, ${height - padding - 10})`)
                    .attr("class", "axes")
                    .call(xAxis);
                chartContainer.append("g")
                    .attr("transform", `translate(50, -25)`)
                    .attr("class", "axes")
                    .call(yAxis);
                
                // Add X-axis description
                // Append X-axis description
                chartContainer.append('text')
                    .attr('transform', 'rotate(-90)')
                    .attr('x', -165)
                    .attr('y', 70)
                    .attr("fill", "white")
                    .text('Total confirmed cases');

                // Create bar with each data inside dataset
                d3.select("svg").selectAll("rect")
                    .data(scaled)
                    .enter()
                    .append("rect")
                    .attr("x", (d, i) => (i * (width - 95) / scaled.length))
                    .attr("y", (d, i) => (height - padding - d - 10))
                    .attr("width", width / 136)
                    .attr("height", (d, i) => d)
                    .attr("class", "bar")
                    .attr("transform", "translate(55, 0)")
                    .append("title")
                    .text((d, i) => `Date: ${unscaled[i][0]}  Cases: ${unscaled[i][1]}`);


                // Update data
                let len = unscaled.length - 1;
                document.querySelector("#info-table-confirmed").innerHTML = unscaled[len][1];
                document.querySelector("#info-table-death").innerHTML = unscaled[len][2];
                document.querySelector("#info-table-recovery").innerHTML = unscaled[len][3];
                document.querySelector("#info-table-active").innerHTML = unscaled[len][4];
            })
    }

    //update("italy");

    d3.select("#select-menu").on('change', function(d){
        let value = d3.select(this).property('value');
        let code = countryList[value][0];
        let country = countryList[value][1];
        document.querySelector("#info-country").innerHTML = country;
        update(code);
    })

})