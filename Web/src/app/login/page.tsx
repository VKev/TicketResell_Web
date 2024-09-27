import React from "react";
import Footer from "@/Components/Footer"; // Import your Footer component
import Login from "@/Components/Login";
import Navbar from "@/Components/Navbar";
import Background from "@/Components/Background";
import Announce from "@/Components/Announcement";
const Signin = () => {
  return (
    <div className="Signin">
      <Navbar />
      <Background test={<Login />} />
      <Footer />
    </div>
  );
};

export default Signin;
