import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');


const projectsTitle = document.querySelector('.projects-title');
const projectCount = projects.length;
projectsTitle.textContent = `${projectCount} Projects`;

renderProjects(projects, projectsContainer, 'h2');


let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let arc = arcGenerator({
    startAngle: 0,
    endAngle: 2 * Math.PI,
  });

d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');


let rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year,
  );
  
let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
});

let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));


let total = 0;

for (let d of data) {
  total += d;
}

let angle = 0;


for (let d of data) {
  let endAngle = angle + (d / total) * 2 * Math.PI;
  arcData.push({ startAngle: angle, endAngle });
  angle = endAngle;
}


let colors = d3.scaleOrdinal(d3.schemeTableau10);

arcs.forEach((arc, idx) => {
    
    d3.select('svg').append('path').attr('d', arc).attr('fill', colors(idx));
  })


let legend = d3.select('.legend');
data.forEach((d, idx) => {
    legend.append('li')
          .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
})


let query = '';
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
  // update query value
  query = event.target.value;
  // filter projects
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  // render filtered projects
  renderProjects(filteredProjects, projectsContainer, 'h2');
});



// function renderPieChart(projectsGiven) {
//     // re-calculate rolled data
//     let newRolledData = d3.rollups(
//       projectsGiven,
//       (v) => v.length,
//       (d) => d.year,
//     );
//     // re-calculate data
//     let newData = newRolledData.map(([year, count]) => {
//       return {}; // TODO
//     });
//     // re-calculate slice generator, arc data, arc, etc.
//     let newSliceGenerator = 
//     let newArcData = newSliceGenerator();
//     let newArcs = newArcData.map();
//     // TODO: clear up paths and legends
    
//     // update paths and legends, refer to steps 1.4 and 2.2
    
//   }
  
//   // Call this function on page load
//   renderPieChart(projects);