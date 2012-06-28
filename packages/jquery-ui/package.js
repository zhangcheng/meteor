Package.describe({
  summary: "Low-level interaction for animation, high-level themable widgets, built on top of jQuery."
});

Package.on_use(function (api) {
  api.add_files('jquery-ui-1.8.21.custom.js', 'client');
  api.add_files('css/smoothness/jquery-ui-1.8.21.custom.css', 'client');
});
