module.exports = function override(config) {
  // Ignore source-map-loader warnings from broken node_modules packages
  config.ignoreWarnings = [
    function ignoreSourcemapsloaderWarnings(warning) {
      return (
        warning.module &&
        warning.module.resource &&
        warning.module.resource.includes("node_modules") &&
        warning.details &&
        warning.details.includes("source-map-loader")
      );
    },
  ];

  // Also remove source-map-loader from node_modules entirely
  if (config.module && config.module.rules) {
    config.module.rules.forEach((rule) => {
      if (
        rule.enforce === "pre" &&
        Array.isArray(rule.use) &&
        rule.use.some((u) =>
          typeof u === "string"
            ? u.includes("source-map-loader")
            : u.loader && u.loader.includes("source-map-loader")
        )
      ) {
        rule.exclude = [
          /node_modules[\\/]@imgly/,
          /node_modules[\\/]onnxruntime-web/,
          /node_modules[\\/]zod/,
        ];
      }
    });
  }

  return config;
};