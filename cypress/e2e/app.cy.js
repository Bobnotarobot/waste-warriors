describe('Navigation', () => {
  it('should navigate to the about page', () => {
    // Start from the index page
    cy.visit('https://my-test-app-gamma.vercel.app/');

    // Find a link with an href attribute containing "/test/test" and click it
    cy.get('a[href*="/test/test"]').click();

    // The new url should include "/test/test"
    cy.url().should('include', '/test/test');

    // The new page should contain title with "Organise event"
    cy.get('title').contains('Organise event');
  });
});