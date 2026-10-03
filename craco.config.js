module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // 1. Ignore source-map-loader warnings for node_modules
      webpackConfig.ignoreWarnings = [
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

      // 2. Exclude @imgly, onnxruntime-web, and zod from source-map-loader entirely
      if (webpackConfig.module && webpackConfig.module.rules) {
        webpackConfig.module.rules.forEach((rule) => {
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

      return webpackConfig;
    },
  },
};