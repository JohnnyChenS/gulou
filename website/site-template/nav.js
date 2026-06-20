// Sidebar toggle for mobile
document.addEventListener('DOMContentLoaded', function() {
  // Highlight current page in sidebar
  var currentPath = window.location.pathname;
  var links = document.querySelectorAll('.sidebar a');
  links.forEach(function(link) {
    if (link.getAttribute('href') === currentPath ||
        link.getAttribute('href') === currentPath.replace(/\/$/, '/index.html')) {
      link.classList.add('active');
    }
  });
});
