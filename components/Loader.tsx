
import React from 'react';

interface LoaderProps {
    message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
    return (
        <div className="fixed inset-0 bg-brand-primary bg-opacity-90 flex flex-col items-center justify-center z-50">
            <div className="w-16 h-16 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-brand-text font-semibold">{message}</p>
        </div>
    );
};

export default Loader;
