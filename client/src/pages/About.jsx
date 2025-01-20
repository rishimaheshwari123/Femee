import React from "react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="bg-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-customGreen text-black shadow-lg rounded-lg p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-purple-600">
          About Femme Cure
        </h1>
        <h2 className="text-lg md:text-xl font-medium text-black mt-4">
          हमारा उद्देश्य <br />
          <span className="text-blue-600 font-bold">
            (हो निरोगी तन और हो घर हर घर में धन)
          </span>
        </h2>
        <p className="text-sm md:text-base text-black mt-3 leading-relaxed">
          हमें आप की फ्रिक हैं। आज की इस भाग दौड़ वाली जिन्दगी में हम अपने
          स्वास्थ्य पर ज्यादा ध्यान नहीं दे पाते हैं। Femme Cure कंपनी आप के लिए
          लाई है यह Helping Her Product और Profit, जो आपको बनाए स्वस्थ्य व सक्षम
          नारी। <br />
          <span className="text-purple-600 font-semibold">
            अच्छे स्वास्थ्य के लिए एक बार जरूर Helping Her Product का इस्तेमाल
            करके देखें। अधिक जानकारी के लिए कॉल करें: 7879523232
          </span>
        </p>
        <div className="mt-8 space-y-6">
          <p className="text-black text-base leading-relaxed">
            महिलाओं को आजीवन व्यवसाय मुहैया कराने की हमारी प्रतिबद्धता है। भारत
            को Plastics Free बनाने की मुहिम के तहत हम सब साथ मिलकर इस लक्ष्य को
            साकार करेंगे। Femme Cure हमेशा महिलाओं के साथ ईमानदारी और सच्चाई के
            साथ खड़ा रहेगा।
          </p>
          <p className="text-black text-base leading-relaxed">
            हर महिला की मददगार, Femme Cure परिवार, स्वच्छता और संपन्नता की ओर एक
            मजबूत कदम है। <br />
            धन्यवाद, <br />
            आपकी, <br />
            मीनू साहू (भोपाल से)
          </p>
        </div>
        <div className="flex justify-center mt-10">
          <Link
            to={"/founder"}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow hover:bg-blue-500 transition duration-300"
          >
            Meet Our Founder
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
