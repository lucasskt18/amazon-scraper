document.addEventListener('DOMContentLoaded', () => {
    const scrapeBtn = document.getElementById('scrape-btn');
    const keywordInput = document.getElementById('keyword');
    const resultsContainer = document.getElementById('results');
  
    scrapeBtn.addEventListener('click', async () => {
      const keyword = keywordInput.value.trim();
  
      if (!keyword) {
        alert('Please enter a keyword');
        return;
      }
  
      try {
        const response = await fetch(`/api/scrape?keyword=${encodeURIComponent(keyword)}`);
        const data = await response.json();
  
        displayResults(data);
      } catch (error) {
        console.error('Error scraping Amazon:', error);
        resultsContainer.innerHTML = '<p>Error scraping Amazon. Please try again later.</p>';
      }
    });
  
    function displayResults(products) {
      if (products.length === 0) {
        resultsContainer.innerHTML = '<p>No products found for the given keyword.</p>';
        return;
      }
  
      resultsContainer.innerHTML = products.map(product => `
        <div class="product">
          <img src="${product.image}" alt="${product.title}">
          <div class="details">
            <h2>${product.title}</h2>
            <p>Rating: ${product.rating}</p>
            <p>Reviews: ${product.reviews}</p>
          </div>
        </div>
      `).join('');
    }
  });
  