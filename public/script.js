// mobile menu toggle
const menuIcon = document.getElementById('menu-icon');
const navbar = document.querySelector('.navbar');

if (menuIcon && navbar) {
  menuIcon.addEventListener('click', () => {
    navbar.classList.toggle('active');
    menuIcon.classList.toggle('bx-x');
  });

  document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('click', () => {
      navbar.classList.remove('active');
      menuIcon.classList.remove('bx-x');
    });
  });
}

// sticky header on scroll
window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  if (header) header.classList.toggle('sticky', window.scrollY > 80);
});
