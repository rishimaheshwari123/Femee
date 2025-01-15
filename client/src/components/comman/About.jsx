import React from "react";
import { Slide } from "react-awesome-reveal";
import c1 from "../../assets/femee.jpg";

import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="my-10">
      <div className=" flex flex-col  w-full items-center">
        <h3 className=" text-2xl lg:text-4xl font-semibold   mt-2">
          Know About Us
        </h3>
        <br />
        <div className="flex items-center w-[75px]">
          <div className="h-0.5 bg-[#cee21a]"></div>
          <div className="h-1 w-1 bg-[#cee21a] rounded-full mx-1"></div>
          <div className="h-1 w-1 bg-[#cee21a] rounded-full mx-1"></div>
          <div className="h-1 w-1 bg-[#cee21a] rounded-full mx-1"></div>
          <div
            className="h-[4px] rounded-full w-[10px] flex-grow"
            style={{ backgroundColor: "#cee21a" }}
          ></div>
        </div>
                  
      </div>
      <div className="bg-[#800080]  py-5">
        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:gap-32 py-1 bg-opacity-90 bg-transparent text-white">
          <div className="main  items-center grid  gap-5 lg:grid-cols-2">
            <Slide direction="left">
              <div className="second border overflow-hidden grid gap-3 p-5">
                <p className="text-yellow-400 font-semibold text-2xl text-center">
                  As Seen On
                </p>
                <div className="scroll-container">
                  <div className="scroll-left-to-right flex gap-2 lg:gap-1">
                    <img
                      src={c1}
                      alt="not found"
                      className="lg:w-36 lg:h-36 w-28 h-28 rounded-full"
                    />
                    <img
                      src={c1}
                      alt="not found"
                      className="lg:w-36 lg:h-36 w-28 h-28 rounded-full"
                    />
                    <img
                      src={c1}
                      alt="not found"
                      className="lg:w-36 lg:h-36 w-28 h-28 rounded-full"
                    />
                    <img
                      src={c1}
                      alt="not found"
                      className="lg:w-36 lg:h-36 w-28 h-28 rounded-full"
                    />
                    <img
                      src={c1}
                      alt="not found"
                      className="lg:w-36 lg:h-36 w-28 h-28 rounded-full"
                    />
                    <img
                      src={c1}
                      alt="not found"
                      className="lg:w-36 lg:h-36 w-28 h-28 rounded-full"
                    />
                    <img
                      src={c1}
                      alt="not found"
                      className="lg:w-36 lg:h-36 w-28 h-28 rounded-full"
                    />
                  </div>
                </div>
                <div className="scroll-container">
                  <div className="scroll-right-to-left flex gap-2 lg:gap-1">
                    <img
                      src={c1}
                      alt="not found"
                      className="lg:w-36 lg:h-36 w-28 h-28 rounded-full"
                    />
                    <img
                      src={c1}
                      alt="not found"
                      className="lg:w-36 lg:h-36 w-28 h-28 rounded-full"
                    />
                    <img
                      src={c1}
                      alt="not found"
                      className="lg:w-36 lg:h-36 w-28 h-28 rounded-full"
                    />
                    <img
                      src={c1}
                      alt="not found"
                      className="lg:w-36 lg:h-36 w-28 h-28 rounded-full"
                    />
                    <img
                      src={c1}
                      alt="not found"
                      className="lg:w-36 lg:h-36 w-28 h-28 rounded-full"
                    />
                    <img
                      src={c1}
                      alt="not found"
                      className="lg:w-36 lg:h-36 w-28 h-28 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </Slide>
            <Slide direction="right">
              <div className="first grid gap-4 p-4 md:gap-6 md:p-8">
                <p className="text-xl md:text-3xl font-semibold  border-l-4 border-yellow-400 pl-4">
                  हो निरोगी तन और हो घर हर घर में धन
                </p>
                <p className="text-sm md:text-xl ">
                  हमें आप की फ्रिक हैं। आज की इस भाग दौड़ वाली जिन्दगी में हम
                  अपने स्वास्थ्य पर ज्यादा ध्यान नहीं दे पाते हैं। Femme Cure
                  कंपनी आप के लिए लाई है यह Helping Her Product और Profit, जो
                  आपको बनाए स्वस्थ्य व सक्षम।
                </p>
                <p>
                  महिलाओं को आजीवन व्यवसाय मुहैया कराने की हमारी प्रतिबद्धता है।
                  भारत को Plastics Free बनाने की मुहिम के तहत हम सब साथ मिलकर इस
                  लक्ष्य को साकार करेंगे। Femme Cure हमेशा महिलाओं के साथ
                  ईमानदारी और सच्चाई के साथ खड़ा रहेगा।
                </p>

                <div>
                  <Link
                    to={"/about"}
                    className="bg-customGreen mt-3  rounded-full text-white  w-fit px-5 py-4 text-xl lg:text-xl"
                  >
                    About Femme Cure
                  </Link>
                </div>
              </div>
            </Slide>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
