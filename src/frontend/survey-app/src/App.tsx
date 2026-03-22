import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import Login from './pages/Login';
import AnswerTemplates from './pages/admin/AnswerTemplates';
import Questions from './pages/admin/Questions';
import Surveys from './pages/admin/Surveys';
import Reports from './pages/admin/Reports';
import MySurveys from './pages/user/MySurveys';
import AnswerSurvey from './pages/user/AnswerSurvey';

function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/admin" element={
              <ProtectedRoute role="Admin"><AdminLayout /></ProtectedRoute>
            }>
              <Route index element={<Navigate to="/admin/templates" replace />} />
              <Route path="templates" element={<AnswerTemplates />} />
              <Route path="questions" element={<Questions />} />
              <Route path="surveys" element={<Surveys />} />
              <Route path="reports" element={<Reports />} />
            </Route>

            <Route path="/user" element={
              <ProtectedRoute role="User"><UserLayout /></ProtectedRoute>
            }>
              <Route index element={<Navigate to="/user/surveys" replace />} />
              <Route path="surveys" element={<MySurveys />} />
              <Route path="surveys/:id/answer" element={<AnswerSurvey />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
