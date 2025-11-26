
        // Admin Password - Change this to your desired password
        const ADMIN_PASSWORD = "Darsti@0903";
        
        // Check if admin is logged in
        function isAdminLoggedIn() {
            return localStorage.getItem('adminLoggedIn') === 'true';
        }
        
        // Tab navigation
        function openTab(tabName) {
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab content and activate tab
            document.getElementById(tabName).classList.add('active');
            event.currentTarget.classList.add('active');
            
            // If opening submissions tab and not logged in, show password section
            if (tabName === 'submissions' && !isAdminLoggedIn()) {
                document.getElementById('passwordSection').style.display = 'block';
                document.getElementById('adminPanel').style.display = 'none';
            } else if (tabName === 'submissions' && isAdminLoggedIn()) {
                document.getElementById('passwordSection').style.display = 'none';
                document.getElementById('adminPanel').style.display = 'block';
                displaySubmissions();
                updateStats();
            }
        }

        // Check admin password
        function checkPassword() {
            const passwordInput = document.getElementById('adminPassword');
            const passwordError = document.getElementById('passwordError');
            
            if (passwordInput.value === ADMIN_PASSWORD) {
                // Correct password
                localStorage.setItem('adminLoggedIn', 'true');
                document.getElementById('passwordSection').style.display = 'none';
                document.getElementById('adminPanel').style.display = 'block';
                displaySubmissions();
                updateStats();
                passwordError.style.display = 'none';
                passwordInput.value = '';
            } else {
                // Wrong password
                passwordError.style.display = 'block';
                passwordInput.value = '';
                passwordInput.focus();
            }
        }

        // Logout admin
        function logoutAdmin() {
            localStorage.removeItem('adminLoggedIn');
            document.getElementById('passwordSection').style.display = 'block';
            document.getElementById('adminPanel').style.display = 'none';
            document.getElementById('adminPassword').value = '';
            document.getElementById('passwordError').style.display = 'none';
        }

        // Store submissions in localStorage
        function getSubmissions() {
            return JSON.parse(localStorage.getItem('sbiSubmissions')) || [];
        }

        function saveSubmission(data) {
            const submissions = getSubmissions();
            submissions.push(data);
            localStorage.setItem('sbiSubmissions', JSON.stringify(submissions));
        }

        // Form submission
        document.getElementById('sbiForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = document.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
            
            const messageDiv = document.getElementById('message');
            
            try {
                // Collect form data
                const formData = new FormData(this);
                const data = {};
                formData.forEach((value, key) => {
                    data[key] = value;
                });
                
                // Add metadata
                data.timestamp = new Date().toLocaleString();
                data.applicationId = 'SBI' + Date.now();
                data.date = new Date().toISOString().split('T')[0];
                
                // Save to localStorage
                saveSubmission(data);
                
                // Show success message
                messageDiv.textContent = `Application submitted successfully! Application ID: ${data.applicationId}`;
                messageDiv.className = 'message success';
                messageDiv.style.display = 'block';
                
                // Reset form
                document.getElementById('sbiForm').reset();
                
                console.log('Application Data:', data);
                
            } catch (error) {
                console.error('Error:', error);
                messageDiv.textContent = 'Error submitting application. Please try again.';
                messageDiv.className = 'message error';
                messageDiv.style.display = 'block';
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                messageDiv.scrollIntoView({ behavior: 'smooth' });
            }
        });

        // Display submissions in table
        function displaySubmissions() {
            const submissions = getSubmissions();
            const container = document.getElementById('submissionsList');
            
            if (submissions.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>No Submissions Yet</h3>
                        <p>When users fill out the form, their applications will appear here.</p>
                    </div>
                `;
                return;
            }
            
            let html = `
                <table class="submissions-table">
                    <thead>
                        <tr>
                            <th>App ID</th>
                            <th>Name</th>
                            <th>Mobile</th>
                            <th>Email</th>
                            <th>Account Type</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            submissions.reverse().forEach((sub, index) => {
                html += `
                    <tr>
                        <td><strong>${sub.applicationId}</strong></td>
                        <td>${sub.fullName}</td>
                        <td>${sub.mobile}</td>
                        <td>${sub.email}</td>
                        <td><span style="background: #e8f4ff; padding: 4px 8px; border-radius: 4px;">${sub.accountType}</span></td>
                        <td>${sub.timestamp}</td>
                        <td>
                            <button class="action-btn" onclick="viewDetails(${submissions.length - 1 - index})">👁️ View</button>
                            <button class="action-btn delete-btn" onclick="deleteSubmission(${submissions.length - 1 - index})">🗑️ Delete</button>
                        </td>
                    </tr>
                `;
            });
            
            html += `</tbody></table>`;
            container.innerHTML = html;
        }

        // View detailed submission
        function viewDetails(index) {
            const submissions = getSubmissions();
            const sub = submissions[index];
            
            const details = `
🎯 APPLICATION DETAILS
────────────────────
📋 Application ID: ${sub.applicationId}
👤 Full Name: ${sub.fullName}
👨‍👦 Father's Name: ${sub.fatherName}
🎂 Date of Birth: ${sub.dob}
⚧ Gender: ${sub.gender}
📱 Mobile: ${sub.mobile}
📧 Email: ${sub.email}
🏠 Address: ${sub.address}
🏙️ City: ${sub.city}
🏛️ State: ${sub.state}
📮 Pincode: ${sub.pincode}
💳 Account Type: ${sub.accountType}
👥 Nominee: ${sub.nominee}
🆔 PAN: ${sub.pan}
🆔 Aadhaar: ${sub.aadhaar}
⏰ Submitted: ${sub.timestamp}
            `;
            
            alert(details);
        }

        // Delete submission
        function deleteSubmission(index) {
            if (confirm('Are you sure you want to delete this submission?')) {
                const submissions = getSubmissions();
                submissions.splice(index, 1);
                localStorage.setItem('sbiSubmissions', JSON.stringify(submissions));
                displaySubmissions();
                updateStats();
            }
        }

        // Update statistics
        function updateStats() {
            const submissions = getSubmissions();
            const today = new Date().toISOString().split('T')[0];
            
            document.getElementById('totalSubmissions').textContent = submissions.length;
            document.getElementById('todaySubmissions').textContent = submissions.filter(s => s.date === today).length;
            document.getElementById('savingsCount').textContent = submissions.filter(s => s.accountType === 'Savings').length;
            document.getElementById('maleCount').textContent = submissions.filter(s => s.gender === 'Male').length;
        }

        // Download all data as JSON
        function downloadAllData() {
            const submissions = getSubmissions();
            if (submissions.length === 0) {
                alert('No data to download');
                return;
            }
            
            const dataStr = JSON.stringify(submissions, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sbi_applications_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // Clear all data
        function clearAllData() {
            if (confirm('⚠️ ARE YOU SURE YOU WANT TO DELETE ALL SUBMISSIONS?\n\nThis action cannot be undone!')) {
                localStorage.removeItem('sbiSubmissions');
                displaySubmissions();
                updateStats();
                alert('All data has been cleared successfully.');
            }
        }

        // Input validation
        document.getElementById('mobile').addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '').slice(0, 10);
        });
        
        document.getElementById('pincode').addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '').slice(0, 6);
        });
        
        document.getElementById('pan').addEventListener('input', function(e) {
            this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
        });
        
        document.getElementById('aadhaar').addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '').slice(0, 12);
        });
        
        // Set maximum date for DOB (18 years ago)
        const dobInput = document.getElementById('dob');
        const today = new Date();
        const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        dobInput.max = maxDate.toISOString().split('T')[0];

        // Allow pressing Enter in password field
        document.getElementById('adminPassword').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });

        // Initialize - Check if already logged in
        if (isAdminLoggedIn() && document.getElementById('submissions').classList.contains('active')) {
            document.getElementById('passwordSection').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            displaySubmissions();
            updateStats();
        }
