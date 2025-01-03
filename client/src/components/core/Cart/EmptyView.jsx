import React from 'react';
import { Link } from 'react-router-dom';

const EmptyView = (props) => {

    const { icon, msg, link, btnText } = props;

    return (
        <>
            <div className="flex justify-center items-center gap-8 flex-col h-screen w-full">
                <div className="text-5xl text-blue-500">
                    {icon}
                </div>
                <h2>{msg}</h2>
                {
                    link && (
                        <Link to={link} className="bg-red-600 bg-opacity-80 text-white px-4 py-2 rounded-md transition duration-200 ease-out hover:bg-blue-500">
                            {btnText}
                        </Link>
                    )
                }
            </div>
        </>
    );
};

export default EmptyView;