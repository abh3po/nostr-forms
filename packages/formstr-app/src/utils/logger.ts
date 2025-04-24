export const log = (...args: unknown[]) => {
  if (window.location.host.includes('local') || window.location.search.includes('debug=true')) {
    console.log(...args);
  }
};
