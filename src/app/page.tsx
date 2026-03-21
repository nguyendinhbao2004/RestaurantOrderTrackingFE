"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  UtensilsCrossed,
  QrCode,
  Clock,
  Star,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
  ShoppingCart,
  ArrowRight,
  LogIn,
} from "lucide-react";

/* ───────────────────────── data ───────────────────────── */

const featuredDishes = [
  {
    name: "Grilled Ribeye Steak",
    desc: "Prime 12 oz ribeye with herb butter, roasted potatoes & seasonal vegetables",
    price: "$34.99",
    img: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&q=80",
    tag: "Chef's Pick",
  },
  {
    name: "Pan-Seared Salmon",
    desc: "Atlantic salmon with lemon dill sauce, asparagus & wild rice",
    price: "$28.99",
    img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80",
    tag: "Popular",
  },
  {
    name: "Chef's Special Lobster",
    desc: "Whole Maine lobster with drawn butter, corn on the cob & coleslaw",
    price: "$49.99",
    img: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=600&q=80",
    tag: "Exclusive",
  },
];

const steps = [
  {
    icon: QrCode,
    title: "Scan QR Code",
    desc: "Find the QR code on your table and scan it with your phone camera.",
  },
  {
    icon: ShoppingCart,
    title: "Browse & Order",
    desc: "Explore the full menu, customize your dishes, and place your order instantly.",
  },
  {
    icon: UtensilsCrossed,
    title: "Enjoy Your Meal",
    desc: "Relax while our chefs prepare your food. Track your order in real-time!",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    text: "The QR ordering system is genius! We ordered right from the table and food arrived super fast. Amazing steak!",
    rating: 5,
    avatar: "S",
  },
  {
    name: "James L.",
    text: "Best fine dining experience in town. The lobster was absolutely phenomenal and the service was impeccable.",
    rating: 5,
    avatar: "J",
  },
  {
    name: "Emily K.",
    text: "Love how easy it is to browse the menu on my phone. The salmon was cooked to perfection. Will be back!",
    rating: 5,
    avatar: "E",
  },
];

const NAV_LINKS = [
  { label: "Menu", href: "#menu" },
  { label: "Order Online", href: "/menu" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Reviews", href: "#reviews" },
];

/* ───────────────────────── component ──────────────────── */

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    const sections = document.querySelectorAll("section[id]");
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* ─── Navbar ─── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-stone-950/60 backdrop-blur-xl shadow-lg shadow-orange-500/5 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 transition-shadow">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-orange-600">
              Restaurant
            </span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`text-sm font-medium transition-colors ${
                  activeSection === l.href.replace(/^[#/]/, '')
                    ? "text-orange-600"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="rounded-full px-4 text-sm font-medium hover:bg-orange-50 dark:hover:bg-orange-950/50"
            >
              <Link href="/login">
                <LogIn className="w-4 h-4 mr-1.5" />
                Login
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-shadow"
            >
              <Link href="/menu">Order Now</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="min-h-screen bg-background">
        {/* ─── Hero ─── */}
        <section
          id="hero"
          className="relative min-h-[100vh] flex items-center overflow-hidden"
        >
          {/* Animated blobs */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-orange-400/20 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[120px] animate-pulse-slow animation-delay-600" />
            <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-orange-400/15 rounded-full blur-[100px] animate-pulse-slow animation-delay-400" />
          </div>

          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center px-6 pt-28 pb-20">
            {/* Text */}
            <div className="animate-slideUp">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Welcome to Fine Dining
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6">
                Experience{" "}
                <span className="text-orange-600">
                  Culinary
                </span>{" "}
                Excellence
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-lg mb-10 leading-relaxed">
                Indulge in exquisite dishes crafted by world-class chefs. Scan
                the QR code at your table to explore our menu and order
                seamlessly.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8 py-6 text-base shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:scale-[1.03]"
                >
                  <Link href="/menu">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    View Menu & Order
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 py-6 text-base border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-950/50 transition-all hover:scale-[1.03]"
                >
                  <a href="#how-it-works">
                    How It Works
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
              </div>

              {/* Mini stats */}
              <div className="flex items-center gap-8 mt-12 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>
                    <strong className="text-foreground">4.9</strong> Rating
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>
                    <strong className="text-foreground">15 min</strong> Avg.
                    Wait
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-amber-500" />
                  <span>
                    <strong className="text-foreground">50+</strong> Dishes
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative animate-slideUp animation-delay-200 hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-full bg-orange-500/30 blur-2xl animate-pulse-slow" />
                <div className="absolute inset-4 rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/20 border border-white/20">
                  <img
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"
                    alt="Beautifully plated gourmet dish"
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-black/40" />
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-2 -left-2 bg-white dark:bg-stone-900 rounded-2xl px-5 py-3 shadow-xl shadow-black/10 animate-float">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                      <Star className="w-4 h-4 text-white fill-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Top Rated
                      </p>
                      <p className="font-bold text-sm">4.9 / 5.0</p>
                    </div>
                  </div>
                </div>

                {/* Floating badge 2 */}
                <div className="absolute -top-2 -right-2 bg-white dark:bg-stone-900 rounded-2xl px-5 py-3 shadow-xl shadow-black/10 animate-float animation-delay-400">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Fast Service
                      </p>
                      <p className="font-bold text-sm">~15 min</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fadeIn delay-1000">
            <span className="text-xs text-muted-foreground">
              Scroll to explore
            </span>
            <div className="w-5 h-8 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-1.5">
              <div className="w-1 h-2 bg-orange-500 rounded-full animate-bounce" />
            </div>
          </div>
        </section>

        {/* ─── Featured Dishes ─── */}
        <section id="menu" className="py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 animate-slideUp">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-sm font-medium mb-4">
                <UtensilsCrossed className="w-4 h-4" />
                Our Signature Dishes
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Crafted with{" "}
                <span className="text-orange-600">
                  Passion
                </span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Each dish tells a story of carefully sourced ingredients and
                culinary artistry from our award-winning chefs.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredDishes.map((dish, i) => (
                <div
                  key={dish.name}
                  className={`group relative rounded-3xl overflow-hidden bg-card border border-border/50 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 hover:-translate-y-2 animate-slideUp`}
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={dish.img}
                      alt={dish.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/60" />

                    {/* Tag */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                        {dish.tag}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="absolute bottom-4 right-4">
                      <span className="bg-white/90 dark:bg-stone-950/70 backdrop-blur-sm text-foreground font-bold text-lg px-4 py-1.5 rounded-2xl shadow-lg">
                        {dish.price}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-orange-600 transition-colors">
                      {dish.name}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {dish.desc}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, j) => (
                          <Star
                            key={j}
                            className="w-3.5 h-3.5 text-amber-500 fill-amber-500"
                          />
                        ))}
                      </div>
                      <Link
                        href="/menu"
                        className="text-orange-600 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                      >
                        Order Now
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-8 border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-950/50"
              >
                <Link href="/menu">
                  Explore Full Menu
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section
          id="how-it-works"
          className="py-24 lg:py-32 bg-orange-50/60 dark:bg-orange-950/20"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 animate-slideUp">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-sm font-medium mb-4">
                <QrCode className="w-4 h-4" />
                Seamless Experience
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                How It{" "}
                <span className="text-orange-600">
                  Works
                </span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                From scanning to savoring — your dining experience is just
                three simple steps away.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting line (desktop) */}
              <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-0.5 bg-orange-300 dark:bg-orange-800" />

              {steps.map((step, i) => (
                <div
                  key={step.title}
                  className="relative flex flex-col items-center text-center animate-slideUp"
                  style={{ animationDelay: `${i * 200}ms` }}
                >
                  {/* Number badge */}
                  <div className="relative z-10 mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-orange-500 flex items-center justify-center shadow-xl shadow-orange-500/30 transition-transform hover:scale-110 hover:rotate-3">
                      <step.icon className="w-9 h-9 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white dark:bg-stone-900 border-2 border-orange-500 flex items-center justify-center text-xs font-bold text-orange-600">
                      {i + 1}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Testimonials ─── */}
        <section id="reviews" className="py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 animate-slideUp">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-sm font-medium mb-4">
                <Star className="w-4 h-4" />
                Customer Love
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                What Our Guests{" "}
                <span className="text-orange-600">
                  Say
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <div
                  key={t.name}
                  className="group relative bg-card border border-border/50 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-500 hover:-translate-y-1 animate-slideUp"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  {/* Quote mark */}
                  <div className="absolute top-6 right-6 text-6xl font-serif text-orange-200 dark:text-orange-800/50 leading-none select-none">
                    &ldquo;
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star
                        key={j}
                        className="w-4 h-4 text-amber-500 fill-amber-500"
                      />
                    ))}
                  </div>

                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {t.text}
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Verified Diner
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA Banner ─── */}
        <section className="py-24 lg:py-32">
          <div className="max-w-5xl mx-auto px-6">
            <div className="relative overflow-hidden rounded-[2rem] bg-orange-600 px-8 py-16 md:px-16 md:py-20 text-center text-white shadow-2xl shadow-orange-500/30">
              {/* Decorative circles */}
              <div className="absolute top-[-80px] right-[-80px] w-60 h-60 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-[-60px] left-[-60px] w-40 h-40 bg-white/10 rounded-full blur-2xl" />

              <h2 className="text-3xl md:text-5xl font-bold mb-4 relative z-10">
                Ready to Dine?
              </h2>
              <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8 relative z-10">
                Scan the QR code at your table or tap the button below to
                explore our menu and place your order in seconds.
              </p>

              <Button
                asChild
                size="lg"
                className="bg-white text-orange-700 hover:bg-white/90 rounded-full px-10 py-6 text-base font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-[1.03] relative z-10"
              >
                <Link href="/menu">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Start Ordering Now
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer className="border-t border-border/50 bg-card/50">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid md:grid-cols-4 gap-12">
              {/* Brand */}
              <div className="md:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <span className="text-white font-bold text-lg">R</span>
                  </div>
                  <span className="font-bold text-xl tracking-tight text-orange-600">
                    Restaurant
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Exquisite dining powered by modern technology. Scan, order,
                  and enjoy — effortlessly.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>
                    <Link
                      href="/menu"
                      className="hover:text-orange-600 transition-colors"
                    >
                      Menu & Order
                    </Link>
                  </li>
                  <li>
                    <a
                      href="#how-it-works"
                      className="hover:text-orange-600 transition-colors"
                    >
                      How It Works
                    </a>
                  </li>
                  <li>
                    <a
                      href="#reviews"
                      className="hover:text-orange-600 transition-colors"
                    >
                      Reviews
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-semibold mb-4">Contact</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    123 Gourmet Street, Ho Chi Minh City
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-orange-500" />
                    +84 (0) 123 456 789
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-orange-500" />
                    hello@restaurant.com
                  </li>
                </ul>
              </div>

              {/* Hours */}
              <div>
                <h4 className="font-semibold mb-4">Opening Hours</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex justify-between">
                    <span>Mon – Fri</span>
                    <span className="font-medium text-foreground">
                      11 AM – 10 PM
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sat – Sun</span>
                    <span className="font-medium text-foreground">
                      10 AM – 11 PM
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>
                &copy; {new Date().getFullYear()} Restaurant. All rights
                reserved.
              </p>
              <p>
                Staff?{" "}
                <Link
                  href="/login"
                  className="text-orange-600 hover:underline font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
