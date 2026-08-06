import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const main = readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');
const home = readFileSync(new URL('../src/pages/Home.jsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/focus-home.css', import.meta.url), 'utf8');

test('default app route opens the focus-first home instead of the chat cockpit', () => {
  assert.match(main, /case '\/app': return <Home/);
  assert.match(main, /case '\/app\/chat': return <ChatApp/);
});

test('primary navigation uses plain-language workspace areas', () => {
  for (const label of ['Home', 'Work', 'Connections', 'Approvals', 'History']) {
    assert.ok(home.includes(label), `Missing navigation label: ${label}`);
  }
});

test('home keeps client, active work, approval, and safety state visible', () => {
  for (const phrase of ['Active client', 'Current work', 'approval needs attention', 'return point']) {
    assert.ok(home.includes(phrase), `Missing required state language: ${phrase}`);
  }
});

test('motion system is explicit and reduced-motion remains informative', () => {
  assert.match(styles, /--motion-fast:\s*140ms/);
  assert.match(styles, /--ease-out-strong:/);
  assert.match(styles, /@media \(hover: hover\) and \(pointer: fine\)/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(styles, /transition:\s*all/);
});

test('default ambient surfaces are intentionally still', () => {
  assert.match(styles, /landing-marquee__track[\s\S]*animation:\s*none\s*!important/);
  assert.match(styles, /avatar--idle[\s\S]*animation:\s*none\s*!important/);
});
