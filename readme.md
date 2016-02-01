# Grocery receipt store
Web development course project

Prototype mobile webapp for storing receipts with automated text parsing.

[![Youtube Demo Video](https://raw.github.com/jasalt/kuittiskanneri/master/ui-anim.gif)](https://www.youtube.com/watch?v=YUJ11Dzjx6w)

Looks best with Chromium based browsers (uses datepicker in date-input field) and mobile browsers.

## Architecture
- AngularJS + Bootstrap frontend
  - Pretty minimal animated UI
  - Some data visualization with D3 library
  - Autocompletes text input when entering products manually
- Rest api backend with Python Flask
  - Scrapers for some Finnish grocery store items
  - Tesseract for OCR, called with shell script.
- MongoDB database

Module seperation is pretty good in both backend and frontend.

- TODO Architecture drawing

## Undone
Untested on most browsers, works probably only on fairly new browsers.

Code is untested.

Proper data validation / db schema is missing.

Some problems with removing cookies at logout (http simple auth).

OCR could be done a lot better.. Currently works for demoing.

Project is not optimized for production use (minified js ...)

# How to Build and Run

- Create the file './app/secrets.py' and put inside credentials for accessing MongoDB like:<br />
  MONGO_URI = 'mongodb://mongo/app'

- Install Docker and Docker-Compose as described here:<br />
  https://docs.docker.com/engine/installation/<br />
  https://docs.docker.com/compose/install/

- Execute being in the root:
  'docker-compose up'

- Open the page in a browser:
  http://localhost:8008/
