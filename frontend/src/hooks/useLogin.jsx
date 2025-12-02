import { useState } from 'react';

const useLogin = () => {
    const [errorEmail, setErrorEmail] = useState('');
    const [errorPassword, setErrorPassword] = useState('');

    const errorData = (dataMessage) => {
        if (dataMessage) {
            if (dataMessage.includes('email') || dataMessage.includes('Email')) {
                setErrorEmail(dataMessage);
            } else if (dataMessage.includes('password') || dataMessage.includes('contraseña')) {
                setErrorPassword(dataMessage);
            }
        }
    };

    const handleInputChange = () => {
        setErrorEmail('');
        setErrorPassword('');
    };

    return {
        errorEmail,
        errorPassword,
        errorData,
        handleInputChange
    };
};

export default useLogin;
