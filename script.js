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
      .attr("height", y.bandwidth())
      .attr("fill", "steelblue");

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
    let patches = Array.from(new Set(data.map((d) => d.Patch)));
    patches = sortPatches(patches);

    const select = d3.select("#patch-select");
    select
      .selectAll("option")
      .data(patches)
      .enter()
      .append("option")
      .text((d) => d)
      .attr("value", (d) => d);

    const roles = Array.from(new Set(data.map((d) => d.Role))).sort();
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

function initializeSecond() {
  d3.csv("data/data.csv").then((data) => {
    let patches = Array.from(new Set(data.map((d) => d.Patch))).sort();
    patches = sortPatches(patches);
    const patchSlider = document.getElementById("patch-slider");
    patchSlider.max = patches.length - 1;

    populateChampionSuggestions(patches[0]);
    drawSecondGraph(patches[0], selectedChampion);

    const debouncedDraw = debounce(function () {
      const selectedPatch = patches[this.value];
      populateChampionSuggestions(selectedPatch);
      drawSecondGraph(selectedPatch, selectedChampion);
    }, 100);

    patchSlider.oninput = debouncedDraw;

    const searchInput = document.getElementById("champion-search");
    searchInput.addEventListener("change", function () {
      selectedChampion = this.value;
      const selectedPatch = patches[patchSlider.value];
      drawSecondGraph(selectedPatch, selectedChampion);
    });

    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        selectedChampion = this.value;
        const selectedPatch = patches[patchSlider.value];
        drawSecondGraph(selectedPatch, selectedChampion);
      }
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

    const margin = { top: 20, right: 20, bottom: 30, left: 100 },
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
  });
}

function initializeThird() {
  d3.csv("data/data.csv").then((data) => {
    let patches = Array.from(new Set(data.map((d) => d.Patch))).sort();
    patches = sortPatches(patches);
    const patchSliderThird = document.getElementById("patch-slider-third");
    patchSliderThird.max = patches.length - 1;
    const selectedPatchDisplayThird = document.getElementById(
      "selected-patch-third"
    );

    drawThirdGraph(patches[0]);
    selectedPatchDisplayThird.textContent = `Selected Patch: ${patches[0]}`;

    patchSliderThird.oninput = function () {
      const selectedPatch = patches[this.value];
      drawThirdGraph(selectedPatch);
      selectedPatchDisplayThird.textContent = `Selected Patch: ${selectedPatch}`;
    };
  });
}

// FOURTH GRAPH-------------------------------------------------

function drawFourthGraph(selectedPatch) {
  d3.select("#fourth-graph").selectAll("*").remove();
  d3.csv("data/data.csv").then(function (data) {
    const filteredData = data.filter((d) => d.Patch === selectedPatch);

    const margin = { top: 20, right: 20, bottom: 30, left: 40 },
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
      .domain([0, d3.max(filteredData, (d) => parseFloat(d["Ban %"]))])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(filteredData, (d) => parseFloat(d["Win %"])) * 0.95,
        d3.max(filteredData, (d) => parseFloat(d["Win %"])) * 1.05,
      ])
      .range([height, 0]);

    svg
      .selectAll("dot")
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("r", 5)
      .attr("cx", (d) => x(parseFloat(d["Ban %"])))
      .attr("cy", (d) => y(parseFloat(d["Win %"])))
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
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("r", 5)
      .attr("cx", (d) => x(parseFloat(d["Ban %"])))
      .attr("cy", (d) => y(parseFloat(d["Win %"])))
      .style("fill", "steelblue")
      .on("mouseover", function (event, d) {
        tooltip
          .style("visibility", "visible")
          .html(
            `Champion: ${d.Name}<br>Win Rate: ${d["Win %"]}%<br>Ban Rate: ${d["Ban %"]}%`
          )
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

function initializeFourth() {
  const patchSlider = document.getElementById("patch-slider-fourth");
  const selectedPatchDisplay = document.getElementById("selected-patch-fourth");

  d3.csv("data/data.csv").then((data) => {
    let patches = Array.from(new Set(data.map((d) => d.Patch)));
    patches = sortPatches(patches);

    patchSlider.max = patches.length - 1;
    patchSlider.value = 0;

    drawFourthGraph(patches[0]);
    selectedPatchDisplay.textContent = `Selected Patch: ${patches[0]}`;

    patchSlider.oninput = function () {
      const selectedPatch = patches[this.value];
      drawFourthGraph(selectedPatch);
      selectedPatchDisplay.textContent = `Selected Patch: ${selectedPatch}`;
    };
  });
}

function updateAllGraphs(selectedPatch) {
  drawFirstGraph(selectedPatch, document.getElementById("role-select").value);
  drawSecondGraph(selectedPatch, selectedChampion);
  drawThirdGraph(selectedPatch);
  drawFourthGraph(selectedPatch);
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

function initializePatchSlider() {
  d3.csv("data/data.csv").then((data) => {
    let patches = Array.from(new Set(data.map((d) => d.Patch)));
    patches = sortPatches(patches);

    const patchSlider = document.getElementById("patch-slider");
    const selectedPatchDisplay = document.getElementById("selected-patch");

    patchSlider.max = patches.length - 1;
    patchSlider.value = patches.length - 1;

    const debouncedUpdateAllGraphs = debounce(function (selectedPatch) {
      updateAllGraphs(selectedPatch);
      selectedPatchDisplay.textContent = `Selected Patch: ${selectedPatch}`;
    }, 100);

    const initialPatch = patches[patchSlider.value];
    updateAllGraphs(initialPatch);
    selectedPatchDisplay.textContent = `Selected Patch: ${initialPatch}`;

    patchSlider.oninput = function () {
      const selectedPatch = patches[this.value];
      debouncedUpdateAllGraphs(selectedPatch);
    };
  });
}

// initializePatchSlider();
initializeFirst();
initializeSecond();
initializeThird();
initializeFourth();
