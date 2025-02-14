const axios = require('axios');
const cheerio = require('cheerio');

// Example of scraping the list of novels
async function getNovels() {
  try {
    const { data } = await axios.get('https://booktoki468.com/novel/');
    const $ = cheerio.load(data);
    const novels = [];

    $('#webtoon-list .list-container li').each((i, el) => {
      const title = $(el).find('a').attr('title');
      const link = $(el).find('a').attr('href');
      const genre = $(el).data('genre');
      const novel = {
        title,
        link,
        genre
      };
      novels.push(novel);
    });
    return novels;
  } catch (error) {
    console.error('Error scraping novels:', error);
  }
}

// Example of scraping individual chapters for a novel
async function getChapters(novelLink) {
  try {
    const { data } = await axios.get(novelLink);
    const $ = cheerio.load(data);
    const chapters = [];
    
    // Assuming the chapters are listed in a specific section
    $('a.chapter-link').each((i, el) => {
      const chapterTitle = $(el).text();
      const chapterUrl = $(el).attr('href');
      chapters.push({ title: chapterTitle, url: chapterUrl });
    });

    return chapters;
  } catch (error) {
    console.error('Error scraping chapters:', error);
  }
}

// You can call these functions and log results
async function main() {
  const novels = await getNovels();
  console.log(novels);

  const chapters = await getChapters(novels[0].link); // Just an example of scraping chapters from the first novel
  console.log(chapters);
}

main();
