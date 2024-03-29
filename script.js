function sortPatches(patches) {
  return patches.sort((a, b) => {
    const partsA = a.split(".").map(Number);
    const partsB = b.split(".").map(Number);

    if (partsA[0] !== partsB[0]) {
      return partsA[0] - partsB[0];
    }

    return partsA[1] - partsB[1];
  });
}

function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

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
      (v) =>
        d3.sum(v, (d) => d["Win %"] * d["Role %"]) /
        d3.sum(v, (d) => d["Role %"]),
      (d) => d.Name
    );

    const dataArray = Array.from(aggregatedData, ([Name, avgWinRate]) => ({
      Name,
      avgWinRate,
    })).sort((a, b) => d3.descending(a.avgWinRate, b.avgWinRate));

    const margin = { top: 20, right: 50, bottom: 50, left: 100 },
      width = 1400 - margin.left - margin.right,
      height = 1500 - margin.top - margin.bottom,
      x = d3
        .scaleLinear()
        .domain([0, d3.max(dataArray, (d) => d.avgWinRate)])
        .range([0, width]),
      y = d3
        .scaleBand()
        .domain(dataArray.map((d) => d.Name))
        .range([height, 0])
        .padding(0.1);

    const svg = d3
      .select("#first-graph")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg
      .selectAll(".bar")
      .data(dataArray, (d) => d.Name)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("width", (d) => x(d.avgWinRate))
      .attr("y", (d) => y(d.Name))
      .attr("height", y.bandwidth())
      .attr("fill", (d) =>
        Math.abs(d.avgWinRate - 50) > 3 ? "red" : "steelblue"
      );

    svg
      .selectAll(".bar-label")
      .data(dataArray, (d) => d.Name)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", (d) => x(d.avgWinRate) - 3)
      .attr("y", (d) => y(d.Name) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .text((d) => d.avgWinRate.toFixed(2));

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    svg.append("g").call(d3.axisLeft(y));

    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", width / 2 + 80)
      .attr("y", height + margin.bottom / 2 + 10)
      .text("AVERAGE WIN RATE (%)")
      .style("fill", "var(--text-color)");

    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left / 2 - 30)
      .attr("x", -height / 2)
      .text("CHAMPION")
      .style("fill", "var(--text-color)");
  });
}

// SECOND GRAPH-------------------------------------------------

let selectedChampion = "";

function drawSecondGraph(patch, championName = "") {
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

    const margin = { top: 20, right: 20, bottom: 50, left: 100 },
      width = 1400 - margin.left - margin.right,
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
      .attr("height", y.bandwidth())
      .attr("fill", (d) => {
        return d.Name.toLowerCase() === championName.toLowerCase()
          ? "orange"
          : "steelblue";
      });

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

    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", width / 2 + 80)
      .attr("y", height + margin.bottom / 2 + 10)
      .text("AVERAGE WIN RATE (%)")
      .style("fill", "var(--text-color)");

    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left / 2 - 30)
      .attr("x", -height / 2)
      .text("CHAMPION")
      .style("fill", "var(--text-color)");
  });
}

function populateChampionSuggestions(patch) {
  const dataList = document.getElementById("champions-datalist");
  dataList.innerHTML = "";

  d3.csv("data/data.csv").then((data) => {
    let filteredData = data.filter((d) => d.Patch === patch);

    let championNames = new Set(filteredData.map((d) => d.Name));

    championNames = [...championNames].sort();

    championNames.forEach((champion) => {
      const option = document.createElement("option");
      option.value = champion;
      dataList.appendChild(option);
    });
  });
}

// THIRD GRAPH-------------------------------------------------

function drawThirdGraph(patch) {
  d3.select("#third-graph").selectAll("*").remove();

  d3.csv("data/data.csv").then((data) => {
    let filteredData = data.filter((d) => d.Patch === patch);

    const aggregatedData = d3.rollup(
      filteredData,
      (v) => d3.mean(v, (d) => parseFloat(d["Win %"])),
      (d) => d.Class
    );

    const dataArray = Array.from(aggregatedData, ([Class, avgWinRate]) => ({
      Class,
      avgWinRate,
    })).sort((a, b) => d3.descending(a.avgWinRate, b.avgWinRate));

    const margin = { top: 20, right: 20, bottom: 50, left: 100 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(dataArray, (d) => d.avgWinRate)])
      .range([0, width]);

    const y = d3
      .scaleBand()
      .domain(dataArray.map((d) => d.Class))
      .range([height, 0])
      .padding(0.1);

    const svg = d3
      .select("#third-graph")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    svg
      .selectAll(".bar")
      .data(dataArray)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("height", y.bandwidth())
      .attr("y", (d) => y(d.Class))
      .attr("width", (d) => x(d.avgWinRate))
      .attr("fill", "steelblue");

    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g").attr("class", "y axis").call(d3.axisLeft(y));

    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", width / 2 + 80)
      .attr("y", height + margin.bottom / 2 + 20)
      .text("AVERAGE WIN RATE (%)")
      .style("fill", "var(--text-color)");

    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left / 2 - 30)
      .attr("x", -height / 2)
      .text("CLASS")
      .style("fill", "var(--text-color)");
  });
}

// FOURTH GRAPH-------------------------------------------------

function drawFourthGraph(selectedPatch) {
  d3.select("#fourth-graph").selectAll("*").remove();
  d3.csv("data/data.csv").then(function (data) {
    const filteredData = data.filter((d) => d.Patch === selectedPatch);

    const aggregatedData = d3.rollup(
      filteredData,
      (v) => ({
        avgWinRate: d3.mean(v, (d) => parseFloat(d["Win %"])),
        avgBanRate: d3.mean(v, (d) => parseFloat(d["Ban %"])),
      }),
      (d) => d.Name
    );

    const processedData = Array.from(aggregatedData, ([name, values]) => ({
      Name: name,
      avgWinRate: values.avgWinRate,
      avgBanRate: values.avgBanRate,
    }));

    const margin = { top: 20, right: 20, bottom: 60, left: 60 },
      width = 1000 - margin.left - margin.right,
      height = 1000 - margin.top - margin.bottom;

    const svg = d3
      .select("#fourth-graph")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, (d) => d.avgBanRate)])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(processedData, (d) => d.avgWinRate) * 0.95,
        d3.max(processedData, (d) => d.avgWinRate) * 1.05,
      ])
      .range([height, 0]);

    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.bottom - 15)
      .text("AVERAGE BAN RATE (%)")
      .style("fill", "var(--text-color)");

    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -height / 2 + margin.top)
      .text("AVERAGE WIN RATE (%)")
      .style("fill", "var(--text-color)");

    svg
      .selectAll("dot")
      .data(processedData)
      .enter()
      .append("circle")
      .attr("r", 5)
      .attr("cx", (d) => x(d.avgBanRate))
      .attr("cy", (d) => y(d.avgWinRate))
      .style("fill", "#D62728");

    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(-height).tickFormat(""));

    svg
      .append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).tickSize(-width).tickFormat(""));

    const tooltip = d3
      .select("#tooltip")
      .style("background-color", "var(--background-color)")
      .style("color", "var(--text-color)")
      .style("border-color", "var(--border-color)");

    svg
      .selectAll("dot")
      .data(processedData)
      .enter()
      .append("circle")
      .attr("r", 5)
      .attr("cx", (d) => x(d.avgBanRate))
      .attr("cy", (d) => y(d.avgWinRate))
      .style("fill", "steelblue")
      .on("mouseover", function (event, d) {
        const html = `Champion: ${d.Name}<br>Win Rate: ${d.avgWinRate}%<br>Ban Rate: ${d.avgBanRate}%`;
        tooltip
          .style("visibility", "visible")
          .html(html)
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mousemove", function (event) {
        tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
      });

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g").call(d3.axisLeft(y));
  });
}

// Overall ---------------------------------------------------------

function initializeGlobalPatchSlider() {
  d3.csv("data/data.csv").then((data) => {
    let patches = Array.from(new Set(data.map((d) => d.Patch)));
    patches = sortPatches(patches);

    const globalPatchSlider = document.getElementById("global-patch-slider");
    const selectedPatchDisplay = document.getElementById(
      "global-selected-patch"
    );
    globalPatchSlider.max = patches.length - 1;
    globalPatchSlider.value = 0;

    const roles = Array.from(new Set(data.map((d) => d.Role))).sort();
    const roleSelect = d3.select("#role-select");
    roleSelect
      .selectAll("option")
      .data(["All", ...roles])
      .enter()
      .append("option")
      .text((d) => d)
      .attr("value", (d) => d);

    const updateContent = () => {
      const selectedPatch = patches[globalPatchSlider.value];
      selectedPatchDisplay.textContent = `SELECTED PATCH: ${selectedPatch}`;
      updateAllGraphs(selectedPatch);
      populateChampionSuggestions(selectedPatch);
    };

    updateContent();

    const debouncedUpdate = debounce(updateContent, 100);
    globalPatchSlider.oninput = debouncedUpdate;

    roleSelect.on("change", function () {
      const selectedPatch = patches[globalPatchSlider.value];
      const selectedRole = this.value;
      drawFirstGraph(selectedPatch, selectedRole);
    });

    const searchInput = document.getElementById("champion-search");
    searchInput.addEventListener("change", function () {
      selectedChampion = this.value;
      const selectedPatch = patches[globalPatchSlider.value];
      drawSecondGraph(selectedPatch, selectedChampion);
    });

    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        selectedChampion = this.value;
        const selectedPatch = patches[globalPatchSlider.value];
        drawSecondGraph(selectedPatch, selectedChampion);
      }
    });
  });
}

function updateAllGraphs(selectedPatch) {
  const selectedRole = document.getElementById("role-select").value;
  drawFirstGraph(selectedPatch, selectedRole);
  drawSecondGraph(selectedPatch, selectedChampion);
  drawThirdGraph(selectedPatch);
  drawFourthGraph(selectedPatch);
}

initializeGlobalPatchSlider();
