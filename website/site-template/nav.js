// Sidebar toggle for mobile
document.addEventListener('DOMContentLoaded', function() {
  // Highlight current page in sidebar
  function normalizePath(value) {
    var path = new URL(value, window.location.origin).pathname;
    return path.replace(/\/+$/, '') || '/';
  }

  var currentPath = normalizePath(window.location.href);
  var links = document.querySelectorAll('.sidebar a');
  links.forEach(function(link) {
    if (normalizePath(link.href) === currentPath) {
      link.classList.add('active');
    }
  });
});
