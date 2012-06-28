Package.describe({
  summary: "a JavaScript file and module loader"
});

Package.on_use(function (api) {
  api.add_files('require.js', 'client');
});
