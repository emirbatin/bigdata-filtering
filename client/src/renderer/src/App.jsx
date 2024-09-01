import React, { useEffect } from 'react';
import FilterForm from './components/FilterForm';
import LoginView from './components/LoginView';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import AdminView from './components/AdminView';
import RegisterView from './components/RegisterView';

const App = () => {
  
  return (
    <Routes>
      <Route path="/FilterForm" element={<FilterForm />} />
      <Route path='/Admin' element={<AdminView/>}/>
      <Route path="/" element={<LoginView />} />
    </Routes>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
