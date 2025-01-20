import React from "react";
import { FaLeaf, FaHeart, FaShieldAlt } from "react-icons/fa";
import { GiRecycle } from "react-icons/gi";

const HappyFuture = () => {
  return (
    <div className="bg-gray-100 p-6 md:p-10 lg:p-14">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-10">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-pink-600">
          हर महिला की मददगार
        </h1>
        <p className="text-center text-gray-700 mt-4">
          हम सब महिला इस सृष्टि का अमूल्य हिस्सा हैं।
        </p>
        <div className="mt-8 space-y-6">
          <div className="flex items-center">
            <FaHeart className="text-pink-500 text-2xl mr-4" />
            <p className="text-gray-800">
              हर महिला इस सृष्टि में सृजन करता है व जननी है । जब नारी स्वयं
              स्वस्थ रहेगी तभी वह अपने परिवार को स्वस्थ व सुखी रख सकती है।
            </p>
          </div>
          <div className="flex items-center">
            <FaHeart className="text-pink-500 text-2xl mr-4" />
            <p className="text-gray-800">
              इसलिए हम सब की जिम्मेदारी है कि हम अपने आप को स्वस्थ व संपन्न
              बनाएं ।
            </p>
          </div>
          <div className="flex items-center">
            <FaShieldAlt className="text-green-500 text-2xl mr-4" />
            <p className="text-gray-800">
              हम आपके लिए लाए हैं Anion Sanitary Pad, जिसके इस्तेमाल से सभी
              बच्चियाँ व महिलाएँ स्वस्थ व सूखी रहती है और साथ ही साथ पर्यावरण को
              भी सुरक्षित रखती हैं। और अन्य महिलाओं और बच्चियों को स्वास्थ्य के
              प्रति जागरूक करके उन्हें भी गर्भाशय की बीमारियों जैसे - 'Uterine
              cancer' जैसी बीमारियों से बचा रही है
            </p>
          </div>
          <div className="flex items-center">
            <GiRecycle className="text-blue-500 text-2xl mr-4" />
            <p className="text-gray-800">
              यह Pad Biodegradable होता है। इसलिए इसके इस्तेमाल से हर महिला
              पर्यावरण संरक्षण में भी अपना योगदान दे रही है।
            </p>
          </div>
          <div className="flex items-center">
            <FaLeaf className="text-green-600 text-2xl mr-4" />
            <p className="text-gray-800">
              यह Anion chip युक्त Pad है, जिसके इस्तेमाल से बच्चेदानी से संबंधित
              व महावारी से संबंधित सभी जानलेवा बीमारियों को यह ठीक करता है।
            </p>
          </div>
        </div>
        {/* <div className="mt-8 text-center">
          <button className="bg-pink-500 text-white py-2 px-6 rounded-lg shadow-md hover:bg-pink-600">
            जानें अधिक
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default HappyFuture;
