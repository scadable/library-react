/**
 * Utility to extract values from objects using JSON path notation
 * Supports paths like ".timestamp" or ".data.tempreture"
 */
export function getValueByPath(obj: any, path: string): any {
  if (!path || typeof path !== 'string') {
    return undefined;
  }

  // Remove leading dot if present
  const cleanPath = path.startsWith('.') ? path.slice(1) : path;

  // Split by dots and traverse the object
  const keys = cleanPath.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return undefined;
    }
    result = result[key];
  }

  return result;
}
