import React from 'react';
import { Outlet } from 'react-router-dom';

const DebugLayout = () => {
    return (
        <div style={{ padding: 20, border: '5px solid red', backgroundColor: 'white' }}>
            <h1>DEBUG LAYOUT</h1>
            <p>If you see this, the layout switching works.</p>
            <Outlet />
        </div>
    );
};

export default DebugLayout;
