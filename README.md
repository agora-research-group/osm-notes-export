# OpenStreetMap - Notes Export Tool

A tool to extract OpenStreetMap Notes based on time and space.

## Usage

Download the latest notes dump on `http://planet.openstreetmap.org/notes`

Extract the file with: `bzip2 -dk planet-notes-latest.osn.bz2`

Run `npm install` and:
```
node app/index.js \
    --file planet-notes-latest.osn \
    --initial-creation-timestamp 2015-04-10 \
    --final-creation-timestamp 2015-05-15 \
    --bounding-box 80.0586,26.3477,88.1993,30.4469
```

Use the flags `node --stack_size=2000 --max-old-space-size=2000` to avoid some memmory errors.

View the output in [json2table](http://json2table.com/).
