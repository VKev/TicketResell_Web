"use client";
import React, { useRef, useState, useEffect } from 'react';
import '@/Css/MyCart.css'; // Updated

import Checkout from '@/Components/Checkout';
import Background from '@/Components/Background';

const Checkoutt = () => {
    return (
       
        <Background test={ <Checkout/>} />
   
    );
};

export default Checkoutt; // Updated