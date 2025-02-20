# Structor - FHIR form builder

Structor form builder is an open source tool for building FHIR Questionnaire forms. A live demo could be found at [formdesigner.helsenorgelab.no/](https://formdesigner.helsenorgelab.no/).

## FHIR Questionnaires

The FHIR specification defines [Questionnaires](https://www.hl7.org/fhir/questionnaire.html): 

> A structured set of questions intended to guide the collection of answers from end-users. Questionnaires provide detailed control over order, presentation, phraseology and grouping to allow coherent, consistent data collection.

## Quickstart

Either open the demo at [formdesigner.helsenorgelab.no/](https://formdesigner.helsenorgelab.no/) or clone this repo, install Typescript, run `npm install` and run `npm start`.

## Netlify functions

Run `npm install -g netlify-cli` before running npm run functions :)

## Embedding into SAGE

Important! Use node version 14.18.1 (or similar)

Can do this using 'n': https://github.com/tj/n
run: `n exec 14.18.1 npm install`

### Development

Run `npm run build` to build the app, then run `node server.js` to serve it on port 9001 as expected by SAGE's webpack-dev-server config

### Production

TBD