import yaml from 'yaml';

export default (dataTransfer: any, type?: string): Promise<Array<string | object>> => {
  type = type || 'text';
  if (!~['yaml', 'json', 'text', 'base64', 'url'].indexOf(type)) throw new Error(`type "${type}" is not supported`);

  return new Promise((resolve) => {
    const result: Array<string | object> = [];
    const loaded = [];

    const list = dataTransfer?.files?.length ? [...dataTransfer.files] : [...dataTransfer.items];

    if (!list?.length) {
      resolve([]);
    }

    list.forEach((file) => {
      if (file.kind && file.kind !== 'file') {
        loaded.push(null);
        return;
      }
      if (file.kind === 'file') file = file.getAsFile();

      const reader = new FileReader();

      reader.onerror = () => {
        loaded.push(file);

        if (loaded.length === list.length) {
          resolve(result);
        }
      };

      reader.onload = (event) => {
        loaded.push(file);
        try {
          const content = event.target.result;
          if (content && typeof content === 'string' && ~content.indexOf(';base64,')) {
            const b64 = content.split(';base64,')[1];
            if (b64) {
              if (type === 'yaml') {
                const docs = yaml.parseAllDocuments(Buffer.from(b64, 'base64').toString('utf8')).map((item) => item.toJSON());
                if (docs?.length) result.push(...docs);
              } else if (type === 'json') {
                result.push(JSON.parse(Buffer.from(b64, 'base64').toString('utf8')));
              } else if (type === 'text') {
                result.push(Buffer.from(b64, 'base64').toString('utf8'));
              } else if (type === 'base64') {
                result.push(b64);
              } else if (type === 'url') {
                result.push(b64);
              }
            }
          }
        } catch (err) {
          console.error(`file parse error`, err);
        } finally {
          if (loaded.length === list.length) {
            resolve(result);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  });
};
