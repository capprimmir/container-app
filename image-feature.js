const str = '/uploads/feature/other/test.png?greyscale=yes';

const getParams = (sentece) => {
  let newStr = str.split('/');
  console.log('Split:', newStr);
  console.log('Last: ', newStr[newStr.length -1]);
}

getParams(str);