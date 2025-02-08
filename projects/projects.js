import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');


const projectsTitle = document.querySelector('.projects-title');
const projectCount = projects.length;
projectsTitle.textContent = `${projectCount} Projects`;

renderProjects(projects, projectsContainer, 'h2');

let selectedIndex = -1;


function renderPieChart(projectsGiven) {
    // Clear existing SVG and legend content
    d3.select('svg').selectAll('path').remove();
    d3.select('.legend').selectAll('*').remove();
  
    // Re-calculate rolled data
    let newRolledData = d3.rollups(
      projectsGiven,
      (v) => v.length,
      (d) => d.year,
    );
  
    // Re-calculate data
    let newData = newRolledData.map(([year, count]) => {
      return { value: count, label: year };
    });
  
    // Re-calculate slice generator, arc data, arcs, etc.
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcs = newArcData.map((d) => arcGenerator(d));
  
    // Re-calculate total for angles (if needed)
    let total = newData.reduce((sum, d) => sum + d.value, 0);
  
    // Define color scale
    let colors = d3.scaleOrdinal(d3.schemeTableau10);
  


    newArcs.forEach((arc, idx) => {
      d3.select('svg')
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(idx))
        .on('click', function () { // Changed arrow function to regular function
          selectedIndex = selectedIndex === idx ? -1 : idx;

          // Highlight the selected wedge
          d3.selectAll('path').attr('class', null); // Clear previous selections
          d3.select(this).attr('class', 'selected'); // Use `this` to refer to the clicked wedge

          // Highlight the corresponding legend item
          d3.selectAll('.legend li').attr('class', null);
          d3.select(`.legend li:nth-child(${idx + 1})`).attr('class', 'selected');

          // Filter projects based on the selected year
          if (selectedIndex === -1) {
            renderProjects(projectsGiven, projectsContainer, 'h2'); // Show all projects if nothing is selected
          } else {
            let selectedYear = newData[idx].label;
            let filteredProjects = projectsGiven.filter(p => p.year === selectedYear);
            renderProjects(filteredProjects, projectsContainer, 'h2');
          }
        });
    });




  
    // Render legend
    let legend = d3.select('.legend');
    newData.forEach((d, idx) => {
      legend
        .append('li')
        .attr('style', `--color:${colors(idx)}`)
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });

  }


renderPieChart(projects);

let query = '';
let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {

  query = event.target.value;

  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });

  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects)
    
});