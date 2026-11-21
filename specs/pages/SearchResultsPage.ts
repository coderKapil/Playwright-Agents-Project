import { Page } from '@playwright/test';

export class SearchResultsPage {
  constructor(private readonly page: Page) {}

  get searchBox() {
    return this.page.getByRole('textbox').first();
  }

  get searchButton() {
    return this.page.getByRole('button', { name: 'Search', exact: true });
  }

  get results() {
    return this.page.locator('.product-item');
  }

  get noResults() {
    return this.page.getByText('No products were found that matched your criteria.', { exact: true });
  }

  async search(term: string): Promise<void> {
    await this.searchBox.fill(term);
    await this.searchButton.click();
  }

  product(name: string) {
    return this.results.filter({ hasText: name }).getByRole('link', { name, exact: true });
  }
}
