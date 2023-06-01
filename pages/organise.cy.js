import IndexPage from './index.tsx';

describe('<IndexPage />', () => {
  it('should render and display expected content', () => {
    // Mount the React component for the About page
    cy.mount(<IndexPage />);

    // The new page should contain an h1 with "About page"
    cy.get('h3').contains('Upcoming events');

    // Validate that a link with the expected URL is present
    // *Following* the link is better suited to an E2E test
    cy.get('a[href="/organise"]').should('be.visible');
  });
});