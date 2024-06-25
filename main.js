const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const startUrl = 'http://www.deviantart.com'; // Starting URL of your website

async function downloadImage(page, url, filepath) {
    const viewSource = await page.goto(url);
    fs.writeFile(filepath, await viewSource.buffer(), function(err) {
        if (err) {
            return console.log(err);
        }
        console.log(`The file was saved as ${filepath}`);
    });
}

async function scrapePages(startUrl) {
    //const browser = await puppeteer.launch();
    const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    let url = startUrl;
    let hasNextPage = true;
    let pageCount = 1;

    while (hasNextPage) {
        try {
            console.log(`Starting to scrape page ${pageCount}: ${url}`);
            
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            console.log('Page loaded successfully');

            // Retrieve all images with property="contentUrl" from each div
            const images = await page.$$eval('img[property="contentUrl"]', imgs => imgs.map(img => img.getAttribute('src')));
            console.log(`Found ${images.length} images`);

            // Download images
            for (const imgUrl of images) {
                console.log(`Downloading ${imgUrl}`);
                const filename = path.basename(new URL(imgUrl).pathname);
                await downloadImage(page, imgUrl, path.join(__dirname, filename));
                console.log(`Downloaded ${filename}`);
            }
            console.log('All images downloaded successfully');

            // Find the "Next Page" link
            const nextPageLink = await page.evaluate(() => 
                Array.from(document.querySelectorAll('a'), a => a.href)
                .find(href => href.includes('Next'))
            );
            if (nextPageLink) {
                url = nextPageLink;
                pageCount++;
                console.log(`Next Page URL: ${url}`);
            } else {
                console.log('No more pages to scrape');
                hasNextPage = false;
            }
        } catch (error) {
            console.error(`Error scraping ${url}:`, error.message);
            hasNextPage = false; // Stop scraping on error
        }
    }

    await browser.close();
}

scrapePages(startUrl);