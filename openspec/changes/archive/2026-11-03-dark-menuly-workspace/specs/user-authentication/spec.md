# Spec Delta

## MODIFIED Requirements

### Requirement: Sign-out ends the current browser session
The application SHALL provide an accessible sign-out action in the desktop sidebar and mobile navigation panel. The action SHALL be available from every primary area, remove the active browser session, and return the visitor to anonymous access.

#### Scenario: Sign out
- **WHEN** a signed-in visitor signs out
- **THEN** subsequent requests from that browser no longer have signed-in access

#### Scenario: Sign out from any primary area
- **WHEN** a signed-in visitor opens Food, Meals, or Meal Plan
- **THEN** the desktop sidebar or open mobile panel shows "Sign out" where "Sign in with Google" appeared before sign-in

### Requirement: Global navigation offers Google-branded sign-in
The application SHALL place the Google sign-in action in the desktop sidebar and mobile navigation panel for anonymous visitors. The action SHALL show a recognizable multicolor Google mark and the visible, accessible label "Sign in with Google". Pointer hover SHALL visibly change its appearance.

#### Scenario: Anonymous visitor uses navigation
- **WHEN** an anonymous visitor views the desktop sidebar or opens the mobile panel
- **THEN** the Google-branded sign-in action is visible, keyboard accessible, and starts the verified Google sign-in flow

#### Scenario: Button alignment and hover
- **WHEN** an anonymous visitor views the desktop sidebar and hovers over the Google sign-in button
- **THEN** the button is aligned within the sidebar and shows a visible hover state

#### Scenario: Signed-in visitor uses navigation
- **WHEN** a visitor has an active application session
- **THEN** the desktop sidebar or mobile panel replaces the sign-in action with sign-out in the same navigation position
