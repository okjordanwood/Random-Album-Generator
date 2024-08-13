const fs = require('fs');
const csv = require('csv-parser');

const results = [];

fs.createReadStream('albums.csv')
    .pipe(csv())
    .on('data', (data) => {
        results.push({
            album: data.album,
            artist: data.artist,
            genre: data.genre.toLowerCase(),
            subgenres: data.subgenres.split(',').map(subgenre => subgenre.trim())
        });
    })
    .on('end', () => {
        const output = `const albumList = ${JSON.stringify(results, null, 4)};`;
        fs.writeFile('albums.js', output, (err) => {
            if (err) throw err;
            console.log('albums.js has been saved!');
        });
    });
