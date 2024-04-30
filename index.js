const express = require('express');
const axios = require('axios');
const { JSDOM } = require('jsdom');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/scrape', async (req, res) => {
  try {
    const keyword = req.query.keyword;
    if (!keyword) {
      return res.status(400).json({ error: 'Please provide a keyword' });
    }

    const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;
    const response = await axios.get(amazonUrl);
    const dom = new JSDOM(response.data);

    const products = dom.window.document.querySelectorAll('.s-result-item');

    const scrapedData = [];

    products.forEach((product) => {
      const title = product.querySelector('h2 span')?.textContent.trim();
      const rating = product.querySelector('.a-icon-star-small')?.getAttribute('aria-label').split(' ')[0];
      const reviews = product.querySelector('.a-size-base')?.textContent.trim();
      const image = product.querySelector('img')?.getAttribute('src');

      if (title && rating && reviews && image) {
        scrapedData.push({
          title,
          rating,
          reviews,
          image,
        });
      }
    });

    res.json(scrapedData);
  } catch (error) {
    console.error('Error scraping Amazon:', error);
    res.status(500).json({ error: 'Failed to scrape Amazon' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
