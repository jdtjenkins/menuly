# database-access Specification

## Purpose

Give Menuly's server-side features one dependable database access path that works with a local file during development and a configured remote libSQL server in deployment.

## Requirements

### Requirement: Local development data persists
The application SHALL use a local libSQL database file when no remote database is configured, and data written through the server-side data layer SHALL remain available after the application restarts.

#### Scenario: Default local connection
- **WHEN** the server starts without remote database settings
- **THEN** database operations use the configured local file path

#### Scenario: Restart with existing data
- **WHEN** the application restarts after writing data to its local database
- **THEN** the server-side data layer can read that data from the same file

### Requirement: One access path supports a remote database
The application SHALL allow server-side database operations to use a configured remote libSQL endpoint without requiring callers to use a different data-access interface.

#### Scenario: Remote connection selected
- **WHEN** a valid remote endpoint and its required credentials are configured
- **THEN** server-side operations use the remote database through the same data-access interface

### Requirement: Invalid configuration fails clearly
The application SHALL reject incomplete or unsupported database configuration instead of silently falling back to another database.

#### Scenario: Remote settings are incomplete
- **WHEN** the server receives a remote endpoint configuration with a required setting missing
- **THEN** database initialization fails with a configuration error before data is written

#### Scenario: Database cannot be reached
- **WHEN** a configured database is unavailable
- **THEN** the operation reports a connection failure without switching to the local database

### Requirement: Database access remains server-side
The application SHALL keep database connections and credentials out of browser-delivered code and SHALL perform database operations only in server-side code.

#### Scenario: Browser receives an application page
- **WHEN** a visitor loads a Menuly page
- **THEN** the browser receives no database credential or direct database connection configuration
