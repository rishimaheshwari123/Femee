import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaHeart, 
  FaLeaf, 
  FaUsers, 
  FaStar, 
  FaShoppingBag,
  FaArrowRight,
  FaCheckCircle,
  FaQuoteLeft
} from "react-icons/fa";
import { useSelector } from "react-redux";
import AOS from "aos";
import "aos/dist/aos.css";
import { getAllReatingAPI } from "../services/operations/user";
import ReviewRating from "../components/core/Home/ReviewRating";
import ReviewsSection from "../components/comman/AllRating";
import SocialMediaBar from "../components/comman/SocialMedia";
import { Container, Button, Card } from "../components/ui";
import femme from "../assets/femee.jpg";

const Home = () => {
  const [reviewModal, setReviewModal] = useState(false);
  const { token, user } = useSelector((state) => state.auth);
  const [allRatings, setAllRatings] = useState([]);

  const fetchRatings = async () => {
    try {
      const response = await getAllReatingAPI();
      setAllRatings(response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchRatings();
    AOS.init({ duration: 800, once: true });
  }, []);

  const handleAddRating = () => {
    if (token) {
      setReviewModal(true);
    }
  };

  // Features Data
  const features = [
    {
      icon: <FaHeart />,
      title: "Women's Health",
      description: "Dedicated to empowering women's wellness and health",
      color: "from-pink-500 to-red-500",
    },
    {
      icon: <FaLeaf />,
      title: "100% Natural",
      description: "No plastic, no chemicals - only natural products",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <FaUsers />,
      title: "Community",
      description: "Join 500+ active members across India",
      color: "from-blue-500 to-cyan-500",
    },
  ];

  // Stats Data
  const stats = [
    { number: "500+", label: "Active Members", icon: <FaUsers /> },
    { number: "85,000+", label: "Happy Customers", icon: <FaHeart /> },
    { number: "100%", label: "Natural Products", icon: <FaLeaf /> },
    { number: "4.9/5", label: "Customer Rating", icon: <FaStar /> },
  ];

  // Benefits Data
  const benefits = [
    "Lifetime business opportunity for women",
    "Plastic-free India initiative",
    "Premium quality natural products",
    "Honest and transparent dealings",
    "Nationwide delivery available",
    "Expert health consultation",
  ];

  return (
    <div className="bg-white overflow-hidden">
      {/* Social Media Bar */}
      <SocialMediaBar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <Container className="relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center py-20">
            {/* Left Content */}
            <div data-aos="fade-right">
              <div className="inline-block mb-6">
                <span className="bg-white/20 backdrop-blur-lg px-6 py-2 rounded-full text-sm font-semibold">
                  ✨ Empowering Women's Health
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight">
                हो निरोगी तन और हो
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  हर घर में धन
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                Femme Cure - Your partner in health, wellness, and prosperity. 
                Join us in making India plastic-free with 100% natural products.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Button 
                  to="/shop" 
                  variant="dark"
                  size="lg"
                  icon={<FaShoppingBag />}
                >
                  Shop Now
                </Button>
                <Button 
                  to="/about" 
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-primary-600"
                  icon={<FaArrowRight />}
                  iconPosition="right"
                >
                  Learn More
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6">
                {stats.slice(0, 3).map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold mb-1">{stat.number}</div>
                    <div className="text-sm text-white/80">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Image */}
            <div data-aos="fade-left" className="relative">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
                <img
                  src={femme}
                  alt="Femme Cure"
                  className="relative rounded-3xl shadow-2xl w-full h-auto transform hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-accent-50">
        <Container>
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-dark-900 mb-4">
              Why Choose Femme Cure?
            </h2>
            <p className="text-xl text-dark-600 max-w-2xl mx-auto">
              We're committed to your health, wellness, and financial independence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                hover
                className="text-center group"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${feature.color} text-white rounded-2xl mb-6 text-3xl group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-display font-bold text-dark-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-dark-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div data-aos="fade-right">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                Know About Us
              </h2>
              <div className="space-y-6 text-lg leading-relaxed">
                <p>
                  हमें आप की फ्रिक हैं। आज की इस भाग दौड़ वाली जिन्दगी में हम अपने 
                  स्वास्थ्य पर ज्यादा ध्यान नहीं दे पाते हैं। Femme Cure कंपनी आप के 
                  लिए लाई है यह Helping Her Product और Profit, जो आपको बनाए स्वस्थ्य व सक्षम।
                </p>
                <p>
                  महिलाओं को आजीवन व्यवसाय मुहैया कराने की हमारी प्रतिबद्धता है। भारत को 
                  Plastics Free बनाने की मुहिम के तहत हम सब साथ मिलकर इस लक्ष्य को साकार करेंगे।
                </p>
              </div>
              <div className="mt-8">
                <Button 
                  to="/about" 
                  variant="dark"
                  size="lg"
                  icon={<FaArrowRight />}
                  iconPosition="right"
                >
                  Read Full Story
                </Button>
              </div>
            </div>

            <div data-aos="fade-left">
              <Card variant="glass" className="p-8">
                <h3 className="text-2xl font-display font-bold mb-6 text-gray-900">
                  Our Commitments
                </h3>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <FaCheckCircle className="text-green-400 text-xl flex-shrink-0 mt-1" />
                      <span className="text-gray-900">{benefit}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats Section */}
  <section className="py-20 bg-gradient-to-br from-secondary-100 to-secondary-200">
  <Container>
    <div className="text-center mb-16" data-aos="fade-up">
      <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-gray-800">
        Our Impact
      </h2>
      <p className="text-xl text-gray-600">
        Making a difference across India
      </p>
    </div>

    <div className="grid md:grid-cols-4 gap-8">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="text-center bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl p-8"
          data-aos="zoom-in"
          data-aos-delay={index * 100}
        >
          <div className="text-5xl mb-4 text-secondary-600 transition-transform duration-300 group-hover:scale-110">
            {stat.icon}
          </div>

          <div className="text-4xl font-bold mb-2 text-gray-800">
            {stat.number}
          </div>

          <div className="text-gray-600 font-medium">
            {stat.label}
          </div>
        </Card>
      ))}
    </div>
  </Container>
</section>


      {/* Testimonials Section */}
      {allRatings.length > 0 && (
        <section className="py-20 bg-white">
          <Container>
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-dark-900 mb-4">
                What Our Customers Say
              </h2>
              <p className="text-xl text-dark-600">
                Real stories from real people
              </p>
            </div>
            <ReviewsSection allRatings={allRatings} />
          </Container>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto" data-aos="zoom-in">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of women who have transformed their health and built successful businesses
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                to="/become-member/meenusahuADMIN" 
                variant="dark"
                size="xl"
              >
                Become a Member
              </Button>
              <Button 
                to="/shop" 
                variant="outline"
                size="xl"
                className="border-white text-white hover:bg-white hover:text-primary-600"
              >
                Shop Products
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Add Rating Button */}
      {["member", "admin"].includes(user?.role) && (
        <section className="py-12 bg-dark-50">
          <Container>
            <div className="text-center">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddRating}
              >
                Add Your Rating
              </Button>
            </div>
          </Container>
        </section>
      )}

      {/* Review Modal */}
      {reviewModal && <ReviewRating setReviewModal={setReviewModal} />}
    </div>
  );
};

export default Home;
