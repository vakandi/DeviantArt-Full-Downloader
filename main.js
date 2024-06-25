const puppeteer = require('puppeteer');
const fs = require('fs').promises; // Use fs.promises for async/await support
const path = require('path');

const startUrl = 'http://www.deviantart.com'; // Starting URL of your website

// Adjust the downloadImage function to accept the page object
async function downloadImage(page, url, filepath) {
    const imageBuffer = await page.evaluate(async (url) => {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        return Array.from(new Uint8Array(buffer));
    }, url);

    await fs.writeFile(filepath, Buffer.from(imageBuffer));
    console.log(`The file was saved as ${filepath}`);
}

async function scrapePages(startUrl) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    let hasNextPage = true;
    let pageCount = 1;
    let nb_total_images = 0;

    // Check if the folder "jpg" exists, if not create it
    const jpgFolder = path.join(__dirname, 'jpg');
    try {
        await fs.access(jpgFolder);
    } catch (error) {
        await fs.mkdir(jpgFolder);
    }

    // Check if the file "images_links.txt" exists, if not create it
    const imagesLinksFile = path.join(jpgFolder, 'images_links.txt');
    try {
        await fs.access(imagesLinksFile);
    } catch (error) {
        await fs.writeFile(imagesLinksFile, '');
    }

    while (hasNextPage) {
        try {
            console.log(`Starting to scrape page ${pageCount}: ${startUrl}`);
            
            await page.goto(startUrl, { waitUntil: 'networkidle2', timeout: 30000 });
            console.log('Page loaded successfully');
            
            const images = await page.$$eval('img[property="contentUrl"]', imgs => imgs.map(img => img.getAttribute('src')));
            console.log(`Found ${images.length} images`);
            
            for (const imgUrl of images) {
                const filename = path.basename(new URL(imgUrl).pathname);
                nb_total_images++;
                console.log(`Downloading ${filename}`);
              
                // Pass the page object to the downloadImage function
                await downloadImage(page, imgUrl, path.join(__dirname, 'jpg', filename));
                console.log(`Downloaded ${filename}`);

                // Append the URL to the text file
                const currentData = await fs.readFile(imagesLinksFile, 'utf8');
                await fs.writeFile(imagesLinksFile, currentData + imgUrl + '\n');
                console.log(`Saved ${imgUrl} to images_links.txt`);
            }
            console.log('All images downloaded and URLs saved successfully');
            
            const nextPageButtonText = 'Next';
            const nextPageButtonExists = await page.evaluate(nextPageButtonText => {
                const button = [...document.querySelectorAll('a')].find(button => button.textContent.includes(nextPageButtonText));
                if (button) {
                    button.click();
                    return true;
                }
                return false;
            }, nextPageButtonText);
            
            if (nextPageButtonExists) {
                pageCount++;
                console.log('Clicked on the Next Page button');
                // Wait for navigation to ensure the new page is loaded
                await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
            } else {
                console.log('No more pages to scrape');
                hasNextPage = false;
            }
        } catch (error) {
            console.error(`Error scraping ${startUrl}:`, error.message); // Use startUrl instead of url
            hasNextPage = false; // Stop scraping on error
        }
    }
    console.log(`\n\nScraping complete. Found a total of ${nb_total_images} images on ${pageCount} pages`);

    await browser.close();
}

scrapePages(startUrl);
