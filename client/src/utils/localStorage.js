export function setToken(tokenName, token) {
  window.localStorage.setItem(tokenName, token);
}

export function deleteToken(tokenName) {
  window.localStorage.removeItem(tokenName);
}

export function getToken(tokenName) {
  return window.localStorage.getItem(tokenName);
}

export function checkToken(tokenName) {
  return window.localStorage.getItem(tokenName) ? true : false;
}
