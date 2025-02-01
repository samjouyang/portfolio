console.log('IT’S ALIVE!');


function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '', title: 'Home' },
  { url: '/projects/', title: 'Projects' },
  { url: '/contact/', title: 'Contacts' },
  { url: '/resume/', title: 'Resume' },
  { url: 'https://github.com/samjouyang', title: 'GitHub' },
];

let nav = document.createElement('nav');
document.body.prepend(nav);

const ARE_WE_HOME = document.documentElement.classList.contains('home');

// for (let p of pages) {
//   let url = p.url;
//   let title = p.title;
//   nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
// }


const BASE_PATH = '/portfolio';


for (let p of pages) {
  let url = p.url === '' ? BASE_PATH : (p.url.startsWith('/') && !p.url.startsWith('http') ? BASE_PATH + p.url : p.url);
  let title = p.title;
  nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
}



url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;



let a = document.createElement('a');
a.href = url;
a.textContent = title;
nav.append(a);

if (a.host === location.host && a.pathname === location.pathname) {
  a.classList.add('current');
}


document.addEventListener('DOMContentLoaded', function () {
  const select = document.querySelector('#color-scheme-select');
  

  if (select) {
    select.addEventListener('input', function (event) {
      const selectedScheme = event.target.value;
      console.log('Color scheme changed to', selectedScheme);
      

      document.documentElement.style.setProperty('color-scheme', selectedScheme);
    });
  }
});



export async function fetchJSON(url) {
  try {

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      console.log(response)

      const data = await response.json();
      return data; 

      

  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
  }

}




export function renderProjects(project, containerElement, headingLevel = 'h2') {

  containerElement.innerHTML = '';

  for (let x of project){
    const article = document.createElement('article');
    article.innerHTML = `
    <h3>${project.title}</h3>
    <img src="${project.image}" alt="${project.title}">
    <p>${project.description}</p>
`;
    containerElement.appendChild(article);
  }
  

}



