"use client";
import React, { useState, useEffect } from "react";
import RichTextEditor from "@/Hooks/RichTextEditor";
import { useRouter } from "next/navigation";
import ScrollToTopButton from "@/Hooks/useScrollTopButton";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  TextField,
  Button,
  Box,
  Autocomplete,
  Typography,
} from "@mui/material";
import Cookies from "js-cookie";
import "@/Css/AddTicketModal.css";
import { useParams } from "next/navigation";
import { fetchImage } from "@/models/FetchImage";

interface Province {
  Id: number;
  Code: string;
  Name: string;
}

interface District {
  Id: number;
  Code: string;
  Name: string;
  ProvinceId: number;
}
interface Ward {
  Id: number;
  Code: string;
  Name: string;
  DistrictId: number;
}

interface FormDataType {
  name: string;
  cost: string;
  location: string;
  date: string;
  image: string;
  description: string;
  Qrcode: string[]; // Change this to an array of files
  categories: Category[];
}

interface Category {
  categoryId: string;
  name: string;
}

const UpdateTicketModal: React.FC = () => {
  const initialFormData: FormDataType = {
    name: "",
    cost: "",
    location: "",
    date: "",
    image: "",
    description: "",
    Qrcode: [],
    categories: [],
  };

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [qrFileNames, setQrFileNames] = useState(Array(quantity).fill(""));
  const [qrFiles, setQrFiles] = useState(Array(quantity).fill(null));
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();

  const [houseNumber, setHouseNumber] = useState<string>("");
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedWard, setSelectedWard] = useState<number | null>(null);
  const [minDateTime, setMinDateTime] = useState("");

  const toDateTimeLocalFormat = (date: string | Date): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = `0${d.getMonth() + 1}`.slice(-2);
    const day = `0${d.getDate()}`.slice(-2);
    const hours = `0${d.getHours()}`.slice(-2);
    const minutes = `0${d.getMinutes()}`.slice(-2);
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const fetchProvinces = async () => {
    try {
      const response = await fetch(
        "https://api.npoint.io/ac646cb54b295b9555be"
      );
      const data = await response.json();
      setProvinces(data);
      return data;
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const fetchDistricts = async (provinceId: number) => {
    try {
      const response = await fetch(
        "https://api.npoint.io/34608ea16bebc5cffd42"
      );
      const data: District[] = await response.json();

      const filteredDistricts = data.filter(
        (district) => district.ProvinceId === provinceId
      );
      setDistricts(filteredDistricts);
      return filteredDistricts;
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const fetchWards = async (districtId: number) => {
    try {
      const response = await fetch(
        "https://api.npoint.io/dd278dc276e65c68cdf5"
      );
      const data: Ward[] = await response.json();

      // Filter wards by DistrictId
      const filteredWards = data.filter(
        (ward) => ward.DistrictId === districtId
      );
      setWards(filteredWards);
      return filteredWards;
    } catch (error) {
      console.error("Error fetching wards:", error);
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      fetchDistricts(selectedProvince);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      fetchWards(selectedDistrict);
    }
  }, [selectedDistrict]);

  const handleProvinceChange = (selectedProvinceId: number | null) => {
    setSelectedProvince(selectedProvinceId);
    setSelectedDistrict(null); // Clear district and ward when province changes
    setSelectedWard(null);
  };

  const handleDistrictChange = (selectedDistrictId: number | null) => {
    setSelectedDistrict(selectedDistrictId);
    setSelectedWard(null); // Clear ward when district changes
  };

  const handleWardChange = (selectedWardId: number | null) => {
    setSelectedWard(selectedWardId);
  };

  const getProvinceName = (provinceId: number | null) => {
    const province = provinces.find((prov) => prov.Id === provinceId);
    return province ? province.Name : "";
  };

  const getDistrictName = (districtId: number | null) => {
    const district = districts.find((dist) => dist.Id === districtId);
    return district ? district.Name : "";
  };

  const getWardName = (wardId: number | null) => {
    const ward = wards.find((wrd) => wrd.Id === wardId);
    return ward ? ward.Name : "";
  };

  // Generate full location string when province, district, and ward are selected
  useEffect(() => {
    if (selectedProvince && selectedDistrict && selectedWard) {
      const provinceName = getProvinceName(selectedProvince);
      const districtName = getDistrictName(selectedDistrict);
      const wardName = getWardName(selectedWard);

      setFormData((prevData) => ({
        ...prevData,
        location: `${houseNumber}, ${wardName}, ${districtName}, ${provinceName}`,
      }));
    }
  }, [houseNumber, selectedProvince, selectedDistrict, selectedWard]);

  useEffect(() => {
    // Function to format the current date and time to the 'datetime-local' format
    const getCurrentDateTime = () => {
      const now = new Date();
      return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    };

    setMinDateTime(getCurrentDateTime());
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch(
        `http://localhost:5296/api/ticket/readbyid/${id}`
      );
      const result = await response.json();
      console.log("Fetched Ticket Data:", result.data);

      if (!result.data) {
        console.log("No data found");
        return;
      }

      // Format start date if available
      const formattedDateForInput = result.data.startDate
        ? toDateTimeLocalFormat(result.data.startDate)
        : null;

      // Split and extract location details
      const locationParts = result.data.location
        ? result.data.location.split(", ").map((part: string) => part.trim())
        : [];
      const houseNumber = locationParts[0] || "";
      const wardName = locationParts[1] || "";
      const districtName = locationParts[2] || "";
      const provinceName = locationParts[3] || "";

      setHouseNumber(houseNumber);

      let updatedQrFiles = [];

      if (Array.isArray(result.data.qrcode)) {
        updatedQrFiles = result.data.qrcode.map((qrCode: string) => {
          const mimeType = detectMimeType(qrCode);
          return `data:${mimeType};base64,${qrCode}`;
        });

        console.log("Updated QR Files:", updatedQrFiles);
      } else if (typeof result.data.qrcode === "string") {
        const mimeType = detectMimeType(result.data.qrcode);
        updatedQrFiles.push(`data:${mimeType};base64,${result.data.qrcode}`);

        console.log("Updated QR Files (single):", updatedQrFiles);
      } else {
        console.log(
          "No valid QR code found or qrcode is not in the expected format"
        );
      }

      setFormData((prevData) => ({
        ...prevData,
        ...result.data,
        date: formattedDateForInput,
        Qrcode: updatedQrFiles,
      }));

      if (updatedQrFiles.length > 0) {
        console.log("Updated QR Files:", updatedQrFiles);
        setQrFiles(updatedQrFiles);
      }

      // Fetch provinces
      const fetchedProvinces = await fetchProvinces();
      console.log("Fetched Provinces:", fetchedProvinces);

      if (!fetchedProvinces.length) {
        console.log("No provinces available yet.");
        return;
      }

      setProvinces(fetchedProvinces);

      // Find the selected province ID
      const selectedProv =
        fetchedProvinces.find(
          (p: Province) =>
            p.Name.trim().toLowerCase() === provinceName.trim().toLowerCase()
        )?.Id || null;

      if (selectedProv) {
        // Fetch districts based on the selected province
        const fetchedDistricts = await fetchDistricts(selectedProv);

        if (Array.isArray(fetchedDistricts)) {
          // Find the selected district ID
          const selectedDist =
            fetchedDistricts.find(
              (d) =>
                d.Name.trim().toLowerCase() ===
                districtName.trim().toLowerCase()
            )?.Id || null;

          if (selectedDist) {
            // Fetch wards based on the selected district
            const fetchedWards = await fetchWards(selectedDist);

            if (Array.isArray(fetchedWards)) {
              // Find the selected ward ID
              const selectedWrd =
                fetchedWards.find(
                  (w) =>
                    w.Name.trim().toLowerCase() ===
                    wardName.trim().toLowerCase()
                )?.Id || null;

              // Set selected province, district, and ward
              setSelectedProvince(selectedProv);
              setSelectedDistrict(selectedDist);
              setSelectedWard(selectedWrd);
            }
          }
        } else {
          console.error("Fetched districts is not an array:", fetchedDistricts);
        }
      }

      // Fetch and set the image if available
      if (result.data.image) {
        const { imageUrl, error } = await fetchImage(result.data.image);
        if (imageUrl) {
          setFormData((prevData) => ({
            ...prevData,
            image: imageUrl,
          }));
        } else {
          console.error(`Error fetching image for ticket: ${error}`);
        }
      }
    } catch (error) {
      console.error("Error fetching ticket items:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [id]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5296/api/Category/read");
      const result = await response.json();

      if (Array.isArray(result.data)) {
        setCategories(result.data);
      } else {
        console.error("Expected array but got:", result.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCategoriesChange = (
    event: React.SyntheticEvent<Element, Event>,
    value: Category[]
  ) => {
    setFormData({
      ...formData,
      categories: value,
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setFormData((prevData) => ({
        ...prevData,
        image: file.name,
      }));

      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };

  const detectMimeType = (base64String: string) => {
    if (base64String.startsWith("/9j/")) {
      return "image/jpeg";
    } else if (base64String.startsWith("iVBORw0KGgo")) {
      return "image/png";
    } else if (base64String.startsWith("UklGR")) {
      return "image/webp";
    }
    return "image/png";
  };

  const handleQrFileChange = async (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      const newQrFiles = [...qrFiles];
      const newQrFileNames = [...qrFileNames];

      files.forEach((file, fileIndex) => {
        const reader = new FileReader();

        reader.onloadend = () => {
          const targetIndex = index + fileIndex;

          newQrFiles[targetIndex] = reader.result as string;
          newQrFileNames[targetIndex] = file.name;

          setQrFiles([...newQrFiles]);
          setQrFileNames([...newQrFileNames]);

          setFormData((prevData) => ({
            ...prevData,
            qr: newQrFiles,
          }));
        };

        reader.readAsDataURL(file);
      });
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);

    setQrFiles((prevFiles) => {
      const updatedFiles = [...prevFiles];
      while (updatedFiles.length < newQuantity) {
        updatedFiles.push(null);
      }
      return updatedFiles.slice(0, newQuantity);
    });

    setQrFileNames((prevNames) => {
      const updatedNames = [...prevNames];
      while (updatedNames.length < newQuantity) {
        updatedNames.push("");
      }
      return updatedNames.slice(0, newQuantity);
    });
  };

  const handleSave = async () => {
    const sellerId = Cookies.get("id");
    if (
      !formData.name ||
      !formData.cost ||
      !formData.location ||
      !formData.date ||
      !formData.image ||
      !formData.description ||
      !formData.Qrcode
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const generateTicketId = () => {
      const randomNum = Math.floor(100 + Math.random() * 900);
      return `TICKET${randomNum}`;
    };

    const checkTicketIdExist = async (ticketId: string) => {
      const response = await fetch(
        `http://localhost:5296/api/Ticket/checkexist/${ticketId}`
      );
      return response.status === 200;
    };

    const createTickets = async () => {
      let baseTicketId = generateTicketId();
      let isValidId = await checkTicketIdExist(baseTicketId);

      while (isValidId) {
        baseTicketId = generateTicketId();
        isValidId = await checkTicketIdExist(baseTicketId);
      }

      const tickets = Array.from({ length: quantity }).map((_, index) => {
        let ticketId = baseTicketId;
        if (quantity > 1) {
          ticketId = `${baseTicketId}_${index + 1}`;
        }

        return {
          TicketId: ticketId,
          SellerId: sellerId,
          Name: formData.name,
          Cost: parseFloat(formData.cost),
          Location: formData.location,
          StartDate: new Date(formData.date),
          Status: 1,
          Image: baseTicketId,
          Qrcode: qrFiles[index],
          CategoriesId: formData.categories.map(
            (category) => category.categoryId
          ),
          Description: formData.description,
        };
      });

      console.log(tickets);

      const uploadImagePromises = tickets.map((ticket) => {
        const formData = new FormData();
        formData.append("id", ticket.Image);
        formData.append("image", selectedFile as Blob);
        return fetch("/api/uploadImage", {
          method: "POST",
          body: formData,
        });
      });

      try {
        await Promise.all(uploadImagePromises);
        console.log("Images uploaded successfully (simulated).");

        const createTicketPromises = tickets.map(async (ticket) => {
          await fetch("http://localhost:5296/api/Ticket/create", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(ticket),
          });
        });

        await Promise.all(createTicketPromises);
        console.log("Tickets created successfully.");
      } catch (error) {
        console.error("Error creating tickets or uploading images:", error);
      }
      setFormData(initialFormData);
      setSelectedFile(null);
      setQrFiles([]);
      setQuantity(1);
      setQrFileNames([]);
      setImagePreview(null);
    };
    await createTickets();
    router.push("/sell");
    window.location.href = "/sell";
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setSelectedFile(null);
    setQrFiles([]);
    setQuantity(1);
    setQrFileNames([]);
    setImagePreview(null);
    router.push("/sell");
  };

  return (
    <div>
      <Box className="modal-style">
        <div className="modal-contentt">
          <ScrollToTopButton />
          <h2>Add Ticket</h2>
          <TextField
            className="custom-text-field"
            fullWidth
            label="Quantity"
            value={quantity}
            onChange={(e) => handleQuantityChange(Number(e.target.value))}
            type="number"
            margin="normal"
            inputProps={{ min: 1 }}
          />

          {/* File input for image */}

          <div className="upload-container">
            <Typography
              variant="h6"
              margin="normal"
              style={{ fontSize: "20px" }}
            >
              Upload Image:
            </Typography>

            <div className="row p-3 justify-between">
              <div
                className="col-md-5 p-0  mb-4  upload-box large-box "
                onClick={() =>
                  document.getElementById("ticketImageInput")?.click()
                }
              >
                <div>
                  <input
                    id="ticketImageInput"
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: "none" }}
                    required
                  />

                  {/* Show uploaded image preview if available */}
                  {imagePreview && (
                    <div className="image-preview">
                      <img
                        src={imagePreview}
                        style={{ width: "100%", height: "42vh" }}
                      />
                    </div>
                  )}

                  {/* Show fetched image if no uploaded image */}
                  {!imagePreview && formData.image && (
                    <div className="image-preview ">
                      <img
                        src={formData.image}
                        style={{ width: "100%", height: "42vh" }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-5 p-3 mb-4 upload-box small-box">
                {Array.from({ length: quantity }).map((_, index) => (
                  <div key={index}>
                    <input
                      id={`qrImageInput${index}`}
                      type="file"
                      onChange={(event) => handleQrFileChange(index, event)}
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      required
                    />
                    <div className="text-center qr-text">
                      <span>QR image {index + 1}</span>
                    </div>

                    {/* Conditionally show empty box or the QR preview */}
                    {!qrFiles[index] && !formData.Qrcode?.[index] && (
                      <div
                        className="items-center qr-image-box"
                        onClick={() =>
                          document
                            .getElementById(`qrImageInput${index}`)
                            ?.click()
                        }
                      />
                    )}
                    {qrFiles[index] && (
                      <div
                        className="qr-preview mt-3"
                        onClick={() =>
                          document
                            .getElementById(`qrImageInput${index}`)
                            ?.click()
                        }
                      >
                        <img
                          src={qrFiles[index]}
                          alt={`QR Code ${index + 1}`}
                          className="img-fluid"
                          style={{ maxWidth: "40%", height: "auto" }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <TextField
            className="custom-text-field"
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            type="string"
            required
          />

          <TextField
            className="custom-text-field"
            fullWidth
            label="Cost"
            name="cost"
            value={formData.cost}
            onChange={handleChange}
            margin="normal"
            type="string"
            required
          />
          {/* Location (Province, District, Ward) */}

          <div className="address-fields-container">
            <TextField
              className="address-field"
              label="House Number/Street"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              margin="normal"
              fullWidth
              required
            />

            <Autocomplete
              options={provinces}
              getOptionLabel={(option: Province) => option.Name}
              value={
                provinces.find(
                  (province) => province.Id === selectedProvince
                ) || null
              }
              onChange={(event, newValue: Province | null) => {
                handleProvinceChange(newValue ? newValue.Id : null);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  className="address-field"
                  label="Province"
                  margin="normal"
                  fullWidth
                  required
                />
              )}
            />

            <Autocomplete
              options={districts}
              getOptionLabel={(option: District) => option.Name}
              value={
                districts.find(
                  (district) => district.Id === selectedDistrict
                ) || null
              }
              onChange={(event, newValue: District | null) => {
                handleDistrictChange(newValue ? newValue.Id : null); // Pass Id, not Name
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  className="address-field"
                  label="District"
                  margin="normal"
                  fullWidth
                  value={
                    districts.find(
                      (district) => district.Id === selectedDistrict
                    ) || null
                  }
                  required
                  disabled={!selectedProvince}
                />
              )}
            />

            <Autocomplete
              options={wards}
              getOptionLabel={(option: Ward) => option.Name}
              value={wards.find((ward) => ward.Id === selectedWard) || null}
              onChange={(event, newValue: Ward | null) => {
                handleWardChange(newValue ? newValue.Id : null); // Pass Id, not Name
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  className="address-field"
                  label="Ward"
                  margin="normal"
                  fullWidth
                  value={wards.find((ward) => ward.Id === selectedWard) || null}
                  required
                  disabled={!selectedDistrict}
                />
              )}
            />
          </div>
          <TextField
            className="custom-text-field"
            label="Please select address "
            value={formData.location}
            margin="normal"
            fullWidth
            required
            disabled={true}
          />
          <TextField
            className="custom-text-field"
            fullWidth
            label="Date and Time"
            name="date"
            value={formData.date}
            onChange={handleChange}
            margin="normal"
            type="datetime-local"
            InputLabelProps={{
              shrink: true,
            }}
            required
            inputProps={{
              min: minDateTime,
            }}
          />
          {/* Autocomplete for selecting multiple categories */}
          <Autocomplete
            multiple
            options={categories}
            getOptionLabel={(option: Category) => option.name}
            value={formData.categories}
            onChange={handleCategoriesChange}
            renderInput={(params) => (
              <TextField
                className="custom-text-field"
                {...params}
                label="Categories"
                margin="normal"
              />
            )}
            loading={loading}
            isOptionEqualToValue={(option, value) =>
              option.categoryId === value.categoryId
            }
          />
          <div className="border rounded-md mb-4 ">
            <div className="custom-text-field">
              <RichTextEditor
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>
          </Box>
        </div>
      </Box>
    </div>
  );
};

export default UpdateTicketModal;