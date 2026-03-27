const axios = require('axios');
const crypto = require('crypto');

async function testUnmappedLogin() {
    try {
        // Register a totally random unmapped user
        const randStr = crypto.randomBytes(4).toString('hex');
        const mockEmail = \`test_\${randStr}@example.com\`;
        const mockVoterId = \`UNMAPPED_\${randStr}\`;

        console.log(\`Registering unmapped user: \${mockVoterId}\`);
        await axios.post('http://localhost:5001/api/auth/voter/signup', {
            name: 'Random Unmapped',
            voterId: mockVoterId,
            email: mockEmail,
            password: 'password123'
        });

        // Now login
        console.log('Logging in directly...');
        const loginRes = await axios.post('http://localhost:5001/api/auth/voter/login', {
            voterId: mockVoterId,
            password: 'password123'
        });

        console.log('Login Payload Received:');
        console.log(JSON.stringify(loginRes.data, null, 2));

    } catch (e) {
        console.log('Error:', e.response ? e.response.data : e.message);
    }
}

testUnmappedLogin();
