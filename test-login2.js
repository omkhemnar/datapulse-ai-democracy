const axios = require("axios");

async function testUnmappedLogin() {
    try {
        const mockEmail = "test_12345@example.com";
        const mockVoterId = "UNMAPPED_12345";

        console.log("Registering unmapped user: " + mockVoterId);
        try {
            await axios.post("http://localhost:5001/api/auth/voter/signup", {
                name: "Random Unmapped",
                voterId: mockVoterId,
                email: mockEmail,
                password: "password123"
            });
        } catch (e) {
            console.log("User might already exist, proceeding to login...");
        }

        console.log("Logging in directly...");
        const loginRes = await axios.post("http://localhost:5001/api/auth/voter/login", {
            voterId: mockVoterId,
            password: "password123"
        });

        console.log("Login Payload Received:");
        console.log(JSON.stringify(loginRes.data, null, 2));

    } catch (e) {
        console.log("Error:", e.response ? e.response.data : e.message);
    }
}

testUnmappedLogin();
