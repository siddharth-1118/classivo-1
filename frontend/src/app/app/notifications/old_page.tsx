"use client";
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Bell, Skull, Clock, AlertTriangle, BookOpen, Copy, Check, ShieldCheck, Zap, ChevronLeft } from 'lucide-react';
import { ClassivoNotificationService } from '@/utils/notificationService';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/Badge';
import { toast } from 'sonner';

const NotificationSettings: React.FC = () => {
  const [userTopic, setUserTopic] = useState<string>('');
  const [notificationUrl, setNotificationUrl] = useState<string>('');
  const [settings, setSettings] = useState({
    dailySchedule: true,
    attendanceAlerts: true,
    examReminders: true,
    scheduleTime: '08:00'
  });
  const [copied, setCopied] = useState(false);
  const [testNotification, setTestNotification] = useState(false);

  useEffect(() => {
    // Generate or load user topic
    const savedTopic = localStorage.getItem('Classivo-notification-topic');
    if (savedTopic) {
      setUserTopic(savedTopic);
      setNotificationUrl(ClassivoNotificationService.subscribeToNotifications(savedTopic));
    } else {
      const newTopic = ClassivoNotificationService.generateUserTopic(Date.now().toString());
      setUserTopic(newTopic);
      setNotificationUrl(ClassivoNotificationService.subscribeToNotifications(newTopic));
      localStorage.setItem('Classivo-notification-topic', newTopic);
    }

    // Load saved settings
    const savedSettings = localStorage.getItem('Classivo-notification-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('Classivo-notification-settings', JSON.stringify(settings));
    toast.success("Notification preferences saved");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(notificationUrl);
      setCopied(true);
      toast.success("Topic URL copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error("Failed to copy URL");
    }
  };

  const sendTestNotification = async () => {
    setTestNotification(true);
    try {
      await ClassivoNotificationService.sendNotification({
        topic: userTopic,
        title: 'Verifed Access',
        message: 'System communication channels verified. Expect academic updates.',
        priority: 'high',
        tags: ['shield', 'Classivo'],
      });
      toast.success("Test signal transmitted");
    } catch (e) {
      toast.error("Signal transmission failed");
    }

    setTimeout(() => {
      setTestNotification(false);
    }, 2000);
  };

  return (
    <main className="min-h-screen w-full bg-zinc-950 text-white overflow-y-auto pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 sm:py-12 space-y-8">
        <div className="absolute top-6 left-6 bg-zinc-900/50 p-3 rounded-full border border-zinc-800"><Link href="/app/settings"><ChevronLeft size={24} /></Link></div>
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-zinc-400 text-sm sm:text-base">
            Configure system alerts and academic protocol updates.
          </p>
        </div>

        {/* Configuration Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={18} className="text-premium-gold" />
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
              System Configuration
            </h2>
          </div>

          <Card className="p-0 overflow-hidden bg-zinc-900/20 border-zinc-800/50">
            {/* Step 1 */}
            <div className="p-4 sm:p-6 border-b border-zinc-800/50">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-sm font-bold text-zinc-400">1</div>
                <div>
                  <h3 className="font-medium text-white mb-1">Install NTFY Client</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Deploy the NTFY application from mobile repositories (App Store / Play Store) or access via <a href="https://ntfy.sh" target="_blank" className="text-premium-gold hover:underline">ntfy.sh</a>.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 sm:p-6 border-b border-zinc-800/50">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-sm font-bold text-zinc-400">2</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white mb-1">Establish Connection</h3>
                  <p className="text-sm text-zinc-400 mb-3">
                    Copy your secure channel endpoint and subscribe within the app:
                  </p>
                  <div className="flex items-center gap-2 p-2 bg-zinc-950/50 rounded-lg border border-zinc-800/50 group">
                    <code className="flex-1 text-xs sm:text-sm text-zinc-300 font-mono break-all px-2">
                      {notificationUrl}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyToClipboard}
                      className="shrink-0 h-8 w-8 text-zinc-500 hover:text-white"
                    >
                      {copied ? <Check size={14} className="text-premium-gold" /> : <Copy size={14} />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 sm:p-6 bg-zinc-900/30">
              <div className="flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-sm font-bold text-zinc-400">3</div>
                <div className="flex-1 flex justify-between items-center gap-4">
                  <div>
                    <h3 className="font-medium text-white">Verify Uplink</h3>
                    <p className="text-xs text-zinc-500 hidden sm:block">Send a test packet to confirm connectivity.</p>
                  </div>
                  <Button
                    onClick={sendTestNotification}
                    disabled={testNotification}
                    size="sm"
                    className="shrink-0 bg-white/5 hover:bg-white/10 text-white border-white/10"
                  >
                    {testNotification ? (
                      <Zap size={16} className="animate-spin" />
                    ) : (
                      "Test Signal"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Alert Protocols */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} className="text-premium-gold" />
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
              Alert Protocols
            </h2>
          </div>

          <div className="space-y-4">
            {/* Daily Schedule */}
            <Card className="p-4 sm:p-5 flex items-start justify-between gap-4 bg-zinc-900/20 border-zinc-800/50">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400 mt-1">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="font-medium text-white text-sm sm:text-base">Daily Schedule Matrix</h3>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                    Morning briefing of your academic schedule.
                  </p>
                  {settings.dailySchedule && (
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="time"
                        value={settings.scheduleTime}
                        onChange={(e) => setSettings({ ...settings, scheduleTime: e.target.value })}
                        className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-premium-gold/50 transition-colors"
                      />
                      <span className="text-[10px] text-zinc-600 uppercase font-medium">Dispatch Time</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center h-6 mt-2">
                <input
                  type="checkbox"
                  checked={settings.dailySchedule}
                  onChange={(e) => setSettings({ ...settings, dailySchedule: e.target.checked })}
                  className="accent-premium-gold h-4 w-4 rounded border-zinc-700 bg-zinc-800 focus:ring-premium-gold/20"
                />
              </div>
            </Card>

            {/* Attendance Alerts */}
            <Card className="p-4 sm:p-5 flex items-start justify-between gap-4 bg-zinc-900/20 border-zinc-800/50">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400 mt-1">
                  <AlertTriangle size={18} className="text-amber-500/80" />
                </div>
                <div>
                  <h3 className="font-medium text-white text-sm sm:text-base">Attendance Thresholds</h3>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                    Immediate warnings when course attendance drops below 75%.
                  </p>
                </div>
              </div>
              <div className="flex items-center h-6 mt-2">
                <input
                  type="checkbox"
                  checked={settings.attendanceAlerts}
                  onChange={(e) => setSettings({ ...settings, attendanceAlerts: e.target.checked })}
                  className="accent-premium-gold h-4 w-4 rounded border-zinc-700 bg-zinc-800 focus:ring-premium-gold/20"
                />
              </div>
            </Card>

            {/* Exam Reminders */}
            <Card className="p-4 sm:p-5 flex items-start justify-between gap-4 bg-zinc-900/20 border-zinc-800/50">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400 mt-1">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 className="font-medium text-white text-sm sm:text-base">Examination Alerts</h3>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                    Advance notifications for internal assessments and semester exams.
                  </p>
                </div>
              </div>
              <div className="flex items-center h-6 mt-2">
                <input
                  type="checkbox"
                  checked={settings.examReminders}
                  onChange={(e) => setSettings({ ...settings, examReminders: e.target.checked })}
                  className="accent-premium-gold h-4 w-4 rounded border-zinc-700 bg-zinc-800 focus:ring-premium-gold/20"
                />
              </div>
            </Card>
          </div>
        </section>

        {/* Footer Actions */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={saveSettings}
            className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200"
          >
            Save Preferences
          </Button>
        </div>

        {/* Privacy Note */}
        <p className="text-center text-xs text-zinc-700 pt-8">
          🔒 End-to-end encrypted locally. Classivo does not store your notification data.
        </p>

      </div>
    </main>
  );
};

export default NotificationSettings;


