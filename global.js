

console.log('IT’S ALIVE!');


function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contacts' },
  { url: 'resume/', title: 'Resume' },
  { url: 'https://github.com/samjouyang', title: 'GitHub' },
];

let INITIAL = ''

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'){
  INITIAL = 'http://127.0.0.1:5500/'
}
else {
  INITIAL = '/portfolio/'
}


let nav = document.createElement('nav');
document.body.prepend(nav);

const ARE_WE_HOME = document.documentElement.classList.contains('home');


for (let p of pages) {
  let url = p.url;
  let title = p.title;

  url = url.startsWith('http') ? url : `${INITIAL}${url}`;
  nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);

}




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
    <h3>${x.title}</h3>
    <img src="${x.image}" alt="${x.title}">
    <p>${x.description}</p>
`;
    containerElement.appendChild(article);
  }
  

}


export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}


