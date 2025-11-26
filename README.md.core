# LANL EDGE Core

A comprehensive bioinformatics platform for managing sequencing workflows and data analysis. EDGE (Enabling Distributed Genomics Analysis) provides a web-based interface for submitting, monitoring, and analyzing genomic sequencing projects using containerized workflows (Nextflow and Cromwell).

## Overview

EDGE Core is a full-stack application consisting of:

- **Web Server**: Node.js/Express backend with REST API and MongoDB database
- **Web Client**: React-based frontend built with Vite, CoreUI, and Material-UI
- **Workflow Engine**: Support for Nextflow and Cromwell workflow orchestration
- **Data Management**: Project and bulk submission management with file upload capabilities

## Features

- **Project Management**: Create and manage genomic analysis projects
- **Bulk Submissions**: Process multiple samples in batch operations
- **Workflow Orchestration**: Execute Nextflow and Cromwell-based workflows
- **File Management**: Upload and organize analysis data
- **Database Backups**: Automated database backup system
- **Email Notifications**: SMTP-based notifications for workflow status
- **Authentication**: JWT-based authentication and authorization
- **API Documentation**: Swagger UI for REST API exploration

## Tech Stack

### Backend
- **Runtime**: Node.js 20.19+
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: Passport.js with JWT
- **Validation**: Express-validator
- **Logging**: Winston with daily rotation
- **Task Scheduling**: node-cron
- **Email**: Nodemailer with Mailgun transport
- **Testing**: Jest with supertest

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Libraries**: CoreUI, Material-UI
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Styling**: SCSS with PostCSS
- **Tables**: Material React Table
- **Date Handling**: Moment.js

### Workflows
- **Nextflow**: Scalable workflow engine for genomics
- **Cromwell**: Workflow management system supporting WDL

## Project Structure

```
edge-core/
├── webapp/
│   ├── server/              # Express backend
│   │   ├── config.js        # Configuration
│   │   ├── server.js        # Entry point
│   │   ├── cronServer.js    # Scheduled tasks
│   │   ├── indexRouter.js   # API routes
│   │   ├── edge-api/        # API controllers
│   │   ├── crons/           # Scheduled job definitions
│   │   ├── workflow/        # Workflow utilities
│   │   ├── mailers/         # Email templates
│   │   ├── tests/           # Test suite
│   │   └── utils/           # Helper utilities
│   └── client/              # React frontend
│       ├── vite.config.mjs  # Vite configuration
│       ├── src/             # React components
│       └── public/          # Static assets
├── workflows/
│   ├── Nextflow/            # Nextflow pipeline definitions
│   ├── Cromwell/            # Cromwell workflow definitions
│   └── docs/                # Workflow documentation
├── io/
│   ├── projects/            # Project data
│   ├── bulkSubmissions/     # Bulk submission data
│   ├── nextflow/            # Nextflow execution data
│   ├── db/                  # Database backups
│   ├── upload/              # User uploads
│   └── sra/                 # SRA data
└── installation/
    ├── install.sh           # Installation script
    └── README.md            # Installation guide
```

## Installation

### Prerequisites

- **Node.js** 20.19 or higher
- **MongoDB** Community Edition or compatible
- **npm** (comes with Node.js)
- **pm2** (for production deployment)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/LANL-Bioinformatics/edge-core.git
   cd edge-core
   ```

2. **Run the installation script**
   ```bash
   cd installation
   ./install.sh
   ```

3. **Configure environment variables**
   
   Client configuration:
   ```bash
   cp webapp/client/.env.example webapp/client/.env
   ```
   Edit `webapp/client/.env` with your API endpoint and settings.

   Server configuration:
   ```bash
   cp webapp/server/.env.example webapp/server/.env
   ```
   Edit `webapp/server/.env` with your database, email, and other settings.

4. **Build the client**
   ```bash
   cd webapp/client
   npm run build
   cd ../..
   ```

5. **Start MongoDB**
   ```bash
   # Using Homebrew (macOS)
   brew services start mongodb-community
   
   # Using system service (Linux)
   sudo systemctl start mongod
   ```

6. **Start the application**
   ```bash
   pm2 start pm2.config.js
   pm2 save
   ```

## Development

### Start Development Servers

**Terminal 1 - Backend**
```bash
cd webapp/server
npm install
npm test     # Run tests
npm run lint # Check code quality
node server.js  # Start server
```

**Terminal 2 - Frontend**
```bash
cd webapp/client
npm install
npm start    # Development server (Vite)
npm run lint # Check code quality
```

The client will be available at `http://localhost:5173` by default.
The API server runs on the port specified in your `.env` file (typically 3000).

### Available Scripts

**Backend**
- `npm test` - Run test suite with Jest
- `npm run lint` - Check code style with ESLint
- `npm run lint:fix` - Auto-fix code style issues

**Frontend**
- `npm start` - Start development server
- `npm run build` - Create production build
- `npm run serve` - Preview production build
- `npm run lint` - Check code style

## Configuration

### Server Environment Variables

Key variables in `webapp/server/.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/edge-core

# Email/Notifications
MAILGUN_API_KEY=your_mailgun_key
MAILGUN_DOMAIN=your_mailgun_domain
EMAIL_FROM=noreply@example.com

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# File Upload
MAX_UPLOAD_SIZE=5000000000  # 5GB

# Workflow
WORKFLOW_ENGINE=nextflow  # or cromwell
```

### Client Environment Variables

Key variables in `webapp/client/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## API Documentation

Once the server is running, access the Swagger API documentation at:
```
http://localhost:3000/api-docs
```

## Database Management

### Backup Database
```bash
mongodump --out ./io/db/db-backup_$(date +%Y-%m-%d:%H:%M:%S)
```

### Restore Database
```bash
mongorestore ./io/db/db-backup_DATE
```

The application automatically creates periodic backups in the `io/db/` directory.

## Workflow Management

### Nextflow Workflows

Nextflow pipelines are located in `workflows/Nextflow/`:
- `sra2fastq/` - Convert SRA files to FASTQ format

Run a Nextflow workflow:
```bash
nextflow run workflows/Nextflow/sra2fastq/main.nf -profile standard
```

### Cromwell Workflows

Cromwell workflows are defined in `workflows/Cromwell/`:
- `sra2fastq/` - SRA to FASTQ conversion workflow

Run a Cromwell workflow:
```bash
java -jar cromwell.jar run workflows/Cromwell/sra2fastq/main.wdl
```

## Monitoring & Logging

### View Application Logs

```bash
# All processes
pm2 logs

# Specific process
pm2 logs edge-server

# Real-time monitoring
pm2 monit
```

### Log Files

Application logs are written to:
- `io/log/` - Daily rotated log files
- `io/projects/*/log.txt` - Per-project logs
- `io/bulkSubmissions/*/log.txt` - Per-submission logs

## Testing

### Run Server Tests
```bash
cd webapp/server
npm test
```

### Run with Coverage
```bash
npm test -- --coverage
```

## Email Configuration

The application uses Nodemailer with Mailgun for sending notifications. To configure:

1. Get your Mailgun API credentials from https://mailgun.com
2. Set `MAILGUN_API_KEY` and `MAILGUN_DOMAIN` in `webapp/server/.env`
3. Email templates are in `webapp/server/email_templates/`

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
brew services list  # macOS
sudo systemctl status mongod  # Linux

# Test connection
mongosh mongodb://localhost:27017/edge-core
```

### Port Already in Use
```bash
# Kill process using port 3000
lsof -ti :3000 | xargs kill -9

# Kill process using port 5173
lsof -ti :5173 | xargs kill -9
```

### Clear Cache & Rebuild
```bash
# Client
cd webapp/client
rm -rf node_modules dist
npm install
npm run build

# Server
cd webapp/server
rm -rf node_modules
npm install
```

## Production Deployment

### Using PM2

1. **Create ecosystem file** (already in `pm2.config.js`)

2. **Start with PM2**
   ```bash
   pm2 start pm2.config.js
   pm2 save
   pm2 startup  # Enable auto-start on reboot
   ```

3. **Monitor**
   ```bash
   pm2 logs
   pm2 monit
   ```

### Using Docker (Optional)

Build and run containers:
```bash
docker build -t edge-core .
docker run -d -p 3000:3000 -p 5173:5173 edge-core
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- Code follows the ESLint configuration
- Tests pass and maintain coverage
- Commits are properly formatted

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or contributions, please visit:
- GitHub Issues: https://github.com/LANL-Bioinformatics/edge-core/issues
- LANL Bioinformatics: https://www.lanl.gov/

## Acknowledgments

EDGE Core is developed by the Bioinformatics team at Los Alamos National Laboratory (LANL).
