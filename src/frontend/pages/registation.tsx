import React from 'react';
import * as ReactDOM from 'react-dom/client'
import RegistrationForm from '../components/RegistrationForm';

const registrationContainer = document.querySelector('#registration-container')

if (registrationContainer) {
    
    ReactDOM.createRoot(registrationContainer)
        .render(<RegistrationForm />);
}