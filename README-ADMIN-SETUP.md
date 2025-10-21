# Admin Database Setup Instructions

This document provides instructions for setting up the admin database for the IPPIS application.

## Prerequisites

- The application must be deployed and running
- You must have the `ADMIN_SETUP_TOKEN` environment variable set

## Option 1: Using the Web Interface

1. Navigate to `/admin/setup` in your browser
2. Click the "Set Up Admin Database" button
3. If prompted, enter the admin setup token
4. Wait for the setup to complete

## Option 2: Using the Command Line

1. Set the required environment variables:
   \`\`\`
   export ADMIN_SETUP_TOKEN=your_token_here
   export API_BASE_URL=https://your-app-url.com  # Optional, defaults to http://localhost:3000
   \`\`\`

2. Run the setup script:
   \`\`\`
   npx tsx scripts/setup-admin-db.ts
   \`\`\`

## Default Admin Credentials

After setup, you can log in with the following default credentials:

- Username: `admin`
- Password: `admin123`

**Important:** Change the default password immediately after the first login.

## What Gets Created

The setup process creates the following database tables:

- `admin_users`: Stores admin user accounts
- `admin_sessions`: Manages authentication sessions
- `dashboard_notifications`: Stores system notifications
- `dashboard_widgets`: Configures dashboard widgets
- `admin_permissions`: Implements role-based access control

## Troubleshooting

If you encounter any issues during setup:

1. Check that the `ADMIN_SETUP_TOKEN` environment variable is set correctly
2. Verify that the database connection is working
3. Check the application logs for detailed error messages
4. Ensure the database user has sufficient privileges to create tables
