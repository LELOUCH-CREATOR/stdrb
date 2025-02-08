const apiUrl = 'http://localhost:5001'; // Ensure your backend server runs on port 5001
const studentTable = document.querySelector('#studentTable tbody');
const studentForm = document.getElementById('studentForm');
const attendanceTable = document.querySelector('#attendanceTable tbody');
const attendanceForm = document.getElementById('attendanceForm');
const loadingSpinner = document.getElementById('loadingSpinner');
const feesTable = document.querySelector('#feesTable tbody');
const feesForm = document.getElementById('feesForm');

// Function to show loading spinner
function showLoading() {
    loadingSpinner.style.display = 'block';
}

// Function to hide loading spinner
function hideLoading() {
    loadingSpinner.style.display = 'none';
}

// Function to show error message
function showError(message) {
    alert(message);
}

// Function to fetch and display students
const fetchStudents = async () => {
    showLoading();
    try {
        const response = await fetch(`${apiUrl}/api/students`);
        if (!response.ok) throw new Error(`Error fetching students: ${response.statusText}`);

        const students = await response.json();
        console.log('Fetched Students:', students);

        studentTable.innerHTML = '';

        students.forEach(student => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', student.student_id);
            row.innerHTML = `
                <th>${student.student_id}</th>
                <td>${student.name}</td>
                <td>${student.roll_number}</td>
                <td>${student.class}</td>
                <td>${student.parent_contact}</td>
                <td>
                    <button class="btn-edit" data-id="${student.student_id}">Edit</button>
                    <button class="btn-delete" data-id="${student.student_id}">Delete</button>
                </td>
            `;
            studentTable.appendChild(row);
        });
    } catch (error) {
        showError('Failed to load students');
        console.error(error);
    }
    hideLoading();
};

// Function to delete a student
const deleteStudent = async (id) => {
    if (confirm('Are you sure you want to delete this student?')) {
        showLoading();
        try {
            const response = await fetch(`${apiUrl}/api/students/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`Error deleting student: ${response.statusText}`);
            }

            alert('Student deleted successfully');
            fetchStudents(); // Refresh the student list
        } catch (error) {
            showError('Failed to delete student');
            console.error(error);
        }
        hideLoading();
    }
};

// Function to fetch and display attendance records
const fetchAttendance = async () => {
    showLoading();
    try {
        const response = await fetch(`${apiUrl}/api/attendance`);
        if (!response.ok) throw new Error(`Error fetching attendance: ${response.statusText}`);

        const attendanceRecords = await response.json();
        console.log('Fetched Attendance:', attendanceRecords);

        const students = {};
        const days = new Set();

        attendanceRecords.forEach(record => {
            if (!students[record.student_id]) {
                students[record.student_id] = {
                    student_id: record.student_id,
                    student_name: record.student_name,
                    attendance: {},
                };
            }
            students[record.student_id].attendance[record.date] = record.status;
            days.add(record.date);
        });

        const sortedDays = Array.from(days).sort((a, b) => new Date(a) - new Date(b));
        renderAttendanceTable(students, sortedDays);
    } catch (error) {
        showError('Failed to load attendance records');
        console.error(error);
    }
    hideLoading();
};

// Function to render the attendance table
const renderAttendanceTable = (students, days) => {
    attendanceTable.innerHTML = '';

    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>Student ID</th>
        <th>Student Name</th>
        ${days.map(day => {
            const date = new Date(day);
            const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`; // Format as "day/month/year"
            return `<th>${formattedDate}</th>`;
        }).join('')}
    `;
    attendanceTable.appendChild(headerRow);

    Object.values(students).forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.student_id}</td>
            <td>${student.student_name}</td>
            ${days.map(day => `
                <td>${student.attendance[day] ? (student.attendance[day] === 'present' ? '✓' : '✗') : '-'}</td>
            `).join('')}
        `;
        attendanceTable.appendChild(row);
    });
};


const addFee = async (feeData) => {
    showLoading();
    try {
        const response = await fetch(`${apiUrl}/api/fees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(feeData),
        });
        if (!response.ok) throw new Error(`Error adding fee: ${response.statusText}`);
        alert('Fee added successfully');
        fetchFees(); // Refresh the fees table
    } catch (error) {
        showError('Failed to add fee');
        console.error(error);
    }
    hideLoading();
};

// Function to fetch and display fees
const fetchFees = async () => {
    showLoading();
    try {
        const response = await fetch(`${apiUrl}/api/fees`);
        if (!response.ok) throw new Error(`Error fetching fees: ${response.statusText}`);

        const fees = await response.json();
        console.log('Fetched Fees:', fees);

        feesTable.innerHTML = '';

        fees.forEach(fee => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', fee.fee_id);
            const paidDate = new Date(fee.paid_date);
            const formattedDate = `${paidDate.getDate()}/${paidDate.getMonth() + 1}/${paidDate.getFullYear()}`; // Format as "day/month/year"

            row.innerHTML = `
                <td>${fee.student_id}</td>
                <td>${fee.student_name || 'N/A'}</td>
                <td>${fee.fee_amount}</td>
                <td>${formattedDate}</td> <!-- Display day/month/year -->
                <td>${fee.status}</td>
                <td>
             
                    <button class="btn-delete" data-id="${fee.fee_id}">Delete</button>
                </td>
            `;
            feesTable.appendChild(row);
        });
    } catch (error) {
        showError('Failed to load fees');
        console.error(error);
    }
    hideLoading();
};

// Function to show section by ID
function showSection(sectionId) {
    const sections = document.querySelectorAll('.view');
    sections.forEach(section => section.classList.remove('active'));

    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
    }

    // Fetch data based on the active section
    if (sectionId === 'students') {
        fetchStudents();
    } else if (sectionId === 'attendance') {
        fetchAttendance();
    } else if (sectionId === 'fees') {
        fetchFees();
    }
}


// Event listener for navigation links
document.querySelectorAll('nav ul li a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('data-route');
        showSection(sectionId);
        document.querySelectorAll('nav ul li a').forEach(nav => nav.classList.remove('active'));
        link.classList.add('active');
    });
});

// Event listener for adding a student
studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(studentForm);
    const studentData = {
        name: formData.get('name'),
        roll_number: formData.get('roll'),
        class: formData.get('class'),
        parent_contact: formData.get('contact'),
    };

    if (!studentData.name || !studentData.roll_number || !studentData.class || !studentData.parent_contact) {
        showError('Please fill in all fields');
        return;
    }

    showLoading();
    try {
        const response = await fetch(`${apiUrl}/api/students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(studentData),
        });
        if (!response.ok) throw new Error(`Error adding student: ${response.statusText}`);
        fetchStudents();
        studentForm.reset();
    } catch (error) {
        showError('Failed to add student');
        console.error(error);
    }
    hideLoading();
});

// Event listener for attendance form submission
attendanceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = document.getElementById('studentId').value;
    const date = document.getElementById('attendanceDate').value;
    const status = document.getElementById('attendanceStatus').value;

    if (!studentId || !date || !status) {
        showError('Please fill in all fields');
        return;
    }

    showLoading();
    try {
        const response = await fetch(`${apiUrl}/api/attendance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ student_id: studentId, date, status }),
        });
        if (!response.ok) throw new Error(`Error recording attendance: ${response.statusText}`);
        alert('Attendance recorded successfully');
        attendanceForm.reset();
        fetchAttendance();
    } catch (error) {
        showError('Failed to record attendance');
        console.error(error);
    }
    hideLoading();
});

// Event listener for fees form submission
feesForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(feesForm);
    const feeData = {
        student_id: parseInt(formData.get('studentId')), // Ensure it's an integer
        fee_amount: parseFloat(formData.get('amount')), // Ensure it's a decimal
        paid_date: formData.get('dueDate'), // Map 'dueDate' to 'paid_date'
        status: formData.get('status'), // Ensure status is 'Paid' or 'Pending'
    };

    if (!feeData.student_id || !feeData.fee_amount || !feeData.paid_date || !feeData.status) {
        showError('Please fill in all fields');
        return;
    }

    showLoading();
    try {
        const response = await fetch(`${apiUrl}/api/fees`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(feeData),
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            console.error(`Error adding fee: ${response.statusText}`, errorDetails);
            throw new Error(`Error adding fee: ${response.statusText}`);
        }

        alert('Fee added successfully');
        feesForm.reset(); // Clear the form
        fetchFees(); // Refresh the fees table
    } catch (error) {
        showError('Failed to add fee');
        console.error(error);
    }
    hideLoading();
});

// Event listener for delete buttons in the student table
studentTable.addEventListener('click', async (e) => {
    const button = e.target;
    const id = button.getAttribute('data-id');
    if (!id) return;

    if (button.classList.contains('btn-edit')) {
        editStudent(id);
    } else if (button.classList.contains('btn-delete')) {
        deleteStudent(id); // Call the deleteStudent function
    }
});

// Event listener for delete buttons in the fees table
feesTable.addEventListener('click', async (e) => {
    const button = e.target;
    const id = button.getAttribute('data-id');
    if (!id) return;

    if (button.classList.contains('btn-edit')) {
        editFee(id);
    } else if (button.classList.contains('btn-delete')) {
        if (confirm('Are you sure you want to delete this fee record?')) {
            showLoading();
            try {
                const response = await fetch(`${apiUrl}/api/fees/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error(`Error deleting fee record: ${response.statusText}`);
                fetchFees(); // Refresh the fees table
            } catch (error) {
                showError('Failed to delete fee record');
                console.error(error);
            }
            hideLoading();
        }
    }
});

// Function to edit a fee// Function to edit a fee
// Function to edit a fee
const editFee = async (id) => {
    showLoading();
    try {
        // Fetch the fee details from the backend
        const response = await fetch(`${apiUrl}/api/fees/${id}`);
        if (!response.ok) throw new Error(`Error fetching fee: ${response.statusText}`);

        const fee = await response.json();

        // Check if the fee data is valid
        if (!fee) {
            throw new Error('Fee data is undefined');
        }

        // Populate the form with the fetched fee details
        document.getElementById('studentId').value = fee.student_id || '';
        document.getElementById('amount').value = fee.fee_amount || '';
        document.getElementById('dueDate').value = fee.paid_date ? fee.paid_date.split('T')[0] : ''; // Format date for input[type="date"]
        document.getElementById('status').value = fee.status || 'Pending'; // Default to 'Pending' if status is missing

        // Change the form's submit behavior to update the fee
        feesForm.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(feesForm);
            const feeData = {
                student_id: parseInt(formData.get('studentId')), // Ensure it's an integer
                fee_amount: parseFloat(formData.get('amount')), // Ensure it's a decimal
                paid_date: formData.get('dueDate'), // Map 'dueDate' to 'paid_date'
                status: formData.get('status'), // Ensure status is 'Paid' or 'Pending'
            };

            if (!feeData.student_id || !feeData.fee_amount || !feeData.paid_date || !feeData.status) {
                showError('Please fill in all fields');
                return;
            }

            showLoading();
            try {
                // Send a PUT request to update the fee
                const response = await fetch(`${apiUrl}/api/fees/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(feeData),
                });
                if (!response.ok) throw new Error(`Error updating fee: ${response.statusText}`);

                alert('Fee updated successfully');
                fetchFees(); // Refresh the fees table
                feesForm.reset(); // Clear the form
                feesForm.onsubmit = addFee; // Reset the form's submit behavior to add a new fee
            } catch (error) {
                showError('Failed to update fee');
                console.error(error);
            }
            hideLoading();
        };
    } catch (error) {
        showError('Failed to fetch fee details');
        console.error(error);
    }
    hideLoading();
};
// Initialize the app
fetchStudents();
fetchAttendance();
fetchFees();
showSection('home');