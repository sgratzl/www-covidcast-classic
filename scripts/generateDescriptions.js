/**
 * helper script to download the google doc description format and generate a JSON out of it
 */

const fetch = require('node-fetch');
const fs = require('fs');
const yaml = require('js-yaml');
const marked = require('marked');

const isCheckMode = process.argv.includes('--check');
const isFallBackMode = process.argv.includes('--fallback');
const isLocalOnlyMode = process.argv.includes('--localOnly');

// has to be publicly viewable
const DOC_URL =
  process.env.COVIDCAST_SIGNAL_DOC || 'https://docs.google.com/document/d/1MWBIjpURru2onDc3_IT_9JQDvdE3KoB9uCFsaW483rA';

async function loadDoc(url) {
  /**
   * download as plain text
   * @type {string}
   */
  const text = await fetch(`${url}/export?format=txt`).then((res) => res.text());
  if (text.startsWith('<!DOCTYPE html>')) {
    console.warn(`${url}: expecting a text file, got a HTML file`);
    return '';
  }
  // console.log(text);
  // find first code block
  const start = text.indexOf('---');
  let code = text.slice(start).trim();
  // replace * in links
  code = code.replace(/^[*] (.*)$/gm, ' - "$1"');
  // console.log(code);
  // unify line endings
  return code.replace(/\r?\n/g, '\n');
}

function compare(current, fileName) {
  if (!fs.existsSync(fileName)) {
    console.error(`file ${fileName} doesn't exit`);
    process.exit(1);
  }
  if (!current) {
    console.warn(`current text is empty, indicating a downloading error`, fileName);
    return true;
  }
  const stored = fs.readFileSync(fileName).toString().replace(/\r?\n/g, '\n');
  if (stored !== current) {
    console.error(
      `file ${fileName} is out of date and needs to be synced. Open a new PR and commit the output of "npm run gen"`,
    );
    process.exit(1);
  } else {
    console.log(`file ${fileName} matches the downloaded file`);
  }
}

async function handleFile(docUrl, fileName, converter) {
  const code = isLocalOnlyMode ? null : (await Promise.all(docUrl.split(',').map(loadDoc))).join('\n\n');
  if (isCheckMode) {
    return compare(code, fileName);
  }
  if (!code && (isFallBackMode || isLocalOnlyMode) && fs.existsSync(fileName)) {
    converter(fs.readFileSync(fileName).toString());
    return;
  }
  if (!code) {
    console.error('failed to download file', fileName);
    process.exit(1);
  }
  fs.writeFileSync(fileName, code);
  converter(code);
}

function parseObject(obj, processors = {}) {
  const r = {};
  Object.entries(obj).map(([key, value]) => {
    const formattedKey = key[0].toLowerCase() + key.slice(1);
    if (typeof processors[formattedKey] === 'function') {
      value = processors[formattedKey](value, formattedKey, processors);
    }
    r[formattedKey] = value;
  });
  return r;
}

function parseMarkdownInline(value) {
  return marked.parseInline(value.trim());
}
function parseNestedOrString(value, _key, processors) {
  if (typeof value === 'string') {
    return value;
  }
  return parseObject(value, processors);
}

function convertDescriptions(code) {
  const entries = yaml.loadAll(code).map((doc) => {
    return parseObject(doc, {
      description: parseMarkdownInline,
      credits: parseMarkdownInline,
      links: (v) => v.map((d) => parseMarkdownInline(d)),
      yAxis: parseNestedOrString,
      casesOrDeathSignals: parseNestedOrString,
      mapTitleText: parseNestedOrString,
    });
  });
  fs.writeFileSync('./src/stores/descriptions.generated.json', JSON.stringify(entries, null, 2));
}

function generateDescriptions() {
  return handleFile(DOC_URL, './src/stores/descriptions.raw.txt', convertDescriptions);
}

if (require.main === module) {
  generateDescriptions();
}
