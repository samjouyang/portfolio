console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '/', title: 'Home' },
  { url: '/projects/', title: 'Projects' },
  { url: '/contact/', title: 'Contacts' },
  { url: '/resume/', title: 'Resume' },
  { url: 'https://github.com/samjouyang', title: 'GitHub' },
];

let nav = document.createElement('nav');
document.body.prepend(nav);

// for (let p of pages) {
//   let url = p.url;
//   let title = p.title;
//   nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
// }

// const ARE_WE_HOME = document.documentElement.classList.contains('home');

// url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

const ARE_WE_HOME = document.documentElement.classList.contains('home');

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  // Adjust URL if not on the home page and it's not an absolute URL
  if (!ARE_WE_HOME && !url.startsWith('http')) {
    url = `..${url}`;
  }

  nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
}

let a = document.createElement('a');
a.href = url;
a.textContent = title;
nav.append(a);

if (a.host === location.host && a.pathname === location.pathname) {
  a.classList.add('current');
}