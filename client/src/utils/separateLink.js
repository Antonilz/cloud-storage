export function separateLink(link) {
  const names = link.split('/').filter(val => val != '');
  const links = [];
  names.reduce((acc, val, index) => {
    return (links[index] = `${acc}/${val}`);
  }, '');
  return { links, names };
}
