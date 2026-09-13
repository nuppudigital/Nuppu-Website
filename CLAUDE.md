# Global rules

## Scope
- Do exactly what was asked. Nothing more.
- No extra files: no README, no tests, no docs, no examples, no config — unless asked.
- No "while I was here" refactors, renames, or reformatting of untouched lines.
- No defensive scaffolding: no try/except, no input validation, no logging, no fallbacks unless the task needs them or I ask.
- If a requirement is unclear, ask one question instead of guessing and building both versions.

## Code size
- Shortest correct solution wins. Prefer stdlib/existing deps over new abstractions.
- No class where a function works. No function where an expression works.
- No config objects, factories, wrappers, or interfaces for a single use.
- No premature generality: write for the case in front of you, not future ones.
- Delete dead code you replace; don't comment it out.

## Comments
- Comments only where the *why* is non-obvious. Never restate the code.
- No file headers, no section banners, no docstrings on obvious functions.

## Edits
- Edit in place, minimal diff. Don't rewrite a file to change three lines.
- Never re-print an entire file back to me after editing it.

## Replies
- Answer in prose, not headers and bullet lists, unless I ask.
- No summary of what you just did if the diff already shows it.
- No "Here's what I changed:" recaps, no next-steps suggestions unless asked.
- Show only the changed code, not surrounding context I already have.
