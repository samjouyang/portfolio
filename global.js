// actual website code

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

for (let p of pages) {
  let url = p.url;
  let title = p.title;
  nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
}


// const BASE_PATH = '/portfolio';


// for (let p of pages) {
//   let url = p.url === '' ? BASE_PATH : (p.url.startsWith('/') && !p.url.startsWith('http') ? BASE_PATH + p.url : p.url);
//   let title = p.title;
//   nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
// }



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







// // sample website code (scuffed)

// function $$(selector, context = document) {
//   return Array.from(context.querySelectorAll(selector));
// }

// let pages = [
//   { url: '', title: 'Home' },
//   { url: '/projects/', title: 'Projects' },
//   { url: '/contact/', title: 'Contacts' },
//   { url: '/resume/', title: 'Resume' },
//   { url: 'https://github.com/samjouyang', title: 'GitHub' },
// ];

// let nav = document.createElement('nav');
// document.body.prepend(nav);

// const ARE_WE_HOME = document.documentElement.classList.contains('home');

// for (let p of pages) {
//   let url = p.url;
//   let title = p.title;

//   // Normalize the URL for comparison
//   let fullUrl = new URL(url, window.location.origin).pathname;
//   let currentPath = window.location.pathname;

//   // Handle home page URL
//   if (url === '') {
//     fullUrl = '/';
//   }

//   // Construct the full URL for the href attribute
//   let href = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

//   // Create the anchor element
//   let a = document.createElement('a');
//   a.href = href;
//   a.textContent = title;

//   // Add 'current' class if the URL matches the current page
//   if (fullUrl === currentPath) {
//     a.classList.add('current');
//   }

//   nav.append(a);
// }

// document.addEventListener('DOMContentLoaded', function () {
//   const select = document.querySelector('#color-scheme-select');

//   if (select) {
//     select.addEventListener('input', function (event) {
//       const selectedScheme = event.target.value;
//       console.log('Color scheme changed to', selectedScheme);
//       document.documentElement.style.setProperty('color-scheme', selectedScheme);
//     });
//   }
// });


// export async function fetchJSON(url) {
//   try {

//       const response = await fetch(url);

//       if (!response.ok) {
//         throw new Error(`Failed to fetch projects: ${response.statusText}`);
//       }
//       console.log(response)

//       const data = await response.json();
//       return data; 

      

//   } catch (error) {
//       console.error('Error fetching or parsing JSON data:', error);
//   }

// }


// export function renderProjects(project, containerElement, headingLevel = 'h2') {

//   containerElement.innerHTML = '';

//   for (let x of project){
//     const article = document.createElement('article');
//     article.innerHTML = `
//     <h3>${project.title}</h3>
//     <img src="${project.image}" alt="${project.title}">
//     <p>${project.description}</p>
// `;
//     containerElement.appendChild(article);
//   }
// }