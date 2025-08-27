import React from 'react';
import { Bell, Gift, ChevronRight, Star, Clock, AlertCircle, CheckCircle2, Info } from 'lucide-react';

const notifications = [
  {
    id: 1,
    type: 'success',
    title: `Let's make India better`,
    message:   `Assign complaints to yourself, discuss permanent solutions for that area, contact the govt official and give updates to the users.`,
    time: '2 minutes ago',
    icon: CheckCircle2
  },

];

const benefits = [
  {
    id: 1,
    company: 'BookR',
    offer: '50% off on Subscription',
    description: 'Order your favorite books for free on monthly subscription basis, read and return,  email at business@revtrance.com to get the codes',
    rating: 4.8,
    expires: '30 days left',
    logo: '📚'
  }
 
 
];

function DashboardMain() {
  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome to the Dashboard!</h1>
              <p className="text-gray-600 mt-1">This is your administrative dashboard.</p>
            </div>
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        
        {/* Important Notifications */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center">
              <Bell className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Important Notifications</h2>
              <span className="ml-auto bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                {notifications.length} new
              </span>
            </div>
          </div>
          <div className="divide-y">
            {notifications.map((notification) => {
              const IconComponent = notification.icon;
              return (
                <div key={notification.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className={`mr-3 mt-1 ${getNotificationColor(notification.type)}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {notification.time}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Get Benefits Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Gift className="w-5 h-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Get Benefits</h2>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                View all
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex overflow-x-auto space-x-4 pb-2">
              {benefits.map((benefit) => (
                <div key={benefit.id} className="flex-shrink-0 w-72">
                  <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{benefit.logo}</span>
                        <div>
                          <h3 className="font-medium text-gray-900">{benefit.company}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                            {benefit.rating}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                        {benefit.expires}
                      </span>
                    </div>
                    
                    <p className="font-medium text-gray-900 mb-2">{benefit.offer}</p>
                    <p className="text-sm text-gray-600 mb-4">{benefit.description}</p>
                    
                    {/* <button className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition-colors">
                      Claim Offer
                    </button> */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardMain;