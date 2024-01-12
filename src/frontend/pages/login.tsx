import React from 'react';
import * as ReactDOM from 'react-dom/client'
import LoginForm from '../components/LoginForm';

const loginContainer = document.querySelector('#login-container')

if (loginContainer) {
    
    ReactDOM.createRoot(loginContainer)
        .render(<LoginForm />);
}