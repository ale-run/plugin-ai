export default (filename: any, contents: string, type?: string): void => {
  const text = Buffer.from(contents, 'utf8').toString('base64');

  const element = document.createElement('a');
  element.setAttribute('href', `data:${type || 'text/plain'};base64,${text}`);
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
