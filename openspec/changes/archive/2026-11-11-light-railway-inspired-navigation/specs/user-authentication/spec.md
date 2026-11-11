# Spec Delta

## MODIFIED Requirements

### Requirement: Sign-out ends the current browser session
The application SHALL provide an accessible sign-out action in the desktop global navigation and mobile navigation panel. The action SHALL be available from every primary area, remove the active browser session, and return the visitor to anonymous access.

#### Scenario: Sign out
- **WHEN** a signed-in visitor signs out
- **THEN** subsequent requests from that browser no longer have signed-in access

#### Scenario: Sign out from any primary area
- **WHEN** a signed-in visitor opens Food, Meals, or Meal Plan
- **THEN** the desktop global navigation or open mobile panel shows "Sign out" where "Sign in with Google" appeared before sign-in

### Requirement: Global navigation offers Google-branded sign-in
The application SHALL place the Google sign-in action on the right side of the desktop global navigation and inside the mobile navigation panel for anonymous visitors. The action SHALL show a recognizable multicolor Google mark and the visible, accessible label "Sign in with Google". On wide screens it SHALL align vertically with the primary links, and pointer hover SHALL visibly change its appearance.

#### Scenario: Anonymous visitor uses navigation
- **WHEN** an anonymous visitor views the global navigation on a wide screen or opens the panel on a narrow screen
- **THEN** the Google-branded sign-in action is visible, keyboard accessible, and starts the verified Google sign-in flow

#### Scenario: Button alignment and hover
- **WHEN** an anonymous visitor views the navigation on a wide screen and hovers over the Google sign-in button
- **THEN** the button lines up vertically with the primary links and shows a visible hover state

#### Scenario: Signed-in visitor uses navigation
- **WHEN** a visitor has an active application session
- **THEN** the desktop navigation or mobile panel replaces the sign-in action with sign-out in the same navigation position
