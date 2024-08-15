const clientId = '';
const clientSecret = '';

let albumDataCache = null;

const getToken = async () => {
    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });

    const data = await result.json();
    return data.access_token;
};

const fetchArtistData = async (artistId) => {
    const token = await getToken();

    const result = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await result.json();

    return {
        artistPicture: data.images && data.images.length > 0 ? data.images[0].url : '',
    };
};

const fetchAlbumData = async (albumName, artistName) => {
    const token = await getToken();

    // Special case for "Culture" by Migos to avoid fetching "Culture II"
    if (albumName.toLowerCase() === 'culture' && artistName.toLowerCase() === 'migos') {
        const cultureAlbumId = '2AvupjUeMnSffKEV05x222'; // Spotify ID for "Culture" by Migos
        return await fetchAlbumDataById(cultureAlbumId);
    } else if (albumName.toLowerCase() === 'led zeppelin' && artistName.toLowerCase() === 'led zeppelin') {
        const ledZepAlbumId = '1J8QW9qsMLx3staWaHpQmU';  // Spotify ID for "Led Zeppelin I" by Led Zeppelin
        return await fetchAlbumDataById(ledZepAlbumId);
    } else if (albumName.toLowerCase() === 'led zeppelin ii' && artistName.toLowerCase() === 'led zeppelin') {
        const ledZepIIAlbumId = '58MQ0PLijVHePUonQlK76Y';  // Spotify ID for "Led Zeppelin II" by Led Zeppelin
        return await fetchAlbumDataById(ledZepIIAlbumId);
    }

    const result = await fetch(`https://api.spotify.com/v1/search?q=album:${encodeURIComponent(albumName)} artist:${encodeURIComponent(artistName)}&type=album`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await result.json();
    const album = data.albums.items[0];

    if (!album) {
        console.warn(`No data found for album: ${albumName} by artist: ${artistName}`);
        return null;
    }

    const artistId = album.artists[0].id;
    const artistData = await fetchArtistData(artistId);

    return {
        coverArt: album.images[0] ? album.images[0].url : '',
        artistPicture: artistData.artistPicture,
        subgenres: album.genres || [],
        releaseDate: album.release_date || '',
        spotifyUrl: album.external_urls.spotify
    };
};

const fetchAlbumDataById = async (albumId) => {
    const token = await getToken();

    const result = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    });

    const album = await result.json();

    const artistId = album.artists[0].id;
    const artistData = await fetchArtistData(artistId);

    return {
        coverArt: album.images[0] ? album.images[0].url : '',
        artistPicture: artistData.artistPicture,
        subgenres: album.genres || [],
        releaseDate: album.release_date || '',
        spotifyUrl: album.external_urls.spotify
    };
};

const fetchAllAlbums = async () => {
    if (albumDataCache) {
        console.log('Using cached album data.');
        return albumDataCache;
    }

    const albumDataList = [];

    for (const { album, artist } of albumList) {
        try {
            const albumData = await fetchAlbumData(album, artist);
            if (albumData) {
                albumDataList.push({
                    title: album,
                    artist: artist,
                    coverArt: albumData.coverArt,
                    artistPicture: albumData.artistPicture,
                    subgenres: albumList.find(a => a.album === album && a.artist === artist).subgenres,
                    releaseDate: albumData.releaseDate,
                    spotifyUrl: albumData.spotifyUrl,
                    genre: albumList.find(a => a.album === album && a.artist === artist).genre
                });
            }
        } catch (error) {
            console.error(`Failed to fetch data for ${album} by ${artist}:`, error);
        }
    }

    albumDataCache = albumDataList;
    console.log('Fetched Album Data List:', albumDataList);
    return albumDataList;
};

const displayAlbum = (album) => {
    document.getElementById('loadingMessage').style.display = 'none';

    if (!album) {
        alert('No album data found for the selected genre. Please try again with a different genre.');
        return;
    }

    const artistPictureElement = document.getElementById('artistPicture');
    const artistImageName = `${album.artist.replace(/\s+/g, '').toLowerCase()}.jpg`; // e.g., 'thebeatles.jpg'
    const customImagePath = `images/artists/${artistImageName}`;

    // Check if the custom image exists
    fetch(customImagePath)
        .then(response => {
            if (response.ok) {
                artistPictureElement.src = customImagePath;  // Use custom image
            } else {
                artistPictureElement.src = album.artistPicture || 'placeholder_artist.jpg';  // Fallback to Spotify image
            }
        })
        .catch(() => {
            artistPictureElement.src = album.artistPicture || 'placeholder_artist.jpg';  // Fallback to Spotify image
        });

    document.getElementById('albumTitle').textContent = `${album.title} by ${album.artist}`;
    document.getElementById('coverArt').src = album.coverArt || 'placeholder_cover.jpg';
    document.getElementById('artistPicture').src = album.artistPicture || 'placeholder_artist.jpg';
    document.getElementById('genreInfo').innerHTML = `Genre: ${album.genre || 'Unknown'}<br><span id="subgenreText">Subgenres: ${album.subgenres ? album.subgenres.join(', ') : 'None'}</span>`;
    document.getElementById('releaseDate').textContent = `Released: ${album.releaseDate || 'Unknown'}`;
    document.getElementById('spotifyLink').href = album.spotifyUrl || '#';
};

document.getElementById('generateButton').addEventListener('click', async function() {
    document.getElementById('loadingMessage').style.display = 'block';

    try {
        const genre = document.getElementById('genreSelect').value.toLowerCase();
        const albumDataList = await fetchAllAlbums();
        const filteredAlbumDataList = albumDataList.filter(album => {
            const albumGenre = album.genre ? album.genre.toLowerCase().trim() : '';
            return genre === 'all' || albumGenre === genre;
        });

        if (filteredAlbumDataList.length > 0) {
            const randomIndex = Math.floor(Math.random() * filteredAlbumDataList.length);
            const randomAlbum = filteredAlbumDataList[randomIndex];
            displayAlbum(randomAlbum);
        } else {
            displayAlbum(null);
        }
    } catch (error) {
        console.error('An error occurred:', error);
        alert('An error occurred while fetching album data. Please try again.');
    } finally {
        document.getElementById('loadingMessage').style.display = 'none';
    }
});
