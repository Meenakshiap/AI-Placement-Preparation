const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => {
  const token = localStorage.getItem('prep_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  async register(data: any) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async login(credentials: { email: string; password?: string }) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return res.json();
  },

  async demoLogin() {
    const res = await fetch(`${API_BASE_URL}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders()
    });
    const data = await res.json();
    return { ...data, status: res.status };
  },

  // Profile & Companies
  async getProfile() {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async getActivity(category: 'programming' | 'aptitude') {
    const res = await fetch(`${API_BASE_URL}/profile/activity?category=${category}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async updateProfile(updates: any) {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async getCompanies() {
    const res = await fetch(`${API_BASE_URL}/companies`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Unable to load company blueprints.');
    }
    return data;
  },

  async getCompany(id: string) {
    const res = await fetch(`${API_BASE_URL}/companies/${encodeURIComponent(id)}`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Unable to load this company blueprint.');
    }
    return data;
  },

  async getProblems() {
    const res = await fetch(`${API_BASE_URL}/problems`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Unable to load coding problems.');
    return data;
  },

  async getProblem(id: string) {
    const res = await fetch(`${API_BASE_URL}/problems/${encodeURIComponent(id)}`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Unable to load this problem.');
    return data;
  },

  async runCode(data: { problemId: string; language: string; code: string }) {
    const res = await fetch(`${API_BASE_URL}/code/run`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok || !result.success) throw new Error(result.message || 'Unable to run your code.');
    return result;
  },

  async submitCode(data: { problemId: string; language: string; code: string }) {
    const res = await fetch(`${API_BASE_URL}/code/submit`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok || !result.success) throw new Error(result.message || 'Unable to submit your code.');
    return result;
  },

  async getTracks() {
    const res = await fetch(`${API_BASE_URL}/tracks`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Unable to load language tracks.');
    return data;
  },

  async getTrack(id: string) {
    const res = await fetch(`${API_BASE_URL}/tracks/${encodeURIComponent(id)}`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Unable to load this language track.');
    return data;
  },

  async startTrack(id: string) {
    const res = await fetch(`${API_BASE_URL}/tracks/${encodeURIComponent(id)}/start`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({})
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Unable to start this track.');
    return data;
  },

  async runTrackModule(trackId: string, moduleId: string, code: string) {
    const res = await fetch(`${API_BASE_URL}/tracks/${encodeURIComponent(trackId)}/modules/${encodeURIComponent(moduleId)}/run`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ code })
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Unable to run this example.');
    return data;
  },

  async submitTrackQuiz(trackId: string, moduleId: string, answers: Record<string, string>) {
    const res = await fetch(`${API_BASE_URL}/tracks/${encodeURIComponent(trackId)}/modules/${encodeURIComponent(moduleId)}/quiz`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ answers })
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Unable to submit this quiz.');
    return data;
  },

  // Diagnostic Assessment
  async getDiagnosticQuestions() {
    const res = await fetch(`${API_BASE_URL}/assessment/diagnostic`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async submitDiagnosticAssessment(answers: { questionId: string; selectedOption: string; timeSpentSeconds?: number }[]) {
    const res = await fetch(`${API_BASE_URL}/assessment/diagnostic/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ answers })
    });
    return res.json();
  },

  async getAssessmentStatus() {
    const res = await fetch(`${API_BASE_URL}/assessment/status`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Dashboard & Recommendations
  async getDashboardOverview() {
    const res = await fetch(`${API_BASE_URL}/dashboard/overview`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async toggleMission(missionId: string) {
    const res = await fetch(`${API_BASE_URL}/dashboard/missions/${missionId}/toggle`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return res.json();
  }
};
