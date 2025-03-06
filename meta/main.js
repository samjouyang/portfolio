let data = [];
let xScale;
let yScale;
let selectedCommits = []; // Declare selectedCommits at the top level
let commitProgress = 100;
let timeScale;
let commitMaxTime;

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  processCommits(); // Make sure commits are processed before creating timeScale
  
  // Initialize time scale after commits are processed
  timeScale = d3.scaleTime()
    .domain([d3.min(commits, d => d.datetime), d3.max(commits, d => d.datetime)])
    .range([0, 100]);
  commitMaxTime = timeScale.invert(commitProgress);
  
  // Set up the slider interaction
  const selectedTime = d3.select('#selectedTime');
  selectedTime.text(timeScale.invert(commitProgress)
    .toLocaleString('en-US', {dateStyle: "long", timeStyle: "short"}));

  d3.select('#commitSlider').on('input', function() {
    commitProgress = +this.value;
    commitMaxTime = timeScale.invert(commitProgress);
    selectedTime.text(commitMaxTime
      .toLocaleString('en-US', {dateStyle: "long", timeStyle: "short"}));
    
    const filteredCommits = commits.filter(d => d.datetime <= commitMaxTime);
    updateVisualization(filteredCommits);
  });

  createScatterplot();
  brushSelector();
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




    // Add these variables after your commits data is loaded
    let commitProgress = 100;
    let timeScale = d3.scaleTime()
        .domain([d3.min(commits, d => d.datetime), d3.max(commits, d => d.datetime)])
        .range([0, 100]);
    let commitMaxTime = timeScale.invert(commitProgress);

    // Add this where you set up your visualization
    const selectedTime = d3.select('#selectedTime');
    selectedTime.textContent = timeScale.invert(commitProgress)
        .toLocaleString('en-US', {dateStyle: "long", timeStyle: "short"});

    // Add the event listener for the slider
    d3.select('#commitSlider').on('input', function() {
        commitProgress = +this.value;
        commitMaxTime = timeScale.invert(commitProgress);
        selectedTime.textContent = commitMaxTime
            .toLocaleString('en-US', {dateStyle: "long", timeStyle: "short"});
        
        // Filter and update visualization
        const filteredCommits = commits.filter(d => d.datetime <= commitMaxTime);
        updateVisualization(filteredCommits);
    });

    // Add this function if it's not already defined
    function updateVisualization(filteredCommits) {
      // Update the dots
      d3.select('#chart')
        .selectAll('circle')
        .style('opacity', d => {
          return d.datetime <= commitMaxTime ? 0.7 : 0.1;
        });
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
    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
    // const rScale = d3.scaleLinear().domain([minLines, maxLines]).range([2, 30]); // adjust these values based on your experimentation
    const rScale = d3
        .scaleSqrt() // Change only this line
        .domain([minLines, maxLines])
        .range([2, 30]);


    const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');


    xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

    yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);


    const dots = svg.append('g').attr('class', 'dots');

    dots
    .selectAll('circle').data(sortedCommits).join('circle')
    .data(commits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue')
    .attr('r', (d) => rScale(d.totalLines))
    .style('fill-opacity', 0.7) // Add transparency for overlapping dots
    // .on('mouseenter', (event, commit) => {
    //     updateTooltipContent(commit);
    //     updateTooltipVisibility(true);
    //     updateTooltipPosition(event);
    //   })

    .on('mouseenter', function (event, d, i) {
        d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
        updateTooltipContent(d)
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
    })


    .on("mouseleave", (event) => {
        d3.select(event.currentTarget).style("fill-opacity", 0.7);
        updateTooltipContent({});
        updateTooltipVisibility(false);
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

    // brushSelector();

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


function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
  }


function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  }

function brushSelector() {
    const svg = document.querySelector('svg');
    d3.select(svg).call(d3.brush().on('start brush end', brushed));
    d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
  }

 
let brushSelection = null;

function brushed(event) {
  let brushSelection = event.selection;
  selectedCommits = !brushSelection
    ? []
    : commits.filter((commit) => {
        let min = { x: brushSelection[0][0], y: brushSelection[0][1] };
        let max = { x: brushSelection[1][0], y: brushSelection[1][1] };
        let x = xScale(commit.datetime); // Make sure we're using datetime consistently
        let y = yScale(commit.hourFrac);

        return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
      });
  
  updateSelection();
  updateSelectionCount();
  updateLanguageBreakdown();
}

function isCommitSelected(commit) {
  return selectedCommits.includes(commit);
}


function updateSelection() {
  // Update visual state of dots based on selection
  d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {
  const countElement = document.getElementById('selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;
  
  return selectedCommits;
}


  function updateLanguageBreakdown() {
    const container = document.getElementById('language-breakdown');
  
    if (selectedCommits.length === 0) {
      container.innerHTML = '';
      return;
    }
    
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);
  
    // Use d3.rollup to count lines per language
    const breakdown = d3.rollup(
      lines,
      (v) => v.length,
      (d) => d.type
    );
  
    // Update DOM with breakdown
    container.innerHTML = '';
  
    for (const [language, count] of breakdown) {
      const proportion = count / lines.length;
      const formatted = d3.format('.1~%')(proportion);
  
      container.innerHTML += `
              <dt>${language}</dt>
              <dd>${count} lines (${formatted})</dd>
          `;
    }
  
    return breakdown;
  }