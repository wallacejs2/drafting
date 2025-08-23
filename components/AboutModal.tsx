import React from 'react';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-bg-primary p-3 rounded-md text-sm text-accent-primary overflow-x-auto">
        <code>{children}</code>
    </pre>
);

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] flex items-center justify-center p-4 font-sans">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden="true"></div>
            <div className="relative bg-bg-secondary border border-border-primary rounded-lg shadow-2xl w-full max-w-2xl m-auto flex flex-col animate-fade-in">
                <header className="flex items-center justify-between p-4 border-b border-border-primary">
                    <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-primary" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <h2 className="text-xl font-bold text-text-primary">About The Data Source</h2>
                    </div>
                     <button type="button" onClick={onClose} aria-label="Close" className="text-text-secondary p-1 rounded-full hover:bg-bg-primary hover:text-text-primary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                <main className="p-6 overflow-y-auto max-h-[70vh] text-text-secondary space-y-4">
                    <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                        <img src="https://github.com/adamvaldez/ESPN_Extractor/blob/main/images/ESPN-fantasy.png?raw=true" alt="ESPN Logo" className="w-8 h-8" />
                        ESPN Fantasy Data Extractor
                    </h1>
                    <p>
                        This tool leverages the <a href="https://github.com/cwendt94/espn-api" target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline">espn_api</a> Python library to extract comprehensive ESPN Fantasy Football data. The extracted data powers the projections, player info, and historical stats you see in this draft assistant.
                    </p>
                    <p>The project can export the following:</p>
                    <ul className="list-disc list-inside pl-4 space-y-1">
                        <li>ESPN Fantasy Excel Draft CheatSheet, using your league's custom scoring.</li>
                        <li>ESPN Fantasy Draft Data files (CSV or Pipe delimited), perfect for databases.</li>
                        <li>ESPN Fantasy Football League History, including historical data for all teams.</li>
                    </ul>
                    
                    <h2 className="text-xl font-bold text-text-primary pt-4 border-t border-border-primary">Setup & Usage</h2>
                    <p>To use the data extractor, first clone the repository:</p>
                    <CodeBlock>git clone https://github.com/adamvaldez/ESPN_Extractor.git</CodeBlock>
                    
                    <p>Navigate into the repository and install dependencies using Poetry:</p>
                    <CodeBlock>{`cd ESPN_Extractor
pip install poetry
poetry install`}</CodeBlock>

                    <p>Make a copy of the sample config file and update it with your league data:</p>
                    <CodeBlock>cp sample.config.py config.py</CodeBlock>

                    <h3 className="text-lg font-bold text-text-primary">Testing and Quality</h3>
                    <p>The extractor includes tests, linting, and security scanning to ensure code quality:</p>
                    <CodeBlock>{`# Run tests
poetry run pytest

# Run linter
poetry run pylint espn_extractor

# Run security scan
poetry run bandit -r espn_extractor`}</CodeBlock>
                </main>
                <footer className="p-4 border-t border-border-primary text-right">
                    <button onClick={onClose} className="bg-accent-primary text-white font-bold py-2 px-4 rounded-md hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition-colors">
                        Close
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AboutModal;
