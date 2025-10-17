
import React from 'react';

const Loader: React.FC = () => (
    <div className="loader" style={{
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #f97316',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite'
    }}>
        <style>{`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

export default Loader;
