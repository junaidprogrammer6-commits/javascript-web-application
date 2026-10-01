# TaskFlow — JavaScript Web Application

A small task manager built with TypeScript, compiled to plain JavaScript,
with no backend — all data is saved in the browser (localStorage).

## Technologies
- HTML5, CSS3
- TypeScript (typed source) compiled to JavaScript

## Files
- index.html, style.css — the page
- script.ts — TypeScript source (typed `Task` interface, filters, stats)
- script.js — compiled output the browser runs
- demo.html — a single self-contained file (CSS + JS inlined) for quick hosting

## Features
- Add tasks with a category, priority (Low/Medium/High) and due date
- Mark tasks done, delete tasks
- Search by title, filter by status and priority
- Live stats: total, pending, done, overdue — with a progress bar
- Light/dark theme toggle, remembered in this browser
- A few example tasks are seeded the first time you open it

## Run it
Just open `index.html` (or `demo.html`) in a browser — no server needed.

## Editing the TypeScript
If you change `script.ts`, recompile with:
```
tsc script.ts --target es2019 --lib es2019,dom --strict
```
This overwrites `script.js`. Requires Node.js and
`npm install -g typescript` (or run once with `npx tsc ...`).
