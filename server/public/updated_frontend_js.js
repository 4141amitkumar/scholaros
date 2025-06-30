// Global state
let currentUser = null;
let authToken = null;
let currentQuestion = null;

const API_BASE = 'https://scholaros-4.onrender.com/api';

// API Utility
async function apiCall(endpoint, method = 'GET', data = null) {
    const config = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    if (authToken) config.headers['Authorization'] = `Bearer ${authToken}`;
    if (data) config.body = JSON.stringify(data);

    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'API failed');
    return json;
}

// Navigation toggle
function toggleMenu() {
    const nav = document.getElementById("navLinks");
    if (nav) nav.classList.toggle("active");
}

function startPreparing() {
    alert("Redirecting to preparation modules...");
}

// Load universities
async function loadUniversities() {
    try {
        const unis = await apiCall('/universities');
        const container = document.querySelector('.features');
        if (container) {
            container.innerHTML += `<h2>Top Universities</h2>`;
            unis.slice(0, 3).forEach(uni => {
                const div = document.createElement('div');
                div.className = 'feature-box';
                div.innerHTML = `
                    <h3>${uni.name}</h3>
                    <p><strong>Country:</strong> ${uni.country}</p>
                    <p><strong>Tuition:</strong> ${uni.tuitionFee}</p>
                    <p><strong>Scholarships:</strong> ${uni.scholarships.join(', ')}</p>
                `;
                container.appendChild(div);
            });
        }
    } catch (err) {
        console.error('University fetch failed:', err);
    }
}

// Load 1 question
async function loadSampleQuestion() {
    try {
        const questions = await apiCall('/questions/GRE/Verbal?limit=1');
        const q = questions[0];
        const section = document.querySelector('.hero');
        if (q && section) {
            const div = document.createElement('div');
            div.className = 'question';
            div.innerHTML = `
                <p>${q.question}</p>
                ${q.options.map((opt, i) => `
                    <div class="option" onclick="selectOption(this, ${i === q.correctAnswer}, '${q._id}', ${i})">
                        ${String.fromCharCode(65 + i)}) ${opt}
                    </div>`).join('')}
                <button onclick="submitAnswer()">Submit</button>
                <div id="resultMessage"></div>
            `;
            section.appendChild(div);
        }
    } catch (err) {
        console.error('Question load failed:', err);
    }
}

function selectOption(elem, correct, id, index) {
    document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
    elem.classList.add('selected');
    currentQuestion = { element: elem, correct, id, index };
}

async function submitAnswer() {
    if (!currentQuestion) return alert("Select an option first");

    try {
        const res = await apiCall('/check-answer', 'POST', {
            questionId: currentQuestion.id,
            userAnswer: currentQuestion.index,
        });
        const resultMsg = document.getElementById('resultMessage');
        resultMsg.innerHTML = res.correct ? "✅ Correct!" : "❌ Incorrect!<br>Explanation: " + res.explanation;
    } catch (err) {
        alert("Submission failed");
    }
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    loadUniversities();
    loadSampleQuestion();
});
