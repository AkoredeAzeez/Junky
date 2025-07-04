// Generic login for any role
export async function loginUser(email, password, role) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role })
  });
  if (!response.ok) throw new Error('Invalid credentials');
  return response.json();
}

// Patient login (uses general auth endpoint)
export async function loginPatient(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role: 'patient' })
  });
  if (!response.ok) throw new Error('Invalid credentials');
  return response.json();
}

// Donor login
export async function loginDonor(email, password) {
  const response = await fetch('/api/donor/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) throw new Error('Invalid credentials');
  return response.json();
}

// Hospital login (uses general auth endpoint)
export async function loginHospital(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role: 'hospital' })
  });
  if (!response.ok) throw new Error('Invalid credentials');
  return response.json();
}

// Admin login
export async function loginAdmin(email, password) {
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) throw new Error('Invalid credentials');
  return response.json();
}

// Patient signup
export async function signupPatient(data) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, role: 'patient' })
  });
  if (!response.ok) throw new Error('Registration failed');
  return response.json();
}

// Donor signup
export async function signupDonor(data) {
  const response = await fetch('/api/donor/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Registration failed');
  return response.json();
}

// Hospital signup (with file upload)
export async function signupHospital(data) {
  const formData = new FormData();
  for (const key in data) {
    if (key === 'documents' && Array.isArray(data.documents)) {
      data.documents.forEach((file) => formData.append('documents', file));
    } else {
      formData.append(key, data[key]);
    }
  }
  const response = await fetch('/api/hospital/register', {
    method: 'POST',
    body: formData
  });
  if (!response.ok) throw new Error('Registration failed');
  return response.json();
} 
