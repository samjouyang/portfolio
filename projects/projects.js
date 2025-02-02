import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');


const projectsTitle = document.querySelector('.projects-title');
const projectCount = projects.length;
projectsTitle.textContent = `${projectCount} Projects`;

renderProjects(projects, projectsContainer, 'h2');
