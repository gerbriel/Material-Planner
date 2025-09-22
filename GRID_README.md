Grid preview persistence

The Grid preview at `src/pages/GridPreview.tsx` now persists layout changes to localStorage under the key `mbuilder:gridLayout` and mirrors layout state into a Jotai atom `gridLayoutAtom` in `src/state/atoms.ts`.

Notes:
- The project includes a react-grid-layout demo file. To run it at runtime you must install the dependencies (react-grid-layout and react-resizable) locally with your package manager.
- Hovering over a section in the grid sets `selectedWidgetAtom` to `main` or `aside`, which you can observe elsewhere in the app (LiveSummary/Topbar) if consumed.

Commands to install:

npm install react-grid-layout react-resizable
