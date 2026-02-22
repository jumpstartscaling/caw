import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import FactoryOptionsModal from './FactoryOptionsModal';

interface SendToFactoryButtonProps {
    postId: number;
    postTitle: string;
    siteUrl: string;
    siteAuth?: string;
    onSuccess?: (result: any) => void;
    onError?: (error: string) => void;
    variant?: 'default' | 'small' | 'icon';
}

export default function SendToFactoryButton({
    postId,
    postTitle,
    siteUrl,
    siteAuth,
    onSuccess,
    onError,
    variant = 'default'
}: SendToFactoryButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleClick = () => {
        setShowModal(true);
    };

    const handleSend = async (options: any) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/factory/send-to-factory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source: {
                        type: 'wordpress',
                        url: siteUrl,
                        postId: postId,
                        auth: siteAuth
                    },
                    options: options
                })
            });

            const result = await response.json();

            if (result.success) {
                onSuccess?.(result);
                setShowModal(false);
            } else {
                onError?.(result.error);
            }
        } catch (error: any) {
            onError?.(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (variant === 'icon') {
        return (
            <>
                <button
                    onClick={handleClick}
                    disabled={isLoading}
                    className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded transition-colors"
                    title="Send to Factory"
                >
                    🏭
                </button>
                {showModal && (
                    <FactoryOptionsModal
                        postTitle={postTitle}
                        onClose={() => setShowModal(false)}
                        onSubmit={handleSend}
                        isLoading={isLoading}
                    />
                )}
            </>
        );
    }

    if (variant === 'small') {
        return (
            <>
                <Button
                    onClick={handleClick}
                    disabled={isLoading}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-500 text-white"
                >
                    {isLoading ? '⏳ Processing...' : '🏭 Send to Factory'}
                </Button>
                {showModal && (
                    <FactoryOptionsModal
                        postTitle={postTitle}
                        onClose={() => setShowModal(false)}
                        onSubmit={handleSend}
                        isLoading={isLoading}
                    />
                )}
            </>
        );
    }

    return (
        <>
            <Button
                onClick={handleClick}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-6 py-3"
            >
                {isLoading ? (
                    <>
                        <span className="animate-spin mr-2">⏳</span>
                        Processing...
                    </>
                ) : (
                    <>
                        <span className="mr-2">🏭</span>
                        Send to Factory
                    </>
                )}
            </Button>
            {showModal && (
                <FactoryOptionsModal
                    postTitle={postTitle}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSend}
                    isLoading={isLoading}
                />
            )}
        </>
    );
}
