import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal,
    Zap,
    Database,
    Award,
    Briefcase,
    Cpu,
    Search,
    BarChart3,
    Rocket,
    BarChart2,
    Calculator,
    Menu,
    X,
    Crosshair,
    ChevronRight,
    Wifi,
    Shield,
    Activity,
    Target
} from 'lucide-react';
import './CyberConsole.css';

const SystemInterface = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('protocols');

    // Navigation Handler
    const handleNavigation = (target) => {
        if (target.startsWith('#')) {
            const element = document.querySelector(target) || document.getElementById(target.replace('#', ''));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: target === '#visuals' ? 'start' : 'center' });
                return;
            }
            window.location.href = '/' + target;
        } else if (target === 'tools') {
            const calc = document.querySelector('.roas-calculator-card, .funnel-calc-card, .ltv-card');
            if (calc) {
                calc.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                window.location.href = '/services/paid-acquisition';
            }
        }
    };

    // Listen for external events
    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        const handleToggle = () => setIsOpen(prev => !prev);

        window.addEventListener('open-system-menu', handleOpen);
        window.addEventListener('toggle-system-menu', handleToggle);

        return () => {
            window.removeEventListener('open-system-menu', handleOpen);
            window.removeEventListener('toggle-system-menu', handleToggle);
        };
    }, []);

    // Lock scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const protocols = [
        { label: 'Strategic Methodology', desc: 'Scaling Roadmap', href: '/services/paid-acquisition', icon: Search, id: 'P-01' },
        { label: 'Funnel Architecture', desc: 'CRO Engineering', href: '/services/funnel-architecture', icon: Zap, id: 'P-02' },
        { label: 'CRM Systems', desc: 'Auto-Nurture', href: '/services/crm-transformation', icon: Database, id: 'P-03' },
        { label: 'Data & Attribution', desc: 'Server Tracking', href: '/services/data-attribution', icon: BarChart3, id: 'P-04' },
        { label: 'Authority Engine', desc: 'Market Dominance', href: '/services/authority-engine', icon: Award, id: 'P-05' },
        { label: 'Growth Retainer', desc: 'Full-Service', href: '/services/growth-retainer', icon: Briefcase, id: 'P-06' },
    ];

    return (
        <div id="system-interface-root">
            {/* Quick Nav - Always Rendered */}
            <nav className="quick-nav-react">
                <button className="quick-link-react menu-trigger" onClick={() => setIsOpen(!isOpen)}>
                    <Menu size={20} className="icon" />
                    <span className="label">Menu</span>
                </button>

                <button className="quick-link-react" onClick={() => handleNavigation('#survey')}>
                    <Rocket size={18} className="icon" />
                    <span className="label">Audit</span>
                </button>
                <button className="quick-link-react" onClick={() => handleNavigation('#visuals')}>
                    <BarChart2 size={18} className="icon" />
                    <span className="label">Charts</span>
                </button>
                <button className="quick-link-react" id="tools-link" onClick={() => handleNavigation('tools')}>
                    <Calculator size={18} className="icon" />
                    <span className="label">Tools</span>
                </button>
            </nav>

            {/* Full-Screen Command Console Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fullscreen-overlay"
                        onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="cyber-console-container-fullscreen"
                        >
                            {/* Corner Accents */}
                            <div className="cyber-corner tl"></div>
                            <div className="cyber-corner tr"></div>
                            <div className="cyber-corner bl"></div>
                            <div className="cyber-corner br"></div>

                            <div className="cyber-screen">
                                {/* HUD Header */}
                                <div className="cyber-hud-header">
                                    <div className="hud-title">
                                        <Rocket size={18} />
                                        <span>JUMPSTART<span style={{ color: '#fff' }}>SCALING</span> // CMD</span>
                                        <div className="blink-cursor"></div>
                                    </div>
                                    <div className="hud-metrics">
                                        <div className="hud-metric">
                                            <Shield size={14} />
                                            <span className="metric-val">SECURE</span>
                                        </div>
                                        <div className="hud-metric">
                                            <Wifi size={14} />
                                            <span className="metric-val">ONLINE</span>
                                        </div>
                                        <button onClick={() => setIsOpen(false)} className="close-btn-cyber">
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="cyber-layout">
                                    {/* Sidebar Nav */}
                                    <div className="cyber-nav">
                                        <button
                                            className={`cyber-nav-btn ${activeTab === 'protocols' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('protocols')}
                                        >
                                            <Crosshair size={16} /> PROTOCOLS
                                        </button>
                                        <button
                                            className={`cyber-nav-btn ${activeTab === 'intel' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('intel')}
                                        >
                                            <Cpu size={16} /> INTEL
                                        </button>
                                        <button
                                            className={`cyber-nav-btn ${activeTab === 'system' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('system')}
                                        >
                                            <Terminal size={16} /> SYSTEM
                                        </button>
                                    </div>

                                    {/* Main Viewport */}
                                    <div className="cyber-viewport">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={activeTab}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                style={{ height: '100%' }}
                                            >
                                                {activeTab === 'protocols' && (
                                                    <div className="cyber-grid">
                                                        {protocols.map((p, i) => (
                                                            <motion.a
                                                                key={p.href}
                                                                href={p.href}
                                                                className="cyber-card"
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: i * 0.05 }}
                                                                whileHover={{ scale: 1.02, y: -5 }}
                                                            >
                                                                <div className="card-header">
                                                                    <p.icon size={24} className="card-icon" />
                                                                    <span className="card-id">{p.id}</span>
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <div className="card-title">{p.label}</div>
                                                                    <div className="card-desc">{p.desc}</div>
                                                                </div>
                                                                <div className="card-action">INITIALIZE <ChevronRight size={14} style={{ display: 'inline' }} /></div>
                                                            </motion.a>
                                                        ))}
                                                    </div>
                                                )}

                                                {activeTab === 'intel' && (
                                                    <div className="cyber-grid">
                                                        {[
                                                            { label: 'Intel Hub', desc: 'All Intelligence Files', href: '/intel', icon: Cpu, id: 'INT-00' },
                                                            { label: 'CRM Automation', desc: 'Growth Strategy', href: '/intel/crm-automation-growth', icon: Database, id: 'INT-01' },
                                                            { label: 'Market Domination', desc: 'Strategy Guide', href: '/intel/market-domination-strategy', icon: Target, id: 'INT-02' },
                                                        ].map((intel, i) => (
                                                            <motion.a
                                                                key={intel.id}
                                                                href={intel.href}
                                                                className="cyber-card"
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ delay: i * 0.05 }}
                                                                whileHover={{ scale: 1.02, y: -5 }}
                                                            >
                                                                <div className="card-header">
                                                                    <intel.icon size={24} className="card-icon" />
                                                                    <span className="card-id">{intel.id}</span>
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <div className="card-title">{intel.label}</div>
                                                                    <div className="card-desc">{intel.desc}</div>
                                                                </div>
                                                                <div className="card-action">ACCESS <ChevronRight size={14} style={{ display: 'inline' }} /></div>
                                                            </motion.a>
                                                        ))}
                                                    </div>
                                                )}

                                                {activeTab === 'system' && (
                                                    <div className="cyber-terminal">
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ staggerChildren: 0.1 }}
                                                        >
                                                            <span className="term-line">&gt; SYSTEM DIAGNOSTICS...</span>
                                                            <span className="term-line">Target: <span className="term-highlight">Jumpstart Scaling</span></span>
                                                            <span className="term-line">Status: <span className="term-success">OPERATIONAL</span></span>
                                                            <br />
                                                            <span className="term-line">&gt; SECURITY PROTOCOLS...</span>
                                                            <span className="term-line">Encryption: AES-256 <span className="term-success">[ACTIVE]</span></span>
                                                            <span className="term-line">Firewall: <span className="term-success">[ACTIVE]</span></span>
                                                            <br />
                                                            <span className="term-line">&gt; ESTABLISH LINK? [Y/N]</span>
                                                            <br />
                                                            <a href="https://chrisamaya.work" target="_blank" style={{ color: '#C9A961', textDecoration: 'none', fontWeight: 'bold' }}>
                                                                &gt; CONNECT TO MAINFRAME_
                                                            </a>
                                                        </motion.div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .quick-nav-react {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 90%;
                    max-width: 450px;
                    background: rgba(15, 15, 15, 0.85);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 50px;
                    display: flex;
                    justify-content: space-evenly;
                    align-items: center;
                    padding: 0.6rem 2rem;
                    z-index: 9900;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.6);
                    transition: all 0.3s ease;
                }
                .quick-nav-react:hover {
                    background: rgba(15, 15, 15, 0.95);
                    border-color: rgba(201, 169, 97, 0.3);
                    transform: translateX(-50%) translateY(-2px);
                }
                .quick-link-react {
                    background: none;
                    border: none;
                    text-decoration: none;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    color: #999;
                    font-size: 0.75rem;
                    font-weight: 500;
                    transition: all 0.2s;
                    min-width: 50px;
                    position: relative;
                    font-family: 'Inter', sans-serif;
                    letter-spacing: 0.5px;
                    cursor: pointer;
                }
                .quick-link-react:hover { color: #fff; }
                .quick-link-react:hover .icon { transform: scale(1.1); }
                .menu-trigger { order: -1; }

                /* Full-Screen Overlay */
                .fullscreen-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.95);
                    backdrop-filter: blur(10px);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }

                .cyber-console-container-fullscreen {
                    width: 100%;
                    max-width: 1400px;
                    height: 85vh;
                    max-height: 900px;
                    position: relative;
                }

                .close-btn-cyber {
                    background: none;
                    border: 1px solid #555;
                    color: #888;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 4px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .close-btn-cyber:hover {
                    border-color: #C9A961;
                    color: #C9A961;
                    background: rgba(201, 169, 97, 0.1);
                }

                @media (max-width: 768px) {
                    .cyber-console-container-fullscreen {
                        height: 95vh;
                        max-height: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default SystemInterface;
