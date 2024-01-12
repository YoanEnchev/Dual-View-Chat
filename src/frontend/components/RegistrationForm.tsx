import React, { FC, ChangeEvent, FormEvent, useState } from 'react';
import getAppBaseURL from '../helpers/getAppBaseURL';

const RegistrationForm: FC = () => {

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [formSubmitErrorMessage, setFormSubmitErrorMessage] = useState<string>('');
    const [isLoading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true)

        try {
            const res: Response = await fetch(`${getAppBaseURL()}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            })

            if (res.ok) {
                window.location.href = '/succ-registration'
                return;
            }

            res.json().then(errResponse => setFormSubmitErrorMessage(errResponse.message));
        }
        catch (error) {
            setFormSubmitErrorMessage('Service not available. Please try again later.')
        }
        finally {
            setLoading(false)
        }
    };

    const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
        setFormSubmitErrorMessage('');
    };

    const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
        setFormSubmitErrorMessage('');
    };

    return <form method="post" onSubmit={handleSubmit}>
        <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input type="email" name="email" className="form-control" 
                id="email" required
                value={email}
                onChange={handleEmailChange}/>
        </div>
        <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" name="password" className="form-control" 
                id="password" 
                value={password}
                required
                onChange={handlePasswordChange} />
        </div>

        <button type="submit" className="btn btn-primary" disabled={isLoading}>Register</button>
        
        {isLoading ? <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
        </div> : <></>}

        {formSubmitErrorMessage ? <p className="text-danger">{formSubmitErrorMessage}</p> : <></>}
    </form>
};

export default RegistrationForm;
