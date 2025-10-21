const express = require('express');
const next = require('next')
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = app.getRequestHandler();

const server = express();
    
    // Serve the main page
 server.get('/', (req, res) => {
    return app.render(req, res, '/terminations/index', req.query);
});
    
    // Handle other routes
server.get('*', (req, res) => {
       return handle(req, res);
});

// Middleware to parse JSON request bodies
server.use(bodyParser.json());

// Database connection pool
const pool = new Pool({
    user: 'your_db_user',
    host: 'your_db_host',
    database: 'your_db_name',
    password: 'your_db_password',
    port: 5432, // Default PostgreSQL port
});

//all termination records
server.get('/terminations', async (req, res) => {
    try {
        const query = 'SELECT * FROM termination;';
        const result = await pool.query(query);

        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error('Error fetching termination records:', error);
        res.status(500).json({ error: '' });
    }
});

// Endpoint to handle POST requests and save data to the termination table
server.post('/terminations', async (req, res) => {
    const {
        id,
        employeeId,
        employeeName,
        employeeAvatar,
        department,
        position,
        terminationType,
        reason,
        noticeDate,
        terminationDate,
        status,
        initiatedBy,
        initiatedById,
        approvedBy,
        approvedById,
        approvalDate,
        exitInterviewDate,
        exitInterviewConductedBy,
        exitInterviewConductedById,
        documents
    } = req.body;

    if (
        !id || !employeeId || !employeeName || !employeeAvatar || !department || !position ||
        !terminationType || !reason || !noticeDate || !terminationDate || !status ||
        !initiatedBy || !initiatedById || !approvedBy || !approvedById || !approvalDate ||
        !exitInterviewDate || !exitInterviewConductedBy || !exitInterviewConductedById || !documents
    ) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const query = `
            INSERT INTO termination (
                id, employee_id, employee_name, employee_avatar, department, position, 
                termination_type, reason, notice_date, termination_date, status, 
                initiated_by, initiated_by_id, approved_by, approved_by_id, approval_date, 
                exit_interview_date, exit_interview_conducted_by, exit_interview_conducted_by_id, documents
            ) VALUES (
                $1, $2, $3, $4, $5, $6, 
                $7, $8, $9, $10, $11, 
                $12, $13, $14, $15, $16, 
                $17, $18, $19, $20
            ) RETURNING *;
        `;
        const values = [
            id, employeeId, employeeName, employeeAvatar, department, position, 
            terminationType, reason, noticeDate, terminationDate, status, 
            initiatedBy, initiatedById, approvedBy, approvedById, approvalDate, 
            exitInterviewDate, exitInterviewConductedBy, exitInterviewConductedById, documents
        ];
        const result = await pool.query(query, values);

        res.status(201).json({ message: 'Termination record created', data: result.rows[0] });
    } catch (error) {
        console.error('Error saving termination record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;

app.prepare().then(() => {

    // Start the server
    server.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${PORT}`);
    });
})