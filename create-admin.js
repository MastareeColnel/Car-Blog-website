
// Load password hashing and database access
const bcrypt = require('bcrypt');
const pool = require('./config/db');
const readline = require('readline');

// Ask for the admin username
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askUsername() {
    return new Promise((resolve) => {
        rl.question('Admin username: ', resolve);
    });
}

// Read the password without displaying its characters
function askPassword() {
    return new Promise((resolve, reject) => {
        const stdin = process.stdin;

        if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
            reject(new Error('Run this script in an interactive terminal.'));
            return;
        }

        process.stdout.write('Admin password: ');
        let password = '';

        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding('utf8');

        function onData(char) {
            if (char === '\u0003') {
                stdin.setRawMode(false);
                stdin.pause();
                stdin.removeListener('data', onData);
                reject(new Error('Password entry cancelled.'));
                return;
            }

            if (char === '\r' || char === '\n') {
                stdin.setRawMode(false);
                stdin.pause();
                stdin.removeListener('data', onData);
                process.stdout.write('\n');
                resolve(password);
                return;
            }

            if (char === '\u007f' || char === '\b') {
                password = password.slice(0, -1);
                return;
            }

            password += char;
        }

        stdin.on('data', onData);
    });
}

// Hash the password and create the admin account
async function createAdmin() {
    try {
        const username = (await askUsername()).trim();
        rl.close();

        if (!username) {
            throw new Error('Username cannot be empty.');
        }

        const password = await askPassword();

        if (password.length < 12) {
            throw new Error('Use a password of at least 12 characters.');
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await pool.query(
            `INSERT INTO users (username, password_hash)
             VALUES ($1, $2)`,
            [username, passwordHash]
        );

        console.log('Admin account created successfully.');
    } catch (error) {
        console.error('Admin setup failed:', error.message);
        process.exitCode = 1;
    } finally {
        rl.close();
        await pool.end();
    }
}

// Run the setup
createAdmin();
