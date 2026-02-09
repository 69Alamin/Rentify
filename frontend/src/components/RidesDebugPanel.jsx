import { useState, useEffect } from 'react';

export default function RidesDebugPanel() {
    const [debugInfo, setDebugInfo] = useState({
        apiCalled: false,
        response: null,
        error: null,
        ridesCount: 0,
        timestamp: null,
        sessionCheck: null
    });

    const checkSession = async () => {
        try {
            const res = await fetch('/api/diagnostic_session.php', { credentials: 'include' });
            const data = await res.json();
            setDebugInfo(prev => ({ ...prev, sessionCheck: data }));
        } catch (err) {
            setDebugInfo(prev => ({ ...prev, sessionCheck: { error: err.message } }));
        }
    };

    const testRidesAPI = async () => {
        const startTime = Date.now();
        try {
            const res = await fetch('/api/rides/request.php', { credentials: 'include' });
            const data = await res.json();
            const endTime = Date.now();
            
            setDebugInfo({
                apiCalled: true,
                response: data,
                error: null,
                ridesCount: data.success ? (data.data?.length || 0) : 0,
                timestamp: new Date().toLocaleString(),
                responseTime: endTime - startTime,
                sessionCheck: debugInfo.sessionCheck
            });
        } catch (err) {
            setDebugInfo({
                apiCalled: true,
                response: null,
                error: err.message,
                ridesCount: 0,
                timestamp: new Date().toLocaleString(),
                sessionCheck: debugInfo.sessionCheck
            });
        }
    };

    useEffect(() => {
        checkSession();
        testRidesAPI();
    }, []);

    return (
        <div className="fixed bottom-4 right-4 w-96 bg-black/90 text-white p-4 rounded-lg shadow-2xl z-50 max-h-[80vh] overflow-y-auto text-xs font-mono">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/20">
                <h3 className="font-bold text-yellow-400">🔧 RIDES DEBUG</h3>
                <button 
                    onClick={testRidesAPI}
                    className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 text-[10px]"
                >
                    Refresh
                </button>
            </div>

            {/* Session Info */}
            <div className="mb-3 p-2 bg-white/5 rounded">
                <div className="font-bold text-cyan-400 mb-1">SESSION:</div>
                {debugInfo.sessionCheck ? (
                    <pre className="text-[10px] text-green-300 whitespace-pre-wrap">
                        {JSON.stringify(debugInfo.sessionCheck, null, 2)}
                    </pre>
                ) : (
                    <span className="text-gray-400">Checking...</span>
                )}
            </div>

            {/* API Status */}
            <div className="mb-3 p-2 bg-white/5 rounded">
                <div className="font-bold text-purple-400 mb-1">API STATUS:</div>
                <div className="space-y-1">
                    <div>Called: <span className={debugInfo.apiCalled ? 'text-green-400' : 'text-red-400'}>
                        {debugInfo.apiCalled ? 'YES' : 'NO'}
                    </span></div>
                    <div>Count: <span className="text-yellow-300">{debugInfo.ridesCount}</span></div>
                    {debugInfo.timestamp && <div>Time: {debugInfo.timestamp}</div>}
                    {debugInfo.responseTime && <div>Response: {debugInfo.responseTime}ms</div>}
                </div>
            </div>

            {/* Error */}
            {debugInfo.error && (
                <div className="mb-3 p-2 bg-red-500/20 rounded border border-red-500">
                    <div className="font-bold text-red-400 mb-1">ERROR:</div>
                    <div className="text-red-300">{debugInfo.error}</div>
                </div>
            )}

            {/* Response Data */}
            {debugInfo.response && (
                <div className="p-2 bg-white/5 rounded">
                    <div className="font-bold text-green-400 mb-1">RESPONSE:</div>
                    <pre className="text-[9px] text-gray-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
                        {JSON.stringify(debugInfo.response, null, 2)}
                    </pre>
                </div>
            )}

            {/* Sample Rides */}
            {debugInfo.response?.success && debugInfo.response.data?.length > 0 && (
                <div className="mt-3 p-2 bg-white/5 rounded">
                    <div className="font-bold text-orange-400 mb-1">FIRST 2 RIDES:</div>
                    {debugInfo.response.data.slice(0, 2).map(ride => (
                        <div key={ride.id} className="mb-2 p-2 bg-black/30 rounded text-[10px]">
                            <div className="text-yellow-300">ID: {ride.id} | Status: {ride.status}</div>
                            <div className="text-blue-300">From: {ride.pickup_address}</div>
                            <div className="text-green-300">To: {ride.destination_address || ride.destination_name}</div>
                            <div className="text-purple-300">Fare: ৳{ride.estimated_fare}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
