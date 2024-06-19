export function getUrl(path) {
  const http = window.location.protocol;
  const domain = window.location.host;
  return http + "//" + domain + "/" + path;
}
