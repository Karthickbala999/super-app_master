import React, { useState, useEffect } from 'react';
import Header from '../SubPages/Header';
import Footer from '../SubPages/Footer';
import notificationService from '../../services/notificationService';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaBell,
    FaShoppingBag,
    FaTag,
    FaCalendarCheck,
    FaTrash,
    FaCheckCircle,
    FaShippingFast,
    FaBoxOpen
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Notification() {
    const [notifications, setNotifications] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        const data = await notificationService.getNotifications();
        setNotifications(data);
    };

    const handleMarkAsRead = async (id) => {
        await notificationService.markAsRead(id);
        loadNotifications();
    };

    const handleClearAll = async () => {
        if (window.confirm('Clear all notifications?')) {
            await notificationService.clearAll();
            loadNotifications();
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order': return <FaShoppingBag className="text-blue-500" />;
            case 'offer': return <FaTag className="text-orange-500" />;
            case 'status_confirmed': return <FaCheckCircle className="text-green-500" />;
            case 'status_shipped': return <FaShippingFast className="text-purple-500" />;
            case 'status_delivered': return <FaBoxOpen className="text-green-600" />;
            default: return <FaBell className="text-gray-400" />;
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'all') return true;
        if (activeTab === 'orders') return n.type?.startsWith('status') || n.type === 'order';
        if (activeTab === 'offers') return n.type === 'offer';
        return true;
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className='bg-[#F8F8F8] min-h-screen flex flex-col'>
            <Header />
            <div className='flex-1 px-4 pt-24 pb-28 max-w-lg mx-auto w-full'>
                <div className='flex justify-between items-center mb-6'>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-800'>Notifications</h1>
                        <p className='text-sm text-gray-500'>Keep track of your grocery orders</p>
                    </div>
                    {notifications.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className='p-2 text-gray-400 hover:text-red-500 transition-colors'
                            title="Clear All"
                        >
                            <FaTrash size={18} />
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className='flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl'>
                    {['all', 'orders', 'offers'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${activeTab === tab
                                    ? 'bg-white text-[#5C3FFF] shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Notifications List */}
                <div className='space-y-4'>
                    <AnimatePresence mode="popLayout">
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((n) => (
                                <motion.div
                                    key={n.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={() => handleMarkAsRead(n.id)}
                                    className={`relative p-4 rounded-2xl border transition-all cursor-pointer ${n.read
                                            ? 'bg-white border-transparent'
                                            : 'bg-white border-[#5C3FFF]/30 shadow-sm'
                                        }`}
                                >
                                    {!n.read && (
                                        <div className="absolute top-4 right-4 w-2 h-2 bg-[#5C3FFF] rounded-full" />
                                    )}
                                    <div className='flex gap-4'>
                                        <div className='w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl shrink-0'>
                                            {getIcon(n.type)}
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <h3 className={`font-semibold text-gray-900 truncate ${!n.read ? 'pr-4' : ''}`}>
                                                {n.title}
                                            </h3>
                                            <p className='text-sm text-gray-600 mt-1 leading-relaxed'>
                                                {n.message}
                                            </p>
                                            <div className='flex justify-between items-center mt-3'>
                                                <span className='text-[10px] uppercase tracking-wider text-gray-400 font-bold'>
                                                    {n.type?.replace('_', ' ') || 'Notification'}
                                                </span>
                                                <span className='text-[10px] text-gray-400'>
                                                    {formatDate(n.date)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className='flex flex-col items-center justify-center py-20 text-center'
                            >
                                <div className='w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4'>
                                    <FaBell className='text-gray-200 text-4xl' />
                                </div>
                                <h3 className='text-lg font-medium text-gray-800'>No notifications yet</h3>
                                <p className='text-gray-500 text-sm mt-1'>
                                    When order updates or offers arrive, you'll find them here.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Demo/Helper Section - Only for testing */}
                <div className='mt-10 p-4 bg-purple-50 rounded-2xl border border-purple-100 hidden'>
                    <h4 className='text-xs font-bold text-purple-600 uppercase mb-2'>Debug Panel</h4>
                    <button
                        onClick={() => notificationService.addNotification({
                            title: 'Order Delivered!',
                            message: 'Your order #OD-1234 has been delivered successfully. Rate your experience!',
                            type: 'status_delivered'
                        }).then(loadNotifications)}
                        className='text-xs bg-purple-600 text-white px-3 py-1 rounded-full'
                    >
                        Simulate Delivery
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Notification;