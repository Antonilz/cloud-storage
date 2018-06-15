//import mimedb from 'mime-types';

const isFolder = (name, contentType) => {
  if (name.endsWith('/')) return true;
  return false;
};

const isPdf = (name, contentType) => {
  if (contentType === 'application/pdf') return true;
  return false;
};

const isZip = (name, contentType) => {
  if (!contentType || !contentType.includes('/')) return false;
  var types = ['zip', 'x-rar'];
  const subType = contentType.split('/')[1];
  for (var i in types) {
    if (subType.includes(types[i])) return true;
  }
  //if (contentType.split('/')[1].includes('zip')) return true;
  return false;
};

const isCode = (name, contentType) => {
  const codeExt = [
    'c',
    'cpp',
    'go',
    'py',
    'java',
    'rb',
    'js',
    'pl',
    'fs',
    'php',
    'css',
    'less',
    'scss',
    'coffee',
    'net',
    'html',
    'rs',
    'exs',
    'scala',
    'hs',
    'clj',
    'el',
    'scm',
    'lisp',
    'asp',
    'aspx'
  ];
  const ext = name.split('.').reverse()[0];
  for (var i in codeExt) {
    if (ext === codeExt[i]) return true;
  }
  return false;
};

const isExcel = (name, contentType) => {
  if (!contentType || !contentType.includes('/')) return false;
  const types = ['excel', 'spreadsheet'];
  const subType = contentType.split('/')[1];
  for (var i in types) {
    if (subType.includes(types[i])) return true;
  }
  return false;
};

const isDoc = (name, contentType) => {
  if (!contentType || !contentType.includes('/')) return false;
  const types = ['word', '.document'];
  const subType = contentType.split('/')[1];
  for (var i in types) {
    if (subType.includes(types[i])) return true;
  }
  return false;
};

const isPresentation = (name, contentType) => {
  if (!contentType || !contentType.includes('/')) return false;
  var types = ['powerpoint', 'presentation'];
  const subType = contentType.split('/')[1];
  for (var i in types) {
    if (subType.includes(types[i])) return true;
  }
  return false;
};

const typeToIcon = type => {
  return (name, contentType) => {
    if (!contentType || !contentType.includes('/')) return false;
    if (contentType.split('/')[0] === type) return true;
    return false;
  };
};

export const getIconFromType = (name, contentType) => {
  if (contentType === '') {
    //contentType = mimedb.lookup(name) || 'application/octet-stream';
    contentType = 'application/octet-stream';
  }
  const check = [
    ['folder', isFolder],
    ['file code outline', isCode],
    ['file audio outline', typeToIcon('audio')],
    ['camera retro', typeToIcon('image')],
    ['file video outline', typeToIcon('video')],
    ['file text outline', typeToIcon('text')],
    ['file pdf outline', isPdf],
    ['file archive outline', isZip],
    ['file excel outline', isExcel],
    ['file word outline', isDoc],
    ['file powerpoint outline', isPresentation]
  ];
  for (let i in check) {
    if (check[i][1](name, contentType)) return check[i][0];
  }
  return 'file outline';
};
