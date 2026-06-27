import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/ToastProvider';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader2, Monitor, Smartphone, Globe, ShieldAlert, LogOut } from 'lucide-react';

interface UserSession {
  sessionId: string;
  loginTime: string;
  ipAddress?: string;
  browser?: string;
  os?: string;
  device?: string;
  country?: string;
}

export const MySessions: React.FC = () => {
  const toast = useToast();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);

  // Fetch active sessions
  const fetchSessions = async () => {
    try {
      const response = await api.get('/auth/sessions');
      setSessions(response.data.data.sessions || []);
    } catch (error: any) {
      toast.error('Fetch Failed', 'Failed to retrieve active login sessions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Revoke specific session device
  const handleRevokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      toast.success('Session Revoked', 'The target device session has been terminated.');
      // Refresh list
      fetchSessions();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to revoke device session.';
      toast.error('Revoke Failed', message);
    } finally {
      setRevokingId(null);
    }
  };

  // Revoke all sessions (except current)
  const handleRevokeAllSessions = async () => {
    if (!window.confirm('Are you sure you want to terminate all other device sessions? You will remain logged in on this device.')) {
      return;
    }
    setIsRevokingAll(true);
    try {
      await api.delete('/auth/sessions');
      toast.success('All Sessions Revoked', 'All other active device sessions have been terminated.');
      fetchSessions();
    } catch (error: any) {
      toast.error('Revoke Failed', 'Failed to revoke device sessions.');
    } finally {
      setIsRevokingAll(false);
    }
  };

  return (
    <div className="space-y-6 select-none max-w-4xl">
      {/* Header Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-none mb-1">My Device Sessions</h1>
          <p className="text-xs text-slate-450 font-medium">Monitor and manage devices connected to your account</p>
        </div>
        
        {sessions.length > 1 && (
          <Button
            onClick={handleRevokeAllSessions}
            disabled={isRevokingAll}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl shadow-glossy-sm transition-all"
          >
            {isRevokingAll ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <LogOut size={12} />
            )}
            <span>Revoke Other Devices</span>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <Card className="p-8 text-center flex flex-col items-center justify-center border-slate-100 bg-white/70 backdrop-blur-xl">
          <ShieldAlert size={36} className="text-slate-300 mb-2" />
          <p className="text-sm font-bold text-slate-700">No Active Sessions</p>
          <p className="text-xs text-slate-400 mt-1">We could not retrieve any active session details.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session, idx) => {
            const isMobile = session.device === 'Mobile' || session.device === 'Tablet';
            
            return (
              <Card
                key={session.sessionId}
                className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white/70 backdrop-blur-xl border-slate-100 shadow-glossy-sm relative overflow-hidden"
              >
                {/* Visual marker for first/current session */}
                {idx === 0 && (
                  <div className="absolute left-0 inset-y-0 w-1 bg-brand-550" />
                )}

                <div className="flex gap-4 items-start">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-450 mt-0.5">
                    {isMobile ? <Smartphone size={20} /> : <Monitor size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs font-bold text-slate-850">
                        {session.os || 'Unknown OS'} • {session.browser || 'Unknown Browser'}
                      </h3>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 text-[9px] font-black text-brand-700 bg-brand-50 border border-brand-100 rounded-lg uppercase tracking-wider">
                          Current Device
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-3 text-[11px] font-medium text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Globe size={11} />
                        <span>IP: {session.ipAddress || '127.0.0.1'}</span>
                      </span>
                      <span>•</span>
                      <span>Logged In: {new Date(session.loginTime).toLocaleString()}</span>
                      {session.country && (
                        <>
                          <span>•</span>
                          <span>Location: {session.country}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {idx !== 0 && (
                  <Button
                    onClick={() => handleRevokeSession(session.sessionId)}
                    disabled={revokingId === session.sessionId}
                    className="sm:self-center py-1.5 px-4 border border-red-200 hover:bg-red-50 text-red-650 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 bg-white transition-all shadow-glossy-sm"
                  >
                    {revokingId === session.sessionId ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <LogOut size={12} />
                    )}
                    <span>Revoke Device</span>
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MySessions;
