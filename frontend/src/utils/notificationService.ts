// Classivo Notification Service using NTFY.sh
export interface NotificationConfig {
  topic: string;
  title: string;
  message: string;
  priority?: 'min' | 'low' | 'default' | 'high' | 'max';
  tags?: string[];
  click?: string;
  icon?: string;
}

export interface DailyScheduleEntry {
  time: string;
  subject: string;
}

export class ClassivoNotificationService {
  private static readonly NTFY_BASE_URL = 'https://ntfy.sh';
  private static readonly DEFAULT_TOPIC = 'Classivo-academic-app';

  /**
   * Send a notification via NTFY.sh
   */
  static async sendNotification(config: NotificationConfig): Promise<boolean> {
    try {
      const headers: Record<string, string> = {
        'Title': config.title,
        'Priority': (config.priority || 'default').toString(),
      };
      if (config.tags && config.tags.length > 0) headers['Tags'] = config.tags.join(',');
      if (config.click) headers['Click'] = config.click;
      if (config.icon) headers['Icon'] = config.icon;

      const response = await fetch(`${this.NTFY_BASE_URL}/${config.topic}`, {
        method: 'POST',
        headers,
        body: config.message,
        mode: 'cors',
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  /**
   * Send daily schedule notification
   */
  static async sendDailySchedule(userTopic: string, schedule: DailyScheduleEntry[]): Promise<boolean> {
    const scheduleText = schedule.length > 0
      ? schedule.map((s) => `${s.time}: ${s.subject}`).join('\n')
      : 'No classes scheduled for today';

    return this.sendNotification({
      topic: userTopic,
      title: '🗓️ Today\'s Schedule - Classivo',
      message: `Good morning! Here's your schedule:\n\n${scheduleText}`,
      priority: 'high',
      tags: ['skull', 'schedule', 'Classivo'],
      click: `${process.env.NEXT_PUBLIC_APP_URL}/app/dashboard`,
    });
  }

  /**
   * Send low attendance alert
   */
  static async sendAttendanceAlert(userTopic: string, subject: string, percentage: number): Promise<boolean> {
    return this.sendNotification({
      topic: userTopic,
      title: '⚠️ Low Attendance Alert - Classivo',
      message: `Your attendance in ${subject} has dropped to ${percentage}%. Consider attending upcoming classes to maintain the 75% requirement.`,
      priority: 'high',
      tags: ['skull', 'attendance', 'alert', 'Classivo'],
      click: `${process.env.NEXT_PUBLIC_APP_URL}/app/attendance`,
    });
  }

  /**
   * Send exam reminder notification
   */
  static async sendExamReminder(userTopic: string, exam: string, date: string): Promise<boolean> {
    return this.sendNotification({
      topic: userTopic,
      title: '📚 Exam Reminder - Classivo',
      message: `Reminder: ${exam} is scheduled for ${date}. Start your preparation!`,
      priority: 'high',
      tags: ['skull', 'exam', 'reminder', 'Classivo'],
      click: `${process.env.NEXT_PUBLIC_APP_URL}/app/marks`,
    });
  }

  /**
   * Generate a unique topic for a user
   */
  static generateUserTopic(userId: string): string {
    return `Classivo-user-${userId.replace(/[^a-zA-Z0-9]/g, '')}`;
  }

  /**
   * Subscribe to notifications (web push)
   */
  static subscribeToNotifications(topic: string): string {
    // Return subscription URL for user to add to their NTFY app
    return `${this.NTFY_BASE_URL}/${topic}`;
  }
}

// Notification scheduler for client-side
export class ClassivoNotificationScheduler {
  private static scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();
  private static readonly IST_OFFSET_MINUTES = 330;

  /**
   * Schedule a daily notification
   */
  static scheduleDailyNotification(topic: string, hour: number = 8, minute: number = 0) {
    const now = new Date();
    const nowIST = this.toIST(now);
    const scheduledIST = new Date(nowIST);
    scheduledIST.setHours(hour, minute, 0, 0);

    if (scheduledIST <= nowIST) {
      scheduledIST.setDate(scheduledIST.getDate() + 1);
    }

    const timeUntilNotification = scheduledIST.getTime() - nowIST.getTime();

    const timeoutId = setTimeout(() => {
      // This would trigger the daily schedule notification
      // In a real app, this would be handled by a backend service
      console.log('Daily notification triggered for topic:', topic);

      // Reschedule for next day
      this.scheduleDailyNotification(topic, hour, minute);
    }, timeUntilNotification);

    this.scheduledNotifications.set(`daily-${topic}`, timeoutId);
  }

  /**
   * Cancel scheduled notification
   */
  static cancelScheduledNotification(key: string) {
    const timeoutId = this.scheduledNotifications.get(key);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledNotifications.delete(key);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  static cancelAllNotifications() {
    this.scheduledNotifications.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledNotifications.clear();
  }

  private static toIST(date: Date): Date {
    const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
    return new Date(utcTime + this.IST_OFFSET_MINUTES * 60000);
  }
}

