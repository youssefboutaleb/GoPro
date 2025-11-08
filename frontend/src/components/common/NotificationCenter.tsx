
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Bell, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Notification {
  id: string;
  type: 'alert' | 'success' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface NotificationCenterProps {
  userId?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'alert',
      title: 'KPI Alert: Sales Target',
      message: 'Team sales performance is 15% below target for this month',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Visit Completion Alert',
      message: '3 delegates have not completed their weekly visit quota',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'success',
      title: 'Monthly Target Achieved',
      message: 'Congratulations! Your team exceeded the monthly visit target',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
      priority: 'medium'
    },
    {
      id: '4',
      type: 'info',
      title: 'Weekly Report Available',
      message: 'Your weekly performance report is ready for review',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      read: false,
      priority: 'low'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 border-red-300';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300';
      default:
        return 'bg-blue-100 border-blue-300';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-96 sm:max-w-96">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>
        <div className="mt-6 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`cursor-pointer transition-all ${
                  !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : 'hover:bg-gray-50'
                } ${getPriorityColor(notification.priority)}`}
                onClick={() => markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          <Badge 
                            variant={notification.priority === 'high' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="p-1 h-6 w-6"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenter;
