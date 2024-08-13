# Album Generator 🎵

## Overview
Album Generator is a web application that allows users to randomly select an album from a pre-defined list of albums. The user can filter albums by genre, and the app fetches detailed information from Spotify, including album cover art, artist picture, genre, subgenres, release date, and a link to listen on Spotify.

## Features
+ 🎶 Random Album Selection: Select a random album from a curated list.
+ 🔍 Genre Filtering: Filter albums by genre (Hip Hop, Rock, Pop, R&B, etc.).
+ 🎨 Dynamic Display: Show album cover art and artist picture side by side.
+ 📅 Detailed Information: Display album genre, subgenres, release date, and a link to listen on Spotify.
+ 🔄 Caching: Implemented caching to reduce redundant API calls for faster performance.
+ ⏳ Loading Spinner: Display a loading message while data is being fetched.
+ ⚠️ Error Handling: Notify users if no album matches the selected genre.

## Getting Started
### Prerequisites
Make sure you have the following installed:
+ Node.js
+ A modern web browser (e.g., Chrome, Firefox, Edge)

## Usage
Select Genre: Use the dropdown to select a genre or keep it as "All Genres" to include all albums.
Generate Album: Click on the "Generate Album" button to fetch and display a random album's information.
Listen on Spotify: Click on the "Listen on Spotify" link to open the album on Spotify.
