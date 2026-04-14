type MatchSummary = {
  id: number
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CONFIRMED' | 'CANCELLED'
  compatibilityScore: number
  matchedUserName: string
  event: {
    id: number
    title: string
    category: string
    date: string
    city: string
    venue: string
  }
}

type NotificationItem = {
  id: number
  status: 'UNREAD' | 'READ'
  createdAt: string
  message: string
  match: MatchSummary
}

type MatchDetailType = MatchSummary & {
  matchedUserBio?: string
  matchedUserCity?: string
  matchedUserTags?: string[]
}

const FUTURE_DATE = new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString()

const mockNotifications: NotificationItem[] = [
  {
    id: 1001,
    status: 'UNREAD',
    createdAt: new Date().toISOString(),
    message: 'We found a strong match for your theatre interests.',
    match: {
      id: 701,
      status: 'PENDING',
      compatibilityScore: 0.87,
      matchedUserName: 'Alice M.',
      event: { id: 10, title: 'Contemporary Theatre Night', category: 'THEATRE', date: FUTURE_DATE, city: 'Paris', venue: 'Le Petit Chatelet' },
    },
  },
  {
    id: 1002,
    status: 'READ',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    message: 'A cinema fan with similar tags is available this weekend.',
    match: {
      id: 702,
      status: 'PENDING',
      compatibilityScore: 0.63,
      matchedUserName: 'Bob K.',
      event: { id: 11, title: 'Indie Film Marathon', category: 'CINEMA', date: FUTURE_DATE, city: 'Paris', venue: 'Studio Lumiere' },
    },
  },
]

const mockMatchDetail: MatchDetailType = {
  id: 701,
  status: 'PENDING',
  compatibilityScore: 0.87,
  matchedUserName: 'Alice M.',
  matchedUserBio: 'I love discovering films outside the mainstream.',
  matchedUserCity: 'Paris',
  matchedUserTags: ['arthouse', 'theatre', 'world cinema'],
  event: { id: 10, title: 'Contemporary Theatre Night', category: 'THEATRE', date: FUTURE_DATE, city: 'Paris', venue: 'Le Petit Chatelet' },
}

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
        displayName: 'Camille Durand',
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
        displayName: 'Camille Durand',
      },
    }).as('signup')

    cy.visit('/')
    cy.get('[data-cy="open-signup"]').click()
    cy.get('[data-cy="signup-form"]').should('be.visible')

    cy.get('[data-cy="signup-email"]').type('camille@example.com')
    cy.get('[data-cy="signup-display-name"]').type('Camille Durand')
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
        displayName: 'Camille Durand',
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
    cy.contains('Accepted').should('be.visible')
  })

  it('shows an error when login credentials are invalid', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials' },
    }).as('loginFail')

    cy.visit('/')
    cy.get('[data-cy="open-login"]').click()
    cy.get('[data-cy="login-email"]').type('wrong@example.com')
    cy.get('[data-cy="login-password"]').type('WrongPass1')
    cy.get('[data-cy="login-submit"]').click()
    cy.wait('@loginFail')
    cy.get('[data-cy="login-error"]').should('be.visible')
    cy.get('[data-cy="login-form"]').should('be.visible')
  })

  it('shows a server error when signup email is already taken', () => {
    cy.intercept('POST', '**/api/auth/signup', {
      statusCode: 409,
      body: { message: 'Email already in use' },
    }).as('signupConflict')

    cy.visit('/')
    cy.get('[data-cy="open-signup"]').click()
    cy.get('[data-cy="signup-email"]').type('existing@example.com')
    cy.get('[data-cy="signup-display-name"]').type('Existing User')
    cy.get('[data-cy="signup-password"]').type('SecurePass1')
    cy.get('[data-cy="signup-confirm-password"]').type('SecurePass1')
    cy.get('[data-cy="signup-date-of-birth"]').type('1995-01-15')
    cy.get('[data-cy="signup-city"]').type('Paris')
    cy.get('[data-cy="signup-submit"]').click()
    cy.wait('@signupConflict')
    cy.get('[data-cy="signup-error"]').should('contain', 'Email already in use')
  })

  it('filters events by category', () => {
    mockEventApis()
    visitAuthenticatedApp()
    cy.get('[data-cy="event-card"]').should('have.length', 3)
    cy.get('[data-cy="events-category-filter"]').select('CINEMA')
    cy.get('[data-cy="event-card"]').should('have.length', 1)
    cy.get('[data-cy="event-card"]').first().should('contain', 'Indie Film Marathon')
  })

  it('shows empty state when search matches no events', () => {
    mockEventApis()
    visitAuthenticatedApp()
    cy.get('[data-cy="events-view"]').should('be.visible')
    cy.get('[data-cy="events-search"]').type('xyznonexistent')
    cy.get('[data-cy="events-empty-state"]').should('be.visible')
    cy.get('[data-cy="event-card"]').should('not.exist')
  })

  it('returns to the landing page after logout', () => {
    mockEventApis()
    visitAuthenticatedApp()
    cy.get('[data-cy="events-view"]').should('be.visible')
    cy.get('[data-cy="logout-button"]').click()
    cy.get('[data-cy="landing-page"]').should('be.visible')
  })

  it('rejects a match locally when the backend is unavailable', () => {
    mockEventApis()

    cy.intercept('GET', '**/api/users/1/notifications', {
      statusCode: 404,
      body: { message: 'Not found' },
    }).as('getNotifications')

    cy.intercept('GET', '**/api/matches/501', {
      statusCode: 404,
      body: { message: 'Not found' },
    }).as('getMatch')

    cy.intercept('PUT', '**/api/matches/501/reject', {
      statusCode: 404,
      body: { message: 'Not found' },
    }).as('rejectMatch')

    visitAuthenticatedApp()
    cy.get('[data-cy="tab-notifications"]').click()
    cy.wait('@getNotifications')
    cy.get('[data-cy="notifications-view"]').should('be.visible')
    cy.get('[data-cy="open-match-501"]').click()
    cy.wait('@getMatch')
    cy.get('[data-cy="match-reject"]').click()
    cy.wait('@rejectMatch')
    cy.contains('Rejected').should('be.visible')
  })

  it('navigates back from match detail to notifications', () => {
    mockEventApis()

    cy.intercept('GET', '**/api/users/1/notifications', {
      statusCode: 404,
      body: { message: 'Not found' },
    }).as('getNotifications')

    cy.intercept('GET', '**/api/matches/501', {
      statusCode: 404,
      body: { message: 'Not found' },
    }).as('getMatch')

    visitAuthenticatedApp()
    cy.get('[data-cy="tab-notifications"]').click()
    cy.wait('@getNotifications')
    cy.get('[data-cy="open-match-501"]').click()
    cy.wait('@getMatch')
    cy.get('[data-cy="match-detail-view"]').should('be.visible')
    cy.get('[data-cy="match-detail-back"]').click()
    cy.get('[data-cy="notifications-view"]').should('be.visible')
  })

  it('shows an error state when the event is not found', () => {
    mockEventApis()

    cy.intercept('GET', '**/api/events/1', {
      statusCode: 404,
      body: { message: 'Event not found' },
    }).as('getEventNotFound')

    visitAuthenticatedApp()
    cy.get('[data-cy="event-card"]').first().click()
    cy.wait('@getEventNotFound')
    cy.get('[data-cy="event-detail-error"]').should('be.visible')
  })

  it('can switch between Events, Preferences, and Notifications tabs', () => {
    mockEventApis()

    cy.intercept('GET', '**/api/users/1/preferences', {
      statusCode: 404,
      body: { message: 'Not found' },
    }).as('getPreferences')

    cy.intercept('GET', '**/api/users/1/notifications', {
      statusCode: 404,
      body: { message: 'Not found' },
    }).as('getNotifications')

    visitAuthenticatedApp()
    cy.get('[data-cy="events-view"]').should('be.visible')

    cy.get('[data-cy="tab-preferences"]').click()
    cy.wait('@getPreferences')
    cy.get('[data-cy="preferences-view"]').should('be.visible')

    cy.get('[data-cy="tab-notifications"]').click()
    cy.wait('@getNotifications')
    cy.get('[data-cy="notifications-view"]').should('be.visible')

    cy.get('[data-cy="tab-events"]').click()
    cy.get('[data-cy="events-view"]').should('be.visible')
  })
})

describe('Matching engine', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    mockEventApis()
  })

  function mockNotificationsApi(body: NotificationItem[] = mockNotifications, statusCode = 200) {
    cy.intercept('GET', '**/api/users/1/notifications', { statusCode, body }).as('getNotifications')
  }

  function mockMatchApi(body: MatchDetailType = mockMatchDetail, statusCode = 200) {
    cy.intercept('GET', `**/api/matches/${body.id}`, { statusCode, body }).as('getMatch')
  }

  function goToNotifications() {
    visitAuthenticatedApp()
    cy.get('[data-cy="tab-notifications"]').click()
    cy.wait('@getNotifications')
    cy.get('[data-cy="notifications-view"]').should('be.visible')
  }

  it('loads notifications from the API and shows unread badge', () => {
    mockNotificationsApi()
    goToNotifications()
    cy.get('[data-cy="notification-card"]').should('have.length', 2)
    cy.get('[data-cy="notifications-unread-count"]').should('contain', '1 new')
  })

  it('shows empty state when API returns no notifications', () => {
    mockNotificationsApi([])
    goToNotifications()
    cy.get('[data-cy="notifications-empty-state"]').should('be.visible')
    cy.get('[data-cy="notification-card"]').should('not.exist')
  })

  it('loads match detail from the API with full profile', () => {
    mockNotificationsApi()
    mockMatchApi()
    goToNotifications()
    cy.get('[data-cy="open-match-701"]').click()
    cy.wait('@getMatch')
    cy.get('[data-cy="match-detail-view"]').should('be.visible')
    cy.contains('Alice M.').should('be.visible')
    cy.contains('Paris').should('be.visible')
    cy.contains('87%').should('be.visible')
    cy.contains('arthouse').should('be.visible')
    cy.contains('Contemporary Theatre Night').should('be.visible')
  })

  it('accepts a match via the API and shows Accepted status', () => {
    const accepted: MatchDetailType = { ...mockMatchDetail, status: 'ACCEPTED' }
    mockNotificationsApi()
    mockMatchApi()
    cy.intercept('PUT', '**/api/matches/701/accept', { statusCode: 200, body: accepted }).as('acceptMatch')

    goToNotifications()
    cy.get('[data-cy="open-match-701"]').click()
    cy.wait('@getMatch')
    cy.get('[data-cy="match-accept"]').click()
    cy.wait('@acceptMatch')
    cy.contains('Accepted').should('be.visible')
    cy.get('[data-cy="match-accept"]').should('be.disabled')
  })

  it('rejects a match via the API and shows Rejected status', () => {
    const rejected: MatchDetailType = { ...mockMatchDetail, status: 'REJECTED' }
    mockNotificationsApi()
    mockMatchApi()
    cy.intercept('PUT', '**/api/matches/701/reject', { statusCode: 200, body: rejected }).as('rejectMatch')

    goToNotifications()
    cy.get('[data-cy="open-match-701"]').click()
    cy.wait('@getMatch')
    cy.get('[data-cy="match-reject"]').click()
    cy.wait('@rejectMatch')
    cy.contains('Rejected').should('be.visible')
    cy.get('[data-cy="match-reject"]').should('be.disabled')
  })

  it('disables accept button when match is already accepted', () => {
    const accepted: MatchDetailType = { ...mockMatchDetail, status: 'ACCEPTED' }
    mockNotificationsApi()
    mockMatchApi(accepted)

    goToNotifications()
    cy.get('[data-cy="open-match-701"]').click()
    cy.wait('@getMatch')
    cy.get('[data-cy="match-accept"]').should('be.disabled')
    cy.get('[data-cy="match-reject"]').should('not.be.disabled')
  })

  it('disables reject button when match is already rejected', () => {
    const rejected: MatchDetailType = { ...mockMatchDetail, status: 'REJECTED' }
    mockNotificationsApi()
    mockMatchApi(rejected)

    goToNotifications()
    cy.get('[data-cy="open-match-701"]').click()
    cy.wait('@getMatch')
    cy.get('[data-cy="match-reject"]').should('be.disabled')
    cy.get('[data-cy="match-accept"]').should('not.be.disabled')
  })

  it('can navigate to a second notification match', () => {
    const match702: MatchDetailType = {
      id: 702,
      status: 'PENDING',
      compatibilityScore: 0.63,
      matchedUserName: 'Bob K.',
      matchedUserCity: 'Paris',
      matchedUserTags: ['indie', 'cinema'],
      event: { id: 11, title: 'Indie Film Marathon', category: 'CINEMA', date: FUTURE_DATE, city: 'Paris', venue: 'Studio Lumiere' },
    }
    mockNotificationsApi()
    cy.intercept('GET', '**/api/matches/702', { statusCode: 200, body: match702 }).as('getMatch702')

    goToNotifications()
    cy.get('[data-cy="open-match-702"]').click()
    cy.wait('@getMatch702')
    cy.get('[data-cy="match-detail-view"]').should('be.visible')
    cy.contains('Bob K.').should('be.visible')
    cy.contains('63%').should('be.visible')
    cy.contains('Indie Film Marathon').should('be.visible')
  })

  it('navigates back from match detail to notifications', () => {
    mockNotificationsApi()
    mockMatchApi()

    goToNotifications()
    cy.get('[data-cy="open-match-701"]').click()
    cy.wait('@getMatch')
    cy.get('[data-cy="match-detail-view"]').should('be.visible')
    cy.get('[data-cy="match-detail-back"]').click()
    cy.get('[data-cy="notifications-view"]').should('be.visible')
  })

  it('falls back to mock data when notifications API fails', () => {
    mockNotificationsApi([], 500)
    visitAuthenticatedApp()
    cy.get('[data-cy="tab-notifications"]').click()
    cy.wait('@getNotifications')
    cy.get('[data-cy="notifications-view"]').should('be.visible')
    cy.get('[data-cy="notification-card"]').should('have.length.at.least', 1)
  })
})
