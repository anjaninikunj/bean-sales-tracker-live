
import { spawn } from 'child_process';
import path from 'path';

console.log('🚀 Starting BeanTracker Pro (Combined Mode)...');

// 1. Start Backend
const backend = spawn('node', ['server.js'], { stdio: 'inherit', shell: true });
console.log('✅ Backend requested...');

// 2. Start Frontend
const frontend = spawn('npm', ['run', 'dev'], { stdio: 'inherit', shell: true });
console.log('✅ Frontend requested...');

process.on('SIGINT', () => {
    backend.kill();
    frontend.kill();
    process.exit();
});
