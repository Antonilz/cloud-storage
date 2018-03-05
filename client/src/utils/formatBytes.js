const sufixes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

export function formatBytes(bytes) {
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (
    (!bytes && '0 B') ||
    (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sufixes[i]
  );
}
