import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';
import { HiOutlineChevronDown } from 'react-icons/hi';
import '../styles/LandingPage.scss';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Update active section based on scroll position
      const sections = ['home', 'about', 'how-it-works', 'faq'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      question: "What is Junky?",
      answer: "Junky is a healthcare funding platform that connects patients in need with donors who want to make a difference. We provide a secure and transparent way to raise funds for medical treatments."
    },
    {
      question: "How does the funding process work?",
      answer: "Patients create a profile and submit their medical funding request. Donors can browse verified cases and contribute directly to the treatment costs. The funds are released to the hospital once the treatment is confirmed."
    },
    {
      question: "Is my donation secure?",
      answer: "Yes, all donations are processed through secure payment gateways. We also verify all medical cases and ensure funds are used for their intended purpose."
    },
    {
      question: "How are patients verified?",
      answer: "We require medical documentation, hospital verification, and doctor's confirmation for all patient applications. This ensures transparency and builds trust with our donors."
    },
    {
      question: "Can I track how my donation is used?",
      answer: "Yes, donors receive regular updates on the treatment progress and can see exactly how their contribution is being used through our transparent tracking system."
    }
  ];

  return (
    <div className="landing-page">
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-content">
          <div className="logo">
            <Link to="/">Junky</Link>
          </div>
          <div className="nav-links">
            <button onClick={() => scrollToSection('home')} className={activeSection === 'home' ? 'active' : ''}>
              Home
            </button>
            <button onClick={() => scrollToSection('about')} className={activeSection === 'about' ? 'active' : ''}>
              About
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className={activeSection === 'how-it-works' ? 'active' : ''}>
              How It Works
            </button>
            <button onClick={() => scrollToSection('faq')} className={activeSection === 'faq' ? 'active' : ''}>
              FAQ
            </button>
          </div>
          <div className="auth-buttons">
            <Link to="/get-started" className="get-started-btn">Get Started</Link>
          </div>
        </div>
      </nav>

      <section id="home" className="hero-section">
        <div className="hero-content">
          <h1>Healthcare Funding Made Simple</h1>
          <p>Connect with donors and get the medical care you need</p>
          <div className="cta-buttons">
            <Link to="/get-started" className="primary-btn">Get Started</Link>
            <button onClick={() => scrollToSection('how-it-works')} className="secondary-btn">
              Learn More <HiOutlineChevronDown />
            </button>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <h3>$2M+</h3>
            <p>Funds Raised</p>
          </div>
          <div className="stat-card">
            <h3>500+</h3>
            <p>Patients Helped</p>
          </div>
          <div className="stat-card">
            <h3>1000+</h3>
            <p>Active Donors</p>
          </div>
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="section-content">
          <h2>About Junky</h2>
          <p>We're on a mission to make healthcare accessible to everyone. Our platform connects patients with donors, making it easier to raise funds for medical treatments.</p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure</h3>
              <p>Your data and donations are protected with bank-level security</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Transparent</h3>
              <p>Track every dollar and see how it's making a difference</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast</h3>
              <p>Quick verification and faster access to funds</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works-section">
        <div className="section-content">
          <h2>How It Works</h2>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create Profile</h3>
              <p>Sign up and complete your profile with medical information</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Submit Request</h3>
              <p>Upload medical documents and specify funding needs</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Get Funded</h3>
              <p>Receive donations from verified donors</p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="faq-section">
        <div className="section-content">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-card">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Junky</h3>
            <p>Making healthcare accessible to everyone</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <button onClick={() => scrollToSection('about')}>About</button>
            <button onClick={() => scrollToSection('how-it-works')}>How It Works</button>
            <button onClick={() => scrollToSection('faq')}>FAQ</button>
          </div>
          <div className="footer-section">
            <h4>Connect With Us</h4>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <FaFacebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <FaLinkedin />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <FaGithub />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Junky. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 