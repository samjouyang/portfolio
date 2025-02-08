import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');


const projectsTitle = document.querySelector('.projects-title');
const projectCount = projects.length;
projectsTitle.textContent = `${projectCount} Projects`;

renderProjects(projects, projectsContainer, 'h2');


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
  
    // Render arcs (pie chart slices)
    newArcs.forEach((arc, idx) => {
      d3.select('svg')
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(idx));
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





// let selectedIndex = -1;

// let svg = d3.select('svg');
// svg.selectAll('path').remove();
// arcs.forEach((arc, i) => {
//     svg
//     .append('path')
//     .attr('d', arc)
//     .attr('fill', colors(i))
//     .on('click', () => {
//         selectedIndex = selectedIndex === i ? -1 : i;
        
//         svg
//         .selectAll('path')
//         .attr('class', (_, idx) => (
//             idx === selectedIndex ? 'selected' : ''));
        

//         legend
//         .selectAll('li')
//         .attr('class', (_, idx) => (
//             idx === selectedIndex ? 'selected' : ''));

//         if (selectedIndex === -1) {

//             renderProjects(projects, projectsContainer, 'h2');
//         } 
//         else {
//             let selectedYear = data[selectedIndex].label;
//             let filteredProjects = projects.filter(p => p.year === selectedYear);
//             renderProjects(filteredProjects, projectsContainer, 'h2');
//         }

        

//     });
// });








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