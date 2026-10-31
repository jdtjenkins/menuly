# Spec Delta

## Purpose

Let a visitor establish a trusted Menuly account through Google and carry that identity across visits without storing Google profile or provider-token data.

## ADDED Requirements

### Requirement: Google sign-in establishes an account
The application SHALL accept a verified Google identity and associate it with one stable internal account, without creating an account from an unverified or failed sign-in.

#### Scenario: First successful sign-in
- **WHEN** a visitor completes Google sign-in with a verified identity
- **THEN** an internal account is created and the visitor becomes signed in

#### Scenario: Returning Google account
- **WHEN** the same Google subject signs in again
- **THEN** the existing internal account is used rather than creating a duplicate

#### Scenario: Failed verification
- **WHEN** Google sign-in is cancelled, fails, or returns an identity that cannot be verified
- **THEN** no new account or signed-in session is created

### Requirement: Provider identity is minimal and stable
The application SHALL persist the provider name and Google's subject ID as the provider identity for an internal account, and SHALL NOT persist OAuth email, name, picture, access token, or refresh token.

#### Scenario: Account is stored
- **WHEN** a Google identity is associated with an internal account
- **THEN** persistent account data contains the internal account ID and provider/subject identity without those profile or provider-token fields

#### Scenario: Google profile changes
- **WHEN** the same Google subject signs in after its email or name changes
- **THEN** the same internal account is used without linking by email or persisting the changed profile fields

### Requirement: Application sessions identify an active account
The application SHALL issue a protected, expiring session after sign-in and SHALL reject missing, expired, invalid, or orphaned sessions when an account is required.

#### Scenario: Return with a valid session
- **WHEN** a signed-in visitor returns before the session expires
- **THEN** the application recognizes the same internal account

#### Scenario: Invalid or expired session
- **WHEN** a request has no valid current session
- **THEN** the request is treated as anonymous and cannot access signed-in resources

#### Scenario: Account no longer exists
- **WHEN** a session refers to an internal account that no longer exists
- **THEN** the session does not authorize account access

### Requirement: Sign-out ends the current browser session
The application SHALL provide an accessible sign-out action in the same right-side global-navigation position used for anonymous sign-in. The action SHALL be available from every primary area, remove the active browser session, and return the visitor to anonymous access.

#### Scenario: Sign out
- **WHEN** a signed-in visitor signs out
- **THEN** subsequent requests from that browser no longer have signed-in access

#### Scenario: Sign out from any primary area
- **WHEN** a signed-in visitor opens Food, Meals, or Meal Plan
- **THEN** the global navigation shows "Sign out" where "Sign in with Google" appeared before sign-in

### Requirement: Global navigation offers Google-branded sign-in
The application SHALL place the Google sign-in action on the right side of the global navigation for anonymous visitors. The action SHALL show a recognizable multicolor Google mark and the visible, accessible label "Sign in with Google". On wide screens it SHALL align vertically with the primary links, and pointer hover SHALL visibly change its appearance.

#### Scenario: Anonymous visitor uses navigation
- **WHEN** an anonymous visitor views the global navigation on a wide or narrow screen
- **THEN** the Google-branded sign-in action is visible, keyboard accessible, and starts the verified Google sign-in flow

#### Scenario: Button alignment and hover
- **WHEN** an anonymous visitor views the navigation on a wide screen and hovers over the Google sign-in button
- **THEN** the button lines up vertically with the primary links and shows a visible hover state

#### Scenario: Signed-in visitor uses navigation
- **WHEN** a visitor has an active application session
- **THEN** the navigation replaces the sign-in action with sign-out in the same position
