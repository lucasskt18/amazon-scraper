const express = require('express');
const axios = require('axios');
const { JSDOM } = require('jsdom');

const app = express();
const PORT = process.env.PORT || 3000;

async function scrapeAmazon(keyword) {
  const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;
  const userAgentList = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',

  ];
  const randomUserAgent = userAgentList[Math.floor(Math.random() * userAgentList.length)];

  try {
    const response = await axios.get(amazonUrl, {
      headers: { 'User-Agent': randomUserAgent },
    });
    const dom = new JSDOM(response.data);
    const products = dom.window.document.querySelectorAll('.s-result-item');

    const scrapedData = Array.from(products).map((product) => {
      const title = product.querySelector('h2 span')?.textContent.trim();
      const rating = product.querySelector('.a-icon-star-small')?.getAttribute('aria-label')?.split(' ')[0];
      const reviews = product.querySelector('.a-size-base')?.textContent.trim();
      const image = product.querySelector('img')?.getAttribute('src');

      if (title && rating && reviews && image) {
        return { title, rating, reviews, image };
      }
      return null;
    }).filter(item => item !== null);

    return scrapedData;
  } catch (error) {
    console.error('Error scraping Amazon:', error);
    throw new Error('Failed to scrape Amazon');
  }
}

app.get('/api/scrape', async (req, res) => {
  const keyword = req.query.keyword;
  if (!keyword) {
    return res.status(400).json({ error: 'Please provide a keyword' });
  }

  try {
    const data = await scrapeAmazon(keyword);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
