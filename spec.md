# CriminalDB - Law Enforcement Database Management System

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full-stack Criminal Database Management System for police departments
- Role-based auth system: Admin, Officer, Investigator
- Criminal records management (CRUD + photo upload)
- Crime reporting and registration
- Case management with status tracking
- Evidence tracking per case
- Police officer management panel
- Arrest records with officer linkage
- Dashboard with crime statistics charts
- Search and filter across all entities
- Dark/light mode toggle
- Activity log for system usage
- Notification system for new cases

### Modify
N/A

### Remove
N/A

## Implementation Plan

### Backend (Motoko)
- Data models: Criminal, Crime, Officer, ArrestRecord, Case, Evidence, User, ActivityLog
- CRUD APIs for all entities
- Role-based access: Admin (full), Officer (read/write cases+criminals), Investigator (read+evidence)
- Search APIs: by name, crime type, location, status
- Pagination support on list endpoints
- Statistics aggregation endpoint (crime counts by type, severity, status)
- Activity logging on mutations
- Notification store for new case alerts

### Components
- authorization: role-based user management (Admin/Officer/Investigator)
- blob-storage: criminal photo uploads

### Frontend (React + Tailwind)
- Login page with role-aware redirect
- Dashboard: stats cards + charts (crime by type, case status distribution, recent activity)
- Criminals page: data table with search/filter, add/edit/delete modal, photo upload
- Crimes page: register crimes, list with severity badges
- Cases page: case management, assign officers, status updates, court dates
- Evidence page: evidence log per case, type tagging
- Officers page: officer roster, rank/badge/station management
- Arrest Records page: history with officer+criminal linkage
- Activity Log page (Admin only)
- Notifications panel (bell icon in header)
- Dark/light mode toggle in header
- Responsive sidebar navigation
