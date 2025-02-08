// Function to toggle search input visibility
// document.getElementById('searchButton').addEventListener('click', function () {
//     const searchContainer = document.querySelector('.search-container');
//     searchContainer.classList.toggle('active'); // Toggle the active class
//     const searchInput = document.getElementById('searchInput');

//     // Focus on the input if it becomes visible
//     if (searchContainer.classList.contains('active')) {
//         searchInput.focus();
//     }
// });

// Function to filter students based on search input
// document.getElementById('searchInput').addEventListener('input', function () {
//     const searchValue = this.value.toLowerCase().trim(); // Sanitize input
//     const studentRows = document.querySelectorAll('#studentTable tbody tr');

//     studentRows.forEach(row => {
//         const studentName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
//         row.style.display = studentName.includes(searchValue) ? '' : 'none'; // Show or hide row
//     });
// });

// Handle student form submission
document.getElementById('studentForm').addEventListener('submit', function (event) {
    event.preventDefault();
    document.getElementById('loadingSpinner').style.display = 'block';

    const name = document.getElementById('name').value.trim();
    const roll = document.getElementById('roll').value.trim();
    const studentClass = document.getElementById('class').value.trim();
    const contact = document.getElementById('contact').value.trim();

    // Validate input
    if (!name || !roll || !studentClass || !contact) {
        alert('All fields are required.');
        document.getElementById('loadingSpinner').style.display = 'none';
        return;
    }

    fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            name, 
            roll_number: roll, 
            class: studentClass, 
            parent_contact: contact 
        }),
    })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            alert('Student added successfully!');
            document.getElementById('studentForm').reset();
            fetchStudents(); // Refresh the table
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to add student. Please try again.');
        })
        .finally(() => {
            document.getElementById('loadingSpinner').style.display = 'none';
        });
});

// Function to edit student
function editStudent(id) {
    document.getElementById('loadingSpinner').style.display = 'block';

    fetch(`/api/students/${id}`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(student => {
            document.getElementById('updateName').value = student.name;
            document.getElementById('updateRoll').value = student.roll_number;
            document.getElementById('updateClass').value = student.class;
            document.getElementById('updateContact').value = student.parent_contact;

            const modal = document.getElementById('updateStudentModal');
            modal.style.display = 'block';
            modal.setAttribute('data-student-id', id); // Store student ID
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to fetch student data.');
        })
        .finally(() => {
            document.getElementById('loadingSpinner').style.display = 'none';
        });
}

// Handle update form submission
document.getElementById('updateStudentForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const id = document.getElementById('updateStudentModal').getAttribute('data-student-id');
    const name = document.getElementById('updateName').value.trim();
    const roll = document.getElementById('updateRoll').value.trim();
    const studentClass = document.getElementById('updateClass').value.trim();
    const contact = document.getElementById('updateContact').value.trim();

    if (!name || !roll || !studentClass || !contact) {
        alert('All fields are required.');
        return;
    }

    fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            name, 
            roll_number: roll, 
            class: studentClass, 
            parent_contact: contact 
        }),
    })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            alert('Student updated successfully!');
            document.getElementById('updateStudentModal').style.display = 'none';
            fetchStudents(); // Refresh the table
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to update student.');
        });
});

// Close modal when clicking the close button
document.querySelector('.close-button').addEventListener('click', function () {
    document.getElementById('updateStudentModal').style.display = 'none';
});

// Close modal when clicking outside of it



// Add these functions for search
function handleSearch() {
    const searchQuery = document.getElementById('searchInput').value.trim();
    const searchResults = document.getElementById('searchResults');
    
    if (!searchQuery) {
        return;
    }

    document.getElementById('loadingSpinner').style.display = 'block';

    fetch(`/api/students/search?search=${encodeURIComponent(searchQuery)}`)
        .then(response => response.json())
        .then(results => {
            const tbody = document.querySelector('#studentTable tbody');
            tbody.innerHTML = '';

            if (results.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">No students found</td></tr>';
                return;
            }

            results.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox" class="student-checkbox" value="${student.student_id}"></td>
                    <td>${student.student_id}</td>
                    <td>${student.name}</td>
                    <td>${student.roll_number}</td>
                    <td>${student.class}</td>
                    <td>${student.parent_contact}</td>
                    <td>
                        <button onclick="editStudent(${student.student_id})" class="btn-edit">Edit</button>
                        <button onclick="deleteStudent(${student.student_id})" class="btn-delete">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Search error:', error);
            alert('Error searching students');
        })
        .finally(() => {
            document.getElementById('loadingSpinner').style.display = 'none';
        });
}

// Function to show/hide loading spinner
function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = 'block';
    }
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

// Function to generate attendance report
function generateAttendanceReport() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }

    showLoading();

    fetch(`/api/attendance/report?startDate=${startDate}&endDate=${endDate}`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            // Process and display the report data
            const reportContainer = document.createElement('div');
            reportContainer.className = 'report-container';
            reportContainer.innerHTML = `
                <h3>Attendance Report (${startDate} to ${endDate})</h3>
                <div class="report-summary">
                    <p>Total Students: ${data.totalStudents}</p>
                    <p>Average Attendance: ${data.averageAttendance.toFixed(2)}%</p>
                </div>
                <table class="report-table">
                    <thead>
                        <tr>
                        <th></th>
                            <th>Student Name</th>
                            <th>Total Days</th>
                            <th>Present Days</th>
                            <th>Absent Days</th>
                            <th>Attendance %</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        ${data.studentReports.map(student => `
                            <tr>
                                <td>${student.studentName}</td>
                                <td>${student.totalDays}</td>
                                <td>${student.presentDays}</td>
                                <td>${student.absentDays}</td>
                                <td>${student.attendancePercentage.toFixed(2)}%</td>
                                
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            // Find the attendance section and append the report
            const attendanceSection = document.getElementById('attendance');
            if (attendanceSection) {
                // Remove any existing report
                const existingReport = attendanceSection.querySelector('.report-container');
                if (existingReport) {
                    existingReport.remove();
                }
                attendanceSection.appendChild(reportContainer);
            }
        })
        .catch(error => {
            console.error('Report generation error:', error);
            alert('Failed to generate report. Please try again.');
        })
        .finally(hideLoading);
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Existing event listeners...

    // Add search event listeners
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    if (searchInput && searchButton) {
        searchButton.addEventListener('click', handleSearch);
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });

        // Real-time search with debounce
        let debounceTimer;
        searchInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(handleSearch, 300);
        });
    }

    // Add report generation event listener
    const generateReportButton = document.getElementById('generateReport');
    if (generateReportButton) {
        generateReportButton.addEventListener('click', generateAttendanceReport);
    }
});

// Function to handle search
// const handleSearch = async () => {
//     const searchQuery = document.getElementById('searchInput').value.trim();

//     if (!searchQuery) {
//         alert('Please enter a search term.');
//         return;
//     }

//     showLoading();
//     try {
//         // Send the search query to the backend
//         const response = await fetch(`${apiUrl}/api/search?query=${encodeURIComponent(searchQuery)}`);
//         if (!response.ok) throw new Error(`Error fetching search results: ${response.statusText}`);

//         const results = await response.json();
//         displaySearchResults(results);
//     } catch (error) {
//         showError('Failed to fetch search results');
//         console.error(error);
//     }
//     hideLoading();
// };

// Function to display search results
// const displaySearchResults = (results) => {
//     const tableBody = document.querySelector('#searchResultsTable tbody');
//     tableBody.innerHTML = ''; // Clear previous results

//     if (results.length === 0) {
//         tableBody.innerHTML = '<tr><td colspan="4">No results found.</td></tr>';
//         return;
//     }

//     results.forEach(result => {
//         const row = document.createElement('tr');
//         row.innerHTML = `
//             <td>${result.student_id}</td>
//             <td>${result.name}</td>
//             <td>${result.attendance || 'N/A'}</td>
//             <td>${result.fee_status || 'N/A'}</td>
//         `;
//         tableBody.appendChild(row);
//     });
// };

// Event listener for the search button
// document.getElementById('searchButton').addEventListener('click', handleSearch);

// // Event listener for pressing Enter in the search input
// document.getElementById('searchInput').addEventListener('keypress', (e) => {
//     if (e.key === 'Enter') {
//         handleSearch();
//     }
// });

// Add this function for logout
function logout() {
    // Clear the authentication token
    localStorage.removeItem('token');
    
    // Redirect to login page
    window.location.href = 'login.html';
}