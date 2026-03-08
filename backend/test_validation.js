const API_URL = 'http://localhost:5000/api';

async function testValidation() {
    console.log('--- Testing Auth Validation ---');

    // Test Register
    const regRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: '',
            email: 'invalid-email',
            password: 'short',
            role: 'invalid'
        })
    });
    const regData = await regRes.json();
    console.log('Register Validation (Invalid Data):', regRes.status, regData.message);

    // Test Login
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'invalid-email',
            password: ''
        })
    });
    const loginData = await loginRes.json();
    console.log('Login Validation (Invalid Data):', loginRes.status, loginData.message);

    console.log('\n--- Testing Event Validation ---');
    const eventRes = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: '',
            description: '',
            location: '',
            date: '2020-01-01',
            capacity: 0
        })
    });
    const eventData = await eventRes.json();
    console.log('Event Validation (Invalid Data):', eventRes.status, eventData.message);
}

testValidation();
