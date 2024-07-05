import { useEffect, useState } from 'react';
import { Link } from "react-router-dom"
import logo from "../assets/icons/logo.webp"
import { Web3Button } from '@web3modal/react'
const Navbar = () => {

    const [isScrolled, setisScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setisScrolled(window.scrollY > 0);
        }
        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, [])


    const [isNavVisible, setIsNavVisible] = useState(false);

    const toggleNav = () => {
        setIsNavVisible(!isNavVisible);
    };


    const closeMenu = () => {
        setIsNavVisible(false);
        window.scrollTo({
            top: 0,
            behavior: "smooth" // Optional: Smooth scrolling animation
        });

    };

  return (
      <>
          <div className="flex flex-wrap pt-5 px-5 justify-between items-center " >
              <a href="/" className=" h-[3rem]  " >
                  <img loading="lazy" className="h-full w-full" src={logo} alt="" />
              </a>
              
              <div>
                  <Link to="/Stake" className=" bg-white w-fit text-black px-4 py-2  rounded-3xl " > stake now ➜ </Link>
              </div>
              <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
                        {/* <a target='blank' href="https://www.pinksale.finance/launchpad/ethereum/0x6eE0B88732aE8298e18d127db401708a44660413" className="   btn2 oxanium text-white   font-medium phone:font-light    text-sm first-line  phone:h-[40px]  ">Buy Token</a> */}
                        <Web3Button />
                    <button
                        onClick={toggleNav}
                        type="button"
                        className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-red-100 bg-gray-900 border border-[--primary-color] rounded-lg md:hidden   focus:outline-none focus:ring-2 focus:ring-[--prime-color]   ring-[--prime-color]  hover:bg-gray-900  "
                        aria-controls="navbar-sticky1"
                        aria-expanded={isNavVisible}
                    >
                        <span className="sr-only">Open main menu</span>
                        <svg
                            className="w-5 h-5"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 17 14"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M1 1h15M1 7h15M1 13h15"
                            />
                        </svg>
                    </button>
                    </div>
              
          </div>
      </>
  )
}

export default Navbar