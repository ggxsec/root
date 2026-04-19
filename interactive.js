document.addEventListener('DOMContentLoaded', () => {
    const writeupContent = document.getElementById('writeup-content');
    const modeToggle = document.getElementById('mode-toggle');
    const viewerTitle = document.getElementById('viewer-title');

    const urlParams = new URLSearchParams(window.location.search);
    const writeupId = urlParams.get('id');
    const mode = urlParams.get('mode') || 'step';

    let currentMode = mode;
    let currentStep = 0;
    let activeWriteup = null;

    const writeups = {


        'otp-brute-force': {
            title: 'OTP Brute Force Leading to Account Takeover (<span class="severity-critical">Critical Severity</span> | <span class="difficulty-easy">Difficulty: Easy</span>)',
            teaser: 'Authentication bypass and full account takeover via automated OTP guessing due to missing rate limits.',
            severity: 'Critical',
            difficulty: 'Easy',
            steps: [
                {
                    type: 'text',
                    content: `<h3>Scenario</h3><p>This assessment focuses on the security of an OTP-based authentication mechanism used for email verification and login in a web application.</p><p>At a basic level, the system used a 6-digit OTP code sent to the user’s email — a common and generally secure authentication method when implemented correctly.</p><p>The same OTP mechanism was used in two different flows:</p><ul><li>Email verification during registration</li><li>Login authentication for existing users</li></ul><p>The OTP remained valid for approximately 2 minutes, which initially appeared reasonable.</p><p>At first glance, everything seemed properly implemented. However, instead of assuming the system was secure, I analyzed it from an attacker’s perspective: </br><strong>What if someone tries to brute force this OTP? Is there any protection preventing repeated attempts?</strong></p>`
                },
                {
                    type: 'interactive',
                    id: 1,
                    question: 'What is the most important security control for OTP-based authentication?',
                    options: [
                        { text: 'A) OTP length', correct: false, feedback: '❌ Not quite. While length matters, it doesn\'t prevent automated attacks.' },
                        { text: 'B) Expiration time', correct: false, feedback: '❌ Not quite. A short expiration window can still be exploited by high-speed tools.' },
                        { text: 'C) Rate limiting and attempt restrictions', correct: true, feedback: '✅ Exactly — without rate limiting, even a short-lived OTP can be brute-forced.' }
                    ]
                },
                {
                    type: 'text',
                    content: `<h3>Initial Testing</h3><p>To analyze the authentication flow, I intercepted the OTP verification request using Burp Suite.</p><p>The request contained target email address and 6-digit OTP value.</p><p>I first performed manual testing by submitting multiple incorrect OTP values. Surprisingly, there were:</p><ul><li>No delays</li><li>No account lockouts</li><li>No visible restrictions</li><li>No error escalation mechanism</li></ul><p>This suggested a lack of brute force protection.</p>`
                },
                {
                    type: 'interactive',
                    id: 2,
                    question: 'What is the next logical step after confirming no protection exists?',
                    options: [
                        { text: 'A) Stop testing', correct: false, feedback: '❌ Not quite. The lack of protection is a sign to investigate further.' },
                        { text: 'B) Attempt automated brute force testing', correct: true, feedback: '✅ Correct — automation is required to validate brute force feasibility and impact.' },
                        { text: 'C) Change target email', correct: false, feedback: '❌ Not quite. Testing on the current target is enough to prove the flaw.' }
                    ]
                },
                {
                    type: 'text',
                    content: `<h3>Exploitation</h3><p>To further test the system, I used Burp Suite Intruder for automated OTP guessing.</p><h4>Key observations:</h4><ul><li>OTP range: 000000 – 999999</li><li>No rate limiting detected</li><li>No CAPTCHA or bot mitigation</li><li>No account lockout after failed attempts</li></ul><p>This resulted in a key security issue: </br><strong>A predictable 1,000,000-value space with no restrictions makes brute force feasible within the OTP validity window.</strong></p>
                    <img src="assets/1.png" class="writeup-image" alt="">
                    <img src="assets/2.png" class="writeup-image" alt="">`
                },
                {
                    type: 'interactive',
                    id: 3,
                    question: 'Why is a 6-digit OTP vulnerable without protections?',
                    options: [
                        { text: 'A) It is too long to brute force', correct: false, feedback: '❌ Incorrect. 6 digits is actually quite short for automated guessing.' },
                        { text: 'B) The keyspace is small and unprotected against automation', correct: true, feedback: '✅ Correct — small search space (1 million) + no protection = high brute force vulnerability.' },
                        { text: 'C) OTP cannot be reused', correct: false, feedback: '❌ Not quite. The issue is not reuse, but weak protection over a small keyspace.' }
                    ]
                },
                {
                    type: 'text',
                    content: `<h3>Result</h3><p>After automated requests, a valid OTP was successfully identified. Once submitted:</p><ul><li>The server returned a valid authentication token (JWT)</li><li>The user session was created</li><li>Full access to the account was granted</li></ul><p>This occurred without access to the victim’s email, prior authentication, or any user interaction.</p>`
                },
                {
                    type: 'interactive',
                    id: 4,
                    question: 'What is the final impact of this vulnerability?',
                    options: [
                        { text: 'A) Information disclosure', correct: false, feedback: '❌ Not quite. This goes beyond simple disclosure.' },
                        { text: 'B) Account Takeover (ATO) via authentication bypass', correct: true, feedback: '✅ Correct — this leads directly to full account compromise.' },
                        { text: 'C) Session fixation', correct: false, feedback: '❌ Not quite. This is a full authentication bypass scenario.' }
                    ]
                },
                {
                    type: 'text',
                    content: `<h3>Impact</h3><p>This vulnerability enables full account compromise, unauthorized actions on behalf of users, and access to sensitive user data. It can be used for large-scale automated attacks against multiple accounts, causing significant financial and reputational damage.</p><h3>Severity Assessment (CVSS v3.1)</h3><ul><li>Attack Vector (AV): Network</li><li>Attack Complexity (AC): Low</li><li>Privileges Required (PR): None</li><li>User Interaction (UI): None</li><li>Scope (S): Unchanged</li><li>Confidentiality (C): High</li><li>Integrity (I): High</li><li>Availability (A): None</li></ul><p><strong>Estimated Score: <span class="severity-critical">9.1 (Critical)</span></strong></p><h3>Root Cause</h3><p>The vulnerability exists due to multiple missing security controls: no rate limiting, no attempt restrictions, and no bot protection. The endpoint directly issues a JWT upon success, effectively converting OTP verification into full authentication bypass.</p>`
                }
            ]
        },
        'email-parameter-pollution': {
            title: 'Email Parameter Pollution Leading to API Key Misdelivery (<span class="severity-informative">Informative</span> | <span class="difficulty-easy">Difficulty: Easy</span>)',
            teaser: 'Sensitive API key misdelivery via duplicate parameter submission in unauthenticated requests.',
            severity: 'Informative',
            difficulty: 'Easy',
            steps: [
                {
                    type: 'text',
                    content: `<h3>Scenario</h3><p>While reviewing a publicly accessible feature in a web application, I noticed a functionality that allowed users to activate an API key by simply submitting an email address — without requiring authentication.</p><p>Once an email was submitted, the system would generate and send an API key directly to that address.</p><p>This raised an interesting question: <strong>What happens if multiple email values are supplied in the same request?</strong></p>`
                },
                {
                    type: 'interactive',
                    id: 1,
                    question: 'What type of vulnerability involves manipulating input parameters by sending multiple values for the same field?',
                    options: [
                        { text: 'A) SQL Injection', correct: false, feedback: '❌ Not quite. This issue is related to how input parameters are parsed.' },
                        { text: 'B) Parameter Pollution', correct: true, feedback: '✅ Correct — parameter pollution occurs when an application fails to properly handle duplicate parameters.' },
                        { text: 'C) CSRF', correct: false, feedback: '❌ Not quite. This issue is related to how input parameters are parsed.' }
                    ]
                },
                {
                    type: 'text',
                    content: `<h3>Initial Testing</h3><p>To test this behavior, I intercepted the API activation request using Burp Suite.</p><p>The original request contained a single email parameter:</p><div class="terminal-code">email=victim@example.com</div><p>I modified the request by adding a second email parameter with my own address.</p>`
                },
                {
                    type: 'interactive',
                    id: 2,
                    question: 'What is the goal of adding duplicate parameters in this scenario?',
                    options: [
                        { text: 'A) Crash the server', correct: false, feedback: '❌ Not quite. The goal is to influence backend logic.' },
                        { text: 'B) Manipulate how the backend processes input values', correct: true, feedback: '✅ Exactly — different backends handle duplicate parameters differently, which can lead to unexpected behavior.' },
                        { text: 'C) Increase response size', correct: false, feedback: '❌ Not quite. The goal is to influence backend logic.' }
                    ]
                },
                {
                    type: 'text',
                    content: `<h3>Modified Request (Sanitized Example)</h3><p>Below is a simplified and sanitized version of the request:</p>
                    <div class="terminal-code">
POST /api/v1/register HTTP/1.1</br>
Host: api.example.com</br>
Content-Type: multipart/form-data; boundary=----boundary</br>
</br>
------boundary</br>
Content-Disposition: form-data; name="email"</br>
</br>
victim@example.com</br>
------boundary</br>
Content-Disposition: form-data; name="email"</br>
</br>
attacker@example.com</br>
------boundary--
                    </div>
                    <h4>Explanation</h4>
                    <ul>
                        <li>Two email parameters are sent in the same request</li>
                        <li>One belongs to the victim</li>
                        <li>One belongs to the attacker</li>
                        <li>The backend does not properly validate or restrict duplicate parameters</li>
                    </ul>`
                },
                {
                    type: 'text',
                    content: `<h3>Observation</h3><p>After sending the modified request, the application processed both email values.</p><p>As a result:</p><ul><li>The API key was generated successfully</li><li>The key was delivered to both email addresses</li><li>The attacker received the same API key intended for the victim</li></ul>`
                },
                {
                    type: 'interactive',
                    id: 3,
                    question: 'What is the core issue in this behavior?',
                    options: [
                        { text: 'A) Missing authentication', correct: false, feedback: '❌ Not quite. The issue is input parsing logic.' },
                        { text: 'B) Improper handling of duplicate parameters', correct: true, feedback: '✅ Correct — the backend fails to properly handle multiple inputs for a single parameter.' },
                        { text: 'C) Weak encryption', correct: false, feedback: '❌ Not quite. The issue is input parsing logic.' }
                    ]
                },
                {
                    type: 'text',
                    content: `<h3>Impact</h3><p>In this specific case, the impact was limited:</p><ul><li>No sensitive data could be accessed via the API</li><li>The key itself did not expose critical functionality</li></ul><p>However, a potential abuse scenario exists:</p><ul><li>An attacker could consume the API rate limit of another user</li><li>This could lead to denial of service for legitimate users</li><li>Abuse could be scaled using automated requests</li></ul>`
                },
                {
                    type: 'interactive',
                    id: 4,
                    question: 'What is the most realistic impact here?',
                    options: [
                        { text: 'A) Full account takeover', correct: false, feedback: '❌ Not quite. This is not a high-impact exploit.' },
                        { text: 'B) Rate limit abuse / resource consumption', correct: true, feedback: '✅ Exactly — the impact is limited but still relevant.' },
                        { text: 'C) Remote code execution', correct: false, feedback: '❌ Not quite. This is not a high-impact exploit.' }
                    ]
                },
                {
                    type: 'text',
                    content: `<h3>Severity Assessment</h3><p>Based on the FIRST CVSS v3.1 standard:</p><ul><li>Attack Vector (AV): Network</li><li>Attack Complexity (AC): Low</li><li>Privileges Required (PR): None</li><li>User Interaction (UI): None</li><li>Scope (S): Unchanged</li><li>Confidentiality (C): None</li><li>Integrity (I): None</li><li>Availability (A): Low</li></ul><p><strong>Estimated CVSS Score: <span class="severity-informative">2.6 – 3.7 (Informative / Low)</span></strong></p><h3>Root Cause</h3><p>The vulnerability exists due to improper input handling: the backend accepts multiple values for the same parameter, no validation or normalization is applied, and the system processes all values instead of enforcing a single input. Email ownership is not verified before sending sensitive data.</p>`
                }
            ]
        },
        'race-condition-withdrawal': {
            title: 'Race Condition in Withdrawal Leading to Balance Manipulation (<span class="severity-critical">Critical Severity</span> | <span class="difficulty-medium">Difficulty: Medium</span>)',
            teaser: 'Financial balance manipulation via concurrent withdrawal requests using Turbo Intruder.',
            severity: 'Critical',
            difficulty: 'Medium',
            steps: [
                {
                    type: 'text',
                    content: `<h3>Scenario</h3><p>During a security assessment of a financial feature within a web application, I focused on how the system processes cryptocurrency withdrawal requests under different conditions.</p><p>The functionality required users to submit a wallet address and a withdrawal amount. The backend implemented a validation check to ensure that users could not request an amount exceeding their current balance.</p><p>At first glance, this seemed properly secured. However, an important question came to mind: <strong>What happens if multiple withdrawal requests are sent at the exact same time?</strong></p>`
                },
                {
                    type: 'interactive',
                    id: 1,
                    question: 'What type of vulnerability should be tested when multiple simultaneous requests may affect shared resources (e.g., balance)?',
                    options: [
                        { text: 'A) SQL Injection', correct: false, feedback: '❌ Not quite. This scenario involves concurrent execution, not input injection.' },
                        { text: 'B) Race Condition', correct: true, feedback: '✅ Exactly — race conditions occur when multiple requests are processed concurrently without proper locking or synchronization.' },
                        { text: 'C) Cross-Site Scripting', correct: false, feedback: '❌ Not quite. This scenario involves concurrent execution, not input injection.' }
                    ]
                },
                {
                    type: 'text',
                    content: `<h3>Initial Testing Approach</h3><p>To test this behavior, I intercepted a valid withdrawal request using Burp Suite. Instead of sending it normally, I forwarded the request to <strong>Turbo Intruder</strong>, a powerful extension for high-speed request manipulation.</p><p>To avoid server-side request deduplication or caching mechanisms, I added a custom header: <code>X-Test: %s</code>. This value was dynamically modified for each request to ensure that every request was treated as unique.</p>`
                },
                {
                    type: 'interactive',
                    id: 2,
                    question: 'Why is it important to slightly modify each request during high-speed attacks?',
                    options: [
                        { text: 'A) To increase server load', correct: false, feedback: '❌ Not quite. The goal is to avoid server-side filtering, not formatting.' },
                        { text: 'B) To bypass duplicate request detection mechanisms', correct: true, feedback: '✅ Correct — many systems block identical repeated requests, so variation helps bypass such protections.' },
                        { text: 'C) To change the response format', correct: false, feedback: '❌ Not quite. The goal is to avoid server-side filtering, not formatting.' }
                    ]
                },
                {
                    type: 'text',
                    content: `<h3>Exploitation Using Turbo Intruder</h3><p>I used the following script inside Turbo Intruder to send multiple concurrent requests:</p>
                    <div class="terminal-code">
<span class="keyword">def</span> <span class="function">queueRequests</span>(target, wordlists):</br>
    <span class="comment"># Configure the request engine for high concurrency</span></br>
    &nbsp;&nbsp;&nbsp;&nbsp;engine = <span class="function">RequestEngine</span>(endpoint=target.endpoint,</br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;concurrentConnections=<span class="number">10</span>,</br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;requestsPerConnection=<span class="number">200</span>,</br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;pipeline=<span class="keyword">False</span></br>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</br>
</br>
    <span class="comment"># Queue multiple requests with slight variations</span></br>
    &nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">for</span> i <span class="keyword">in</span> <span class="function">range</span>(<span class="number">10</span>):</br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;engine.<span class="function">queue</span>(target.req, target.baseInput, gate=<span class="string">'race1'</span>)</br>
</br>
    <span class="comment"># Send all queued requests at the exact same time</span></br>
    &nbsp;&nbsp;&nbsp;&nbsp;engine.<span class="function">openGate</span>(<span class="string">'race1'</span>)</br>
    &nbsp;&nbsp;&nbsp;&nbsp;engine.<span class="function">complete</span>(timeout=<span class="number">60</span>)</br>
</br>
<span class="keyword">def</span> <span class="function">handleResponse</span>(req, interesting):</br>
    &nbsp;&nbsp;&nbsp;&nbsp;table.<span class="function">add</span>(req)</br>
                    </div>
                    <h4> Short Explanation of the Script</h4>
                    <ul>
                        <li><code>RequestEngine(...)</code> → configures parallelism & speed</li>
                        <li><code>engine.queue(...)</code> → prepares requests but holds them</li>
                        <li><code>gate='race1'</code> → groups requests to be released simultaneously</li>
                        <li><code>engine.openGate(...)</code> → releases all requests at once</li>
                    </ul>`
                },
                {
                    type: 'interactive',
                    id: 3,
                    question: 'What is the purpose of openGate() in this context?',
                    options: [
                        { text: 'A) To encrypt the requests', correct: false, feedback: '❌ Not quite. The goal is synchronized execution.' },
                        { text: 'B) To delay requests randomly', correct: false, feedback: '❌ Not quite. The goal is synchronized execution.' },
                        { text: 'C) To release all queued requests simultaneously', correct: true, feedback: '✅ Exactly — this is what triggers the race condition.' }
                    ]
                },
                {
                    type: 'text',
                    content: `<h3>Observation</h3><p>Due to weak rate limiting and lack of proper synchronization on the backend, multiple withdrawal requests were processed simultaneously.</p><p>This resulted in several withdrawal requests being accepted at the same time, each passing the balance check independently. In other words: <strong>The same balance was reused across multiple concurrent transactions.</strong></p>`
                },
                {
                    type: 'interactive',
                    id: 4,
                    question: 'What is the core technical issue behind this vulnerability?',
                    options: [
                        { text: 'A) Missing input validation', correct: false, feedback: '❌ Not quite. The issue lies in concurrency handling, not validation.' },
                        { text: 'B) Lack of atomic operations / locking mechanism', correct: true, feedback: '✅ Correct — without atomic operations, concurrent requests can bypass logic checks.' },
                        { text: 'C) Incorrect HTTP method usage', correct: false, feedback: '❌ Not quite. The issue lies in concurrency handling, not validation.' }
                    ]
                },
                {
                    type: 'text',
                    content: `<h3>Impact</h3><p>This vulnerability has severe consequences: financial loss for the platform, balance duplication, and loss of trust. An attacker could effectively multi-withdraw using the same balance, looping the process by canceling and restoring funds if applicable.</p>`
                },
                {
                    type: 'text',
                    content: `<h3>Severity Assessment</h3><p>Based on the FIRST CVSS v3.1 standard:</p><ul><li>Attack Vector (AV): Network</li><li>Attack Complexity (AC): Low</li><li>Privileges Required (PR): Low</li><li>User Interaction (UI): None</li><li>Scope (S): Changed</li><li>Confidentiality (C): None</li><li>Integrity (I): High</li><li>Availability (A): Low</li></ul><p><strong>Estimated CVSS Score: <span class="severity-critical">8.8 – 9.4 (Critical)</span></strong></p><h3>Root Cause</h3><p>The vulnerability exists due to improper handling of concurrent operations: no locking mechanism on user balance, non-atomic checks, and trusting each request in isolation without considering concurrent execution.</p>`
                }
            ]
        },
        'stored-xss-game-rules': {
            title: 'Stored XSS via Filter Bypass in Game Rules Section (<span class="severity-high">High Severity</span> | <span class="difficulty-easy">Difficulty: Easy</span>)',
            teaser: 'Stored XSS on a gaming platform by bypassing weak input filters using malformed HTML structures.',
            severity: 'High',
            difficulty: 'Easy',
            steps: [
                {
                    type: 'text',
                    content: `<h3>Scenario</h3><p>During a functional review of a competitive gaming platform, I focused on how user-created content is handled across different user interactions.</p><p>Players were able to create 1v1 matches and include a custom “rules” section, which would later be displayed to anyone browsing or joining the match.</p><p>Instead of immediately testing obvious payloads, I became interested in how the application attempts to filter potentially dangerous input.</p><p>This led me to explore whether the filtering mechanism could be bypassed using malformed or broken HTML structures.</p>`
                },
                {
                    type: 'interactive',
                    id: 1,
                    question: 'What is the most effective way to test weak input filters?',
                    options: [
                        { text: 'A) Use only basic payloads like &lt;script&gt;alert(1)&lt;/script&gt;', correct: false, feedback: '❌ Not quite. Simple payloads are often blocked.' },
                        { text: 'B) Try malformed or obfuscated payloads to bypass filters', correct: true, feedback: '✅ Correct — real-world filters often fail against broken or nested payloads.' },
                        { text: 'C) Increase request size', correct: false, feedback: '❌ Not quite. Simple payloads are often blocked.' }
                    ]
                },
                {
                    type: 'text',
                    content: `<h3>Initial Testing</h3><p>I created a new match and inserted a crafted payload into the rules/description field.</p><p>Instead of using a standard <code>&lt;script&gt;</code> tag, I used a fragmented payload designed to bypass naive filtering mechanisms.</p><h4>Payload Used</h4><div class="terminal-code">&lt;scr&lt;script&gt;ipt&gt;alert(1)&lt;/scr&lt;/script&gt;ipt&gt;</div>`
                },
                {
                    type: 'interactive',
                    id: 2,
                    question: 'What is the purpose of breaking the &lt;script&gt; tag in this payload?',
                    options: [
                        { text: 'A) To reduce payload size', correct: false, feedback: '❌ Not quite. This is about filter evasion.' },
                        { text: 'B) To confuse or bypass pattern-based filters', correct: true, feedback: '✅ Exactly — filters looking for exact &lt;script&gt; patterns can be bypassed this way.' },
                        { text: 'C) To improve performance', correct: false, feedback: '❌ Not quite. This is about filter evasion.' }
                    ]
                },
                {
                    type: 'text',
                    content: `<h3>Observation</h3><p>After saving the match and viewing it from another account:</p><ul><li>The payload was rendered in the rules section</li><li>The browser reconstructed the malformed HTML</li><li>JavaScript executed successfully</li></ul><p>This confirmed that the filtering mechanism was insufficient and the vulnerability was stored, affecting all users who viewed the match.</p>`
                },
                {
                    type: 'interactive',
                    id: 3,
                    question: 'Why does the browser execute this malformed payload?',
                    options: [
                        { text: 'A) Because the server forces execution', correct: false, feedback: '❌ Not quite. The browser’s parser is the key factor.' },
                        { text: 'B) Because browsers try to correct broken HTML during parsing', correct: true, feedback: '✅ Correct — browsers are tolerant and reconstruct invalid HTML into executable form.' },
                        { text: 'C) Because JavaScript is always allowed', correct: false, feedback: '❌ Not quite. The browser’s parser is the key factor.' }
                    ]
                },
                {
                    type: 'text',
                    content: `<h3>Impact</h3><p>This vulnerability enables multiple attack scenarios:</p><ul><li>Executing arbitrary JavaScript in victims’ browsers</li><li>Stealing session tokens (if not protected)</li><li>Performing actions on behalf of users</li><li>Injecting phishing content inside platform</li><li>Spreading malicious payloads to other players</li></ul><p>In this context: <strong>Any player viewing a match could be silently targeted.</strong></p>`
                },
                {
                    type: 'interactive',
                    id: 4,
                    question: 'What makes this payload particularly dangerous?',
                    options: [
                        { text: 'A) It is long', correct: false, feedback: '❌ Not quite. Reliability is key.' },
                        { text: 'B) It bypasses weak filters and still executes', correct: true, feedback: '✅ Exactly — bypassing filters makes it more reliable in real-world scenarios.' },
                        { text: 'C) It only works on one browser', correct: false, feedback: '❌ Not quite. Reliability is key.' }
                    ]
                },
                {
                    type: 'text',
                    content: `<h3>Why This Payload Works (Bypass Analysis)</h3>
                    <div class="terminal-code">&lt;scr&lt;script&gt;ipt&gt;alert(1)&lt;/scr&lt;/script&gt;ipt&gt;</div>
                    <h4>Technical Breakdown</h4>
                    <ul>
                        <li>The word <strong>script</strong> is intentionally split</li>
                        <li>Filter attempts to detect exact patterns like <code>&lt;script&gt;</code> but sees broken parts: <code>&lt;scr</code>, <code>&lt;script&gt;</code>, <code>ipt&gt;</code></li>
                    </ul>
                    <h4>What Happens in Browser</h4>
                    <ul>
                        <li>Browser parses and reconstructs valid DOM</li>
                        <li>Merges broken tags into executable structure</li>
                        <li>Executes <code>alert(1)</code> successfully</li>
                    </ul>
                    <h4>Root Bypass Reason</h4>
                    <ul>
                        <li>No proper HTML sanitization</li>
                        <li>No normalization before filtering</li>
                        <li>Reliance on blacklist-based filtering</li>
                    </ul>`
                },
                {
                    type: 'text',
                    content: `<h3>Severity Assessment</h3><p>Based on the FIRST CVSS v3.1 standard:</p><ul><li>Attack Vector (AV): Network</li><li>Attack Complexity (AC): Low</li><li>Privileges Required (PR): Low</li><li>User Interaction (UI): Required</li><li>Scope (S): Changed</li><li>Confidentiality (C): High</li><li>Integrity (I): High</li><li>Availability (A): None</li></ul><p><strong>Estimated CVSS Score: <span class="severity-high">7.2 – 8.0 (High)</span></strong></p><h3>Root Cause</h3><p>The vulnerability exists due to weak blacklist-based filtering, lack of proper HTML sanitization, failure to consider browser parsing behavior, and missing output encoding.</p>`
                }
            ]
        },


        'Write-up is cooking... stay tuned... ': {
            title: 'Write-up is cooking... stay tuned...',
            teaser: '',
            severity: 'Hidden ',
            difficulty: 'Hidden for now',
            steps: [
            ]
        },
        'Something interesting is coming here... ': {
            title: 'Something interesting is coming here... ',
            teaser: '',
            severity: 'Classified',
            difficulty: 'Classified (yet)',
            steps: [

            ]
        },
        'Bypassing WAF ...': {
            title: 'Bypassing WAF ...',
            teaser: '',
            severity: 'Unknown',
            difficulty: 'Unknown (yet)',
            steps: [

            ]
        }
    };

    // --- Pagination and Gallery Logic ---
    const ITEMS_PER_PAGE = 3;
    const galleryContainer = document.getElementById('writeup-gallery');
    const paginationContainer = document.getElementById('pagination-controls');

    function renderGallery(pageIndex, skipScroll = false) {
        if (!galleryContainer) return;

        galleryContainer.classList.add('loading');

        setTimeout(() => {
            galleryContainer.innerHTML = '';
            const keys = Object.keys(writeups);
            const start = pageIndex * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE;
            const pageItems = keys.slice(start, end);

            pageItems.forEach(id => {
                const data = writeups[id];
                const item = document.createElement('div');
                item.className = 'writeup-item fade-in';
                item.innerHTML = `
                    <h3>${data.title.split(' (')[0]}</h3>
                    <p><span class="severity-${data.severity.toLowerCase()}">${data.severity} Severity</span> | <span class="difficulty-${data.difficulty.toLowerCase()}">Difficulty: ${data.difficulty}</span></p>
                    <p>${data.teaser}</p>
                    <div class="writeup-actions">
                        <a href="writeup.html?id=${id}&mode=full" class="btn-outline-terminal">Full Writeup</a>
                        <a href="writeup.html?id=${id}&mode=step" class="btn-dotted">EXECUTE:(Step-by-Step)</a>
                    </div>
                `;
                galleryContainer.appendChild(item);
            });

            galleryContainer.classList.remove('loading');
            if (!skipScroll) {
                document.getElementById('writeups')?.scrollIntoView({ behavior: 'smooth' });
            }
        }, 300);
    }

    function setupPagination() {
        if (!paginationContainer) return;

        const totalPages = Math.ceil(Object.keys(writeups).length / ITEMS_PER_PAGE);
        let currentPage = 0;

        function updateControls() {
            paginationContainer.innerHTML = '';

            // Previous Button
            const prev = document.createElement('button');
            prev.className = `page-btn ${currentPage === 0 ? 'disabled' : ''}`;
            prev.textContent = '< prev';
            prev.onclick = () => {
                if (currentPage > 0) {
                    currentPage--;
                    renderGallery(currentPage);
                    updateControls();
                }
            };
            paginationContainer.appendChild(prev);

            // Page Numbers
            for (let i = 0; i < totalPages; i++) {
                const btn = document.createElement('button');
                btn.className = `page-btn ${currentPage === i ? 'active' : ''}`;
                btn.textContent = i + 1;
                btn.onclick = () => {
                    currentPage = i;
                    renderGallery(currentPage);
                    updateControls();
                };
                paginationContainer.appendChild(btn);
            }

            // Next Button
            const next = document.createElement('button');
            next.className = `page-btn ${currentPage === totalPages - 1 ? 'disabled' : ''}`;
            next.textContent = 'next >';
            next.onclick = () => {
                if (currentPage < totalPages - 1) {
                    currentPage++;
                    renderGallery(currentPage);
                    updateControls();
                }
            };
            paginationContainer.appendChild(next);
        }

        updateControls();
    }

    // --- Viewer Logic ---
    async function typeWriter(element, html, speed = 5) {
        // ... (preserving existing typewriter logic)
        const div = document.createElement('div');
        div.innerHTML = html;
        element.innerHTML = '';

        async function reveal(node, parent) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                for (let i = 0; i < text.length; i++) {
                    parent.append(text[i]);
                    window.scrollTo(0, document.body.scrollHeight);
                    await new Promise(resolve => setTimeout(resolve, speed));
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const newNode = document.createElement(node.tagName);
                for (let attr of node.attributes) {
                    newNode.setAttribute(attr.name, attr.value);
                }
                parent.appendChild(newNode);
                for (let child of node.childNodes) {
                    await reveal(child, newNode);
                }
            }
        }
        for (let child of div.childNodes) {
            await reveal(child, element);
        }
    }

    async function renderStep(stepIndex) {
        if (!activeWriteup || stepIndex >= activeWriteup.steps.length) return;

        const step = activeWriteup.steps[stepIndex];
        const stepDiv = document.createElement('div');
        stepDiv.className = 'writeup-step';
        writeupContent.appendChild(stepDiv);

        if (step.type === 'text') {
            await typeWriter(stepDiv, step.content);
            currentStep++;
            renderStep(currentStep);
        } else if (step.type === 'interactive') {
            const stopDiv = document.createElement('div');
            stopDiv.className = 'interactive-stop fade-in';
            stopDiv.innerHTML = `
                <div class="question"><strong>Question:</strong> ${step.question}</div>
                <div class="options">
                    ${step.options.map((opt, i) => `<button class="opt-btn" data-idx="${i}">${opt.text}</button>`).join('')}
                </div>
                <div class="feedback hidden"></div>
                <button class="next-btn hidden">Continue Interaction >></button>
            `;
            stepDiv.appendChild(stopDiv);
            window.scrollTo(0, document.body.scrollHeight);

            const optButtons = stopDiv.querySelectorAll('.opt-btn');
            const feedbackDiv = stopDiv.querySelector('.feedback');
            const nextBtn = stopDiv.querySelector('.next-btn');

            optButtons.forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.idx);
                    const option = step.options[idx];
                    feedbackDiv.textContent = option.feedback;
                    feedbackDiv.className = `feedback animate-slide-in ${option.correct ? 'correct' : 'incorrect'}`;
                    feedbackDiv.classList.remove('hidden');
                    optButtons.forEach(b => b.disabled = true);
                    btn.classList.add(option.correct ? 'selected-correct' : 'selected-incorrect');

                    if (option.correct) {
                        nextBtn.classList.remove('hidden');
                        nextBtn.classList.add('fade-in');
                    } else {
                        setTimeout(() => {
                            optButtons.forEach(b => {
                                b.disabled = false;
                                b.classList.remove('selected-incorrect');
                            });
                            feedbackDiv.classList.add('hidden');
                        }, 2000);
                    }
                };
            });

            nextBtn.onclick = () => {
                nextBtn.classList.add('hidden');
                currentStep++;
                renderStep(currentStep);
            };
        }
    }

    function renderFull() {
        if (!activeWriteup) return;
        writeupContent.innerHTML = '';
        activeWriteup.steps.forEach(step => {
            if (step.type === 'text') {
                const div = document.createElement('div');
                div.className = 'writeup-step';
                div.innerHTML = step.content;
                writeupContent.appendChild(div);
            }
        });
    }

    // --- Bootstrapper ---
    if (galleryContainer) {
        renderGallery(0, true);
        setupPagination();
    } else if (writeupId && writeups[writeupId]) {
        activeWriteup = writeups[writeupId];
        viewerTitle.innerHTML = activeWriteup.title;
        currentMode = (mode === 'step' || mode === 'full') ? mode : 'step';
        if (modeToggle) modeToggle.textContent = currentMode === 'step' ? 'Switch to Full Read Mode' : 'Switch to Interactive Mode';

        if (currentMode === 'step') renderStep(0);
        else renderFull();

        if (modeToggle) {
            modeToggle.onclick = () => {
                const nextMode = currentMode === 'step' ? 'full' : 'step';
                const newParams = new URLSearchParams();
                newParams.set('id', writeupId);
                newParams.set('mode', nextMode);
                window.location.search = newParams.toString();
            };
        }
    } else if (writeupId) {
        // 404 state
        viewerTitle.textContent = '404 - Write-up Not Found';
        writeupContent.innerHTML = `<div class="writeup-step fade-in">
            <p>Access Denied: The requested technical write-up identifier is invalid or does not exist.</p>
            <a href="index.html" class="btn-outline-terminal">Return to Mission Control</a>
        </div>`;
        if (modeToggle) modeToggle.style.display = 'none';
    }
    // --- Scroll to Top Logic ---
    const scrollTopBtn = document.getElementById('scroll-top');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                scrollTopBtn.classList.add('show');
            } else {
                scrollTopBtn.classList.remove('show');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
