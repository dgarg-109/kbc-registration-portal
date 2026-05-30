// Form validation and submission handling
const form = document.getElementById('kbcForm');
const submitBtn = form.querySelector('.btn-submit');

// Validation rules
const validationRules = {
    fname: {
        validate: (value) => value.trim().length >= 2,
        message: 'First name must be at least 2 characters'
    },
    lname: {
        validate: (value) => value.trim().length >= 2,
        message: 'Last name must be at least 2 characters'
    },
    fathername: {
        validate: (value) => value.trim().length >= 2,
        message: 'Parent/Guardian name must be at least 2 characters'
    },
    dob: {
        validate: (value) => {
            const dob = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - dob.getFullYear();
            return age >= 18 && age <= 120;
        },
        message: 'You must be at least 18 years old'
    },
    mobile: {
        validate: (value) => /^[0-9]{10}$/.test(value),
        message: 'Mobile number must be 10 digits'
    },
    email: {
        validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Please enter a valid email address'
    },
    address: {
        validate: (value) => value.trim().length >= 10,
        message: 'Address must be at least 10 characters'
    },
    state: {
        validate: (value) => value !== '',
        message: 'Please select a state'
    },
    city: {
        validate: (value) => value.trim().length >= 2,
        message: 'City name must be at least 2 characters'
    },
    pincode: {
        validate: (value) => /^[0-9]{6}$/.test(value),
        message: 'Pincode must be 6 digits'
    },
    gender: {
        validate: () => document.querySelector('input[name="gender"]:checked'),
        message: 'Please select a gender'
    },
    aadhar: {
        validate: (value) => {
            const file = document.getElementById('aadhar').files[0];
            if (!file) return false;
            const maxSize = 5 * 1024 * 1024;
            const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            return file.size <= maxSize && validTypes.includes(file.type);
        },
        message: 'Please upload a valid file (PDF, JPG, PNG, max 5MB)'
    },
    terms: {
        validate: () => document.getElementById('terms').checked,
        message: 'You must agree to the terms and conditions'
    }
};

// Field error mapping
const errorMapping = {
    fname: 'fnameError',
    lname: 'lnameError',
    fathername: 'fathernameError',
    dob: 'dobError',
    mobile: 'mobileError',
    email: 'emailError',
    address: 'addressError',
    state: 'stateError',
    city: 'cityError',
    pincode: 'pincodeError',
    gender: 'genderError',
    aadhar: 'aadharError',
    terms: 'termsError'
};

// Validate individual field
function validateField(fieldName) {
    const field = document.getElementById(fieldName);
    const errorElement = document.getElementById(errorMapping[fieldName]);
    const rule = validationRules[fieldName];

    if (!rule) return true;

    const value = field.value || '';
    const isValid = rule.validate(value);

    const formGroup = field.closest('.form-group') || field.closest('.terms-checkbox');

    if (!isValid) {
        formGroup.classList.add('error');
        if (errorElement) {
            errorElement.textContent = rule.message;
        }
        return false;
    } else {
        formGroup.classList.remove('error');
        if (errorElement) {
            errorElement.textContent = '';
        }
        return true;
    }
}

// Real-time validation on input
Object.keys(validationRules).forEach(fieldName => {
    const field = document.getElementById(fieldName);
    if (field) {
        field.addEventListener('blur', () => validateField(fieldName));
        field.addEventListener('change', () => validateField(fieldName));
    }
});

// Validate entire form
function validateForm() {
    let isValid = true;
    Object.keys(validationRules).forEach(fieldName => {
        if (!validateField(fieldName)) {
            isValid = false;
        }
    });
    return isValid;
}

// Handle file upload preview
const aadharInput = document.getElementById('aadhar');
aadharInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const fileLabel = document.querySelector('.file-label');
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        fileLabel.innerHTML = `
            <i class="fas fa-check-circle" style="color: #4CAF50;"></i>
            <span style="color: #4CAF50;">${file.name}</span>
            <small style="color: #4CAF50;">File size: ${fileSize}MB</small>
        `;
    }
});

// Drag and drop functionality
const fileUpload = document.querySelector('.file-upload');
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    fileUpload.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    fileUpload.addEventListener(eventName, () => {
        fileUpload.style.backgroundColor = 'rgba(107, 14, 163, 0.1)';
    });
});

['dragleave', 'drop'].forEach(eventName => {
    fileUpload.addEventListener(eventName, () => {
        fileUpload.style.backgroundColor = 'rgba(0, 212, 255, 0.05)';
    });
});

fileUpload.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    aadharInput.files = files;
    aadharInput.dispatchEvent(new Event('change'));
});

// Form submission
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!validateForm()) {
        alert('Please fix the errors in the form');
        return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        const formData = new FormData(form);
        const userData = {
            firstName: formData.get('fname'),
            lastName: formData.get('lname'),
            parentName: formData.get('fathername'),
            dateOfBirth: formData.get('dob'),
            mobile: formData.get('mobile'),
            email: formData.get('email'),
            gender: formData.get('gender'),
            address: formData.get('address'),
            state: formData.get('state'),
            city: formData.get('city'),
            pincode: formData.get('pincode'),
            timestamp: new Date().toISOString()
        };

        // Simulate email submission
        await simulateEmailSubmission(userData, formData);

        form.style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';

        downloadKBCDocument(userData);

        setTimeout(() => {
            form.reset();
        }, 2000);

    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
});

// Simulate email submission
async function simulateEmailSubmission(userData, formData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const emailContent = `
KBC REGISTRATION FORM SUBMISSION
====================================================

PERSONAL INFORMATION:
Name: ${userData.firstName} ${userData.lastName}
Parent/Guardian: ${userData.parentName}
Date of Birth: ${userData.dateOfBirth}
Gender: ${userData.gender}

CONTACT INFORMATION:
Mobile: ${userData.mobile}
Email: ${userData.email}
Address: ${userData.address}

LOCATION:
State: ${userData.state}
City: ${userData.city}
Pincode: ${userData.pincode}

Submitted: ${userData.timestamp}

====================================================
EMAIL NOTIFICATION SENT TO: dharampura109@gmail.com
====================================================
            `;

            console.log('📧 Email Content:');
            console.log(emailContent);

            // Store in localStorage
            const submissions = JSON.parse(localStorage.getItem('kbcSubmissions') || '[]');
            submissions.push(userData);
            localStorage.setItem('kbcSubmissions', JSON.stringify(submissions));

            console.log('✅ Registration data saved locally');
            console.log('📤 Email notification would be sent to: dharampura109@gmail.com');

            resolve();
        }, 1500);
    });
}

// Download KBC Document
function downloadKBCDocument(userData) {
    const fileName = `KBC_Registration_${userData.firstName}_${userData.lastName}_${Date.now()}.txt`;
    
    const fileContent = `
╔═══════════════════════════════════════════════════════════════════╗
║            KBC REGISTRATION - CONFIRMATION DOCUMENT                ║
║         Kaun Banega Crorepati - Hot Seat Challenge                 ║
╚═══════════════════════════════════════════════════════════════════╝

REGISTRATION SUCCESSFUL!
═══════════════════════════════════════════════════════════════════

Dear ${userData.firstName} ${userData.lastName},

Congratulations! Your registration for KBC has been successfully submitted.

REGISTRATION DETAILS
═══════════════════════════════════════════════════════════════════
Registration Date: ${new Date().toLocaleDateString('en-IN')}
Registration Time: ${new Date().toLocaleTimeString('en-IN')}
Registration ID: KBC-${Date.now()}

YOUR INFORMATION
═══════════════════════════════════════════════════════════════════
Name: ${userData.firstName} ${userData.lastName}
Parent/Guardian: ${userData.parentName}
Date of Birth: ${userData.dateOfBirth}
Gender: ${userData.gender}
Mobile: ${userData.mobile}
Email: ${userData.email}
Address: ${userData.address}
State: ${userData.state}
City: ${userData.city}
Pincode: ${userData.pincode}

IMPORTANT GUIDELINES
═══════════════════════════════════════════════════════════════════

✓ Keep this document for reference and future correspondence
✓ Check your email regularly for updates and KBC question papers
✓ Follow all instructions sent by the organizing committee
✓ Bring a valid government-issued ID proof on the day of the event
✓ Report 15 minutes before the scheduled start time
✓ Download and study the KBC question paper from the attached link

WHAT HAPPENS NEXT?
═══════════════════════════════════════════════════════════════════

1. You will receive a confirmation email at: ${userData.email}
2. The KBC question paper will be sent to you via email
3. Study the questions thoroughly
4. Appear for the Hot Seat Challenge on the scheduled date
5. Winners will be announced and prizes awarded

CONTACT & SUPPORT
═══════════════════════════════════════════════════════════════════

For any queries or clarifications, please contact:
📧 Email: dharampura109@gmail.com
📞 Phone: [Your Contact Number]
🌐 Website: [Your Website]

TERMS & CONDITIONS
═══════════════════════════════════════════════════════════════════

By registering, you agree to:
• Participate in good faith
• Follow all rules and regulations
• Maintain confidentiality of questions
• Not share or distribute the question paper
• Accept the organizing committee's final decision

DOCUMENT LINK
═══════════════════════════════════════════════════════════════════

KBC Question Paper: 
[Your local path: C:\\Users\\Welcome\\Documents\\PPT\\KBC QUESTION FOR HOT SEAT.pptx]

This document has been automatically generated and sent to you.
Please save it for your records.

═══════════════════════════════════════════════════════════════════

Best of Luck! 🌟
We look forward to seeing you at KBC!

KBC Organizing Committee
═══════════════════════════════════════════════════════════════════

Generated on: ${new Date().toISOString()}
This is an automated message. Please do not reply to this email.
    `;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log('✅ Document downloaded: ' + fileName);
}

// Reset form button handler
form.querySelector('.btn-reset').addEventListener('click', () => {
    form.reset();
    document.querySelectorAll('.form-group, .terms-checkbox').forEach(group => {
        group.classList.remove('error');
    });
    document.querySelectorAll('.error-msg').forEach(msg => {
        msg.textContent = '';
    });
});

// Admin functions
window.viewAllSubmissions = function() {
    const submissions = JSON.parse(localStorage.getItem('kbcSubmissions') || '[]');
    console.log('=== KBC REGISTRATION SUBMISSIONS ===');
    console.log(`Total Registrations: ${submissions.length}`);
    console.table(submissions);
    return submissions;
};

window.downloadAllSubmissions = function() {
    const submissions = JSON.parse(localStorage.getItem('kbcSubmissions') || '[]');
    const dataStr = JSON.stringify(submissions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KBC_AllSubmissions_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

console.log('🎉 KBC Registration Form Loaded Successfully!');
console.log('📊 Admin Commands:');
console.log('   • viewAllSubmissions() - View all registrations');
console.log('   • downloadAllSubmissions() - Download all data as JSON');