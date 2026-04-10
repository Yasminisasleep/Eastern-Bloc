type EventItem = {
  id: number
  title: string
  description: string
  category: string
  date: string
  venue: string
  city: string
  imageUrl: string | null
  price: number | null
  externalLink: string | null
  tags: string[]
  source: string
  status: string
}

const events: EventItem[] = [
  {
    id: 1,
    title: 'Indie Film Marathon',
    description: 'A long night of independent films.',
    category: 'CINEMA',
    date: '2026-04-20T19:30:00Z',
    venue: 'Studio Lumiere',
    city: 'Paris',
    imageUrl: null,
    price: 12,
    externalLink: 'https://example.com/tickets/1',
    tags: ['indie', 'cinema'],
    source: 'manual',
    status: 'ACTIVE',
  },
  {
    id: 2,
    title: 'Contemporary Theatre Night',
    description: 'A modern theatre performance.',
    category: 'THEATRE',
    date: '2026-04-22T18:00:00Z',
    venue: 'Le Petit Chatelet',
    city: 'Paris',
    imageUrl: null,
    price: 18,
    externalLink: null,
    tags: ['theatre'],
    source: 'manual',
    status: 'ACTIVE',
  },
  {
    id: 3,
    title: 'Modern Art Exhibition',
    description: 'Paintings and installations.',
    category: 'EXHIBITION',
    date: '2026-04-24T14:00:00Z',
    venue: 'Musee Urbain',
    city: 'Paris',
    imageUrl: null,
    price: 0,
    externalLink: null,
    tags: ['art'],
    source: 'manual',
    status: 'ACTIVE',
  },
]

function pageResponse(content: EventItem[]) {
  return {
    content,
    totalPages: 1,
    totalElements: content.length,
    number: 0,
    size: 20,
  }
}

function mockEventApis() {
  cy.intercept('GET', '**/api/events*', (req) => {
    const category = req.query.category as string | undefined
    const search = (req.query.q as string | undefined)?.toLowerCase()

    let filtered = events
    if (category) {
      filtered = filtered.filter((event) => event.category === category)
    }
    if (search) {
      filtered = filtered.filter((event) => event.title.toLowerCase().includes(search))
    }

    req.reply({ statusCode: 200, body: pageResponse(filtered) })
  }).as('getEvents')

  cy.intercept('GET', '**/api/events/1', {
    statusCode: 200,
    body: events[0],
  }).as('getEventDetail')
}

function visitAuthenticatedApp() {
  cy.visit('/', {
    onBeforeLoad(win) {
      win.localStorage.setItem('authToken', 'fake-jwt')
      win.localStorage.setItem('authUser', JSON.stringify({
        email: 'camille@example.com',
        firstName: 'Camille',
        lastName: 'Durand',
      }))
    },
  })
}

describe('Kulto frontend', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
  })

  it('shows the public landing page with event sections', () => {
    mockEventApis()

    cy.visit('/')

    cy.get('[data-cy="landing-page"]').should('be.visible')
    cy.contains('Discover Cultural Events Near You').should('be.visible')
    cy.get('[data-cy="landing-event-card"]').should('have.length', 3)
    cy.get('[data-cy="open-login"]').should('be.visible')
    cy.get('[data-cy="open-signup"]').should('be.visible')
  })

  it('validates signup on the client and authenticates on success', () => {
    mockEventApis()

    cy.intercept('POST', '**/api/auth/signup', {
      statusCode: 201,
      body: {
        token: 'signup-token',
        type: 'Bearer',
        email: 'camille@example.com',
        firstName: 'Camille',
        lastName: 'Durand',
      },
    }).as('signup')

    cy.visit('/')
    cy.get('[data-cy="open-signup"]').click()
    cy.get('[data-cy="signup-form"]').should('be.visible')

    cy.get('[data-cy="signup-email"]').type('camille@example.com')
    cy.get('[data-cy="signup-first-name"]').type('Camille')
    cy.get('[data-cy="signup-last-name"]').type('Durand')
    cy.get('[data-cy="signup-password"]').type('weakpass')
    cy.get('[data-cy="signup-date-of-birth"]').type('1998-06-10')
    cy.get('[data-cy="signup-city"]').type('Paris')
    cy.get('[data-cy="signup-confirm-password"]').type('weakpass')
    cy.get('[data-cy="signup-submit"]').click()
    cy.get('[data-cy="signup-error"]').should('contain', 'uppercase letter')

    cy.get('[data-cy="signup-password"]').clear().type('SecurePass1')
    cy.get('[data-cy="signup-confirm-password"]').clear().type('SecurePass1')
    cy.get('[data-cy="signup-submit"]').click()

    cy.wait('@signup')
    cy.get('[data-cy="authenticated-app"]').should('be.visible')
    cy.get('[data-cy="user-name"]').should('contain', 'Camille Durand')
  })

  it('logs in and lets the user filter and open event detail', () => {
    mockEventApis()

    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'login-token',
        type: 'Bearer',
        email: 'camille@example.com',
        firstName: 'Camille',
        lastName: 'Durand',
      },
    }).as('login')

    cy.visit('/')
    cy.get('[data-cy="open-login"]').click()
    cy.get('[data-cy="login-email"]').type('camille@example.com')
    cy.get('[data-cy="login-password"]').type('SecurePass1')
    cy.get('[data-cy="login-submit"]').click()

    cy.wait('@login')
    cy.get('[data-cy="events-view"]').should('be.visible')
    cy.get('[data-cy="events-search"]').type('Indie')
    cy.get('[data-cy="event-card"]').should('have.length', 1).first().click()
    cy.wait('@getEventDetail')
    cy.get('[data-cy="event-detail-view"]').should('be.visible')
    cy.get('[data-cy="event-detail-title"]').should('contain', 'Indie Film Marathon')
    cy.get('[data-cy="event-detail-back"]').click()
    cy.get('[data-cy="events-view"]').should('be.visible')
  })

  it('saves preferences locally when the backend endpoint is unavailable', () => {
    mockEventApis()

    cy.intercept('GET', '**/api/users/1/preferences', {
      statusCode: 404,
      body: { message: 'Not found' },
    }).as('getPreferences')

    cy.intercept('PUT', '**/api/users/1/preferences', {
      statusCode: 404,
      body: { message: 'Not found' },
    }).as('savePreferences')

    visitAuthenticatedApp()
    cy.get('[data-cy="tab-preferences"]').click()
    cy.wait('@getPreferences')
    cy.get('[data-cy="preferences-view"]').should('be.visible')
    cy.get('[data-cy="preferences-category-concert"]').click()
    cy.get('[data-cy="preferences-tags"]').clear().type('indie, jazz, museum')
    cy.get('[data-cy="preferences-radius"]').invoke('val', 30).trigger('input').trigger('change')
    cy.get('[data-cy="preferences-save"]').click()
    cy.wait('@savePreferences')
    cy.get('[data-cy="preferences-success"]').should('contain', 'saved locally')
  })

  it('shows fallback notifications and updates match status locally', () => {
    mockEventApis()

    cy.intercept('GET', '**/api/users/1/notifications', {
      statusCode: 404,
      body: { message: 'Not found' },
    }).as('getNotifications')

    cy.intercept('GET', '**/api/matches/501', {
      statusCode: 404,
      body: { message: 'Not found' },
    }).as('getMatch')

    cy.intercept('PUT', '**/api/matches/501/accept', {
      statusCode: 404,
      body: { message: 'Not found' },
    }).as('acceptMatch')

    visitAuthenticatedApp()
    cy.get('[data-cy="tab-notifications"]').click()
    cy.wait('@getNotifications')
    cy.get('[data-cy="notifications-view"]').should('be.visible')
    cy.get('[data-cy="notification-card"]').should('have.length.at.least', 1)
    cy.get('[data-cy="open-match-501"]').click()
    cy.wait('@getMatch')
    cy.get('[data-cy="match-detail-view"]').should('be.visible')
    cy.get('[data-cy="match-accept"]').click()
    cy.wait('@acceptMatch')
    cy.contains('ACCEPTED').should('be.visible')
  })
})
