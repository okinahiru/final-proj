// FIRST GRAPH ----------------------------------------------
function drawFirstGraph(patch, role) {
  d3.select("#first-graph").selectAll("*").remove();
  d3.csv("data/data.csv").then((data) => {
    let filteredData = data.filter((d) => d.Patch === patch);
    if (role !== "All") {
      filteredData = filteredData.filter((d) => d.Role === role);
    }
    const aggregatedData = d3.rollup(
      filteredData,
      (v) => {
        const totalWeight = d3.sum(v, (d) => d["Role %"]);
        const weightedSum = d3.sum(v, (d) => d["Win %"] * d["Role %"]);
        return weightedSum / totalWeight;
      },
      (d) => d.Name
    );
    const dataArray = Array.from(aggregatedData, ([key, value]) => ({
      Name: key,
      avgWinRate: value,
    }));
    dataArray.sort((a, b) => d3.descending(a.avgWinRate, b.avgWinRate));

    const margin = { top: 20, right: 20, bottom: 30, left: 100 },
      width = 1200 - margin.left - margin.right,
      height = 1500 - margin.top - margin.bottom;

    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleBand().range([height, 0]).padding(0.1);
    x.domain([0, d3.max(dataArray, (d) => d.avgWinRate)]);
    y.domain(dataArray.map((d) => d.Name));

    const svg = d3
      .select("#first-graph")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg
      .selectAll(".bar")
      .data(dataArray)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("width", (d) => x(d.avgWinRate))
      .attr("y", (d) => y(d.Name))
      .attr("height", y.bandwidth());

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    svg.append("g").call(d3.axisLeft(y));

    svg
      .selectAll(".bar-label")
      .data(dataArray)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", (d) => x(d.avgWinRate) - 3)
      .attr("y", (d) => y(d.Name) + y.bandwidth() / 2 + 4)
      .text((d) => d.avgWinRate.toFixed(2));
  });
}

function initializeFirst() {
  d3.csv("data/data.csv").then((data) => {
    const patches = Array.from(new Set(data.map((d) => d.Patch))).sort();

    const select = d3.select("#patch-select");
    select
      .selectAll("option")
      .data(patches)
      .enter()
      .append("option")
      .text((d) => d)
      .attr("value", (d) => d);

    const roles = Array.from(new Set(data.map((d) => d.Role))).sort();
    console.log(roles);
    const roleSelect = d3.select("#role-select");
    roleSelect
      .selectAll("option")
      .data(["All", ...roles])
      .enter()
      .append("option")
      .text((d) => d)
      .attr("value", (d) => d);

    drawFirstGraph(patches[0], "All");

    d3.select("#patch-select").on("change", function () {
      drawFirstGraph(this.value, d3.select("#role-select").node().value);
    });

    d3.select("#role-select").on("change", function () {
      drawFirstGraph(d3.select("#patch-select").node().value, this.value);
    });
  });
}

// SECOND GRAPH-------------------------------------------------

function drawSecondGraph(patch) {
  d3.select("#second-graph").selectAll("*").remove();

  d3.csv("data/data.csv").then((data) => {
    let filteredData = data.filter((d) => d.Patch === patch);

    const aggregatedData = d3.rollup(
      filteredData,
      (v) => {
        const totalWeight = d3.sum(v, (d) => d["Role %"]);
        const weightedSum = d3.sum(v, (d) => d["Win %"] * d["Role %"]);
        return weightedSum / totalWeight;
      },
      (d) => d.Name
    );

    const dataArray = Array.from(aggregatedData, ([key, value]) => ({
      Name: key,
      avgWinRate: value,
    }));
    dataArray.sort((a, b) => d3.descending(a.avgWinRate, b.avgWinRate));

    const margin = { top: 20, right: 20, bottom: 30, left: 100 },
      width = 1200 - margin.left - margin.right,
      height = 1500 - margin.top - margin.bottom;

    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleBand().range([height, 0]).padding(0.1);

    x.domain([0, d3.max(dataArray, (d) => d.avgWinRate)]);
    y.domain(dataArray.map((d) => d.Name));

    const svg = d3
      .select("#second-graph")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg
      .selectAll(".bar")
      .data(dataArray)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("width", (d) => x(d.avgWinRate))
      .attr("y", (d) => y(d.Name))
      .attr("height", y.bandwidth());

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    svg.append("g").call(d3.axisLeft(y));

    svg
      .selectAll(".bar-label")
      .data(dataArray)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", (d) => x(d.avgWinRate) - 3)
      .attr("y", (d) => y(d.Name) + y.bandwidth() / 2 + 4)
      .text((d) => d.avgWinRate.toFixed(2));
  });
}

function initializeSecond() {
  d3.csv("data/data.csv").then((data) => {
    const patches = Array.from(new Set(data.map((d) => d.Patch))).sort();
    const patchSlider = document.getElementById("patch-slider");
    patchSlider.max = patches.length - 1;

    drawSecondGraph(patches[0]);

    patchSlider.oninput = function () {
      const selectedPatch = patches[this.value];
      drawSecondGraph(selectedPatch);
    };
  });
}
initializeFirst();
initializeSecond();
