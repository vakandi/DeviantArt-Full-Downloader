# DeviantArt Full Image Scraper

This script is designed to scrape images from DeviantArt, starting from a specified URL and continuing to the next page until there are no more pages or you stop the process. The image URLs are saved to a text file, and the images are downloaded to a local directory.

## Prerequisites

- Node.js
- npm (Node Package Manager)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/vakandi/DeviantArt-Full-Downloader
   cd DeviantArt-Full-Downloader
   ```

2. Install the required dependencies:

   ```bash
   npm install puppeteer
   ```

## Usage

1. Open `main.js` 

2. Change the `startUrl` variable to the DeviantArt URL you want to start scraping from:

   ```javascript
   const startUrl = 'http://www.deviantart.com'; // Starting URL of your website
   ```

3. Run the script:

   ```bash
   node main.js
   ```

## How It Works

- The script uses Puppeteer to control a headless browser and navigate through pages on DeviantArt.
- It scrapes all images with the property `contentUrl` from each page which is the only things constant on deviantart.com with the context row div.
- Each image is downloaded and saved in the `jpg` directory.
- The URLs of the downloaded images are written to a text file named `images_links.txt` in the `jpg` directory.
- The script continues to the next page by clicking the "Next" button until there are no more pages.


## Contributing

Feel free to open an issue or submit a pull request if you find any bugs or have suggestions for improvements.

