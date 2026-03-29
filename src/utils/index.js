import copy from 'copy-to-clipboard';

export function copyTextToClipboard(text) {
  return copy(text);
}

export const getHTML = (item) => `<i class="${item}"></i>`;

export const getJSXTag = (item) => `<i className="${item}"></i>`;

export const getJSX = (item) => {
  const iconName = item.split('icon-font-')[1];
  const capitalized = iconName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  return `export const ${capitalized} = () => {
  return <i className="${item}"></i>;
};

export default ${capitalized};
`;
};

export function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
