import React from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaLeaf, FaUsers } from "react-icons/fa";
import SocialMediaBar from "../components/comman/SocialMedia";
import { Container, Card, Button } from "../components/ui";

const About = () => {
  const features = [
    {
      icon: <FaHeart />,
      title: "Women's Health",
      description: "Dedicated to women's wellness and empowerment",
    },
    {
      icon: <FaLeaf />,
      title: "Eco-Friendly",
      description: "Committed to making India plastic-free",
    },
    {
      icon: <FaUsers />,
      title: "Community",
      description: "Building a supportive network of women",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
      <Container>
        {/* Hero Section */}
        <Card className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white mb-12">
          <div className="text-center py-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About Femme Cure
            </h1>
            <p className="text-xl md:text-2xl font-medium">
              हमारा उद्देश्य
            </p>
            <p className="text-2xl md:text-3xl font-bold mt-2">
              हो निरोगी तन और हो हर घर में धन
            </p>
          </div>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} hover className="text-center">
              <div className="flex flex-col items-center">
                <div className="bg-primary-100 text-primary-500 p-6 rounded-full text-4xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Mission Statement */}
        <Card className="bg-white mb-8">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              हमें आप की फ्रिक हैं। आज की इस भाग दौड़ वाली जिन्दगी में हम अपने
              स्वास्थ्य पर ज्यादा ध्यान नहीं दे पाते हैं। Femme Cure कंपनी आप के लिए
              लाई है यह Helping Her Product और Profit, जो आपको बनाए स्वस्थ्य व सक्षम
              नारी।
            </p>
            
            <div className="bg-primary-50 border-l-4 border-primary-500 p-4 mb-6">
              <p className="text-primary-700 font-semibold">
                अच्छे स्वास्थ्य के लिए एक बार जरूर Helping Her Product का इस्तेमाल
                करके देखें। अधिक जानकारी के लिए कॉल करें +91 7879523232
              </p>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              महिलाओं को आजीवन व्यवसाय मुहैया कराने की हमारी प्रतिबद्धता है। भारत
              को Plastics Free बनाने की मुहिम के तहत हम सब साथ मिलकर इस लक्ष्य को
              साकार करेंगे। Femme Cure हमेशा महिलाओं के साथ ईमानदारी और सच्चाई के
              साथ खड़ा रहेगा।
            </p>

            <p className="text-lg text-gray-700 leading-relaxed">
              हर महिला की मददगार, Femme Cure परिवार, स्वच्छता और संपन्नता की ओर एक
              मजबूत कदम है।
            </p>

            <div className="mt-8 text-right">
              <p className="text-gray-700 font-medium">
                धन्यवाद,<br />
                आपकी,<br />
                <span className="text-primary-600 font-bold">मीनू साहू (भोपाल से)</span>
              </p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Button
            to="/founder"
            variant="primary"
            size="lg"
          >
            Meet Our Founder
          </Button>
        </div>

        {/* Social Media Bar */}
        <div className="mt-12">
          <SocialMediaBar />
        </div>
      </Container>
    </div>
  );
};

export default About;
