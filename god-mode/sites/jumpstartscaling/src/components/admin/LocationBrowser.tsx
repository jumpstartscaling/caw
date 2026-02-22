import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

interface State {
    id: string;
    name: string;
    code: string;
}

interface County {
    id: string;
    name: string;
    population?: number;
}

interface City {
    id: string;
    name: string;
    population?: number;
    postal_code?: string;
}

export default function LocationBrowser() {
    const [states, setStates] = useState<State[]>([]);
    const [counties, setCounties] = useState<County[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedState, setSelectedState] = useState<State | null>(null);
    const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingCounties, setLoadingCounties] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);

    useEffect(() => {
        fetchStates();
    }, []);

    async function fetchStates() {
        try {
            const res = await fetch('/api/locations/states');
            const data = await res.json();
            setStates(data.states || []);
        } catch (err) {
            console.error('Error fetching states:', err);
        } finally {
            setLoading(false);
        }
    }

    async function fetchCounties(stateId: string) {
        setLoadingCounties(true);
        setCounties([]);
        setCities([]);
        setSelectedCounty(null);

        try {
            const res = await fetch(`/api/locations/counties?state=${stateId}`);
            const data = await res.json();
            setCounties(data.counties || []);
        } catch (err) {
            console.error('Error fetching counties:', err);
        } finally {
            setLoadingCounties(false);
        }
    }

    async function fetchCities(countyId: string) {
        setLoadingCities(true);
        setCities([]);

        try {
            const res = await fetch(`/api/locations/cities?county=${countyId}`);
            const data = await res.json();
            setCities(data.cities || []);
        } catch (err) {
            console.error('Error fetching cities:', err);
        } finally {
            setLoadingCities(false);
        }
    }

    function selectState(state: State) {
        setSelectedState(state);
        fetchCounties(state.id);
    }

    function selectCounty(county: County) {
        setSelectedCounty(county);
        fetchCities(county.id);
    }

    if (loading) {
        return <Spinner className="py-12" />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <button
                    className="hover:text-white transition-colors"
                    onClick={() => {
                        setSelectedState(null);
                        setSelectedCounty(null);
                        setCounties([]);
                        setCities([]);
                    }}
                >
                    All States
                </button>
                {selectedState && (
                    <>
                        <span>/</span>
                        <button
                            className="hover:text-white transition-colors"
                            onClick={() => {
                                setSelectedCounty(null);
                                setCities([]);
                            }}
                        >
                            {selectedState.name}
                        </button>
                    </>
                )}
                {selectedCounty && (
                    <>
                        <span>/</span>
                        <span className="text-white">{selectedCounty.name}</span>
                    </>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* States Column */}
                <Card className={selectedState ? 'opacity-60' : ''}>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>States</span>
                            <Badge variant="outline">{states.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-[500px] overflow-y-auto">
                        <div className="space-y-1">
                            {states.map((state) => (
                                <button
                                    key={state.id}
                                    className={`w-full px-3 py-2 rounded-lg text-left transition-colors ${selectedState?.id === state.id
                                            ? 'bg-primary text-white'
                                            : 'hover:bg-gray-700 text-gray-300'
                                        }`}
                                    onClick={() => selectState(state)}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{state.name}</span>
                                        <span className="text-sm opacity-60">{state.code}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Counties Column */}
                <Card className={!selectedState ? 'opacity-40' : selectedCounty ? 'opacity-60' : ''}>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Counties</span>
                            {selectedState && <Badge variant="outline">{counties.length}</Badge>}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-[500px] overflow-y-auto">
                        {loadingCounties ? (
                            <Spinner />
                        ) : !selectedState ? (
                            <p className="text-gray-500 text-center py-8">Select a state first</p>
                        ) : counties.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No counties found</p>
                        ) : (
                            <div className="space-y-1">
                                {counties.map((county) => (
                                    <button
                                        key={county.id}
                                        className={`w-full px-3 py-2 rounded-lg text-left transition-colors ${selectedCounty?.id === county.id
                                                ? 'bg-primary text-white'
                                                : 'hover:bg-gray-700 text-gray-300'
                                            }`}
                                        onClick={() => selectCounty(county)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{county.name}</span>
                                            {county.population && (
                                                <span className="text-xs opacity-60">
                                                    {county.population.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Cities Column */}
                <Card className={!selectedCounty ? 'opacity-40' : ''}>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Cities (Top 50)</span>
                            {selectedCounty && <Badge variant="outline">{cities.length}</Badge>}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-[500px] overflow-y-auto">
                        {loadingCities ? (
                            <Spinner />
                        ) : !selectedCounty ? (
                            <p className="text-gray-500 text-center py-8">Select a county first</p>
                        ) : cities.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No cities found</p>
                        ) : (
                            <div className="space-y-1">
                                {cities.map((city, index) => (
                                    <div
                                        key={city.id}
                                        className="px-3 py-2 rounded-lg bg-gray-700/30 text-gray-300"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500 w-5">{index + 1}.</span>
                                                {city.name}
                                            </span>
                                            {city.population && (
                                                <span className="text-xs text-gray-500">
                                                    Pop: {city.population.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                        {city.postal_code && (
                                            <span className="text-xs text-gray-500 ml-7">{city.postal_code}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
