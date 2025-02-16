let data = [];


document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
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


//   function displayStats() {
//     // Process commits first
//     processCommits();
  
//     // Create the dl element
//     const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  
//     // Add total LOC
//     dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
//     dl.append('dd').text(data.length);
  
//     // Add total commits
//     dl.append('dt').text('Total commits');
//     dl.append('dd').text(commits.length);
  
//     // Number of files in the codebase
//     let files = d3.groups(data, (d) => d.file);
//     dl.append('dt').text('Number of files');
//     dl.append('dd').text(files.length);

//     // Maximum file length (in lines) and longest file
//     let fileLengths = files.map(([file, lines]) => ({ file, length: lines.length }));
//     let maxFile = d3.max(fileLengths, (d) => d.length);
//     let longestFile = fileLengths.find((d) => d.length === maxFile).file;

//     dl.append('dt').text('Maximum file length (in lines)');
//     dl.append('dd').text(maxFile);

//     dl.append('dt').text('Longest file');
//     dl.append('dd').text(longestFile);

//     // Average file length (in lines)
//     let avgFileLength = d3.mean(fileLengths, (d) => d.length);
//     dl.append('dt').text('Average file length (in lines)');
//     dl.append('dd').text(avgFileLength.toFixed(2));

//     // Average line length (in characters)
//     let avgLineLength = d3.mean(data, (d) => d.length);
//     dl.append('dt').text('Average line length (in characters)');
//     dl.append('dd').text(avgLineLength.toFixed(2));
//   }


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