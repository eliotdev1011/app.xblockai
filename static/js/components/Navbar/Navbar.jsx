import React from 'react'
import logo from '../../assets/images/logo.png'
import { IoMenu, IoClose } from 'react-icons/io5'
import './Navbar.css'
import navLogo from '../../assets/images/navLogo.png'
const Navbar = ({ ConnectButton }) => {
     return (
          <header className='header'>
               <nav className='nav'>
                    <div className="left-nav">
                         {/* <label className="hamberger-menu" >
                              <input type="checkbox" aria-label="hamberger-menu" id='hamberger-checkbox' />
                              <IoMenu />
                         </label>
                         <div className="menu-option">
                              <label htmlFor='hamberger-checkbox' className='close-menu-btn'>
                                   <IoClose />
                              </label>
                              <span className='clr-white mob-home' onClick={()=>{}}>Home</span>
                         </div> */}
                              <img src="./logo.png"/>
                    </div>
                    <div className="menu">
                         <ConnectButton chainStatus='none' />
                    </div>
               </nav>
          </header>
     )
}

export default Navbar