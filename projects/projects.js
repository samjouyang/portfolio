import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

const projectsTitle = document.querySelector('.projects-title');

// Select all elements with the class 'project' to count the number of projects

// Get the count of projects
const projectCount = projects.length;

// Update the text content of the <h1> element to include the project count
projectsTitle.textContent = `${projectCount} Projects`;
