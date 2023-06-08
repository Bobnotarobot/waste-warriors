describe('Navigation', () => {
  it('should navigate to the organise page', () => {
    // Start from the index page
    cy.visit('https://my-test-app-gamma.vercel.app/');

    // Find a link with an href attribute containing "/test/test" and click it
    //cy.get('a[href*="/organise"]').click();

    // The new url should include "/test/test"
    //cy.url().should('include', '/organise');

    // The new page should contain title with "Organise event"
    //cy.get('title').contains('Organise event');
  });
});
