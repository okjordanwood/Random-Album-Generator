const fs = require('fs');
const csv = require('csv-parser');

const results = [];

fs.createReadStream('albums.csv')
    .pipe(csv())
    .on('data', (data) => {
        // Remove any potential BOM from the key 'album'
        const albumKey = Object.keys(data).find(key => key.includes('album'));
        const cleanedData = {
            album: data[albumKey].trim(),
            artist: data.artist.trim(),
            genre: data.genre.trim().toLowerCase(),
            subgenres: data.subgenres.split(',').map(subgenre => subgenre.trim())
        };
        console.log('Processing row:', cleanedData);
        results.push(cleanedData);
    })
    .on('end', () => {
        const output = `const albumList = ${JSON.stringify(results, null, 4)};`;
        fs.writeFile('albums.js', output, (err) => {
            if (err) throw err;
            console.log('albums.js has been saved!');
        });
    });
