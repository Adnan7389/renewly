import { Link } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import {
    CheckCircle2,
    BarChart3,
    Bell,
    ArrowRight,
    ShieldCheck,
    Zap,
    Sun,
    Moon
} from 'lucide-react';

export default function LandingPage() {
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-['Lexend']">
            {/* Header */}
            <header className="fixed w-full top-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-[var(--primary)] p-1.5 rounded-lg">
                                <Bell className="h-5 w-5 text-[var(--primary-foreground)]" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">Renewly</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-md hover:bg-[var(--muted)] transition-colors text-[var(--foreground)]"
                                aria-label="Toggle dark mode"
                            >
                                {isDarkMode ? (
                                    <Sun className="h-5 w-5" />
                                ) : (
                                    <Moon className="h-5 w-5" />
                                )}
                            </button>
                            <Link
                                to="/login"
                                className="text-sm font-medium hover:text-[var(--primary)] transition-colors"
                            >
                                Log in
                            </Link>
                            <Link
                                to="/register"
                                className="btn-primary text-sm"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--muted)] border border-[var(--border)] mb-8 animate-fade-in-up">
                        <span className="flex h-2 w-2 rounded-full bg-[var(--primary)]"></span>
                        <span className="text-sm font-medium text-[var(--muted-foreground)]">v1.0 is now live</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-[var(--foreground)]">
                        Stop Wasting Money on <br className="hidden md:block" />
                        <span className="text-[var(--primary)]">Forgotten Subscriptions</span>
                    </h1>

                    <p className="text-lg md:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10 leading-relaxed">
                        Renewly helps you track, manage, and optimize your recurring expenses in one beautiful dashboard. Never pay for an unwanted subscription again.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Link
                            to="/register"
                            className="btn-primary h-12 px-8 flex items-center gap-2 text-lg w-full sm:w-auto justify-center"
                        >
                            Start Tracking Free <ArrowRight className="h-5 w-5" />
                        </Link>
                        <Link
                            to="/login"
                            className="btn-secondary h-12 px-8 flex items-center gap-2 text-lg w-full sm:w-auto justify-center"
                        >
                            View Demo
                        </Link>
                    </div>

                    {/* Dashboard Preview */}
                    <div className="relative max-w-5xl mx-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl overflow-hidden aspect-[16/9] group">
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] to-transparent opacity-20 z-10 pointer-events-none"></div>
                        <img
                            src="/dashboard-preview.png"
                            alt="Renewly Dashboard Preview"
                            className="w-full h-full object-cover object-top"
                        />
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-[var(--muted)]/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold mb-4">Everything you need to stay in control</h2>
                        <p className="text-[var(--muted-foreground)]">
                            Simple yet powerful tools to help you manage your financial commitments.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Zap className="h-6 w-6 text-[var(--primary)]" />,
                                title: "Automated Tracking",
                                description: "Add your subscriptions once and let us handle the calculations. We'll project your monthly and yearly spend automatically."
                            },
                            {
                                icon: <Bell className="h-6 w-6 text-[var(--primary)]" />,
                                title: "Smart Reminders",
                                description: "Get notified before a payment is due. Set custom alert thresholds so you're never caught off guard by a renewal."
                            },
                            {
                                icon: <BarChart3 className="h-6 w-6 text-[var(--primary)]" />,
                                title: "Spending Analytics",
                                description: "Visualize your spending habits with beautiful charts. See exactly where your money goes each month."
                            }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="p-8 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="h-12 w-12 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-[var(--card-foreground)]">{feature.title}</h3>
                                <p className="text-[var(--muted-foreground)] leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">How Renewly works</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-[var(--border)] -z-10"></div>

                        {[
                            {
                                step: "01",
                                title: "Create Account",
                                description: "Sign up in seconds. No credit card required for the free tier."
                            },
                            {
                                step: "02",
                                title: "Add Subscriptions",
                                description: "Input your recurring services manually or import them."
                            },
                            {
                                step: "03",
                                title: "Save Money",
                                description: "Get insights and alerts to cancel unused services."
                            }
                        ].map((item, index) => (
                            <div key={index} className="text-center bg-[var(--background)] pt-4">
                                <div className="w-16 h-16 mx-auto bg-[var(--card)] border-2 border-[var(--primary)] rounded-full flex items-center justify-center text-xl font-bold text-[var(--primary)] mb-6 shadow-sm">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-[var(--muted-foreground)]">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust/Security Section */}
            <section className="py-20 bg-[var(--card)] border-y border-[var(--border)]">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <ShieldCheck className="h-12 w-12 text-[var(--primary)] mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-6">Your data is secure</h2>
                    <p className="text-[var(--muted-foreground)] text-lg mb-8">
                        We prioritize your privacy. Your financial data is encrypted and never shared with third parties.
                        We only use your data to help you save money.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-[var(--muted-foreground)]">
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--primary)]" /> End-to-end Encryption</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--primary)]" /> No Data Selling</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--primary)]" /> GDPR Compliant</span>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to take control?</h2>
                    <p className="text-xl text-[var(--muted-foreground)] mb-10">
                        Join thousands of users who are saving money with Renewly.
                    </p>
                    <Link
                        to="/register"
                        className="btn-primary inline-flex items-center gap-2 text-lg px-10 py-4 h-auto"
                    >
                        Get Started for Free
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-[var(--border)] bg-[var(--muted)]/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-[var(--primary)] p-1 rounded-md">
                            <Bell className="h-4 w-4 text-[var(--primary-foreground)]" />
                        </div>
                        <span className="font-bold text-[var(--foreground)]">Renewly</span>
                    </div>

                    <div className="flex gap-8 text-sm text-[var(--muted-foreground)]">
                        <a href="#" className="hover:text-[var(--foreground)] transition-colors">Privacy</a>
                        <a href="#" className="hover:text-[var(--foreground)] transition-colors">Terms</a>
                        <a href="#" className="hover:text-[var(--foreground)] transition-colors">Contact</a>
                    </div>

                    <div className="text-sm text-[var(--muted-foreground)]">
                        © {new Date().getFullYear()} Renewly. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
