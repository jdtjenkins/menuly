# Spec Delta

## Purpose

Provide a repeatable way to evolve Menuly's database schema in local and remote environments without losing data or accepting unrecorded schema drift.

## ADDED Requirements

### Requirement: Pending migrations apply in order
The migration workflow SHALL apply unapplied schema changes in their defined order and record each successful change in the target database.

#### Scenario: Fresh database
- **WHEN** an operator runs migrations against a new database
- **THEN** each available migration is applied in order and recorded as complete

#### Scenario: Database with earlier migrations
- **WHEN** an operator runs migrations against a database with some changes already recorded
- **THEN** only later unapplied migrations are applied in order

### Requirement: Repeated runs preserve data
The migration workflow SHALL leave an already migrated database unchanged when run again with the same migration set.

#### Scenario: Run twice
- **WHEN** an operator reruns the migration command without adding migrations
- **THEN** no migration is applied again and existing data remains intact

### Requirement: A failed migration is not recorded as successful
The migration workflow SHALL leave the failed migration unapplied and SHALL not continue to later migrations after an error.

#### Scenario: Migration statement fails
- **WHEN** a migration fails while applying schema changes
- **THEN** that migration's changes and completion record are rolled back, later migrations are not attempted, and the error is reported

### Requirement: Changed migration history is rejected
The migration workflow SHALL detect when a previously applied migration no longer matches its recorded content and stop without applying further changes.

#### Scenario: Applied migration edited
- **WHEN** a migration file is changed after it was applied to a database
- **THEN** the migration command reports a history mismatch and makes no new schema changes

### Requirement: Local and remote targets use the same migration set
The migration workflow SHALL support both the local file and a configured remote libSQL database with the same ordered migration definitions.

#### Scenario: Remote target selected
- **WHEN** an operator configures a remote database and runs migrations
- **THEN** the pending migrations apply to that remote database rather than to the local file
