import React, { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ExitConfirmation() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Define which paths should trigger the exit confirmation
    // Usually this is just the home screen or main dashboard
    const EXIT_PATHS = ['/home', '/home-clothes', '/home-food', '/home-grocery', '/home-taxi', '/home-hotel', '/porter', '/urban-services', '/urban-services/partner'];

    const isExitPath = EXIT_PATHS.includes(location.pathname);

    useEffect(() => {
        if (!isExitPath) return;

        // 1. Handle Window Close / Reload
        const handleBeforeUnload = (e) => {
            // Standard way to trigger browser's native "Leave site?" dialog
            e.preventDefault();
            e.returnValue = '';
            return '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // 2. Handle Back Button (History API Trap)
        // We push a dummy state so that when user presses BACK, we catch it locally
        // without actually leaving the page URL initially.

        // Push a state when we enter this component (if not already pushed)
        // We use a specific state flag to identify our trap
        window.history.pushState({ exitTrap: true }, '', window.location.href);

        const handlePopState = (event) => {
            // If we popped back to a state that doesn't have our trap, 
            // it means the user pressed Back.
            // event.state might be null or different.

            // We want to prevent immediate navigation away.
            // So we immediately push state again to "restore" the current URL
            // effectively cancelling the back navigation visually, then show modal.
            window.history.pushState({ exitTrap: true }, '', window.location.href);
            setIsOpen(true);
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isExitPath]);

    const confirmExit = () => {
        // User wants to exit.
        // We need to clean up the history trap we pushed.
        // Go back once to undo our "pushState", then go back again to actually exit
        // OR simply close the window / navigate to login depending on "App Exit" definition.
        // For a PWA/Web App, "Exit" usually means going to previous external page or closing tab (which scripts can't always do).

        // Let's try to simulate 'Back' without the trap.
        // We might need to remove the listener temporarily to avoid loop
        // But since we are unmounting or navigating, it might be tricky.

        // Simplest approach for "App Exit": 
        // If it's a mobile wrapped app, maybe `window.close()` works.
        // If it's a browser, maybe navigate to a "Goodbye" or Landing page, or just history.back() multiple times using `navigate(-2)`.

        setIsOpen(false);
        // Go back in history (undoing our trap push)
        navigate(-1);

        // NOTE: In a real browser, you can't force close a tab typically unless opened by script.
        // But we can allow the back navigation to proceed.
        // Since we pushed state, `navigate(-1)` returns to the previous entry.
        // If we want to genuinely "Go Back" from where we came, we might need to go 2 steps back 
        // because we added 1 fake step.

        // Let's assume exiting means "Let the back button work".
        // Since we re-pushed state in handlePopState to show modal, we are currently at TOP.
        // To exit:
        // 1. We permit the back action.
        // Actually, simply calling `navigate(-2)` might be the logical "Back" from the perspective of "before the trap".

        navigate(-2);
    };

    const cancelExit = () => {
        // User wants to stay.
        setIsOpen(false);
        // We already re-pushed the state in handlePopState, so we remain "trapped".
    };

    if (!isExitPath) return null;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[9999]" onClose={() => setIsOpen(false)}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900"
                                >
                                    Confirm Exit
                                </Dialog.Title>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        Are you sure you want to exit the application?
                                    </p>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                        onClick={cancelExit}
                                    >
                                        No, Stay
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                        onClick={confirmExit}
                                    >
                                        Yes, Exit
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
