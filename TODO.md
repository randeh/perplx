# Next Tasks
- [x] Add player/mouse/keyboard objects
- [ ] Allow formulae as input
  - Only if field type allows formulae (has a formulaValidator) and field is not dynamic
- [ ] Simple user input e.g. mouse control
  - Start with single player, client-sided only
  - Move the logic to server-side eventually
- [ ] Custom fields
- [ ] Triggers
- [ ] More shapes and fields
- [ ] Publishing/testing levels
- [ ] Preload all images

# Ongoing
- [ ] Tighten up validation and error reporting
  - [x] Don't allow duplicate object names
    - Keep track of used object names and which fields reference the object
  - Display nice messages in editor
    - [ ] Invalid object name (when creating new object)
    - [ ] Level saved
    - [ ] Level not saved
  - [ ] Validation of uploaded levels on server-side
  - etc.
- [ ] Avoid using $.css() wherever possible
  - Add/remove classes instead
- [ ] Improve commenting
- [ ] Consider race conditions
- [ ] Improve server-side code
  - Functions should accept callbacks
  - Improve inefficient queries

# Meta
- [x] Update versions of node dependencies
- [ ] Create build script
  - Minify scripts (Google closure compiler?)
  - N.B. Use `object["property"]` instead of `object.property` for all serialised objects
  - Combine files
  - Document in README
- [ ] Set up http server to serve client files
  - Possibly use `python -m SimpleHTTPServer`
  - Remove "http:" protocol specifier from jQuery source
  - Incorporate into build script
- [ ] Add a license
  - Consider reset.css and any other dependencies
