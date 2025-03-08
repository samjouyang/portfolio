let data = [];
let xScale;
let yScale;
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
    updateScatterplot(filteredCommits);
    updateFileDetails(filteredCommits); // Add this line
  });

  // Also add this line to initialize the file details
  updateScatterplot(commits);
  updateFileDetails(commits); // Add this line
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
        updateScatterplot(filteredCommits);
    });






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

function updateScatterplot(filteredCommits) {
  // Clear previous SVG
  d3.select('#chart svg').remove();
  
  const width = 1000;
  const height = 600;
  
  // Use filteredCommits instead of commits for scales
  const [minLines, maxLines] = d3.extent(filteredCommits, (d) => d.totalLines);
  const sortedCommits = d3.sort(filteredCommits, (d) => -d.totalLines);
  
  const rScale = d3
    .scaleSqrt()
    .domain([minLines, maxLines])
    .range([2, 30]);

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  // Use filteredCommits for domain
  xScale = d3
    .scaleTime()
    .domain(d3.extent(filteredCommits, (d) => d.datetime))
    .range([0, width])
    .nice();

  yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

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
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

  // Add gridlines
  const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

  // Create gridlines as an axis with no labels and full-width ticks
  gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

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

  // Create dots group
  const dots = svg.append('g').attr('class', 'dots');

  // Use filteredCommits for the dots
  dots
    .selectAll('circle')
    .data(filteredCommits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7)
    .on('mouseenter', function (event, d) {
      d3.select(event.currentTarget).style('fill-opacity', 1);
      updateTooltipContent(d);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on("mouseleave", function(event) {
      d3.select(event.currentTarget).style("fill-opacity", 0.7);
      updateTooltipContent({});
      updateTooltipVisibility(false);
    });

    brushSelector();
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
  brushSelection = event.selection;
  updateSelection();
  updateSelectionCount();
  updateLanguageBreakdown();
}

function isCommitSelected(commit) {
    if (!brushSelection) {
        return false;
    }

    const min = { x: brushSelection[0][0], y: brushSelection[0][1] }; 
    const max = { x: brushSelection[1][0], y: brushSelection[1][1] }; 
    const x = xScale(commit.date); 
    const y = yScale(commit.hourFrac);
    return x >= min.x && x <= max.x && y >= min.y && y <= max.y; 
}

function updateSelection() {
  // Update visual state of dots based on selection
  d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
  
    const countElement = document.getElementById('selection-count');
    countElement.textContent = `${
      selectedCommits.length || 'No'
    } commits selected`;
  
    return selectedCommits;
  }


  function updateLanguageBreakdown() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
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


// Replace the incomplete code at the bottom with this function
function updateFileDetails(filteredCommits) {
  // Get all lines from filtered commits
  let lines = filteredCommits.flatMap((d) => d.lines);
  
  // Group lines by file
  let files = d3
    .groups(lines, (d) => d.file)
    .map(([name, lines]) => {
      return { name, lines };
    });
  
  // Sort files by number of lines (descending)
  files = d3.sort(files, (d) => -d.lines.length);
  
  // Create a color scale for different line types
  let typeColors = d3.scaleOrdinal(d3.schemeTableau10);
  
  // Clear existing content
  d3.select('.files').selectAll('div').remove();
  
  // Create file entries
  let filesContainer = d3.select('.files')
    .selectAll('div')
    .data(files)
    .enter()
    .append('div');
  
  // Add file names
  filesContainer.append('dt')
    .append('code')
    .text(d => d.name);

  // Add line counts as text
  filesContainer.append('dd')
    .text(d => `${d.lines.length} lines`);
  
  // Add unit visualization with colored squares based on line type
  const unitContainer = filesContainer.append('dd');
  
  unitContainer.selectAll('div')
    .data(d => d.lines)
    .enter()
    .append('div')
    .attr('class', 'line-unit')
    .attr('title', d => `Line ${d.line}: ${d.text || ''} (${d.type || 'unknown'})`)
    .style('background-color', d => typeColors(d.type || 'unknown'));
}


let NUM_ITEMS = 100; // Ideally, let this value be the length of your commit history
let ITEM_HEIGHT = 30; // Feel free to change
let VISIBLE_COUNT = 10; // Feel free to change as well
let totalHeight = (NUM_ITEMS - 1) * ITEM_HEIGHT;
const scrollContainer = d3.select('#scroll-container');
const spacer = d3.select('#spacer');
spacer.style('height', `${totalHeight}px`);
const itemsContainer = d3.select('#items-container');
scrollContainer.on('scroll', () => {
  const scrollTop = scrollContainer.property('scrollTop');
  let startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
  startIndex = Math.max(0, Math.min(startIndex, commits.length - VISIBLE_COUNT));
  renderItems(startIndex);
});




  

