"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import RequestDialog from "./RequestDialog";
import ChatboxTable from "./RequestForm";
import Cookies from "js-cookie";
interface Role {
  roleId: string;
  rolename: string;
  description: string;
}
interface UserData {
  userId: string;
  username: string;
  fullname: string;
  gmail: string;
  phone: string;
  address: string;
  sex: string;
  status: number;
  birthday: string;
  bio: string;
  roles: Role[];
}
interface UserRequestProps {
  userData: UserData | null;
}

interface ChatboxItem {
  chatboxId: number;
  status: number;
  createDate: string;
  title: string;
  description: string;
}
const UserRequest: React.FC<UserRequestProps> = ({ userData }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [chatboxData, setChatboxData] = useState<ChatboxItem[]>([]);

  const fetchChatboxData = async () => {
    try {
      const id = Cookies.get("id");
      console.log("Fetching data for ID:", id);
      
      const response = await fetch(
        `http://localhost:5296/api/Chatbox/getall/${id}`, 
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch chatbox data');
      }
      const data = await response.json();
      
      if(Array.isArray(data.data)){
        setChatboxData(data.data);
      } else {
        console.warn("Received data is not an array:", data);
      }
    } catch (error) {
      console.error('Error fetching chatbox data:', error);
    }
  };

  useEffect(() => {
    fetchChatboxData();
  }, []);

  const hasRO3Role = userData?.roles?.some((role) => role.roleId === "RO3");
  console.log(userData);
  return (
    <div className="bg-white py-12 px-10 rounded-xl ">
      <div className="container mx-auto px-5 flex flex-col pt-20 justify-between  sm:flex-row items-center">
        {!hasRO3Role && (
          <div className="relative flex items-center bg-gray-100 mb-5 rounded-full px-4 h-12 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search requests"
              className="border-none outline-none items-center bg-transparent w-96 text-gray-700 placeholder-gray-400 focus:ring-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FontAwesomeIcon
              className="text-gray-500 cursor-pointer"
              icon={faMagnifyingGlass}
            />
          </div>
        )}
        {hasRO3Role && (
           <div className="relative flex  items-center bg-gray-100 mb-5 rounded-full px-4 h-12 w-full sm:w-96">
            <input
              type="text"
              placeholder="Search requests"
              className="border-none outline-none items-center bg-transparent w-96 text-gray-700 placeholder-gray-400 focus:ring-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FontAwesomeIcon
              className="text-gray-500 cursor-pointer"
              icon={faMagnifyingGlass}
            />
          </div>
        )}
        <div></div>
        {!hasRO3Role && <RequestDialog setChatboxData={setChatboxData} />}
      </div>
      <div className="flex justify-center w-full ">
        <div className="w-full max-w-7xl">
          {/* Set a max-width for the card container */}
          <ChatboxTable chatboxData={chatboxData} />
        </div>
      </div>
    </div>
  );
};

export default UserRequest;
