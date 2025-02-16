let data = [];


document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  createScatterplot();
});

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
    displayStats();
  }


let commits = d3.groups(data, (d) => d.commit);


function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        let ret = {
          id: commit,
          url: 'https://github.com/vis-society/lab-7/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };
  
        Object.defineProperty(ret, 'lines', {
          value: lines,
          // What other options do we need to set?
          // Hint: look up configurable, writable, and enumerable
          enumerable: false,
          writable: false,
          configurable: false,
        });
  
        return ret;
      });
  }



function displayStats() {
    // Process commits first
    processCommits();

    // Remove any existing stats before appending new ones (prevents duplication)
    d3.select("#stats").html("");

    // Create a styled stats container
    const statsContainer = d3.select("#stats")
        .append("div")
        .attr("class", "stats-container");

    // Add a title
    statsContainer.append("h2").text("Codebase Statistics");

    // Create the dl element
    const dl = statsContainer.append("dl").attr("class", "stats");

    // Function to add a stat entry
    function addStat(title, value) {
        dl.append("dt").text(title);
        dl.append("dd").text(value);
    }

    // Populate stats
    addStat("Total LOC", data.length);
    addStat("Total commits", commits.length);

    let files = d3.groups(data, (d) => d.file);
    addStat("Number of files", files.length);

    let fileLengths = files.map(([file, lines]) => ({ file, length: lines.length }));
    let maxFile = d3.max(fileLengths, (d) => d.length);
    let longestFile = fileLengths.find((d) => d.length === maxFile).file;

    addStat("Maximum file length (lines)", maxFile);
    addStat("Longest file", longestFile);

    let avgFileLength = d3.mean(fileLengths, (d) => d.length);
    addStat("Average file length (lines)", avgFileLength.toFixed(2));

    let avgLineLength = d3.mean(data, (d) => d.length);
    addStat("Average line length (characters)", avgLineLength.toFixed(2));
}

function createScatterplot(){


    const width = 1000;
    const height = 600;


    const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');


    const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

    const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);


    const dots = svg.append('g').attr('class', 'dots');

    dots
    .selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue')
    .on('mouseenter', (event, commit) => {
        updateTooltipContent(commit);
    })
    .on('mouseleave', () => {
        updateTooltipContent({}); // Clear tooltip content
    });
    

    const margin = { top: 10, right: 10, bottom: 30, left: 20 };

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
      };
      
      // Update scales with new ranges
      xScale.range([usableArea.left, usableArea.right]);
      yScale.range([usableArea.bottom, usableArea.top]);

      // Create the axes
    const xAxis = d3.axisBottom(xScale);
    // const yAxis = d3.axisLeft(yScale);
    const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

    // Add X axis
    svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

    // Add Y axis
    svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);


    // Add gridlines BEFORE the axes
    const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

    // Create gridlines as an axis with no labels and full-width ticks
    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

}



function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const author = document.getElementById('commit-author');
    const linesEdited = document.getElementById('commit-lines-edited');
  
    if (Object.keys(commit).length === 0) return;
  
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {
      dateStyle: 'full',
    });
    time.textContent = commit.datetime?.toLocaleString('en', {
        timeStyle: 'short',
    });
    author.textContent = commit.author;
    linesEdited.textContent = commit.totalLines;
  }