// compare two field values
export function compareItemsValues({ fieldName, order }) {
  return function(a, b) {
    if (a.data[fieldName] === undefined || b.data[fieldName] === undefined) {
      return 0;
    }

    let firstItemValue = a.data[fieldName],
      secondItemValue = b.data[fieldName];

    if (typeof a.data[fieldName].getMonth === 'function') {
      firstItemValue = new Date(a.data[fieldName]);
      secondItemValue = new Date(b.data[fieldName]);
    } else if (fieldName === 'name') {
      firstItemValue = firstItemValue.toUpperCase();
      secondItemValue = secondItemValue.toUpperCase();
    }
    let comparison = 0;
    if (firstItemValue > secondItemValue) {
      comparison = 1;
    } else if (firstItemValue < secondItemValue) {
      comparison = -1;
    } else {
      comparison = 0;
    }

    return order === 'desc' ? comparison * -1 : comparison;
  };
}

function sortAlphaNum(a, b) {
  let reA = /[^a-zA-Z]/g;
  let reN = /[^0-9]/g;
  let aA = a.replace(reA, '');
  let bA = b.replace(reA, '');
  if (aA === bA) {
    let aN = parseInt(a.replace(reN, ''), 10);
    let bN = parseInt(b.replace(reN, ''), 10);
    return aN === bN ? 0 : aN > bN ? 1 : -1;
  } else {
    return aA.toUpperCase() > bA.toUpperCase() ? 1 : -1;
  }
}
