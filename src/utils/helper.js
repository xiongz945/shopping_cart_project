import { message } from 'antd';

export const copyToClipboard = (event, dataToAppend, dataToCopy) => {
  let str;
  if (dataToCopy) {
    str = dataToCopy;
  } else {
    str = `${window.location.origin}/plans/${localStorage.getItem(
      'reseller-public-link-token',
      ''
    )}/${dataToAppend || ''}`;
  }
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  message.success('Copied');
};

// converts lower case letters to title case eg string: "abc xyz" will be converted to "Abc Xyz"
// userful for converting lowercase name
export const titleCase = str => {
  const splitStr = str.toLowerCase().split(' ');
  for (let i = 0; i < splitStr.length; i += 1) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(' ');
};
