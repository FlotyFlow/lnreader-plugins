const axios = require('axios');
const cheerio = require('cheerio');
const o = require('@libs/storage');  // Import the storage library (if necessary)
const r = require('@libs/fetch');    // Import your fetch utility (if necessary)
const l = require('@libs/defaultCover'); // Import your default cover image utility (if necessary)

async function fetchHtml(url) {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    console.error(`Error fetching page: ${error.message}`);
    return null;
  }
}

// Scrape novels from a page
async function scrapeNovelsFromPage(url) {
  const html = await fetchHtml(url);
  if (!html) {
    console.error('Failed to fetch HTML');
    return [];
  }

  const $ = cheerio.load(html);

  const novels = [];

  // Scrape each novel entry within the <li> elements
  $('li[data-id]').each((index, element) => {
    const title = $(element).attr('date-title');  // Extract title from the 'date-title' attribute
    const genres = $(element).attr('data-genre'); // Extract genre from the 'data-genre' attribute
    const lastUpdated = $(element).attr('date-update'); // Extract last update time from 'date-update' attribute
    const novelLink = $(element).find('a').attr('href'); // Extract the link to the novel page

    const chapters = [];
    $(element).find('a').each((chapterIndex, chapterElement) => {
      const chapterLink = $(chapterElement).attr('href');
      const chapterName = $(chapterElement).text().trim();
      chapters.push({ chapterName, chapterLink });
    });

    novels.push({
      title,
      genres,
      lastUpdated,
      novelLink,
      chapters
    });
  });

  return novels;
}

// Scrape multiple pages
async function scrapeMultiplePages(baseUrl, numPages) {
  let allNovels = [];

  for (let i = 1; i <= numPages; i++) {
    const pageUrl = `${baseUrl}/p${i}`;
    console.log(`Scraping page: ${pageUrl}`);

    const novelsFromPage = await scrapeNovelsFromPage(pageUrl);
    allNovels = allNovels.concat(novelsFromPage);

    // Add a delay between page requests to avoid overloading the server
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay between requests
  }

  console.log(`Scraped ${allNovels.length} novels in total.`);
  return allNovels;
}

// Sample usage within your script
const baseUrl = 'https://booktoki468.com/novel';  // Base URL
const numPages = 5;  // Specify how many pages you want to scrape

// Scraping multiple pages
scrapeMultiplePages(baseUrl, numPages).then(allNovels => {
  console.log(allNovels);  // This will log all scraped novels from the pages
  // You can now use `allNovels` for further processing, such as saving to storage, etc.
});
