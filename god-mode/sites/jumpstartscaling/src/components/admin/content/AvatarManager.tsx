// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { getDirectusClient } from '@/lib/directus/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
    initialAvatars?: any[];
    initialVariants?: any[];
}

export default function AvatarManager({ initialAvatars = [], initialVariants = [] }: Props) {
    const [avatars, setAvatars] = useState(initialAvatars);
    const [variants, setVariants] = useState(initialVariants);
    const [selectedAvatar, setSelectedAvatar] = useState(null);

    const getVariantsForAvatar = (avatarKey) => {
        return variants.filter(v => v.avatar_key === avatarKey);
    };


    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="text-3xl font-bold text-white">{avatars.length}</div>
                        <div className="text-sm text-slate-400">Base Avatars</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="text-3xl font-bold text-white">{variants.length}</div>
                        <div className="text-sm text-slate-400">Total Variants</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                        <div className="text-3xl font-bold text-white">
                            {avatars.reduce((sum, a) => sum + (a.business_niches?.length || 0), 0)}
                        </div>
                        <div className="text-sm text-slate-400">Business Niches</div>
                    </CardContent>
                </Card>
            </div>

            {/* Avatar List */}
            <div className="grid grid-cols-2 gap-6">
                {avatars.map((avatar) => {
                    const avatarVariants = getVariantsForAvatar(avatar.avatar_key);

                    return (
                        <Card
                            key={avatar.id}
                            className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors cursor-pointer"
                            onClick={() => setSelectedAvatar(selectedAvatar === avatar.avatar_key ? null : avatar.avatar_key)}
                        >
                            <CardHeader>
                                <CardTitle className="text-white flex items-center justify-between">
                                    <span>{avatar.base_name}</span>
                                    <Badge variant="outline" className="text-blue-400 border-blue-400">
                                        {avatar.wealth_cluster}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Avatar Key */}
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">Avatar Key</div>
                                    <code className="text-sm text-green-400 bg-slate-900 px-2 py-1 rounded">
                                        {avatar.avatar_key}
                                    </code>
                                </div>

                                {/* Business Niches */}
                                <div>
                                    <div className="text-xs text-slate-500 mb-2">
                                        Business Niches ({avatar.business_niches?.length || 0})
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {(avatar.business_niches || []).slice(0, 5).map((niche, i) => (
                                            <Badge key={i} variant="secondary" className="bg-slate-700 text-slate-300">
                                                {niche}
                                            </Badge>
                                        ))}
                                        {(avatar.business_niches?.length || 0) > 5 && (
                                            <Badge variant="secondary" className="bg-slate-700 text-slate-400">
                                                +{avatar.business_niches.length - 5} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Variants */}
                                {selectedAvatar === avatar.avatar_key && (
                                    <div className="mt-4 pt-4 border-t border-slate-700">
                                        <div className="text-xs text-slate-500 mb-2">
                                            Variants ({avatarVariants.length})
                                        </div>
                                        <div className="space-y-2">
                                            {avatarVariants.map((variant) => (
                                                <div
                                                    key={variant.id}
                                                    className="bg-slate-900 p-3 rounded border border-slate-700"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <Badge className="bg-purple-600">
                                                            {variant.variant_type}
                                                        </Badge>
                                                        <span className="text-xs text-slate-400">
                                                            {variant.data?.pronoun || 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-slate-400 space-y-1">
                                                        <div>Identity: <span className="text-slate-300">{variant.data?.identity}</span></div>
                                                        <div>Pronouns: <span className="text-slate-300">
                                                            {variant.data?.pronoun}/{variant.data?.ppronoun}/{variant.data?.pospronoun}
                                                        </span></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
