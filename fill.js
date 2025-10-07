// Store candidates in memory (not localStorage as it's not supported)
    let candidates = JSON.parse(localStorage.getItem('candidateData')) || [];


    document.getElementById('candidateForm').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const fileInput = document.getElementById('resume');
      const coverLetterInput = document.getElementById('coverLetterFile');
      const resumeFile = fileInput.files[0];
      const coverLetterFile = coverLetterInput.files[0];
      
      let resumeURL = '';
      let coverLetterURL = '';

      // Convert resume to base64
      if (resumeFile) {
        const reader = new FileReader();
        reader.onload = function() {
          resumeURL = reader.result;
          
          // Convert cover letter if exists
          if (coverLetterFile) {
            const clReader = new FileReader();
            clReader.onload = function() {
              coverLetterURL = clReader.result;
              saveCandidate(resumeURL, coverLetterURL);
            };
            clReader.readAsDataURL(coverLetterFile);
          } else {
            saveCandidate(resumeURL, '');
          }
        };
        reader.readAsDataURL(resumeFile);
      } else {
        saveCandidate('', '');
      }
    });

    function saveCandidate(resumeURL, coverLetterURL) {
      const candidate = {
        id: Date.now(),
        firstName: document.getElementById('firstName').value,
        middleName: document.getElementById('middleName').value,
        lastName: document.getElementById('lastName').value,
        title: document.getElementById('title').value,
        gender: document.getElementById('gender').value,
        dob: document.getElementById('dob').value,
        nationality: document.getElementById('nationality').value,
        maritalStatus: document.getElementById('maritalStatus').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        altPhone: document.getElementById('altPhone').value,
        linkedin: document.getElementById('linkedin').value,
        portfolio: document.getElementById('portfolio').value,
        github: document.getElementById('github').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zip: document.getElementById('zip').value,
        country: document.getElementById('country').value,
        educationLevel: document.getElementById('educationLevel').value,
        fieldOfStudy: document.getElementById('fieldOfStudy').value,
        university: document.getElementById('university').value,
        graduationYear: document.getElementById('graduationYear').value,
        gpa: document.getElementById('gpa').value,
        certifications: document.getElementById('certifications').value,
        experience: document.getElementById('experience').value,
        currentJobTitle: document.getElementById('currentJobTitle').value,
        currentCompany: document.getElementById('currentCompany').value,
        currentSalary: document.getElementById('currentSalary').value,
        expectedSalary: document.getElementById('expectedSalary').value,
        noticePeriod: document.getElementById('noticePeriod').value,
        skills: document.getElementById('skills').value,
        workSummary: document.getElementById('workSummary').value,
        jobTitle: document.getElementById('jobTitle').value,
        department: document.getElementById('department').value,
        employmentType: document.getElementById('employmentType').value,
        workMode: document.getElementById('workMode').value,
        relocate: document.getElementById('relocate').value,
        preferredLocations: document.getElementById('preferredLocations').value,
        visaStatus: document.getElementById('visaStatus').value,
        sponsorship: document.getElementById('sponsorship').value,
        ethnicity: document.getElementById('ethnicity').value,
        disability: document.getElementById('disability').value,
        veteran: document.getElementById('veteran').value,
        referralSource: document.getElementById('referralSource').value,
        referralName: document.getElementById('referralName').value,
        coverLetter: document.getElementById('coverLetter').value,
        additionalComments: document.getElementById('additionalComments').value,
        resume: resumeURL,
        coverLetterFile: coverLetterURL,
        submittedDate: new Date().toLocaleString()
      };

      candidates.push(candidate);
    localStorage.setItem('candidateData', JSON.stringify(candidates));


      
      // Show success message
      const alert = document.getElementById('successAlert');
      alert.style.display = 'block';
      setTimeout(() => {
        alert.style.display = 'none';
      }, 3000);
      
      // Reset form
      document.getElementById('candidateForm').reset();
      
      // Scroll to table
      document.getElementById('candidateTable').scrollIntoView({ behavior: 'smooth' });
    }

    function deleteCandidate(id) {
      if (confirm('Are you sure you want to delete this application?')) {
        candidates = candidates.filter(c => c.id !== id);
        renderTable();
      }
    }

    function viewCandidate(id) {
      const candidate = candidates.find(c => c.id === id);
      if (!candidate) return;

      const fullName = `${candidate.title ? candidate.title + ' ' : ''}${candidate.firstName} ${candidate.middleName ? candidate.middleName + ' ' : ''}${candidate.lastName}`;
      
      const detailHTML = `
        <h2 style="color: #667eea; margin-bottom: 25px;">📋 Application Details</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
          <div>
            <h3 style="color: #667eea; margin-bottom: 10px;">Personal Information</h3>
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Gender:</strong> ${candidate.gender || 'N/A'}</p>
            <p><strong>Date of Birth:</strong> ${candidate.dob || 'N/A'}</p>
            <p><strong>Nationality:</strong> ${candidate.nationality || 'N/A'}</p>
            <p><strong>Marital Status:</strong> ${candidate.maritalStatus || 'N/A'}</p>
          </div>

          <div>
            <h3 style="color: #667eea; margin-bottom: 10px;">Contact Information</h3>
            <p><strong>Email:</strong> ${candidate.email}</p>
            <p><strong>Phone:</strong> ${candidate.phone}</p>
            <p><strong>Alt Phone:</strong> ${candidate.altPhone || 'N/A'}</p>
            <p><strong>LinkedIn:</strong> ${candidate.linkedin ? `<a href="${candidate.linkedin}" target="_blank">Profile</a>` : 'N/A'}</p>
            <p><strong>Portfolio:</strong> ${candidate.portfolio ? `<a href="${candidate.portfolio}" target="_blank">Website</a>` : 'N/A'}</p>
            <p><strong>GitHub:</strong> ${candidate.github ? `<a href="${candidate.github}" target="_blank">Profile</a>` : 'N/A'}</p>
          </div>

          <div>
            <h3 style="color: #667eea; margin-bottom: 10px;">Address</h3>
            <p><strong>Street:</strong> ${candidate.address}</p>
            <p><strong>City:</strong> ${candidate.city}</p>
            <p><strong>State:</strong> ${candidate.state}</p>
            <p><strong>ZIP:</strong> ${candidate.zip}</p>
            <p><strong>Country:</strong> ${candidate.country}</p>
          </div>

          <div>
            <h3 style="color: #667eea; margin-bottom: 10px;">Education</h3>
            <p><strong>Highest Level:</strong> ${candidate.educationLevel}</p>
            <p><strong>Field of Study:</strong> ${candidate.fieldOfStudy || 'N/A'}</p>
            <p><strong>University:</strong> ${candidate.university || 'N/A'}</p>
            <p><strong>Graduation Year:</strong> ${candidate.graduationYear || 'N/A'}</p>
            <p><strong>GPA:</strong> ${candidate.gpa || 'N/A'}</p>
            <p><strong>Certifications:</strong> ${candidate.certifications || 'None'}</p>
          </div>

          <div>
            <h3 style="color: #667eea; margin-bottom: 10px;">Professional Experience</h3>
            <p><strong>Total Experience:</strong> ${candidate.experience} years</p>
            <p><strong>Current Job:</strong> ${candidate.currentJobTitle || 'N/A'}</p>
            <p><strong>Current Company:</strong> ${candidate.currentCompany || 'N/A'}</p>
            <p><strong>Current Salary:</strong> ${candidate.currentSalary || 'N/A'}</p>
            <p><strong>Notice Period:</strong> ${candidate.noticePeriod || 'N/A'}</p>
          </div>

          <div>
            <h3 style="color: #667eea; margin-bottom: 10px;">Position Applied</h3>
            <p><strong>Job Title:</strong> ${candidate.jobTitle}</p>
            <p><strong>Department:</strong> ${candidate.department || 'N/A'}</p>
            <p><strong>Employment Type:</strong> ${candidate.employmentType || 'N/A'}</p>
            <p><strong>Work Mode:</strong> ${candidate.workMode || 'N/A'}</p>
            <p><strong>Expected Salary:</strong> ${candidate.expectedSalary}</p>
          </div>

          <div>
            <h3 style="color: #667eea; margin-bottom: 10px;">Work Authorization</h3>
            <p><strong>Visa Status:</strong> ${candidate.visaStatus}</p>
            <p><strong>Sponsorship:</strong> ${candidate.sponsorship}</p>
            <p><strong>Willing to Relocate:</strong> ${candidate.relocate}</p>
            <p><strong>Preferred Locations:</strong> ${candidate.preferredLocations || 'N/A'}</p>
          </div>

          <div>
            <h3 style="color: #667eea; margin-bottom: 10px;">Additional Info</h3>
            <p><strong>Referral Source:</strong> ${candidate.referralSource || 'N/A'}</p>
            <p><strong>Referral Name:</strong> ${candidate.referralName || 'N/A'}</p>
            <p><strong>Submitted:</strong> ${candidate.submittedDate}</p>
          </div>
        </div>

        <div style="margin-top: 20px;">
          <h3 style="color: #667eea; margin-bottom: 10px;">Key Skills</h3>
          <p style="background: #f0f0f0; padding: 10px; border-radius: 5px;">${candidate.skills || 'N/A'}</p>
        </div>

        ${candidate.workSummary ? `
        <div style="margin-top: 20px;">
          <h3 style="color: #667eea; margin-bottom: 10px;">Work Experience Summary</h3>
          <p style="background: #f0f0f0; padding: 10px; border-radius: 5px;">${candidate.workSummary}</p>
        </div>
        ` : ''}

        ${candidate.coverLetter ? `
        <div style="margin-top: 20px;">
          <h3 style="color: #667eea; margin-bottom: 10px;">Cover Letter</h3>
          <p style="background: #f0f0f0; padding: 10px; border-radius: 5px;">${candidate.coverLetter}</p>
        </div>
        ` : ''}

        ${candidate.additionalComments ? `
        <div style="margin-top: 20px;">
          <h3 style="color: #667eea; margin-bottom: 10px;">Additional Comments</h3>
          <p style="background: #f0f0f0; padding: 10px; border-radius: 5px;">${candidate.additionalComments}</p>
        </div>
        ` : ''}

        <div style="margin-top: 25px; display: flex; gap: 10px;">
          ${candidate.resume ? `<a href="${candidate.resume}" download="resume_${candidate.firstName}_${candidate.lastName}.pdf" style="background: #27ae60; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">📄 Download Resume</a>` : ''}
          ${candidate.coverLetterFile ? `<a href="${candidate.coverLetterFile}" download="cover_letter_${candidate.firstName}_${candidate.lastName}.pdf" style="background: #3498db; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">📄 Download Cover Letter</a>` : ''}
        </div>
      `;

      document.getElementById('detailContent').innerHTML = detailHTML;
      document.getElementById('detailModal').style.display = 'block';
    }

    function closeDetailModal() {
      document.getElementById('detailModal').style.display = 'none';
    }

    function exportToCSV() {
      if (candidates.length === 0) {
        alert('No data to export!');
        return;
      }

      const headers = [
        'Full Name', 'Title', 'Email', 'Phone', 'Alt Phone', 'DOB', 'Gender', 'Nationality',
        'Marital Status', 'Address', 'City', 'State', 'ZIP', 'Country', 'Education Level',
        'Field of Study', 'University', 'Graduation Year', 'GPA', 'Certifications',
        'Experience (Years)', 'Current Job', 'Current Company', 'Current Salary',
        'Expected Salary', 'Notice Period', 'Skills', 'Job Title Applied', 'Department',
        'Employment Type', 'Work Mode', 'Relocate', 'Preferred Locations', 'Visa Status',
        'Sponsorship', 'Ethnicity', 'Disability', 'Veteran', 'Referral Source', 'Referral Name',
        'LinkedIn', 'Portfolio', 'GitHub', 'Submitted Date'
      ];

      let csv = headers.join(',') + '\n';

      candidates.forEach(c => {
        const fullName = `${c.title ? c.title + ' ' : ''}${c.firstName} ${c.middleName ? c.middleName + ' ' : ''}${c.lastName}`;
        const row = [
          fullName, c.title, c.email, c.phone, c.altPhone, c.dob, c.gender, c.nationality,
          c.maritalStatus, c.address, c.city, c.state, c.zip, c.country, c.educationLevel,
          c.fieldOfStudy, c.university, c.graduationYear, c.gpa, c.certifications,
          c.experience, c.currentJobTitle, c.currentCompany, c.currentSalary,
          c.expectedSalary, c.noticePeriod, c.skills, c.jobTitle, c.department,
          c.employmentType, c.workMode, c.relocate, c.preferredLocations, c.visaStatus,
          c.sponsorship, c.ethnicity, c.disability, c.veteran, c.referralSource, c.referralName,
          c.linkedin, c.portfolio, c.github, c.submittedDate
        ].map(field => `"${(field || '').toString().replace(/"/g, '""')}"`);
        
        csv += row.join(',') + '\n';
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candidates_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }

    function clearAllData() {
      if (confirm('⚠️ WARNING: This will delete ALL candidate data permanently. Are you absolutely sure?')) {
        if (confirm('This action cannot be undone. Click OK to confirm deletion.')) {
          candidates = [];
          renderTable();
          alert('All data has been cleared.');
        }
      }
    }

    function viewDetailedReport() {
      if (candidates.length === 0) {
        alert('No candidates to display!');
        return;
      }

      const reportHTML = `
        <h2 style="color: #667eea; margin-bottom: 20px;">📊 Candidate Analytics Report</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px;">
            <h4 style="margin-bottom: 10px;">Total Applications</h4>
            <p style="font-size: 2em; font-weight: bold;">${candidates.length}</p>
          </div>
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 10px;">
            <h4 style="margin-bottom: 10px;">Avg Experience</h4>
            <p style="font-size: 2em; font-weight: bold;">${(candidates.reduce((sum, c) => sum + (parseInt(c.experience) || 0), 0) / candidates.length).toFixed(1)} yrs</p>
          </div>
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 10px;">
            <h4 style="margin-bottom: 10px;">Need Sponsorship</h4>
            <p style="font-size: 2em; font-weight: bold;">${candidates.filter(c => c.sponsorship && c.sponsorship.includes('Yes')).length}</p>
          </div>
          <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 20px; border-radius: 10px;">
            <h4 style="margin-bottom: 10px;">Willing to Relocate</h4>
            <p style="font-size: 2em; font-weight: bold;">${candidates.filter(c => c.relocate === 'Yes').length}</p>
          </div>
        </div>

        <h3 style="color: #667eea; margin-bottom: 15px;">Top Positions Applied For</h3>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          ${getTopPositions()}
        </div>

        <h3 style="color: #667eea; margin-bottom: 15px;">Education Level Distribution</h3>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
          ${getEducationDistribution()}
        </div>
      `;

      document.getElementById('detailContent').innerHTML = reportHTML;
      document.getElementById('detailModal').style.display = 'block';
    }

    function getTopPositions() {
      const positions = {};
      candidates.forEach(c => {
        positions[c.jobTitle] = (positions[c.jobTitle] || 0) + 1;
      });
      
      const sorted = Object.entries(positions).sort((a, b) => b[1] - a[1]).slice(0, 5);
      return sorted.map(([job, count]) => `<p><strong>${job}:</strong> ${count} applicants</p>`).join('');
    }

    function getEducationDistribution() {
      const education = {};
      candidates.forEach(c => {
        education[c.educationLevel] = (education[c.educationLevel] || 0) + 1;
      });
      
      return Object.entries(education).sort((a, b) => b[1] - a[1])
        .map(([level, count]) => `<p><strong>${level}:</strong> ${count} applicants</p>`).join('');
    }

    function renderTable() {
      const tbody = document.querySelector('#candidateTable tbody');
      tbody.innerHTML = '';
      
      if (candidates.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" style="text-align: center; padding: 30px; color: #666;">No applications yet</td></tr>';
        return;
      }
      
      candidates.forEach((c) => {
        const fullName = `${c.title ? c.title + ' ' : ''}${c.firstName} ${c.middleName ? c.middleName + ' ' : ''}${c.lastName}`;
        const resumeLink = c.resume ? `<a href="${c.resume}" download="resume_${c.firstName}_${c.lastName}.pdf" class="resume-link">Download</a>` : 'N/A';
        const location = `${c.city}, ${c.state}`;
        
        const row = `
          <tr>
            <td>${fullName}</td>
            <td>${c.email}</td>
            <td>${c.phone}</td>
            <td>${c.jobTitle}</td>
            <td>${c.experience} yrs</td>
            <td>${c.educationLevel}</td>
            <td>${c.expectedSalary}</td>
            <td>${location}</td>
            <td style="font-size: 0.85em;">${c.submittedDate}</td>
            <td>${resumeLink}</td>
            <td class="action-buttons">
              <button style="background: #3498db; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 5px;" onclick="viewCandidate(${c.id})">View</button>
              <button class="btn-delete" onclick="deleteCandidate(${c.id})">Delete</button>
            </td>
          </tr>
        `;
        tbody.innerHTML += row;
      });
    }

    // Make functions available globally
    window.deleteCandidate = deleteCandidate;
    window.viewCandidate = viewCandidate;
    window.closeDetailModal = closeDetailModal;
    window.exportToCSV = exportToCSV;
    window.clearAllData = clearAllData;
    window.viewDetailedReport = viewDetailedReport;

    // Initial render
    renderTable();

    